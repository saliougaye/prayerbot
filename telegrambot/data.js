const { createClient } = require('redis');

const data = () => {

    const client = createClient({
        url: process.env.REDIS_DB
    });

    const openClient = async () => {
        await client.connect();
    }

    const closeClient = async () => {
        await client.quit()
    }

    const initDb = async () => {
        await openClient();

        const userList = await client.get('users');

        if(!userList) {
            await client.set('users', JSON.stringify({}));
        }

        const prayersObj = await client.get('prayers');

        if(!prayersObj) {
            await client.set('prayers', JSON.stringify({}));
        }


    }

    const getUser = async (chatId) => {

        const usersRaw = await client.get("users") 


        const users = JSON.parse(usersRaw);

        const user = users[chatId];

        return user;
    }

    const addUser = async (user) => {

        const usersRaw = await client.get("users") 
        
        const users = JSON.parse(usersRaw);

        users[user.chatId] = user;

        await client.set("users", JSON.stringify(users))

    }

    const editUser = async (user) => {


        const usersRaw = await client.get("users"); 
        
        const users = JSON.parse(usersRaw);

        users[user.chatId] = user;

        await client.set('users', JSON.stringify(users));


    }

    const addPrayerTimes = async (date, city, data) => {

        const prayersRaw = await client.get("prayers");

        const prayers = JSON.parse(prayersRaw);

        if(!prayers[date]) {
            prayers[date] = {};
        }

        prayers[date][city] = data;

        await client.set("prayers", JSON.stringify(prayers));

    }

    const getPrayers = async (date, city) => {

        const prayersRaw = await client.get("prayers");

        const prayers = JSON.parse(prayersRaw);

        if(prayers[date] && prayers[date][city]) {
            const prayerData = prayers[date][city];

            return {
                city: city,
                date: date,
                ...prayerData
            }
        }
        
        return undefined;
        
    }

    return {
        initDb,
        getUser,
        addUser,
        editUser,
        closeClient,
        getPrayers,
        addPrayerTimes
    }

}

module.exports = data