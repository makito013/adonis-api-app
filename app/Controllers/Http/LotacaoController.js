'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const DwSession = use('App/Models/DwSession')
const Lotacao = use('App/Models/Lotacao')
const Database = use('Database')
var geral = require('./Geral.js');
/**
 * Resourceful controller for interacting with lotacaos
 */
class LotacaoController {


  async Salvar ( { request } ) {
      var data = await request.raw();
      data = JSON.parse(data)
      var reposta;
      var codigo =data.codLotacao
      if (codigo == 0){
          var numSeq = new geral.numeroSequecial('Lotacao')
          codigo =  await numSeq.consulta();
          codigo=codigo+1;
      }
      var l={   
      CodLotacao: codigo,
      CodEmpresa:data.codEmpresa,
      Sigla:data.Sigla,
      
      Nome:data.nome,
      Bloco:data.bloco,
      Latitude :data.latitude, 
      Longitude:data.longitude,
      NumeroVagas:data.totVagas,
      }

      
          //var token= await Database.table('DWSession').select('*').where('token','like',data["token"]);
          var token = await DwSession.validarToken(data["token"]);
          var body=[];
          if  (Boolean(token)){   
              //validacoes
              
              try{
                var  userId;
                  if(data.codLotacao == 0) {                
                      userId = await Database.table('Lotacao').insert(l);
                      numSeq.atualiza();     
                      //.insert({"CodEmpresa":,"Periodos":Periodos, "TolEntrada":15, "TolSaida": 15, "Flagsrefeitorio": 31, "ToleranciasColetor": toleranciaColetor})
                  }  
                  else{
                      userId = await Database.table('Lotacao')
                      .where("CodLotacao", l.CodLotacao)
                      .update(l);
                  }

          //        numSeq.atualiza(ID, 'Horario');

                reposta ={
                      retorno: true,   
                      dados : userId    
                  }
              
              }
              catch(error){
                  reposta ={
                      erro :error.message,
                      retorno :false
                  }
                  return  error.message
              }   

              return JSON.stringify(reposta);
          }
    
  }
  async Excluir( { request } ) {
    var data = await request.raw();
    data = JSON.parse(data)
    var reposta;
    try{
    if (await DwSession.validarToken(data["token"])){

            var Secao = await Database.table('Secao').select('CodLotacao').where('CodSecao',data.codigo);

            if (Secao.length > 0)
            {
                reposta={
                    erro : 'Empresa possui secões',
                    retorno : false
                }
            }
            else{
                const lotacao =await Lotacao.find(data.codigo);
              if (lotacao !== null)   { 
                await lotacao.delete()
              
                reposta={
                    mensagem : 'Lotacao Excluida',
                    retorno : true
                }
              }else {
                reposta={
                  mensagem : 'Lotacao Não Encontrada',
                  retorno : false
              }
              }
            }

            // .where("CodEmpresa", '=', data.codigo)
            // .delete()
    }
    } catch(error){
        reposta ={
            erro :error.message,
            retorno:false
        }
      
    }  
    return JSON.stringify(reposta);  
}   
  /**
   * Show a list of all lotacaos.
   * GET lotacaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new lotacao.
   * GET lotacaos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new lotacao.
   * POST lotacaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single lotacao.
   * GET lotacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing lotacao.
   * GET lotacaos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update lotacao details.
   * PUT or PATCH lotacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a lotacao with id.
   * DELETE lotacaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = LotacaoController
