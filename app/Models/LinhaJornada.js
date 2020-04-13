'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LinhaJornada extends Model {
    static get table(){
        return 'linhajornada'
    }

    static get primaryKey (){
        return 'CodLinhaJornada'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }   
    
    static Salvar () {
        //return this.hasMany('App/Models/LinhaJornada', 'CodJornada', 'CODJORNADA')
        // return this.belongsToMany.createMany([
        //     { CodJornada: ID[0].Nr_Atual+1, Nome: Teste, DataInicio: moment(), Regime: 1 },
        //     { CodJornada: ID[0].Nr_Atual+2, Nome: teste2,  DataInicio: moment(), Regime: 1}
        //   ]);
    }
}

module.exports = LinhaJornada
