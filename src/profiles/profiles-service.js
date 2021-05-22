const ProfilesService = {
    getAllProfiles(knex) {
        return knex.select('*').from('profiles')
    },
    insertProfile(knex, newProfile){
        return knex
            .insert(newProfile)
            .into('profiles')
            .returning('*')
            .then(rows => {
                return rows[0]
            }) 
    },
    getById(knex, id){
        return knex.from('profiles').select('*').where('id', id).first()
    },
    deleteProfile(knex, id){
        return knex('profiles')
            .where({ id })
            .delete()
    },
    updateProfile(knex, id, newProfileFields){
        return knex('profiles')
            .where({ id })
            .update(newProfileFields)
    }
}

module.exports = ProfilesService