from apscheduler.schedulers.background import BackgroundScheduler
import threading
from loguru import logger
from app.controllers.agents.sensitivity_analysis_agent import convert_data
from app.controllers.agents.sensitivity_clustering_agent import sensitivity_clustering_agent
from app.controllers.agents.sensitivity_range_mean_sample_agent import sensitivity_clustering_range_mean_agent
from app.controllers.agents.sensitivity_summary_curves_agent import summary_curves_agent
from app.controllers.agents.ents_to_sandu_agent import ents_to_sandu_agent
from app.controllers.agents.data_downloader_agent import download_data
from app.controllers.agents.uncertainty_mean_sample_agent import uncertainty_mean_sample_agent
from app.controllers.agents.uncertainty_clustering_agent import uncertainty_clustering_agent
from app.controllers.agents.uncertainty_cluster_mean_sample_agent import uncertainty_cluster_mean_sample_agent
from app.controllers.agents.time_series_precompute_agent import precompute


def uncertainty_agents():
    logger.info("Running Uncertainty Analysis Agents")
    # Start clustering
    t_u_cluster = threading.Thread(target=uncertainty_clustering_agent)
    t_u_cluster.start()

    # Start non-clustered computations
    threading.Thread(target=uncertainty_mean_sample_agent).start()

    t_u_cluster.join()
    logger.info("Uncertainty Clustering Complete")
    # Start computations requiring clustered data
    logger.info("Running Uncertainty Cluster Analysis")
    threading.Thread(target=uncertainty_cluster_mean_sample_agent).start()


def sensitivity_agents():
    logger.info("Converting ents files to sandu SensitivityInput objects.")
    #Converts data from Ensemble Time-series (ents) format into sandu SensitivtyInput objects.
    t_convert = threading.Thread(target=ents_to_sandu_agent)
    t_convert.start()
    
    # Start non clustered threads
    threading.Thread(target=convert_data).start()
    
    t_convert.join()
    logger.info(" SensitivityInput objects created from ents files.")
    threading.Thread(target=summary_curves_agent).start()
    
    logger.info("Running Sensitivity Analysis Agents")
    t_s_cluster = threading.Thread(target=sensitivity_clustering_agent)
    t_s_cluster.start()
    
    t_s_cluster.join()
    logger.info("Sensitivity Clustering Complete")
    threading.Thread(target=sensitivity_clustering_range_mean_agent).start()

def run_agents():
    download_data()
#    threading.Thread(target=precompute).start()
    threading.Thread(target=uncertainty_agents).start()
    threading.Thread(target=sensitivity_agents).start()


# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 0am daily
scheduler.add_job(run_agents, "cron", hour=0, minute=0, second=0)

scheduler.start()

# Run immediately after server starts
threading.Thread(target=run_agents).start()