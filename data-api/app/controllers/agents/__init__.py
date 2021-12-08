from apscheduler.schedulers.background import BackgroundScheduler
import threading
from loguru import logger
from app.controllers.agents.sensitivity_analysis_agent import convert_data
from app.controllers.agents.data_downloader_agent import download_data
from app.controllers.agents.uncertainty_mean_sample_agent import uncertainty_mean_sample_agent
from app.controllers.agents.uncertainty_clustering_agent import uncertainty_clustering_agent
from app.controllers.agents.uncertainty_cluster_mean_sample_agent import uncertainty_cluster_mean_sample_agent
from app.controllers.agents.time_series_precompute_agent import precompute


def uncertainty_agents():
    print("Running Uncertainty Analysis Agents")
    # Start clustering
    t_u_cluster = threading.Thread(target=uncertainty_clustering_agent)
    t_u_cluster.start()

    # Start non-clustered computations
    threading.Thread(target=uncertainty_mean_sample_agent).start()

    t_u_cluster.join()
    print("Uncertainty Clustering Complete")
    # Start computations requiring clustered data
    print("Running Uncertainty Cluster Analysis")
    threading.Thread(target=uncertainty_cluster_mean_sample_agent).start()


def sensitivity_agents():
    print("Running Sensitivity Analysis Agents")
    threading.Thread(target=convert_data).start()


def run_agents():
    logger.info('Download data agent starts. Will run immediately now and every midnight.')
    download_data()
    logger.info('Timeseries similarity agent starts. Will run immediately now and every 1am.')
    threading.Thread(target=precompute).start()
    threading.Thread(target=uncertainty_agents).start()
    threading.Thread(target=sensitivity_agents).start()


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 0am daily
scheduler.add_job(run_agents, "cron", hour=0, minute=0, second=0)

scheduler.start()

# Run immediately after server starts
threading.Thread(target=run_agents()).start
