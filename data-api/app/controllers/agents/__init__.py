# TODO: remove BackgroundScheduler fron data_download_agent.py
# TODO: remove BackgroundScheduler from contorllers/__init__.py

# import datadownload

def run_agents():
    print("Running Uncertainty Analysis Agents")
    download_data()

    # wait unitl data has been downloaded
    # for each agent, run in their own thread, parallel
    threading.Thread(target=uncertainty_mean_sample_agent).start()
    # uncertainty_clustering_agent()
    # uncertainty_cluster_mean_sample_agent()



# A recurrent job
scheduler = BackgroundScheduler(daemon=True)

# Cron runs at 1am daily
scheduler.add_job(run_agents, "cron", hour=0, minute=0, second=0)

scheduler.start()
logger.info('Uncertainty-clustering-agent starts. Will run immediately now and every 1am.')

# Run immediately after server starts
threading.Thread(target=run_agents).start()