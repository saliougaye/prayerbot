import { Job, Queue, Worker, QueueScheduler } from 'bullmq';
import prayerService from '../services/prayerService';
import redisHelper from '../helpers/redis-helper';
import Logger from '../services/logger';

const cleanerQueueName = 'prayer-cleaner-queue';
const cleanerQueueWorker = 'prayer-cleaner-worker';
const activity = 'prayer-cleaner';


const logger = Logger(activity);

const instantiateCleanerWorker = async () => {
    


    const connection = redisHelper.getConnection();

    const cleanerQueueScheduler = new QueueScheduler(cleanerQueueName, {
        connection: connection
    })
    
    const cleanerQueue = new Queue(cleanerQueueName, {
        connection: connection
    });

    const cleanerWorker = new Worker(cleanerQueueName, onExecute, {
        connection: connection
    });

    cleanerWorker.on('completed', onCompleted);
    cleanerWorker.on('failed', onFailed);

    await cleanerQueue.add(activity, {}, {
        repeat: {
            cron: '0 0 * * *'
        }
    });


    logger.info(`✅ ${cleanerQueueWorker} started`);

}

const onExecute = async (job: Job<any, any, string>) : Promise<any> => {
    
    const result = await prayerService.cleanPrayers();


    if(!result) {
        throw new Error('clean not executed correctly. prayers not updated');
    }

}

const onCompleted = (job: Job<any, any, string>) => {
    logger.info(`✅ ${cleanerQueueName} job completed successfully`, {
        jobId: job.id
    })
}

const onFailed = (job: Job<any, any, string>, err: Error) => {
    logger.error(`❌ ${cleanerQueueName} failed`,err, {
        jobId: job.id
    })
}


export {
    instantiateCleanerWorker
}