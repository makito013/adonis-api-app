'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PermissaoAcessoVeiculo extends Model {

    static get table(){
        return 'permissaoacessoveiculo'
    }

    static get primaryKey (){
        return 'CodPermissaoAcessoVeiculo'
    }

    static get foreignKey (){
        return 'CodVeiculo'
    } 

    static get createdAtColumn (){
        return null
    }

    static scopeGeral (query){
        return query.select('CodLocalAcesso')     
    }

    static get updatedAtColumn (){
        return null
    }

    nomeLocais () {
        return this.hasOne('App/Models/localAcesso', 'CODLOCALACESSO', 'CodLocalAcesso')
    }
}

module.exports = PermissaoAcessoVeiculo
