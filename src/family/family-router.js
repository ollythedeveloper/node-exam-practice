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
        
    })