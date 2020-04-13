'use strict'
const Database = use('Database')
const DwSession = use('App/Models/DwSession')
var geral = require('./Geral.js');
var numSeq = new geral.numeroSequecial('acionamentoProgramado', 'CodAcionamentoProgramado');

class AcionamentoProgramado{
    async Index ({request}){
        var data = await request.raw(); 
        data = JSON.parse(data);
        try{
            // if (!await DwSession.validarToken(data["token"]))
            //     throw "invalid token";
            // var table = Database.table("AcionamentoProgramado")
            // .select('CodAcionamentoProgramado')
            // .select('CodColetor')
            // .select('DATE(DataInicio) as DataInicio')
            // .select('DATE(DataFim) as DataFim')
            // .select('TIME(Hora) as Hora, Dispositivo')
            // .select('TempoLigado')
            // .select('TempoDesligado')
            // .select('Ciclos')
            // .select('DiasSemana')
            // .where('codColetor', '=', data.codColetor);
            var table = Database.raw('Select CodAcionamentoProgramado, CodColetor, DATE(DataInicio) as DataInicio, '+
            'DATE(DataFim) as DataFim, TIME(Hora) as Hora, Dispositivo, TempoLigado, TempoDesligado, Ciclos'+
            ', DiasSemana from AcionamentoProgramado where codColetor = ?', [data.codColetor]);
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
        var tabela1 = Database.table('AcionamentoProgramado');
        var dados = {
            "DataInicio": Database.raw('TIMESTAMP(?)', [data.dataInicio]),
            "DataFim": Database.raw('TIMESTAMP(?)', [data.dataFim]),
            "Hora": Database.raw('TIMESTAMP(?)', ["1889-12-30 "+data.horario]),
            "Dispositivo": data.dispositivo,
            "TempoLigado": data.tempoLigado,
            "TempoDesligado": data.tempoDesligado,
            "Ciclos": data.ciclos,
            "DiasSemana": data.diasSemana,
            "CodColetor": data.coletor
        }
        try{
            // if (!await DwSession.validarToken(data["token"]))
            //     throw "invalid token";
            if (data.codigo !== 0){
                var tabela1 = tabela1.where('CodAcionamentoProgramado', '=', data.codigo);
                tabela1.update(dados);
                return await tabela1;
            }
            else {
                var ID = await numSeq.consulta();
                dados.CodAcionamentoProgramado = ID;
                tabela1.insert(dados);
                numSeq.atualiza();
                tabela1 = await tabela1;
            }
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AcionamentoProgramado"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:data.data.codigo !== 0 ? data.codigo : dados.CodAcionamentoProgramado,
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
            var tabela1 = Database.table('AcionamentoProgramado').where('CodAcionamentoProgramado', '=', data.codigo);
            tabela1 = await tabela1.delete();
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="AcionamentoProgramado"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto: data.codigo,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento: 3
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
module.exports = AcionamentoProgramado