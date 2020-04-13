'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const DwSession = use('App/Models/DwSession')
const Secao = use('App/Models/Secao')
const Database = use('Database')
var geral = require('./Geral.js');
/**
 * Resourceful controller for interacting with secaos
 */
class SecaoController {


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
        //numSeq.atualiza(ID, 'Horario');
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
      var numPessoasSecao = await Database.from('Autorizado').where('CodSecao',data.codigo).getCount()   
      var numAcessoSecao = await Database.from('Acesso').where('CodSecaoDestino',data.codigo).getCount()     

      if (numPessoasSecao > 0 || numAcessoSecao >0 )
      {
          reposta={
              mensagem : 'secao possui pessoas e/ou registros de acessos',
              retorno : false
          }
      }
      else{
          const secao =await Secao.find(data.codigo);
        if (secao !== null)   { 
          await secao.delete()
        
          reposta={
              mensagem : 'Secao Excluida',
              retorno : true
          }
        }else {
          reposta={
            mensagem : 'Secao Não Encontrada',
            retorno : false
          }
        }
      }
      // .where("CodEmpresa", '=', data.codigo)
      // .delete()
    }
  } catch(error){
      reposta ={
          mensagem :error.message,
          retorno:false
      }
    
  }  
  return JSON.stringify(reposta);  
}   

  /**
   * Show a list of all secaos.
   * GET secaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new secao.
   * GET secaos/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new secao.
   * POST secaos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single secao.
   * GET secaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing secao.
   * GET secaos/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update secao details.
   * PUT or PATCH secaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a secao with id.
   * DELETE secaos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = SecaoController
