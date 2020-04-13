'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
const PermissaoGerencia = use('App/Models/PermissaoGerencia')

class Empresa extends Model {
    static get primaryKey () {
        return 'CODEMPRESA'
    }

    static get table () { 
        return 'Empresa'
    }
  
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    static scopeAlias(query){
        return query.select(['CodEmpresa','CodEmpresa as key','Nome','Nome as NomeEmpresa','Endereco','CGC','CEI','DiaInicioMes','DiaFimMes','Numero','NumeroFolha','NumeroVagas','CodAtividadeEconomica as Cnae','Latitude','Longitude'])
    }
    static scopeAlias2(query){
        return query.select(['CodEmpresa','Nome'])
    }
    static permitido(permissao){

      
        var codigoEmpresa = permissao.map(prop=>{
           return prop.CODEMPRESA
         })  
         var codigolotacao = permissao.map(prop=>{
           return prop.CODLOTACAO
         })  
         var codigosecao= permissao.map(prop=>{
           return prop.CODSECAO
         })  
       
         var subQueryEmpresa ;
         if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
         const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
         const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
         subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)               
     //    return this.query().select('CodEmpresa','CodEmpresa as key','Nome','Nome as NomeEmpresa','Endereco','CGC','CEI','DiaInicioMes','DiaFimMes','Numero','NumeroFolha','NumeroVagas','CodAtividadeEconomica as Cnae','Latitude','Longitude').where('CODEMPRESA','in',subQueryEmpresa).fetch();
         }
         else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
                 subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA')  
                 
         else   subQueryEmpresa =  [] ;    
         // 

         return this.query().select('CodEmpresa','CodEmpresa as key','Nome','Nome as NomeEmpresa','Endereco','CGC','CEI','DiaInicioMes','DiaFimMes','Numero','NumeroFolha','NumeroVagas','CodAtividadeEconomica as Cnae','Latitude','Longitude').where('CODEMPRESA','in',subQueryEmpresa).fetch();
       
//       return  Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token','token');
    }
    static permitidoIds(permissao){

      
        var codigoEmpresa = permissao.map(prop=>{
           return prop.CODEMPRESA
         })  
         var codigolotacao = permissao.map(prop=>{
           return prop.CODLOTACAO
         })  
         var codigosecao= permissao.map(prop=>{
           return prop.CODSECAO
         })  
       
         var subQueryEmpresa ;
         if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
         const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
         const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
         subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)               
     //    return this.query().select('CodEmpresa','CodEmpresa as key','Nome','Nome as NomeEmpresa','Endereco','CGC','CEI','DiaInicioMes','DiaFimMes','Numero','NumeroFolha','NumeroVagas','CodAtividadeEconomica as Cnae','Latitude','Longitude').where('CODEMPRESA','in',subQueryEmpresa).fetch();
         }
         else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
                 subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA')  
                 
         else   subQueryEmpresa =  [] ;    
         // 

         return this.query().ids();
       
//       return  Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token','token');
    }
    children () {
        return this.hasMany('App/Models/Lotacao','CodEmpresa','CodEmpresa')
    //    return b;
    }
}

module.exports = Empresa
