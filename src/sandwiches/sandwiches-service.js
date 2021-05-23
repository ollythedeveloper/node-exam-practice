const SandwichesService = {
    getAllSandwiches(knex){
        return knex.select('*').from('sandwiches')
    },
    insertSandwich(knex, newSandwich){
        return knex
            .insert(newSandwich)
            .into('sandwiches')
            .returning('*')
            .then(rows=>{
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('sandwiches').select('*').where('id', id).first()
    },
    deleteSandwich(knex, id){
        return knex('sandwiches')
            .where({ id })
            .delete()
    },
    updateSandwich(knex, id, newSandwichFields){
        return knex('sandwiches')
            .where({ id })
            .update(newSandwichFields)
    }
}

module.exports = SandwichesService