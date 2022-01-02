const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();

(async () => {

    const res = await axios.get(`${process.env.ENDPOINT}/venice`);
    
    console.log(res.data)

})()