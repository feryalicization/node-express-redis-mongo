const dotenv = require('dotenv')
dotenv.config()


module.exports = {
    url: process.env.DATABASE_URL
}