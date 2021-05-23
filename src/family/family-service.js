const FamiliesService = {
    getAllFamilies(knex){
        return knex.select('*').from('families')
    },
    insertFamily(knex, newFamily){
        return knex
            .insert(newFamily)
            .into('families')
            .returninga('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('families').select('*').where('id', id).first()
    },
    deleteFamily(knex, id) {
        return knex('families')
            .where({ id })
            .delete()
    },
    updateFamily(knex, id, newFamilyFields) {
        return knex('families')
            .where({ id })
            .update(newFamilyFields)
    }
}

module.exports = FamiliesService