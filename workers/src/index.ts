import throng from 'throng';

import {
    instantiateCleanerWorker,
    instantiateNotifier
} from './workers';

const workers = process.env.WEB_CONCURRENCY || 1;


const start = async () => {
    console.log('🔃 Starting Workers')

    await instantiateCleanerWorker();
    await instantiateNotifier();


    console.log('✅ Workers Started')
}


throng({
    workers: workers,
    worker: start,
    lifetime: Infinity
})