const QuestionsService = {
    getAllQuestions(knex){
        return knex.select('*').from('questions')
    },
    insertQuestion(knex, newQuestion){
        return knex
            .insert(newQuestion)
            .into('questions')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('questions').select('*').where('id', id).first()
    },
    deleteQuestion(knex, id){
        return knex('questions')
            .where({ id })
            .delete()
    },
    updateQuestion(knex, id, newQuestionFields){
        return knex('questions')
            .where({ id })
            .update(newQuestionFields)
    }
}

module.exports = QuestionsService