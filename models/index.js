const dbConfig = require("../config.js")
const mongoose = require("mongoose")

module.exports = {
    mongoose,
    url: dbConfig.url,
    user: require("./user.model.js")(mongoose)
}