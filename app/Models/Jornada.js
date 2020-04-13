'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Jornada extends Model {

    static get table(){
        return 'jornada'
    }

    static get primaryKey (){
        return 'CodJornada'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }

    static scopeAlias (query){
        return query.select(['CodJornada', 'Nome'])
    }

    LinhaJornada () {
        //return this.hasMany('App/Models/LinhaJornada', 'CodJornada', 'CODJORNADA')
        return this.belongsToMany('App/Models/Horario', 'CODJORNADA', 'CODHORARIO', 'CodJornada','CodHorario').pivotTable('linhajornada').withPivot(['tipoDia','Dia']);
    }

    static Salvar () {
        //return this.hasMany('App/Models/LinhaJornada', 'CodJornada', 'CODJORNADA')
        // return this.belongsToMany.createMany([
        //     { CodJornada: ID[0].Nr_Atual+1, Nome: Teste, DataInicio: moment(), Regime: 1 },
        //     { CodJornada: ID[0].Nr_Atual+2, Nome: teste2,  DataInicio: moment(), Regime: 1}
        //   ]);
    }
}

module.exports = Jornada
