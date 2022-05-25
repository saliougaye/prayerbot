import {
    instantiateCleanerWorker
} from './workers';

const start = async () => {
    console.log('🔃 Starting Workers')

    await instantiateCleanerWorker();


    console.log('✅ Workers Started')
}

start()