import os
import json
import pandas as pd
from fastapi import APIRouter, Query
from starlette.exceptions import HTTPException
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY

from app.core.settings import DATA_MODEL


analytics_controller = APIRouter()


@analytics_controller.get("/")
def query(col=Query(None)):
    if col not in {"H", "R", "D"}:
        raise HTTPException(
            status_code=HTTP_422_UNPROCESSABLE_ENTITY,
            detail="col parameter should be one of [H, R, D]",
        )

    filepath = os.path.join(DATA_MODEL, "eera-outcome-hosp-rec-death-age-groups.csv")
    df = pd.read_csv(filepath)
    result = generate_age_group_file(df, col)
    return result


def generate_aggregated_file(df):
    results = {}

    results["x"] = {
        "label": "day",
        "values": next(iter(df.groupby("iter")["day"]))[1].values.tolist(),
    }

    quantiles = [0.95, 0.75, 0.5, 0.25, 0.05]
    results["percentiles"] = [f"{q:.0%}" for q in quantiles]

    cols = df.columns.difference(["iter", "day"])
    results["ys"] = []
    for c in cols:
        results["ys"].append(
            {
                "label": c,
                "values": [
                    df.groupby("day")[c].quantile(q).tolist() for q in quantiles
                ],
            }
        )

    for ys in results["ys"]:
        for d in results["x"]["values"]:
            for i in range(4):
                assert ys["values"][i] > ys["values"][i + 1]

    return results


def generate_age_group_file(df, col, n_groups=8):
    "Generate data for visualisation, using only `col` variable."
    df["group"] = df.index % n_groups

    results = {}

    results["x"] = {
        "label": "day",
        "values": next(iter(df.groupby(["iter", "group"])["day"]))[1].values.tolist(),
    }

    quantiles = [0.95, 0.75, 0.5, 0.25, 0.05]
    results["percentiles"] = [f"{q:.0%}" for q in quantiles]

    results["ys"] = []
    labels = [
        "Under 20",
        "20-29",
        "30-39",
        "40-49",
        "50-59",
        "60-69",
        "70+",
        "Health Care Workers",
    ]
    for c in range(n_groups):
        g = df.query("group == @c")
        results["ys"].append(
            {
                "label": labels[c],
                "values": [
                    g.groupby("day")[col].quantile(q).tolist() for q in quantiles
                ],
            }
        )

    for ys in results["ys"]:
        for d in results["x"]["values"]:
            for i in range(4):
                assert ys["values"][i] > ys["values"][i + 1]

    return results