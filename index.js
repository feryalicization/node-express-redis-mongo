const express = require('express')
const app = express()
const db = require("./models")
const bodyParser = require('body-parser')
const Redis = require("ioredis")

const PORT = process.env.PORT || 3000
const REDIS_PORT = process.env.REDIS_PORT || 6379
const REDIS_HOST = "127.0.0.1" 

const redisClient = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  retryStrategy: (times) => {
    // Reconnect with exponential backoff (2^times seconds)
    const delay = Math.min(times * 100, 2000)
    return delay
  },
})

app.use(express.json())
app.use(bodyParser.json())

app.post("/", async (req, res) => {
  try {
    const { key, value } = req.body
    const response = await redisClient.set(key, value)
    res.json(response)
  } catch (error) {
    console.error("Error setting data in Redis:", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.get("/", async (req, res) => {
  try {
    const { key } = req.body
    const response = await redisClient.get(key)
    res.json(response)
  } catch (error) {
    console.error("Error setting data in Redis:", error.message)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

const mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

db.mongoose.connect(db.url, mongooseConfig)
  .then(() => console.log("Database connected"))
  .catch(err => {
    console.log(`Failed to connect to the database: ${err.message}`)
    process.exit(1)
  })

module.exports = { redisClient }

// Routes
require("./routes/user.routes")(app, redisClient)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})


