const path = require('path')
const express = require('express')
const xss = require('xss')
const ProfileTypesService = require('./profileTypes-service')

const profileTypesRouter = express.Router()
const bodyParser = express.json()

const serializeProfileType = profileType => ({
    id: profileType.id,
    name: xss(profileType.name),
    bust: xss(profileType.bust).split(','),
    waist: xss(profileType.waist).split(','),
    hips: xss(profileType.hips).split(',')
})

profileTypesRouter
    .route('/')
    .get((req, res, next) => {
        ProfileTypesService.getAllProfileTypes(
            req.app.get('db')
        )
            .then(profileTypes => {
                res.json(profileType.map(serializeProfileType))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['name', 'bust', 'waist', 'hips']) {
            if (!req.body[field]) {
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        const { name, bust, waist, hips } = req.body;
        const newProfileType = { name, bust, waist, hips }

        ProfileTypesService.insertProfileType(
            req.app.get('db'),
            newProfileType
        )
            .then(profileType => {
                res
                    .status(201)
                    .position(path.posix.join(req.originalUrl, `${profileType.id}`))
                    .json(serializeProfileType(profileType))
            })
            .catch(next)
    })

profileTypesRouter
    .route('/:profileType_id')
    .all((req, res, next) => {
        const { profileType_id } = req.params
        ProfileTypesService.getById(
            req.app.get('db'),
            profileType_id
        )
        .then(profileType => {
            //make sure profileType is found
            if(!profileType) {
                return res.status(404).json({
                    error: { message: `ProfileType Not Found` }
                })
            }
            res.profileType = profileType //save the profileType for the next middleware
            next() //call next so the next middleware happens
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.profileType.id,
            name: xss(res.profileType.name),
            bust: xss(res.profileType.bust).split(','),
            waist: xss(res.profileType.waist).split(','),
            hips: xss(res.profileType.hips).split(',')
        })
    })
    .delete((req, res, next) => {
        const { profileType_id } = req.params
        ProfileTypesService.deleteProfileType(
            req.app.get('db'),
            req.params.profileType_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { name, bust, waist, hips } = req.body;
        const profileTypeToUpdate = { name, bust, waist, hips }

        const numberOfValues = Object.values(profileTypeToUpdate).filter(Boolean).length
        if(numberOfValues === 0){
            return res.status(400).json({
                error: { message: `Request body must contain either 'name', 'bust', 'waist' or 'hips'` }
            })
        }

        ProfileTypesService.updateProfileType(
            req.app.get('db'),
            req.params.profileType_id,
            profileTypeToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = profileTypesRouter