const path = require('path')
const express = require('express')
const xss = require('xss')
const QuestionsService = require('./question-service')

const questionsRouter = express.Router()
const bodyParser = express.json()

const serializeQuestion = question => ({
    id: question.id,
    question: xss(question.question),
    guidance: xss(question.guidance),
    response: xss(question.guidance)
})

questionsRouter
    .route('/')
    .get((req, res, next) => {
        QuestionsService.getAllQuestions(
            req.app.get('db')
        )
        .then(questions => {
            res.json(questions.map(serializeQuestion))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['question', 'guidance', 'response']) {
            if(!req.body[field]){
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        const { question, guidance, response } = req.body;
        const newQuestion = { question, guidance, response }

        QuestionsService.insertQuestion(
            req.app.get('db'),
            newQuestion
        )
        .then(question => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${question.id}`))
                .json(serializeQuestion(question))
        })
        .catch(next)
    })

questionsRouter
    .route('/:question_id')
    .all((req, res, next) => {
        const { question_id } = req.params
        QuestionsService.getById(
            req.app.get('db'),
            question_id
        )
        .then(question => {
            //make sure question is found
            if(!question){
                return res.status(404).json({
                    error: { message: `Question Not Found` }
                })
            }
            res.question = question //save question for next middleware
            next() //call next so next middleware happens
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.question.id,
            question: xss(res.question.question),
            guidance: xss(res.question.guidance),
            response: xss(res.question.response)
        })
    })
    .delete((req, res, next) => {
        const { question_id } = req.params
        QuestionsService.deleteQuestion(
            req.app.get('db'),
            req.params.question_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch((req, res, next) => {
        const { question, guidance, response } = req.body;
        const questionToUpdate = { question, guidance, response }

        const numberOfValues = Object.values(questionToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must include either 'question', 'guidance' or 'response'` }
            })
        }

        QuestionsService.updateQuestion(
            req.app.get('db'),
            req.params.question_id,
            questionToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = questionsRouter