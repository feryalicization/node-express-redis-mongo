const { redisClient } = require("../index")

const checkRedisCache = async (req, res, next) => {
  let key

  // Check if the key is in the params
  if (req.params && req.params.key) {
    key = req.params.key
  }

  // If the key is not in the params, check in body
  if (!key && req.body && req.body.key) {
    key = req.body.key
  }

  // If the key is still not found, proceed to the next middleware
  if (!key) {
    return next()
  }

  try {
    const cachedData = await redisClient.get(key)

    if (cachedData) {
      // If data is found in Redis cache, send it as the response
      res.json(JSON.parse(cachedData))
    } else {
      // If data is not in cache, proceed to the next middleware
      next()
    }
  } catch (error) {
    console.error("Error checking Redis cache:", error.message)
    res.status(500).json({ code: -1, message: "Internal Server Error" })
  }
}

const storeInRedis = async (key, data) => {
  try {
    // Store data in Redis
    await redisClient.set(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error storing data in Redis:", error.message)
  }
}

module.exports = { checkRedisCache, storeInRedis }
