const path = require('path')
const express = require('express')
const xss = require('xss')
const RegionsService = require('./regions-service')

const regionsRouter = express.Router()
const bodyParser = express.json()

const serializeRegion = region => ({
    id: region.id,
    country: xss(region.country)
})

regionsRouter
    .route('/')
    .get((req, res, next) => {
        RegionsService.getAllRegions(req.app.get('db'))
            .then(regions => {
                res.json(regions.map(serializeRegion))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for(const field of ['country']){
            if(!req.body[field]){
                return res.status(400).send({ 
                    error: { message: `'${field}' is required` } 
                })
            }
        }
        const { country } = req.body;
        const newRegion = { country }

        RegionsService.insertRegion(
            req.app.get('db'),
            newRegion
        )
        .then(region => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${region.id}`))
                .json(serializeRegion(region))
        })
        .catch(next)
    })

regionsRouter
    .route('/:region_id')
    .all((req, res, next) => {
        const { region_id } = req.params
        RegionsService.getById(
            req.app.get('db'),
            region_id
        )
        .then(region => {
            //make sure region is found
            if(!region){
                return res.status(404).send({
                    error: { message: `Region Not Found` }
                })
            }
            res.region = region //save the region for the next middleware
            next() //call next so the next middleware happens
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.region.id,
            country: xss(res.region.country) //sanitize country
        })
    })
    .delete((req, res, next) => {
        const { region_id } = req.params
        RegionsService.deleteRegion(
            req.app.get('db'),
            req.params.region_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { country } = req.body
        const regionToUpdate = { country }

        const numberOfValues = Object.values(regionToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain 'country'` }
            })
        }

        RegionsService.updateRegion(
            req.app.get('db'),
            req.params.region_id,
            regionToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = regionsRouter
