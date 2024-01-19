const express = require('express')
const userController = require('../controller/user.controller')
const { checkRedisCache, storeInRedis } = require("../middleware/cacheMiddleware")
const { redisClient } = require('../index')

const router = express.Router()

router.post('/login', userController.login)

router.get('/', checkRedisCache, userController.findAll)

router.get('/:id', checkRedisCache, userController.show)

router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body

    await storeInRedis(key, { key, value })

    await userController.create(req, res)
  } catch (error) {
    console.error('Error creating data:', error.message)
    res.status(500).json({ code: -1, message: 'Internal Server Error', error })
  }
})

router.put('/:id', userController.update)

router.delete('/:id', userController.delete)

module.exports = (app) => {
  app.use('/user', router)
}
