const moment = require('moment');
const { createClient } = require('redis');
const intervalTime = 60000;
const midnight = '0:00:00'

const delay = () => {
    return new Promise(res => setTimeout(res, intervalTime))
}


(async () => {


    try {

        const client = createClient({
            url: process.env.REDIS_DB
        });
    
        
    
        while(true) {
    
            const now = moment().format('H:mm:ss');
    
            if(now === midnight) {
    
                await client.connect();
    
                const prayersRaw = await client.get("prayers");

                const prayers = JSON.parse(prayersRaw);
                
                for(const date in prayers) {
                    const dateFormat = moment(date, 'ddd,DD MMM YYYY');

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