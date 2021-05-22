const path = require('path')
const express = require('express')
const xss = require('xss')
const ProfilesService = require('./profiles-service')

const profilesRouter = express.Router()
const bodyParser = express.json()

const serializeProfile = profile => ({
    id: profile.id,
    profiletype_id: xss(profile.profiletype_id),
    region_id: xss(profile.region_id),
    fit: xss(profile.fit),
    category: xss(profile.category),
    number_sizes: xss(profile.number_sizes).split(','),
    results: xss(profile.results)
})

profilesRouter
    .route('/')
    .get((req, res, next) => {
        ProfilesService.getAllProfiles(req.app.get('db'))
            .then(profiles => {
                res.json(profiles.map(serializeProfile))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for(const field of ['profiletype_id', 'region_id', 'fit', 'category', 'number_sizes', 'results']){
            if(!req.body[field]) {
                return res.status(400).send({ 
                    error: { message: `'${field}' is required`}
                })
            }
        }
        const { profiletype_id, region_id, fit, category, number_sizes, results } = req.body;
        const newProfile = { profiletype_id, region_id, fit, category, number_sizes, results }

        ProfilesService.insertProfile(
            req.app.get('db'),
            newProfile
        )
            .then(profile => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${profile.id}`))
                    .json(serializeProfile(profile))
            })
            .catch(next)
    })

profilesRouter
    .route('/:profile_id')
    .all((req, res, next) => {
        const profile_id = req.params

        ProfilesService.getById(
            req.app.get('db'),
            profile_id
        )
        .then(profile => {
            //make sure profile is found
            if (!profile) {
                return res.status(404).json({
                    error: { message: `Profile Not Found` }
                })
            }
            res.profile = profile //save the profile for the next middleware
            next() //call next so the next middleware happens
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.profile.id,
            profiletype_id: xss(res.profile.profiletype_id), //sanitize
            region_id: xss(res.profile.region_id), //sanitize
            fit: xss(res.profile.fit), //sanitize
            category: xss(res.profile.category), //sanitize
            number_sizes: xss(res.profile.number_sizes), //sanitize
            results: xss(res.profile.results) //sanitize
        })
    })
    .delete((req, res, next) => {
        const profile_id = req.params
        ProfilesService.deleteProfile(
            req.app.get('db'),
            req.params.profile_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { profiletype_id, region_id, fit, category, number_sizes, results } = req.body;
        const profileToUpdate = { profiletype_id, region_id, fit, category, number_sizes, results }

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain 'profiletype_id', 'region_id', 'fit', 'category', 'number_sizes' or 'results'` }
            })
        }

        ProfilesService.updateProfile(
            req.app.get('db'),
            req.params.profile_id,
            profileToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = profilesRouter