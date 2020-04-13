'use strict'

const Model = use('Model')

class Autorizado extends Model {

    static get table(){
        return 'Autorizado'
    }

    static get primaryKey (){
        return 'CODPESSOA'
    }
    // static get foreignKey () {
    //     return 'CodPessoa'
    // }
    static get foreignKey () {
      return 'CODSECAO'
  }
    static get createdAtColumn () {
      return null
  }
  static get updatedAtColumn () {
      return null
  } 
    static scopeIdTipoAut (query){
        return query.select(['CodPessoa', 'TipoAutorizacao'])
    }  
    static scopeHasPessoa(query) {
        return query.has('pessoa')
    }
    static scopeHasAcesso(query) {
        return query.has('acesso')
    }
    acessoultimo () {
        return this.belongsTo('App/Models/Acesso','CodPessoa','CodPessoa')
    } 
    pessoa () {
        return this.hasOne('App/Models/Pessoa','CodPessoa','CodPessoa')
    }
    static scopeAlias(query){
        return query.select('Autorizado.CodPessoa','Autorizado.TipoAutorizacao',)
    }
    // getTipoAutorizacao(value){
    //     return value
    // }

 
    size () {
        return this.isOne ? 1 : this.rows.length
      }
    static permitido(permissao,nome){
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
}

module.exports = Autorizado
