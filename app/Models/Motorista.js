'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Motorista extends Model {
    static get table(){
        return 'veiculo'
    }

    static get primaryKey (){
        return 'CodVeiculo'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }
}

module.exports = Motorista
