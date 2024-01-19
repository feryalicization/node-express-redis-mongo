
const CustomError = require('../helper/response')

function errorHandler(err, req, res, next) {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ error: err.message })
  } else {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = errorHandler
