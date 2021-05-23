const path = require('path')
const express = require('express')
const xss = require('xss')
const SandwichesService = require('./sandwiches-service')

const sandwichesRouter = express.Router()
const bodyParser = express.json()

const serializeSandwich = sandwich => ({
    id: sandwich.id,
    bread: xss(sandwich.bread),
    cheese: xss(sandwich.cheese),
    protien: xss(sandwich.protien),
    veggies: xss(sandwich.veggies)
})

sandwichesRouter
    .route('/')
    .get((req, res, next) => {
        SandwichesService.getAllSandwiches(
            req.app.get('db')
        )
        .then(sandwiches => {
            res.json(sandwiches.map(serializeSandwich))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['bread', 'cheese', 'protien', 'veggies']){
            if(!req.body[field]){
                return res.status(400).send({
                    error: { message: `'${field} is required` }
                })
            }
        }

        const { bread, cheese, protien, veggies } = req.body;
        const newSandwich = { bread, cheese, protien, veggies }

        SandwichesService.insertSandwich(
            req.app.get('db'),
            newSandwich
        )
        .then(sandwich => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${sandwich.id}`))
                .json(serializeSandwich(sandwich))
        })
        .catch(next)
    })
sandwichesRouter
    .route('/:sanwiches_id')
    .all((req, res, next) => {
        const { sandwich_id } = req.params
        SandwichesService.getById(
            req.app.get('db'),
            sandwich_id
        )
        .then(sandwich => {
            //make sure it exists
            if(!sandwich){
                return res.status(404).json({
                    error: { message: `Sandwich Not Found` }
                })
            }
            res.sandwich = sandwich
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.sandwich.id,
            bread: xss(res.sandwich.bread),
            cheese: xss(res.sandwich.cheese),
            protien: xss(res.sandwich.protien),
            veggies: xss(res.sandwich.veggies)
        })
    })
    .delete((req, res, next) => {
        const { sandwich_id } = req.params
        SandwichesService.deleteSandwich(
            req.app.get('db'),
            req.params.sandwich_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { bread, cheese, protien, veggies } = req.body;
        const sandwhichToUpdate = { bread, cheese, protien, veggies }

        const numberOfValues = Object.values(sandwhichToUpdate).filter(Boolean).length
        if(numberOfValues === 0){
            return res.status(400).json({
                error: { message: `Request body must contain either 'bread', 'cheese', 'protein' or 'veggies'`}
            })
        }

        SandwichesService.updateSandwich(
            req.app.get('db'),
            req.params.sandwich_id,
            sandwhichToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })