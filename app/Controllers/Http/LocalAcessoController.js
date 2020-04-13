'use strict'

const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const Logger = use('Logger')
Logger.level = 'debug'
const LocalAcesso = use('App/Models/LocalAcesso')
var geral = require('./Geral.js');
var numSeq = new geral.numeroSequecial('LocalAcesso');

class LocalAcessoController {
    async Salvar ( { request } ){
        var data = await request.raw();
        // if (!await DwSession.validarToken(data["token"]))
        //     throw "invalid token";
        data = JSON.parse(data)
        var tabela1 = Database.table('LocalAcesso');
        var dados = {
            'nome': data.nome,
            'nomeComputador': data.concentrador,
            'finalidade': data.finalidade,
            'tratamentoTempoMinimo': data.antiDupla,
            'exigeBiometriaEntrada': data.exigeBioE,
            'exigeBiometriaSaida': data.exigeBioS,
            'exigeBiometria2xEntrada': data.exigeBioDuplaE,
            'exigeBiometria2xSaida': data.exigeBioDuplaS,
            'exigeCartao': data.exigeCartaoE,
            'exigeCartaoSaida': data.exigeCartaoS,
            'exigeSenhaEntrada': data.exigeSenhaE,
            'exigeSenhaSaida': data.exigeSenhaS,
            'tempoMinimoEntreAcessos': data.intervalominimo,
            'codambienteInterno': data.codAmbienteInterno,
            'codambienteExterno': data.codAmbienteExterno,
            'descricao': data.descricao,
            'limiteAcessosDia': data.acessosPorDia,
            'restringeTempoMesmoSentido': data.restricaoSentido
        };
        try{
            if (data.codigo !== 0){
                var tabela1 = tabela1.where('codLocalAcesso', '=', data.codigo);
                tabela1.update(dados);
                tabela1 = await tabela1;
            }
            else {
                var ID = await numSeq.consulta();
                dados.codLocalAcesso = ID;
                tabela1.insert(dados);
                numSeq.atualiza();
                tabela1 = await tabela1;
            }
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="LocalAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:data.data.codigo !== 0 ? data.codigo : dados.codLocalAcesso,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento: data.codigo !== 0 ? 7 : 6
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            return({
                count:tabela1,
                retorno: true,
                mensagem: "ok",
                dados:{}          
            })
        }
        catch (error){
            return({
                erro: error,
                retorno: false
            })
        }
    }
    async Index ( { request } ){
        var data = await request.raw();
        data = JSON.parse(data);
        // if (!await DwSession.validarToken(data["token"]))
        //     throw "invalid token";
        try{
            var permissao = await Database.table('PermissaoGerenciaAcesso as P')
                .select('P.CodLocalAcesso')
                .innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario')
                .where('Dwsession.Token',data.token);
            var bodyLocais = await LocalAcesso.permitidoIds(permissao);
            var tabela =  await Database.select('l.*')
                .from('LocalAcesso as l')
                .whereIn('CodLocalAcesso', bodyLocais);
            //var tabela = await Database.table('LocalAcesso').select('*');
            var count = tabela.length;
            return({
                count:count,
                retorno: true,
                mensagem: "ok",
                dados:tabela          
            })
        }
        catch(error){
            return(JSON.stringify({
                erro: error,
                retorno: false
            }))
        }
    }
    async Excluir ( { request } ){
        // if (!await DwSession.validarToken(data["token"]))
        //     throw "invalid token";

        var data = await request.raw();
        data = JSON.parse(data)
        try{
            var tabela1 = Database.table('LocalAcesso').where('CODLOCALACESSO', '=', data.codigo);
            tabela1 = await tabela1.delete();
            return({
                count:tabela1.length,
                retorno: true,
                mensagem: "ok",
                dados:tabela1          
            })
        }
        catch(error){
            return({
                erro: error,
                retorno: false
            })
        }
    }
}

module.exports = LocalAcessoController