const User = require("../models/user.model")
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWT_SECRET_KEY 
const { storeInRedis } = require("../middleware/cacheMiddleware")
const { redisClient } = require('../index')

exports.create = async (req, res) => {
    try {
      const { userName, accountNumber, emailAddress, identityNumber } = req.body
      const user = await User.create({ userName, accountNumber, emailAddress, identityNumber })
  
      res.json({ code: 1, message: 'Create data success', data: user })
  
      const key = accountNumber 
      const value = { userName, accountNumber, emailAddress, identityNumber }
      await storeInRedis(key, value)
    } catch (error) {
      console.error("Error creating data:", error.message)
      res.status(500).json({ code: -1, message: 'Internal Server Error', error })
    }
  }


exports.login = async (req, res) => {
    const { accountNumber, identityNumber } = req.body
  
    try {
      const user = await User.findOne({ accountNumber, identityNumber })
  
      if (!user) {
        return res.status(401).json({ code: -1, message: 'Invalid credentials', data: null })
      }
  
      const tokenPayload = {
        userId: user._id,
        userName: user.userName,
        accountNumber: user.accountNumber,
        identityNumber: user.identityNumber,
      }
  
      const token = jwt.sign(tokenPayload, jwtSecretKey, { expiresIn: '1h' })
  
      res.json({ code: 1, message: 'Login success', data: { token } })
    } catch (error) {
      console.error(error)
      res.status(500).json({ code: -1, message: 'Internal Server Error', data: null })
    }
  }


  exports.findAll = async (req, res) => {
    const token = req.headers.authorization
  
    try {
      if (!token) {
        return res.status(401).json({ code: -1, message: 'Invalid credentials', data: null })
      }
  
      const decodedToken = jwt.verify(token, jwtSecretKey)
  
      const data = await User.find()
  
      const data_user = data.map(user => ({
        id: user._id,
        userName: user.userName,
        accountNumber: user.accountNumber,
        emailAddress: user.emailAddress,
        identityNumber: user.identityNumber,
      }))
  
      res.json({ code: 1, message: "Get data success", data: data_user })
    } catch (tokenError) {
      console.error(tokenError)
      return res.status(401).json({ code: -1, message: 'Invalid token', data: null })
    }
  }
  


exports.show = (req, res) => {
    const id = req.params.id
    const token = req.headers.authorization

    try {
        if (!token) {
            return res.status(401).json({ code: -1, message: 'Invalid credentials' })
        }

        const decodedToken = jwt.verify(token, jwtSecretKey)

        User.findById(id)
            .then(data => {
                if (!data) {
                    res.status(404).send({ code: -1, message: "User not found", data: null })
                    return
                }

                const user_data = {
                    id: data._id,
                    userName: data.userName,
                    accountNumber: data.accountNumber,
                    emailAddress: data.emailAddress,
                    identityNumber: data.identityNumber,
                }

                res.send({ code: 1, message: "Get data success", data: user_data })
            })
            .catch(error => res.status(500).send({ code: -1, message: "Error retrieving data", error }))
    } catch (tokenError) {
        console.error(tokenError)
        return res.status(401).json({ code: -1, message: 'Invalid token', data: null })
    }
}





exports.update = async (req, res) => {
    const { id } = req.params
    try {
      const user = await User.findByIdAndUpdate(id, req.body, { new: true })
      if (!user) {
        return res.status(404).send({ code: -1, message: "User not found", data: null })
      }
      
      const key = user.accountNumber 
      const value = { ...user.toObject(), ...req.body } 
      await storeInRedis(key, value)
  
      res.send({ code: 1, message: "Update user success", data: user })
    } catch (error) {
      console.error(error)
      res.status(500).send({ code: -1, message: "Error updating user", error })
    }
  }


exports.delete = async (req, res) => {
    const id = req.params.id
    try {
      const user = await User.findByIdAndDelete(id)
      if (!user) {
        return res.status(404).send({ code: -1, message: "User not found" })
      }
  
      const key = user.accountNumber 
      await redisClient.del(key)
  
      res.send({ code: 1, message: "Delete data success" })
    } catch (error) {
      console.error(error)
      res.status(500).send({ code: -1, message: "Error deleting data", error })
    }
  }