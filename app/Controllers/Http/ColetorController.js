'use strict'

const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const Logger = use('Logger')
Logger.level = 'debug'
const LocalAcesso = use('App/Models/LocalAcesso')
var geral = require('./Geral.js');
var numSeq = new geral.numeroSequecial('Coletor');

class ColetorController {
    async Salvar ( { request } ){
        // if (!await DwSession.validarToken(data["token"]))
        //     throw "invalid token";

        var data = await request.raw();
        data = JSON.parse(data)
        var flags = '';
        flags += data.comosenha ? '*' : '-';                                //1
        flags += data.modelopictograma ? data.modelopictograma : '0';       //2
        flags += data.teclaentrada ? '*' : '-';                             //3
        flags += data.teclasaida ? '*' : '-';                               //4
        flags += data.ativo ? '*' : '-';                                    //5
        flags += data.tipoleitorcartao1 ? data.tipoleitorcartao1 : '0';     //6
        flags += data.tipoleitorcartao2 ? data.tipoleitorcartao2 : '0';     //7
        flags += data.direcoescartao1 ? data.direcoescartao1 : '0';         //8
        flags += data.direcoescartao2 ? data.direcoescartao2 : '0';         //9
        flags += data.leitornaurna ? '*' : '-';                            //10
        flags += data.usaBiometria ? '*' : '-';                            //11
        flags += data.podeatualizarincremental ? '*' : '-';                //12
        flags += data.temdispositivoteclado ? '*' : '-';                   //13
        flags += data.temdispositivoibutton ? '*' : '-';                   //14
        flags += data.temdispositivocartao ? '*': '-';                     //15
        flags += data.temdispositivowiegand ? '*' : '-';                   //16
        flags += data.usaopcaocard ? '*': '-';                             //17
        flags += data.modoquadratura ? '*' : '-';                          //18
        flags += data.possuicamera ? '*': '-';                             //19
        flags += data.configajustada ? '*' : '-';                          //20
        flags += data.autoconfig ? '*' : '-';                              //21
        flags += data.leitornaurna ? '*' : '-';                            //22
        flags += data.tipoLeitorCartao3 ? data.tipoLeitorCartao3: '0';     //23
        flags += data.direcoesCartao3 ? data.direcoesCartao3 : '0';        //24
        flags += data.longaDistanciaCartao1 ? '*' : '-';                   //25
        flags += data.longaDistanciaCartao2 ? '*' : '-';                   //26
        flags += data.longaDistanciaCartao3 ? '*' : '-';                   //27
        flags += data.usaAntenaTCPIP ? '*' : '-';                          //28
        flags += data.enviaeventosoffline ? '*' : '-';                     //29
        flags += data.usams ? '*' : '-';                                   //30
        flags += data.invertesensorporta ? '*' : '-';                      //31

        try{
            var tabela1 = Database.table('Coletor');
            var tempoExpiracaoEntradaM = data.tempoexpiracaoentrada;
            var dados = {
                'nome': data.nome,
                'codLocalAcesso': data.codlocalacesso,
                'modelo': data.tipocoletor,
                'tipoUso': data.tipouso,
                'numero': data.numero,
                'caminhoListas': data.caminholistas,/**/
                'numSerieLeitor2': data.codcoletorredirecionar,/**/
                'reservado_S2': data.soregistragirar, //soRegistraAoGirar
                'padraoRelogio': data.padraorelogio,
                //'temDispositivoTeclado': data.temdispositivoteclado,
                //'temDispositivoCartao': data.temdispositivocartao,
                'exigeMotorista': data.exigemotorista,
                'permiteVisitantes': data.permitevisitantes,
                'codEmpresa': data.codempresa,
                //'numPortaSerial': data.numportaserial,
                'releEntrada': data.releentrada,
                'releSaida': data.relesaida,
                'tempoReleEntrada': data.temporeleentrada,
                'tempoReleSaida': data.temporelesaida,
                'formatoArquivo': data.formatoarquivo,
                //'usaBiometria': data.usaBiometria,
                'direcoesPermitidas': data.direcaopermitida,
                'endereco': data.endereco,
                'numSerieLeitor': data.numserieleitor,
                'numSerieLeitor2': data.numserieleitor2,
                'resolucaoLeitor': data.resolucaoleitor,
                'padraoCadastro': data.padraocadastro,
                'emitirSons': data.emitirsons,
                //'numNaoReconhecimento': data.numnaoreconhecimento,
                //'tempoNaoReconhecimento': data.temponaoreconhecimento,
                'tempoExpiracaoEntrada': tempoExpiracaoEntradaM,
                'deveAguardarGiro': data.deveaguardargiro,
                'sensorEntrada': data.sensorentrada,
                'sensorSaida': data.sensorsaida,
                'pulsarAposExpirarTempo': data.pulsaraposexpirartempo,
                'modoCancela': data.modocancela,
                'tempoRetardoCancela': data.temporetardocancela,
                'modoPorta': data.modoporta,
                'modoCatraca': data.modocatraca,
                //'incluirNomeArquivo': data.incluirNomeArquivo,
                //'modeloPictograma': data.modelopictograma,
                'mensagemPadrao': data.mensagempadrao,
                //'digitacaoComoSenha': data.comosenha,
                'modoPanico': data.modopanico,
                //'ativo': data.ativo,
                'reservado_I2': data.forcarmodo, //modoOperacaoForcado
                'enderecoIP': data.enderecoIP,
                'numPortaTCP': data.porta,
                //'autoConfigIPUmaVez': data.autoconfig,
                'tempoMinAguardarGiro': data.tempoMinAguardaGiro,
                'tempoMinRele': data.tempoMinRele,
                'monitoraPorta': data.monitoraPorta,
                'sensorBracoAbaixado': data.sensorBracoAbaixado,
                'modoConectividade': data.modoConectividade,
                'numLeitorCartao1': data.numleitorcartao1,
                'numLeitorCartao2': data.numleitorcartao2,
                'numLeitorCartao3': data.numleitorcartao3,
                //'tipoLeitorCartao1': data.tipoLeitorCartao1,
                //'tipoLeitorCartao2': data.tipoLeitorCartao2,
                //'tipoLeitorCartao3': data.tipoLeitorCartao3,
                //'longaDistanciaCartao1': data.longaDistanciaCartao1,
                //'longaDistanciaCartao2': data.longaDistanciaCartao2,
                //'longaDistanciaCartao3': data.longaDistanciaCartao3,
                //'direcoesCartao1': data.direcoesCartao1,
                //'direcoesCartao2': data.direcoesCartao2,
                //'direcoesCartao3': data.direcoesCartao3,
                //'usaAntenaTCPIP': data.usaAntenaTCPIP,
                'dispositivoAcionarUrna': data.dispositivoacionarurna,
                'endereco': data.endereco,
                'numPortaSerial': data.tipoUrna, //define o tipo da urna
                //'leitorNaUrna': data.leitornaurna,
                'tempoCartaoLongaDistancia': data.tempocartaolongadistancia,
                'enderecoIPAntena': data.enderecoipantena,
                'portaTCPAntena': data.portatcpantena,
                'dispositivoAlternativo': data.dispositivoacionarparaevento,
                'tempoAcionarParaEvento': data.tempoacionarparaevento,
                'permiteAbrirFecharSistema': data.permiteabrirfecharsistema,
                'soFuncionaUmaVez': data.sofuncionaumavez,
                //'numBitsSiteWiegand': data.numbitsusuariowiegand,
                'modoCancela': data.modocancela,
                'flags': flags
            };
            if (dados.codigo !== 0){
                var tabela1 = tabela1.where('codColetor', '=', data.codigo);
                tabela1.update(dados);
                tabela1 = await tabela1;
            }
            else {
                var ID = await numSeq.consulta();
                dados.codColetor = ID;
                tabela1.insert(dados);
                numSeq.atualiza();
                tabela1 = await tabela1;
            }
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Coletor"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:data.data.codigo !== 0 ? data.codigo : dados.codColetor,
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
        try{
            if (!await DwSession.validarToken(data["token"]))
                throw "invalid token";
            var permissao = await Database.table('PermissaoGerenciaAcesso as P')
                .select('P.CodLocalAcesso')
                .innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario')
                .where('Dwsession.Token',data.token);
            var bodyLocais = await LocalAcesso.permitidoIds(permissao);
            var tabela =  await Database.select('c.*')
                .from('Coletor as c')
                .whereIn('c.CodLocalAcesso', bodyLocais);
            //var tabela = await Database.table('Coletor').select('*');
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
        if (!await DwSession.validarToken(data["token"]))
            throw "invalid token";

        var data = await request.raw();
        data = JSON.parse(data)
        try{
            var tabela1 = Database.table('Coletor').where('CODCOLETOR', '=', data.codigo);
            tabela1 = await tabela1.delete();
            var EventoSistemaWebData={
                Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Coletor"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto: data.codigo,
                CodUsuario:0,//user[0].CODPESSOA,
                TipoEvento:3
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
                erro: error,
                retorno: false
            })
        }
    }
}
module.exports = ColetorController