'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cartoe extends Model {
    static get table(){
        return 'identificador'
    }

    static get primaryKey (){
        return 'CodIdentificador'
    }
}

module.exports = Cartoe
