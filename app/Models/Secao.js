'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')
class Secao extends Model {
    static get primaryKey () {
        return 'CODSECAO'
    }
    static get foreignKey () {
        return 'CODLOTACAO'
    }


    static get table () {
        return 'Secao'
    }

    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
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
         var secaopermitidas;
         if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
            const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
                //  const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
                //   const subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)
            const lotacoespermitidas = Database.from('Lotacao').select('CODLOTACAO').whereIn('CODEMPRESA',codigoEmpresa)
                                        .orWhere('CODLOTACAO','in',codigolotacao)
                                        .orWhere('CODLOTACAO','in', subQuerySecao);
            secaopermitidas =  Database.from('Secao').select('CODSECAO').whereIn('CODSECAO',codigosecao)
                .orWhere('CODLOTACAO','in',lotacoespermitidas)

            }
            else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
            secaopermitidas =  Database.from('Secao').select('CODSECAO')  
            
            else   secaopermitidas =  [] ;  
            return this.query().select(['CodSecao','CodSecao as Key' ,'CodLotacao','Nome','Nome as NomeSecao','CodSecaoGlobal','Apartamento','NumeroVagas','Publica','IDSite']).where('CODSECAO','in',secaopermitidas).fetch();
    }


    static permitidoIds(permissao){
        var codigoEmpresa =[]
        var codigolotacao =[]
        var codigosecao =[]

        permissao.forEach(prop => {
            codigoEmpresa.push(prop.CODEMPRESA)
            codigolotacao.push(prop.CODLOTACAO)
            codigosecao.push(prop.CODSECAO)
        })


        var secaopermitidas;
        if(permissao.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
            const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
                //  const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
                //   const subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)
                const lotacoespermitidas = Database.from('Lotacao').select('CODLOTACAO').whereIn('CODEMPRESA',codigoEmpresa)
                    .orWhere('CODLOTACAO','in',codigolotacao)
                    .orWhere('CODLOTACAO','in', subQuerySecao);
                secaopermitidas =  Database.from('Secao').select('CODSECAO').whereIn('CODSECAO',codigosecao)
                    .orWhere('CODLOTACAO','in',lotacoespermitidas)

        }
        else if (permissao.length == 1 && (codigosecao[0]===null  && codigolotacao[0]===null  && codigoEmpresa[0]===null))
            secaopermitidas =  Database.from('Secao').select('CODSECAO')  
            
        else   secaopermitidas =  [] ;  
        return this.query().where('CODSECAO','in',secaopermitidas).ids();                         
    }

    static scopeAlias(query){
        return query.select(['CodSecao','CodSecao as Key' ,'CodLotacao','Nome','Nome as NomeSecao','CodSecaoGlobal','Apartamento','NumeroVagas','Publica','IDSite'])
    }
}

module.exports = Secao
