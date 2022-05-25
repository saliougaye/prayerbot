import moment from "moment";
import redisHelper from "../helpers/redis-helper";

type Prayer = {
    [name: string] : any
}

const prayerService = () => {

    const prayerKey = 'CACHE_PRAYER';

    const cleanPrayers = async () : Promise<"OK" | undefined> => {
        const rawPrayers = await redisHelper.get(prayerKey);

        if(!rawPrayers) {
            return;
        }

        const prayers = JSON.parse(rawPrayers);

        const prayerToSave : Prayer = {}

        Object.keys(prayers).forEach(el => {
            const prayerDate = moment(prayers[el].date, 'ddd,DD MMM YYYY').startOf('day');
            const now = moment().startOf('day');
            

            const isBefore = prayerDate.isBefore(now);

            if(!isBefore) {
                prayerToSave[el] = prayers[el];
            }
        });

        const result = await redisHelper.set(prayerKey, JSON.stringify(prayerToSave))

        return result;

        
    }

    return {
        cleanPrayers
    }
}

export default prayerService();