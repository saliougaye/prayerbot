const moment = require('moment')

const d = moment("Sun 2 Jan 2022", "ddd, DD MMM YYYY");

console.log("Today: " + d.toString())
console.log("Tommorrow: " + d.add(1, 'days').format('ddd, DD MMM YYYY'))