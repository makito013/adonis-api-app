'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Acesso extends Model {

    static get table(){
        return 'Acesso'
    }

    static get primaryKey (){
        return 'CODACESSO'
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
    getDirecao(value){
      //  return value ===1 ? Antl.formatMessage('Entrada'): value ===2 ? Antl.formatMessage('Sainda'): Antl.formatMessage(Tentativa')
        return value ===1 ? 'Entrada': value ===2 ?'Saida':'Tentativa'
    }
    getDataHora(value){
        //  return value ===1 ? Antl.formatMessage('Entrada'): value ===2 ? Antl.formatMessage('Sainda'): Antl.formatMessage(Tentativa')
        const moment = require("moment");

          return moment(value).format('DD-MM-YYYY hh:mm:ss')
      }
      

    static scopeHasPessoa(query) {
        return query.has('pessoa')
      }
    
    static scopeAcessos(query) {
        return query.select("Pessoa.Nome","Datahora","Direcao","Secao.Nome as Secao", "Lotacao.Nome as Lotacao","Coletor.Nome as Coletor","Autorizado.Matricula as Matricula",
                            "AcessoExtra.ModeloCarro", "AcessoExtra.PlacaCarro", "Pvisitou.Nome as PessoaContato")
            .leftJoin('Secao','Acesso.CODSECAODESTINO','Secao.CODSECAO')
            .leftJoin('Pessoa','Pessoa.CODPESSOA','Acesso.CODPESSOA')
            .leftJoin('Coletor','Coletor.CODCOLETOR','Acesso.CODCOLETOR')
            .leftJoin('Lotacao','Secao.CodLotacao','Lotacao.CodLotacao')
            .leftJoin('Autorizado','Autorizado.CODPESSOA','Acesso.CODPESSOA')
            .leftJoin('AcessoExtra','AcessoExtra.CodAcesso','Acesso.CodAcesso')
            .leftJoin('Pessoa as Pvisitou','Acesso.CodPessoaContato','Pessoa.CODPESSOA')
    }

    pessoa () {
        return this.belongsTo('App/Models/Pessoa')
    }
    acessoextra () {
        return this.hasOne('App/Models/AcessoExtra','CodAcesso','CodAcesso')
    }
    static scopeAliasultimoacesso(query){
        
        return query.select('CodAcesso','CodPessoa','Datahora','Direcao','Secao.Nome as nomeSecao','Lotacao.Nome as nomeLotacao','Empresa.Nome as nomeEmpresa')
        .innerJoin('Secao','Secao.CodSecao','Acesso.CodSecaoDestino')
        .innerJoin('Lotacao','Lotacao.CodLotacao','Secao.CodLotacao')
        .innerJoin('Empresa','Empresa.CodEmpresa','Lotacao.CodEmpresa')
    }
    static scopeAlias(query){
        return query.select("CodAcesso","Pessoa.Codpessoa","Pessoa.Nome","Datahora","Direcao","Secao.Nome as Visitou","Coletor.Nome as Coletor").innerJoin('Secao','Acesso.CODSECAODESTINO','Secao.CODSECAO').innerJoin('Pessoa','Pessoa.CODPESSOA','Acesso.CODPESSOA').innerJoin('Coletor','Coletor.CODCOLETOR','Acesso.CODCOLETOR')
    }
}

module.exports = Acesso
