require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const profileTypesRouter = require('./profileTypes/profileTypes-router')
const regionsRouter = require('./regions/regions-router')
const profilesRouter = require('./profiles/profiles-router')
const questionsRouter = require('./questions/questions-router')
const profilesRouter = require('./profiles/profiles-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/questions', questionsRouter)

app.use('/api/profiles', profilesRouter)
app.use('/api/regions', regionsRouter)
app.use('/api/profileTypes', profileTypesRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app