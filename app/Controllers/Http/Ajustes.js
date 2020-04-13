'use strict'
const Autorizado = use('App/Models/Autorizado')
const Acesso = use('App/Models/Acesso')
const Empresa = use('App/Models/Empresa')
const Lotacao = use('App/Models/Lotacao')
const Secao = use('App/Models/Secao')
const Jornada = use('App/Models/Jornada')
const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const AlteracaoJornada = use('App/Models/AlteracaoJornada')
const EventoSistemaWeb = use('App/Models/EventoSistemaWeb')
EventoSistemaWeb
var geral = require('./Geral.js');

class Ajustes {

   async AlteracaoColetivadeJornadaController ({request}){
        var data = await request.raw();
        data = JSON.parse(data)
        var {cmd,datainicio,datafim ,newjornada,oldjornada,itensbusca,token} = data;
        var { empresav, lotacaov, pessoav, secaov,}= itensbusca
        //  var numSeq = new geral.numeroSequecial('Empresa')
          const dwsession =await DwSession.validarToken(data["token"])

    
        if (dwsession.size()>0){
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
    
    //       var bodyEmpresa= await Empresa.permitidoIds(permissao)
     //      var bodyLotacao= await Lotacao.permitidoIds(permissao)
           var bodySecao= await Secao.permitidoIds(permissao)
          // var codigo =  await numSeq.consulta();
           var JornadaNova =await Database.table("Jornada").where('CODJORNADA',newjornada).limit(1);
          
          //  return JornadaNova[0].CODJORNADA
           const ids = await Secao.query().whereIn('CODSECAO',secaov).whereIn('CODSECAO',bodySecao).ids()

           var QueryAutorizado = Autorizado.query().where('CODSECAO','in',ids)
           if (oldjornada!=="")
               QueryAutorizado.where('CODJORNADA',oldjornada)
           if(pessoav.length > 0)
             QueryAutorizado.whereIn('CODPESSOA',pessoav)
          
           var alteracoes = await QueryAutorizado.update({CODJORNADA:JornadaNova[0].CODJORNADA})
          
           //  var NewAlteracoesjornada =[]
                //para quando for fucionario
           //   //numSeq.atualizanum(pessoav.length)
        //    pessoav.forEach(prop => {
        //         codigo= codigo+1
        //         NewAlteracoesjornada.push(
        //         {
        //             'CODALTERACAOJORNADA': codigo,
        //             'CODPESSOA': prop,
        //             'DATAINICIO': datainicio,
        //             'DATAFIM': datafim == "" ? null:datafim,
        //             'CODJORNADA':JornadaNova[0].CODJORNADA
        //         }
        //     )
        //     await  Database.from('AlteracaoJornada').insert(NewAlteracoesjornada)
           
        //    });
        //    Autorizado.query().whereIn()
        //    var alteracoes = await  Database.from('AlteracaoJornada').insert(NewAlteracoesjornada)


            // const EventoSistemaWebData={
            //     Conteudo:'S=DokeoWeb 4.0.0;U="'+dwsession[0].NOMEUSUARIO+'"',
            //     DataHoraEvento: new Date(),
            //     DataReferenciaInicio: new Date(),
            //     DataReferenciaFim: new Date(),
            //     CodigoObjeto:dwsession[0].CODUSUARIO.CODPESSOA,
            //     CodUsuario:dwsession[0].CODUSUARIO.CODPESSOA,
            //     TipoEvento:19
            //     }
            // EventoSistemaWeb.create(EventoSistemaWebData);

            var resposta = {
              dados: alteracoes,
              mensagem:'ok',
              retorno:true
            }
            return JSON.stringify(resposta);  

        }
        else 
        {
            var resposta = {
                msg:'token inválido',
                retorno:false
            }
            return JSON.stringify(resposta);  

        }

    }
    async SalvaAcessoMan ({request}){
      var data = await request.raw();
      data = JSON.parse(data)
      var resposta={}
      var{
        cmd,
        codpessoa,
        direcao,     
        datahora,
        codacesso,
        token
      }=data
      var acesso 
      if (codacesso > 0){
       acesso = await  Acesso.find(codacesso)
          if (acesso.Funcao != 'MAN'){
            resposta = {
              retorno:false,
              msg:'Acesso não pode ser editado' 
            }
            return JSON.stringify(resposta);
          }  
          
          acesso = {
            DataHora:datahora,
            Direcao:direcao,
            CodPessoa:codpessoa,
            CODACESSO:codacesso,
            Funcao :'MAN',
          }  
         await Acesso.update(acesso)
          resposta={
            retorno: true,
            msg: 'Acesso alterado'
          }
      }
      else{
          var numSeq = new geral.numeroSequecial('Acesso')
          codacesso=await numSeq.consulta()
          
          


          acesso = {
            DataHora:datahora,
            Direcao:direcao,
            CodPessoa:codpessoa,
            CODACESSO:codacesso+1,
            Funcao :'MAN',
          }
          //return JSON.stringify(acesso);  
          await numSeq.atualiza();
          await Acesso.create(acesso)
          
          resposta={
            retorno: true,
            msg: 'Acesso criado'
          }
      }
      return JSON.stringify(resposta);  
    }
}

module.exports = Ajustes
