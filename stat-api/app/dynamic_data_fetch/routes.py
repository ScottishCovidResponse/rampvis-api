from apscheduler.schedulers.background import BackgroundScheduler

from app.dynamic_data_fetch import blueprint


@blueprint.route('/dynamic_data_fetch/start', methods=['GET'])
def start():
    sched = BackgroundScheduler(daemon=True)
    sched.add_job(lambda: sched.print_jobs(), 'interval', seconds=5)
    sched.start()

    return
