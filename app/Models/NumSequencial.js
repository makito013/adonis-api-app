'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class NumSequencial extends Model {
    static get table(){
        return 'cm_numsequencial'
    }

    static get primaryKey (){
        return 'Nr_Atual'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }

    static scopeValorAtual (query){
        var id = query.select(['No_Campo']).where('No_Campo','Like','Horario')  
        return id[0].Nr_Atual
    }
}

module.exports = NumSequencial
