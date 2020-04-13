'use strict'
const Database = use('Database')
const DwSession = use('App/Models/DwSession')
var geral = require('./Geral.js');
var numSeq = new geral.numeroSequecial('ambienteAcesso', 'CodAmbienteAcesso');

class AmbientesConectadosController{
    async Index ({request}){
        var data = await request.raw(); 
        data = JSON.parse(data);
        try{
            // if (!await DwSession.validarToken(data["token"]))
            //     throw "invalid token";
            var table = Database.table("AmbienteAcesso");
            var tabela = await table;
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
                mensagem: error,
                retorno: false
            }))
        }
    }

    async Salvar({request}){
        var data = await request.raw(); 
        data = JSON.parse(data);
        var tabela1 = Database.table('AmbienteAcesso');
        var dados = {
            "Nome": data.nome,
            "Numero": data.numero,
            "ModoEclusa": null,
            "CodAmbienteExterno": data.codContido !== -1 ? data.codContido : null,
            "CodSecao": data.codSecao,
            "Bloqueado": null
        }
        try{
            // if (!await DwSession.validarToken(data["token"]))
            //     throw "invalid token";
            if (data.codigo !== 0){
                var tabela1 = tabela1.where('CodAmbienteAcesso', '=', data.codigo);
                tabela1.update(dados);
                return await tabela1;
            }
            else {
                var ID = await numSeq.consulta();
                dados.codAmbienteAcesso = ID;
                tabela1.insert(dados);
                await numSeq.atualiza();
                tabela1 = await tabela1;
            }
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AmbienteAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:data.data.codigo !== 0 ? data.codigo : dados.CodAcionamentoProgramado,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento: data.codigo !== 0 ? 7 : 6
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            if (data.tipo === 1){
                await Database.table('LocalAcesso').update({"codAmbienteInterno": data.codigo}).where('codLocalAcesso', '=', data.codlocal);
            }
            else if (data.tipo === 2){
                await Database.table('LocalAcesso').update({"codAmbienteExterno": data.codigo}).where('codLocalAcesso', '=', data.codlocal);
            }
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="LocalAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto: data.codLocal,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento:7
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            return({
                count:tabela1,
                retorno: true,
                mensagem: "ok",
                dados:{}          
            })
        }
        catch(error){
            return(JSON.stringify({
                menmsagem: error,
                retorno: false
            }))
        }
    }

    async Excluir({request}){
        var data = await request.raw();
        data = JSON.parse(data)
        try{
            //if (!await DwSession.validarToken(data["token"]))
            //throw "invalid token";
            var tabela1 = Database.table('AmbienteAcesso').where('CodAmbienteAcesso', '=', data.codigo);
            tabela1 = await tabela1.delete();
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AmbienteAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto: data.codigo,
                CodUsuario: 0,//user[0].CODPESSOA,
                TipoEvento: 3
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            var localAcessoI = await Database.table('LocalAcesso')
                .update('codAmbienteInterno', null)
                .where('codLocalAcesso', '=', data.codLocal)
                .where('codAmbienteInterno', '=', data.codigo);
            var localAcessoE = await Database.table('LocalAcesso')
                .update('codAmbienteExterno', null)
                .where('codLocalAcesso', '=', data.codLocal)
                .where('codAmbienteExterno', '=', data.codigo);
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="LocalAcesso"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto: data.codLocal,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento:7
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
            return({
                count:tabela1.length,
                retorno: true,
                mensagem: "ok",
                dados:tabela1          
            })
        }
        catch(error){
            return({
                mensagem: error,
                retorno: false
            })
        }
    }
}
module.exports = module.exports = AmbientesConectadosController