'use strict'

const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const Logger = use('Logger')
Logger.level = 'debug'

var geral = require('./Geral.js');
var numSeq = new geral.numeroSequecial('AutorizacaoAcesso', 'codAutorizacaoAcesso');

class AutorizacaoAcessoController {
    async Autorizar ( { request } ){
        var data = await request.raw();  
        data = JSON.parse(data);
        if (!await DwSession.validarToken(data["token"]))
            throw "invalid token";
        var empresas = data.itensbusca.empresav//.split(',');
        var lotacoes = data.itensbusca.lotacaov//.split(',');
        var secoes = data.itensbusca.secaov//.split(',');
        var pessoas = data.itensbusca.pessoasv//.split(',');
        var tabela2 = await Database.select('a.codPessoa')
        .from('Autorizado as a')
        .innerJoin('Secao as s', 'a.codSecao', 's.codSecao')
        .innerJoin('Lotacao as l', 'l.codLotacao', 's.codLotacao')
        .innerJoin('Empresa as e', 'e.codEmpresa', 'l.codEmpresa')
        .orWhereIn('a.codPessoa', pessoas)
        .orWhereIn('s.codSecao', secoes)
        .orWhereIn('l.codLotacao', lotacoes)
        .orWhereIn('e.codEmpresa', empresas);
        var autorizacoes = [];
        var idInserido = [];
        var codAutorizacao = await numSeq.consulta();
        tabela2.map((prop, key) =>{
            idInserido.push(codAutorizacao + key);
            autorizacoes.push({
                'codAutorizacaoAcesso': idInserido[key],
                'codPessoa': prop.codPessoa,
                'dataInicio': Database.raw('TIMESTAMP(?)', [data.datainicio]),
                'dataFim': Database.raw('TIMESTAMP(?)', [data.datafim]),
                'horaInicio': Database.raw('TIMESTAMP(?)', ["1889-12-30 "+data.horainicio]),
                'horaFim': Database.raw('TIMESTAMP(?)', ["1889-12-30 "+data.horafim]),
                'descricao': data.descricao,
                'codLocalAcesso': data.localacesso
            })
        })
        await numSeq.atualiza();
        var tabela1 = Database.table('AutorizacaoAcesso');
        try{
            var tabela = await Database.table('AutorizacaoAcesso').insert(autorizacoes);
            var count = tabela;
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AutorizacaoAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:idInserido,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento: 4
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            return({
                count:tabela,
                retorno: true,
                mensagem: "ok",
                dados:{}
            })
        }
        catch(error){
            return(JSON.stringify({
                erro: error,
                retorno: false
            }))
        }
    }

    async Revogar ( { request } ){
        var data = await request.raw();
        data = JSON.parse(data);
        if (!await DwSession.validarToken(data["token"]))
            throw "invalid token";
        var empresas = data.itensbusca.empresav//.split(',');
        var lotacoes = data.itensbusca.lotacaov//.split(',');
        var secoes = data.itensbusca.secaov//.split(',');
        var pessoas = data.itensbusca.pessoasv//.split(',');
        var tabela2 = Database.select('a.codPessoa')
        .from('Autorizado as a')
        .innerJoin('Secao as s', 'a.codSecao', 's.codSecao')
        .innerJoin('Lotacao as l', 'l.codLotacao', 's.codLotacao')
        .innerJoin('Empresa as e', 'e.codEmpresa', 'l.codEmpresa')
        .orWhereIn('a.codPessoa', pessoas)
        .orWhereIn('s.codSecao', secoes)
        .orWhereIn('l.codLotacao', lotacoes)
        .orWhereIn('e.codEmpresa', empresas);
        //var resTab2 = await tabela2;
        var tabela4 = Database.table('AutorizacaoAcesso')
        .whereIn('codPessoa', tabela2)
        .andWhere('codLocalAcesso', data.localacesso)
        .andWhere(Database.raw('TIMESTAMP(datafim)'), '>', Database.raw('CURRENT_TIMESTAMP()'));
        tabela4 = tabela4.where(Database.raw('TIMESTAMP(datainicio)'), '<', Database.raw('CURRENT_TIMESTAMP()'));
        var res = await tabela4.update({'dataFim': Database.raw('TIMESTAMP(SUBDATE(CURRENT_DATE(), 1))')});
        var tabela3 = Database.table('AutorizacaoAcesso')
        .whereIn('codPessoa', tabela2)
        .andWhere('codLocalAcesso', data.localacesso)
        .andWhere(Database.raw('TIMESTAMP(datafim)'), '>', Database.raw('CURRENT_TIMESTAMP()'));
        tabela3 = tabela3.where(Database.raw('TIMESTAMP(datainicio)'), '>=', Database.raw('CURRENT_TIMESTAMP()'));
        res += await tabela3.delete()
        try{
            var tabela = await Database.table('AutorizacaoAcesso').insert(autorizacoes);
            var count = tabela;
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AutorizacaoAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:0,//idInserido,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento: 5
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            return({
                count:res,
                retorno: true,
                mensagem: "ok",
                dados:{}          
            })
        }
        catch(error){
            return(JSON.stringify({
                erro: error.message,
                retorno: false
            }))
        }
    }
}

module.exports = AutorizacaoAcessoController