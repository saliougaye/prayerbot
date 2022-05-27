import { Job, Queue, Worker, QueueScheduler } from 'bullmq';
import redisHelper from '../helpers/redis-helper';
import Logger from '../services/logger';


const notifierQueueName = 'prayer-notifier-queue';
const notifierQueueWorker = 'prayer-notifier-worker';
const activity = 'prayer-notifier';

const logger = Logger(activity);


const instantiateNotifier = async () => {

    const connection = redisHelper.getConnection();
    const notifierQueueScheduler = new QueueScheduler(notifierQueueName, {
        connection: connection
    })
    
    const notifierQueue = new Queue(notifierQueueName, {
        connection: connection
    });

    const notifierWorker = new Worker(notifierQueueName, onExecute, {
        connection: connection
    });

    notifierWorker.on('completed', onCompleted);
    notifierWorker.on('failed', onFailed);

    
    await notifierQueue.add(activity, {}, {
        repeat: {
            cron: '0 0 * * *'
        }
    });



    logger.info(`✅ ${notifierQueueWorker} started`);
    
}

const onExecute = async (job: Job<any, any, string>) : Promise<any> => {

    // TODO logic
}

const onCompleted = (job: Job<any, any, string>) => {
    logger.info(`✅ ${notifierQueueName} job completed successfully`, {
        jobId: job.id
    })
}

const onFailed = (job: Job<any, any, string>, err: Error) => {
    logger.error(`❌ ${notifierQueueName} failed`,err, {
        jobId: job.id
    })
}


export {
    instantiateNotifier
}