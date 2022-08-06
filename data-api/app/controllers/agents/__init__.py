from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import threading
from loguru import logger
from app.controllers.agents.sensitivity_analysis_agent import convert_data
from app.controllers.agents.sensitivity_analysis_agent import sobol_index_agent
from app.controllers.agents.sensitivity_clustering_agent import sensitivity_clustering_agent
from app.controllers.agents.sensitivity_range_mean_sample_agent import sensitivity_clustering_range_mean_agent
from app.controllers.agents.sensitivity_summary_curves_agent import summary_curves_agent
from app.controllers.agents.ents_to_sandu_agent import ents_to_sandu_agent
from app.controllers.agents.data_downloader_agent import download_data
from app.controllers.agents.uncertainty_mean_sample_agent import uncertainty_mean_sample_agent
from app.controllers.agents.uncertainty_clustering_agent import uncertainty_clustering_agent
from app.controllers.agents.uncertainty_cluster_mean_sample_agent import uncertainty_cluster_mean_sample_agent
from app.controllers.agents.time_series_precompute_agent import precompute
from app.controllers.agents.sensitivity_stream_registration_agent import sensitivity_stream_registration_agent

def uncertainty_agents():
    try:
        logger.info("Running Uncertainty Analysis Agents")
        # Start clustering
        uncertainty_clustering_agent()
        # Start non-clustered computations
        uncertainty_mean_sample_agent()    
        logger.info("Uncertainty Clustering Complete")
        logger.info("Running Uncertainty Cluster Analysis")
        uncertainty_cluster_mean_sample_agent()
    except Exception as e:
        logger.info("Uncertainty Agents failed.")
        logger.exception(e)


def sensitivity_agents():
    try:
        logger.info("Converting ents files to sandu SensitivityInput objects.")
        # Converts data from Ensemble Time-series (ents) format into sandu SensitivtyInput objects.
        ents_to_sandu_agent()
        convert_data()
        sensitivity_stream_registration_agent()
        logger.info("SensitivityInput objects created from ents files.")
        summary_curves_agent()
        sobol_index_agent()
        logger.info("Running Sensitivity Analysis Agents")
        sensitivity_clustering_agent()
        logger.info("Sensitivity Clustering Complete")
        sensitivity_clustering_range_mean_agent()
    except Exception as e:
        logger.info("Sensitivity Agents failed.")
        logger.exception(e)

def run_agents():
    download_data()
    precompute()
    uncertainty_agents()
    sensitivity_agents()

# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs now and at 0am daily
scheduler.add_job(run_agents, "cron", hour=0, minute=0, second=0,next_run_time=datetime.now())

scheduler.start()
