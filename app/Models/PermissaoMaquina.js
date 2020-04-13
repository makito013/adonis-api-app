'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PermissaoMaquina extends Model {
    static get table () {
        return 'permissaomaquinas'
    }
    
    static get createdAtColumn () {
        return 'DataPermissao'
    }
    static get primaryKey () {    
        return 'CodPermissao'
    }
    static get updatedAtColumn () {
        return null
    }
}

module.exports = PermissaoMaquina
