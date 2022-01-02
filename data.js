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


        const usersRaw = await client.get("users") 
        
        const users = JSON.parse(usersRaw);

        users[user.chatId] = user;

        await client.set('users', JSON.stringify(users));


    }

    const addPrayerTimes = () => {

    }

    const getPrayers = async (city) => {
        
    }

    return {
        initDb,
        getUser,
        addUser,
        editUser,
        closeClient
    }

}

module.exports = data