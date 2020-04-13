'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AlteracaoJornada extends Model {
    static get primaryKey () {
        return 'CODALTERACAOJORNADA'
    }

    static get table () { 
        return 'AlteracaoJornada'
    }
  
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    static scopeAlias(query){
       // return query.select(['CodEmpresa','CodEmpresa as key','Nome','Nome as NomeEmpresa','Endereco','CGC','CEI','DiaInicioMes','DiaFimMes','Numero','NumeroFolha','NumeroVagas','CodAtividadeEconomica as Cnae','Latitude','Longitude'])
    }
    static scopeAlias2(query){
       // return query.select(['CodEmpresa','Nome'])
    }
}

module.exports = AlteracaoJornada
