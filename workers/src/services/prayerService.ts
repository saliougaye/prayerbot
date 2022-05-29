import moment from "moment";
import redisHelper from "../helpers/redis-helper";
import { MessageToSend, Prayers, User, UserTimezone, } from '../types/index';
import axios from "axios";
import { Telegraf } from 'telegraf';
import config from "../config";

const prayerService = () => {

    const prayerKey = 'CACHE_PRAYER';
    const userKey = 'PRAYER_USERS';

    const cleanPrayers = async (): Promise<"OK" | undefined> => {
        const rawPrayers = await redisHelper.get(prayerKey);

        if (!rawPrayers) {
            return;
        }

        const prayers = JSON.parse(rawPrayers) as Prayers;

        const prayerToSave: Prayers = {}

        Object.keys(prayers).forEach(el => {
            const prayerDate = moment(prayers[el].date, 'ddd,DD MMM YYYY').startOf('day');
            const now = moment().startOf('day');


            const isBefore = prayerDate.isBefore(now);

            if (!isBefore) {
                prayerToSave[el] = prayers[el];
            }
        });

        const result = await redisHelper.set(prayerKey, JSON.stringify(prayerToSave))

        return result;


    }



    const notify = async (): Promise<void> => {

        const users = await getUsers();

        const mappedUsers: UserTimezone[] = await mapUserTimezone(users);

        const messagesToSend: MessageToSend[] = await createMessages(mappedUsers);

        await sendMessages(messagesToSend);

    }

    const mapUserTimezone = async (users: User[]): Promise<UserTimezone[]> => {

        const mappedUser: UserTimezone[] = [];


        for (const user of users) {

            if (mappedUser.filter(el => el.city === user.city).length !== 0) {
                mappedUser.filter(el => el.city === user.city)[0].users.push(user.id)
            } else {
                const { latitude, longitude } = user.coordinates;
                const url = `https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`;

                const res = await axios.get(url);

                mappedUser.push({
                    users: [user.id],
                    time: res.data.time,
                    city: user.city
                });
            }

        }

        return mappedUser;
    }

    const createMessages = async (usersTimezone: UserTimezone[]) => {

        const messagesToSend: MessageToSend[] = [];
        const prayers = await getPrayers();

        for (const item of usersTimezone) {

            const cityPrayer = prayers[item.city];

            if (cityPrayer) {

                Object.keys(cityPrayer.today).forEach(el => {

                    if (cityPrayer.today[el] === item.time) {
                        messagesToSend.push({
                            users: item.users,
                            prayer: el,
                            time: cityPrayer.today[el]
                        });
                    }
                    
                });
            }

        }

        return messagesToSend;

    }

    const sendMessages = async (messages: MessageToSend[]) => {

        const bot = new Telegraf(config.botToken);

        for (const message of messages) {

            for (const user of message.users) {
                await bot.telegram.sendMessage(user, `📿🤲🏿 It's time to pray ${message.prayer} - ${message.time}`);
            }

        }

    }

    const getUsers = async () => {
        const rawUsers = await redisHelper.get(userKey);

        if (!rawUsers) {
            throw Error('failed to get users');
        }

        const users = JSON.parse(rawUsers) as User[];

        return users;
    }

    const getPrayers = async () => {
        const rawPrayers = await redisHelper.get(prayerKey);

        if (!rawPrayers) {
            throw Error('failed to get prayers')
        }

        const prayers = JSON.parse(rawPrayers) as Prayers;

        return prayers;
    }

    return {
        cleanPrayers,
        notify
    }
}

export default prayerService();