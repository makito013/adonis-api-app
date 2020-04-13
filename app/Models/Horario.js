'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Horario extends Model {
    static get table(){
        return 'horario'
    }

    static get primaryKey (){
        return 'CodHorario'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }

    static scopeAlias (query){
        return query.select(['Nr_Atual']).where('No_Campo','Like',campo)     
    }
}

module.exports = Horario
