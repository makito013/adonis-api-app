'use strict'

const Schema = use('Schema')

class WebSchema extends Schema {


  
  up () {
    this.createIfNotExists('EventoSistemaWeb', (table) => {

      table.increments('CodEventoSistemaWeb')
      table.string('Conteudo', 200).notNullable()
      table.integer('CodigoObjeto').notNullable()
      table.integer('CodUsuario').notNullable()
      table.integer('TipoEvento').notNullable()
      table.datetime('DataHoraEvento')
      table.datetime('DataReferenciaInicio')
      table.datetime('DataReferenciaFim')
      
    })

    this.createIfNotExists('dwsession', (table) => {
        table.increments('CodDWSession').notNullable()
        table.integer('CodUsuario').notNullable()
        table.string('Token',200).defaultTo()
        table.datetime('CreationDate').notNullable()
        table.datetime('ExpiryDate').defaultTo()    
    })

    this.alter('dwsession', (table) => {
      table.dropColumn('Token')
    })

    this.alter('dwsession', (table) => {
        table.string('Token',200).defaultTo()    
    })
    
    
  }
  

  down () {
    this.drop('EventoSistemaWeb')
    this.drop('dwsession')
  }
}

module.exports = WebSchema
