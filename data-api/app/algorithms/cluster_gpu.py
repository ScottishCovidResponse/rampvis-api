import cudf
from cuml.cluster import KMeans
import pandas as pd
from loguru import logger


def np2cudf(df):
    """
    convert numpy array to cuDF dataframe
    """
    df = pd.DataFrame({"fea%d" % i: df[:, i] for i in range(df.shape[1])})
    pdf = cudf.DataFrame()
    for c, column in enumerate(df):
        pdf[str(c)] = df[column]
    return pdf


def cluster_gpu(Sdd, n_clusters):
    logger.info(
        f"Propagate: compute clusters from Sdd, n_clusters = {n_clusters},  (in GPU)"
    )

    Sdd_pdf = np2cudf(Sdd)

    logger.info(f"Propagate: compute clusters from Sdd, Sdd_pdf created,  (in GPU)")
    clustering = KMeans(n_clusters=n_clusters).fit(Sdd_pdf)
    logger.info(
        f"Propagate: computed clusters from Sdd, len(clustering.labels_) = {len(clustering.labels_)},  (in GPU)"
    )
    return clustering.labels_
