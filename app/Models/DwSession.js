'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
const User = use('App/Models/Usuario')

class DwSession extends Model {
    static get table () { 
        return 'DWSession'
    }
    static get primaryKey () {
        return 'CodDWSession'
    }

      
    static get createdAtColumn () {
        return 'CreationDate'
    }
    static get updatedAtColumn () {
        return null
    } 
    // static get incrementing () {
    //     return false
    //   }
    static salvarToken(token,user){
    //  var DwSession =  this.query().select('*').where('Token','=',token).fetch();
    var DwSession  =  this.query().findOrCreate(
        {'CodUsuario':user.CODPESSOA},
        {'Token' : token, 'CodUsuario':user.CODPESSOA, 'CreationDate': new Date(),'ExpiryDate': new Date()}
        ).fetch()
    
    return DwSession

    }
    size () {
        return this.isOne ? 1 : this.rows.length
    }
    dados1 () {
        return this.rows
    }
    static validarToken(tokenentrada){
     //   return tokenentrada
     return this.query().select('USUARIO.CODPESSOA as CodPessoa','DWSESSION.Token as Token').innerJoin('USUARIO','USUARIO.CODPESSOA','DWSESSION.CODUSUARIO').where('Token','=',tokenentrada).limit(1).fetch()
    
    }
    static scopeHasUsuario (query) {
        return query.has('usuario')
    }

    usuario () {
        return this.hasOne('App/Models/Usuario')
    }

}

module.exports = DwSession
