'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
class LocalAcesso extends Model {
    static get table(){
        return 'localacesso'
    }

    static get primaryKey () {
        return 'CODLOCALACESSO'
    } 
  
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    static permitido(permissao){
        var PermissaoGerenciaAcesso = permissao.map(prop => {
            return prop.CodLocalACesso
        })
        if (PermissaoGerenciaAcesso[0] === null )
        return this.query().select('CodLocalAcesso','Nome').fetch();
       // var PermissaoGerenciaAcesso =Database.from('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',user);
        return this.query().select('CodLocalAcesso','Nome').where('CODLOCALACESSO','in',PermissaoGerenciaAcesso).fetch();
         
    }
    static permitidoIds(permissao){       
        var PermissaoLocalAcesso = permissao.map(prop => {
               return prop.CodLocalAcesso
           
        })
        console.log(PermissaoLocalAcesso)
        if (PermissaoLocalAcesso[0] === null )
            return this.query().ids()
       // var PermissaoGerenciaAcesso =Database.from('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',user);
        return this.query().where('CODLOCALACESSO','in',PermissaoLocalAcesso).ids()
         
    }
}

module.exports = LocalAcesso
