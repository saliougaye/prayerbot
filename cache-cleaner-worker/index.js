const moment = require('moment');
const { createClient } = require('redis');
const intervalTime = 60000;
const FORMAT_TIME = 'H:mm:ss';
const FORMAT_DATE = 'ddd,DD MMM YYYY';

const midnight = moment('0:00:00', FORMAT_TIME);
const one = moment('1:00:00', FORMAT_TIME);

const delay = () => {
    return new Promise(res => setTimeout(res, intervalTime))
}


(async () => {


    try {

        const client = createClient({
            url: process.env.REDIS_DB
        });
    
        
    
        while(true) {
    
            const now = moment();

            const isTimeToClear = now.isBetween(midnight, one);
    
            if(isTimeToClear) {
    
                await client.connect();
    
                const prayersRaw = await client.get("prayers");

                const prayers = JSON.parse(prayersRaw);
                
                for(const date in prayers) {
                    const dateFormat = moment(date, FORMAT_DATE);

                    if(dateFormat.isBefore(moment())) {

                        delete prayers[date];

                    }
                }


                await client.set('prayers', JSON.stringify(prayers));

                
    
                await client.quit();
    
            }
    
    
            await delay();
    
        }

    } catch(err) {

        console.log(`Error\n${err}`)
    }
    

})();