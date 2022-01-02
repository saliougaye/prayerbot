const body = require('./structure.json');
console.log(body.prayers["data"])

const ou = {
  city: 'city',
  date: 'date',
  ...body.prayers["data"]["conegl"]
}

console.log(ou)