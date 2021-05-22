const RegionsService = {
    getAllRegions(knex){
        return knex.select('*').from('regions')
    },
    insertRegion(knex, newRegion){
        return knex
            .insert(newRegion)
            .into('regions')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('regions').select('*').where('id', id).first()
    },
    deleteRegion(knex, id){
        return knex('regions')
            .where({ id })
            .delete()
    },
    updateRegion(knex, id, newRegionFields){
        return knex('regions')
            .where({ id })
            .update(newRegionFields)
    }
}

module.exports = RegionsService