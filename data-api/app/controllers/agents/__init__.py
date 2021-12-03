# TODO: remove BackgroundScheduler fron data_download_agent.py
# TODO: remove BackgroundScheduler from contorllers/__init__.py
from apscheduler.schedulers.background import BackgroundScheduler
import threading
from loguru import logger
from app.controllers.sensitivity_analysis_agent import convert_data
from app.controllers.data_downloader_agent import download_data
from app.controllers.uncertainty_mean_sample_agent import uncertainty_mean_sample_agent
from app.controllers.uncertainty_clustering_agent import uncertainty_clustering_agent
from app.controllers.uncertainty_cluster_mean_sample_agent import uncertainty_cluster_mean_sample_agent


def uncertainty_agents():
    print("Running Uncertainty Analysis Agents")
    # Start clustering
    t_u_cluster = threading.Thread(target=uncertainty_clustering_agent)
    t_u_cluster.start()

    # Start non-clustered computations
    threading.Thread(target=uncertainty_mean_sample_agent).start()

    t_u_cluster.join()
    print("Running Uncertainty Clustering Complete")
    # Start computations requiring clustered data
    threading.Thread(target=uncertainty_cluster_mean_sample_agent).start()


def sensitivity_agents():
    print("Running Sensitivity Analysis Agents")
    threading.Thread(target=convert_data).start()


def run_agents():
    logger.info('Download data agent starts. Will run immediately now and every midnight.')
    download_data()
    threading.Thread(target=uncertainty_agents).start()
    threading.Thread(target=sensitivity_agents).start()


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(run_agents, "cron", hour=0, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-clustering-agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=run_agents).start()
