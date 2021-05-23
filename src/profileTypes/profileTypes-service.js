const ProfileTypesService = {
    getAllProfileTypes(knex){
        return knex.select('*').from('profile_types')
    },
    insertProfileType(knex, newProfileType){
        return knex
            .insert(newProfileType)
            .into('profile_types')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('profile_types').where('id', id).first()
    },
    deleteProfileType(knex, id){
        return knex.from('profile_types')
            .where({ id })
            .delete()
    },
    updateProfileType(knex, id, newProfileTypeFields){
        return knex.from('profile_types')
            .where({ id })
            .update(newProfileTypeFields)
    }
}

module.exports = ProfileTypesService