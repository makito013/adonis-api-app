'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
class Lotacao extends Model {
    static get primaryKey () {
        return 'CODLOTACAO'
    }
    static get foreignKey () {
        return 'CODEMPRESA'
    }

    static get table () {
        return 'Lotacao'
    }
  
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    static scopeAlias(query){
        return query.select(['CodLotacao','CodLotacao as Key','CodEmpresa','Bloco','Nome','Nome as NomeLotacao','Sigla','CodLotacaoGlobal','CodigoExterno','NumeroVagas','Latitude','Longitude'])
    }
    static scopeAlias2(query){
        return query.select(['CodLotacao','CodEmpresa','Nome'])
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
          var lotacoespermitidas;
          if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
            const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
                //     const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
            //        const subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)
            
            
            lotacoespermitidas = Database.from('Lotacao').select('CODLOTACAO').whereIn('CODEMPRESA',codigoEmpresa)
            .orWhere('CODLOTACAO','in',codigolotacao)
            .orWhere('CODLOTACAO','in', subQuerySecao);
          }
          else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
             lotacoespermitidas =  Database.from('Lotacao').select('CODLOTACAO')  
          
          else   lotacoespermitidas =  [] ;    

        return this.query().select(['CodLotacao','CodLotacao as Key','CodEmpresa','Bloco','Nome','Nome as NomeLotacao','Sigla','CodLotacaoGlobal','CodigoExterno','NumeroVagas','Latitude','Longitude']).where('CODLOTACAO','in',lotacoespermitidas).fetch();

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
          var lotacoespermitidas;
          if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
            const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
                //     const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
            //        const subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)
            
            
            lotacoespermitidas = Database.from('Lotacao').select('CODLOTACAO').whereIn('CODEMPRESA',codigoEmpresa)
            .orWhere('CODLOTACAO','in',codigolotacao)
            .orWhere('CODLOTACAO','in', subQuerySecao);
          }
          else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
             lotacoespermitidas =  Database.from('Lotacao').select('CODLOTACAO')  
          
          else   lotacoespermitidas =  [] ;    

        return this.query().where('CODLOTACAO','in',lotacoespermitidas).ids();      

    }
    children() {
        return this.hasMany('App/Models/Secao','CodLotacao','CodLotacao')
    }
}

module.exports = Lotacao
