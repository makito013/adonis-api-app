'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PermissaomaquinaSchema extends Schema {
  up () {
    this.createIfNotExists('permissaomaquinas', (table) => {
      table.increments('CodPermissao').notNullable()
      table.integer('CodMaquina').notNullable()
      table.integer('CodLocalAcesso').notNullable()
      table.datetime('DataPermissao').notNullable()  
    })

    this.createIfNotExists('configuracaoflexivel', (table) => {
      table.increments('CodConfiguracaoFlexivel').notNullable()      
      table.integer('Escopo').notNullable()
      table.string('NomeItem',100).notNullable()  
    })

    this.alter('configuracaoflexivel', (table) => {
      table.string('Apelido',100).defaultTo()    
    })
  }

  down () {
    this.drop('permissaomaquinas')
    this.drop('configuracaoflexivel')
  }
}

module.exports = PermissaomaquinaSchema
