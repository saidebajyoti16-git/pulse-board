// Vercel detects this as an Express application and runs it as a Function.
require('express')
module.exports = require('./server/index.js')
