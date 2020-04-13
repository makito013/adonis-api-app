'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CmNumsequencial extends Model {

    static get primaryKey () {
        return null
    }

    static get table () {
        return 'CM_Numsequencial'
    }

    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    // static scopeAtualizaNumeroSequencial(query){
        
    //       this.select('Nr_Atual')
    // }
    static pegaNumeroSequencial(table){
    var cm = this.query().select('*').where('No_Campo',table).fetch()
    return cm

   //    var id = cm[0].Nr_Atual;
    var affectedRows = this.query().where('No_Campo',table).update({'Nr_Atual':id+1}).fetch(); 
    if (affectedRows > 0) {
    return cm[0].Nr_Atual+1;
    }
    else return -1;
    }
}

module.exports = CmNumsequencial
