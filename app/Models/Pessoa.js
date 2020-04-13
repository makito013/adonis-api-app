'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Pessoa extends Model {


    static get primaryKey () {
        return 'CodPessoa'
    }

    static get table () { 
        return 'Pessoa'
    }
    static get foreignKey () {
        return 'CODPESSOA'
    }
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    } 
    secao () {
        return this.belongsToMany('App/Models/Autorizado')
    }
    static scopeInnerJoinAutorizado(query) {
        return query.innerJoin('autorizado','Autorizado.codpessoa','Pessoa.codpessoa')
    }
    static scopeHasAutorizado(query) {
        return query.innerJoin('autorizado')
    }
    autorizado () {
        return this.hasMany('App/Models/Autorizado')
    }
    static permitido(permissao){
        var {codigoEmpresa,codigolotacao,codigosecao} = []
     
        permissao.forEach(prop=>{
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
       else if (codigosecao[0]===null  || codigolotacao[0]===null  || codigoEmpresa[0]===null)
        secaopermitidas =  Database.from('Secao').select('CODSECAO')  
       else   secaopermitidas =  null ;  

        return this.query().where('CODSECAO','in',secaopermitidas).fetch();                         
                                 
    }
    size () {
        return this.isOne ? 1 : this.rows.length
    }
    static scopeAlias(query){
        return query.select('CodPessoa','Nome','CPF')
    }
    static scopeAliasNomeCodigo(query){
        return query.select('Nome as nome','Pessoa.CODPESSOA as codigo')
    }

}

module.exports = Pessoa
