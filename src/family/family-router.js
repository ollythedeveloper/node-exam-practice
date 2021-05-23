const path = require('path')
const express = require('express')
const xss = require('xss')
const FamiliesService = require('./family-service')


const familiesRouter = express.Router()
const bodyParser = express.json()

const serializeFamiliy = family => ({
    id: family.id,
    father: xss(family.father),
    mother: xss(family.mother),
    daughter: xss(family.daughter),
    son: xss(family.son)
})

familiesRouter
    .route('/')
    .get((req, res, next) => {
        FamiliesService.getAllFamilies(
            req.app.get('db')
        )
        .then(families => {
            res.json(families.map(serializeFamiliy))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['father', 'mother', 'daughter', 'son']){
            if(!req.body[field]){
                return res.status(400).send({ 
                    error: { message: `'${field}' is required`}
                })
            }
        }

        const { father, mother, daughter, son } = req.body;
        const newFamily = { father, mother, daughter, son }

        FamiliesService.insertFamily(
            req.app.get('db'),
            newFamily
        )
        .then(family => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${family.id}`))
                .json(serializeFamiliy(family))
        })
        .catch(next)
    })

familiesRouter
    .route('/:family_id')
    .all((req, res, next) => {
        const { family_id } = req.params
        FamiliesService.getById(
            req.app.get('db'),
            family_id
        )
        .then(family => {
            //make sure family is found 
            if(!family){
                return res.status(404).json({
                    error: { message: `Family Not Found` }
                })
            }
            res.family = family //save family for next middleware
            next() //call next so the next middlware can happen
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.family.id,
            father: xss(res.family.father),
            mother: xss(res.family.mother),
            daughter: xss(res.family.daughter),
            son: xss(res.family.son)
        })
    })
    .delete((req, res, next) => {
        const { family_id } = req.params
        FamiliesService.deleteFamily(
            req.app.get('db'),
            req.params.family_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { father, mother, daughter, son } = req.body;
        const familyToUpdate = { father, mother, daughter, son }

        const numberOfValues = Object.values(familyToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            res.status(400).json({
                error: { message: `Request body must contain 'father', 'mother', 'daughter' or 'son'`}
            })
        }
        FamiliesService.updateFamily(
            req.app.get('db'),
            req.params.family_id,
            familyToUpdate
        )
        .then(numRowsAffected => {
            res
                .status(204).end()
        })
        .catch(next)
    })

module.exports = familiesRouter