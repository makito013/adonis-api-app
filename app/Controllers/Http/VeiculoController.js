'use strict'
const Database = use('Database')
var geral = require('./Geral.js');
const SecaoI  = use('App/Models/Secao')
const EmpresaI  = use('App/Models/Empresa')
const LotacaoI  = use('App/Models/Lotacao')
const LocalI  = use('App/Models/LocalAcesso')
//var controllerCartores = require('./IdentificadorController.js');
const Veiculos = use('App/Models/Veiculo')
const DwSession = use('App/Models/DwSession')
var numSeq = new geral.numeroSequecial('veiculo', 'CodVeiculo');
var numSeqMotorista = new geral.numeroSequecial('motorista', 'CodMotorista');
var numSeqCartao = new geral.numeroSequecial('identificador', 'CodIdentificador')
var numSeqAcessVei = new geral.numeroSequecial('permissaoacessoveiculo', 'CodPermissaoAcessoVeiculo');



class VeiculoController {
  
  //////////// INDEX //////////////////////////////////////////////////////////
  async Index ({ request, response, view }) {
    var data = await request.raw();
    data = JSON.parse(data)        
    var bodySecao, bodyLocaisAcesso, bodyEmpresa, bodyLotacao;   

    try{
      if (await DwSession.validarToken(data["token"])){  
        var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
        var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalAcesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
        var permissaoSecao= await SecaoI.permitidoIds(permissao)
        var permissaoEmpresa= await EmpresaI.permitidoIds(permissao)
        var permissaoLotacao= await LotacaoI.permitidoIds(permissao)
        var permissaoLocal= await LocalI.permitidoIds(PermissaoGerenciaAcesso)
        var LocaisAcesso=['CodLocalAcesso', 'Nome']
        var Secao=['CodSecao', 'Nome', 'codLotacao']
        var Lotacao=['CodLotacao', 'Nome', 'codEmpresa']
        var Empresa=['CodEmpresa', 'Nome']   

        var QueryEmpresa= Database.table('Empresa')
        .select(Empresa).whereIn('Empresa.CODEMPRESA',permissaoEmpresa)
        
        var QueryLotacao= Database.table('Lotacao')
        .select(Lotacao).whereIn('Lotacao.CODLOTACAO',permissaoLotacao)
        
        var QuerySecao= Database.table('Secao')
        .select(Secao).whereIn('Secao.CODSECAO',permissaoSecao)

        var QueryLocaisAcesso= Database.table('LocalAcesso')
        .select(LocaisAcesso).whereIn('LocalAcesso.CODLOCALACESSO',permissaoLocal)

        bodyLocaisAcesso= await QueryLocaisAcesso.orderBy('Nome','asc');
        bodyEmpresa     = await QueryEmpresa.orderBy('Nome','asc');
        bodyLotacao     = await QueryLotacao.orderBy('Nome','asc');
        bodySecao       = await QuerySecao.orderBy('Nome','asc');
        
        var reposta ={
          retorno: true,
          mensagem: "ok",

          LocaisAcesso:{
              count:bodyLocaisAcesso.length,                                       
              dados: bodyLocaisAcesso
          },
          Empresa:{
              count:bodyEmpresa.length,                                           
              dados: bodyEmpresa
          },
          Lotacao:{
              count:bodyLotacao.length,                                           
              dados: bodyLotacao
          },
          Secao:{
              count:bodySecao.length,                        
              dados: bodySecao
          }                        
        }
      }
      else{
        var reposta ={
          error: 1,             
          retorno: false,
          mensagem: "Invalid Token",
        } 
      }                   
    }
    catch(error){
        var reposta ={
            error: error.message,
            retorno: false,       
        }
    }  
    
    return JSON.stringify(reposta);
    
  }

  //////////// PESQUISA //////////////////////////////////////////////////////////
  async Pesquisa ({ request }) {
    var data = await request.raw();    
    data = JSON.parse(data)       

    try{
      if (await DwSession.validarToken(data["token"])){   
        var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])        
        var permissaoSecao= await SecaoI.permitidoIds(permissao)
        var permissaoEmpresa= await EmpresaI.permitidoIds(permissao)
        var unionQuery;
        var query= Database.table('veiculo as a')
                    .select('a.CodVeiculo','a.Placa','a.Modelo','b.nome as proprietario', 'c.nome as proprietario1', 'a.TextoMarca', 'a.TextoCor', 'a.TextoCategoria')
                    .leftJoin('pessoa as b','a.codProprietario','b.codPessoa')
                    .leftJoin('autorizado as d','a.codProprietario','d.codPessoa')
                    .leftJoin('empresa as c','c.codEmpresa','a.codEmpresa')
                    .where(1,'=', 1)
                
      
        if(data.tipoProprietario !== 5)
          query.andWhere('TipoProprietario','=',data.tipoProprietario)

        if(data.tipoPesquisa === 0)
          query.andWhere('Placa','=',data.valorPesquisa)  

        Object.keys(data).forEach((prop) => {
          if(prop !== 'valorPesquisa' && prop !== 'tipoProprietario' && prop !== 'token' && prop !== 'tipoPesquisa' && geral.notNull(data[prop])){
            query.andWhere('a.'+prop,'=',data[prop])
          }
        })

        query.andWhere(builder => {
          builder
          .orWhereIn('a.codEmpresa',permissaoEmpresa)
          .orWhereIn('d.CodSecao',permissaoSecao)
          .orWhereNull('a.codEmpresa', 'a.codEmpresa')
        })

        var body = await query.orderBy('Placa','asc'); 

        var reposta ={
          retorno: true,
          mensagem: "ok",
          count: body.length,
          dados: body
        } 
      }
      else{
        var reposta ={
          error: 1,             
          retorno: false,
          mensagem: "Invalid Token",
        } 
      }
    }
    catch(error){
      var reposta ={
        error: error.message,
        retorno: false,       
      }
    }

    return JSON.stringify(reposta);
  }

  /////////// PESQUISA POR ID ///////////////////////////////////////////////////
  async PesquisaId ({ request }) {
    var data = await request.raw();    
    data = JSON.parse(data)    
    var select = ['c.nome as ProprietarioEmpresa', 'b.nome as Proprietario']
    try{
      if (await DwSession.validarToken(data["token"])){
        
        var body= await Veiculos.query().Geral()
          .select(select)
          .leftJoin('pessoa as b','veiculo.codProprietario','b.codPessoa')
          .leftJoin('empresa as c','c.codEmpresa','veiculo.codEmpresa')
          .where(1,'=', 1)
          .andWhere('veiculo.CodVeiculo','=',data.codigo)
          .with('locaisAcesso')
          .with('motoristas', (busca) => {busca.select('CodPessoa','Nome')})
          .with('cartoes')
          .fetch() 
        
        var reposta ={
          retorno: true,
          mensagem: "ok",
          dados: body.rows[0]
        } 
      }
      else{
        var reposta ={
          error: 1,             
          retorno: false,
          mensagem: "Invalid Token",
        } 
      }
    }
    catch(error){
      var reposta ={
        error: error.message,
        retorno: false,       
      }
    }

    return JSON.stringify(reposta);
  }

  /////////////////////// SALVAR ///////////////////////////////////////////////////////////////////
  async Salvar ({ request }) {
    var data = await request.raw();
    data = JSON.parse(data)        
    var codigo = data.codigo;
    var tipoproprietario = data.tipoproprietario;
    var codproprietario = data.codproprietario;
    var proprietario, codMotorista, codPermissao, reposta;
    var codcartao = data.identificador.codigoIdentificador;
    var conteudo = data.identificador.conteudo, numserie = data.identificador.numserie;
    var cadastroCartao = 0;
    //cadastroCartao === 0: Nao Cadastro || 1: Cadastra novo || 2: Atualiza || NumeroNegativo para erro

    try{
      if (await DwSession.validarToken(data["token"])){   
          //-------------   VERIFICA CARTAO------------------
        if(codcartao === 0)
        {
          if(conteudo !== "" || numserie !== "")
          {
            //TECNOLOGIA 1 = MIFARE
            var totalCartoes;
            var cartoes = Database
              .table('identificador')        
              .where(1,'=',1)

            if(conteudo !== "")
              cartoes.andWhere('conteudo','like',conteudo)            
            
            if(numserie !== "")
              cartoes.andWhere('UIDH','like',numserie)       

            totalCartoes = await cartoes.count('CodIdentificador as Count') 

            if(totalCartoes[0].Count > 0){
              return JSON.stringify({
                error: 1,             
                retorno: false,
                mensagem: "Cartão já cadastrado",
              });
            }
            else                        
              cadastroCartao = 1
          }
        }
        else{
          var totalVinculados;
          var vinculados = await Database
            .table('identificador')     
            .where('CodIdentificador','=',data.identificador.codigoIdentificador)
            .count('CodVeiculo as V')
            .count('CodPessoa as P')             
          totalVinculados = vinculados[0].V + vinculados[0].P;

          if(totalVinculados > 0){
            return JSON.stringify({
              error: 2,             
              retorno: false,
              mensagem: "Cartão já Vinculado a outra pessoa",
            });
          }
          else                          
            cadastroCartao = 2       
        } 
        //////////////// FIM  VERIFICA CARTAO----------------------

        //// VERIFICA PLACA------------------------------------------
        var totalPlacas = await Database
        .table('veiculo')     
        .where('Placa','like',data.placa)
        .andWhere('CodVeiculo','!=',codigo)
        .count('Placa as P')

        if(totalPlacas[0].P > 0){
          return JSON.stringify({
            error: 3,             
            retorno: false,
            mensagem: "Placa já registrada!",
          });
        }
        ///// Fim Verifica Placa ------------------------------------------

        //// Monta array motoristas --------------------------------------------
        codMotorista = await numSeqMotorista.consulta();
        var arrayMotoristas = data.motoristas.map((prop,key) => {
          return ({
              "CodMotorista":codMotorista + key,
              "CodVeiculo":codigo, 
              "CodPessoa":prop.codigo,
              "PIN":prop.pin
          })        
        })

        //// Fim Monsta array motoristas --------------------------------------------


        ///// Monta array locais de acesso -----------------------------------------
        codPermissao = await numSeqAcessVei.consulta(); 
        var arrayLocais = data.listalocais.map((prop,key) => {
          return({
            "codpermissaoacessoveiculo":codPermissao+key,
            "CodVeiculo":codigo, 
            "CodLocalAcesso":prop,
          })
        })  


        // Fim monta array locais de acesso


        if(codigo === 0){        
          codigo = await numSeq.consulta();               

          var arrayVeiculo = {
            "CodVeiculo":codigo,
            "Placa":data.placa, 
            "TipoProprietario":tipoproprietario,
            "Modelo": data.modelo, 
            "TextoMarca": data.marca,
            "TextoCor": data.cor,
            "Categoria":1,
            "TextoCategoria":data.categoriaveiculo,

        }
          switch (tipoproprietario){
            case 0:
              arrayVeiculo["CodEmpresa"] = codproprietario;
            break;

            case 1:  
              arrayVeiculo["CodProprietario"] = codproprietario;
            break;
          }              

          await Database.table('veiculo')
            .insert(arrayVeiculo)

          console.log(codigo)

          await Database.table('motorista')
            .insert(arrayMotoristas)           

          await Database.table('permissaoacessoveiculo')
            .insert(arrayLocais)        

          await numSeq.atualiza();
          await numSeqMotorista.atualiza();        
          await numSeqAcessVei.atualiza();
          
        } 
        else{
          await Database.table('veiculo')
            .where("CodVeiculo", codigo)
            .update({
              "Placa":data.placa, 
              "TipoProprietario":tipoproprietario,
              "Modelo": data.modelo, 
              "TextoMarca": data.marca,
              "TextoCor": data.cor,
              "Categoria":1,
              "TextoCategoria":data.categoriaveiculo,
            })

            await Database.table('motorista')
              .where("Codveiculo", '=', codigo)
              .delete()

            await Database.table('permissaoacessoveiculo')
              .where("Codveiculo", '=', codigo)
              .delete()
    
            await Database.table('motorista')
              .insert(arrayMotoristas)  

            await Database.table('permissaoacessoveiculo')
              .insert(arrayLocais)     
        }


        if(cadastroCartao === 1){
          codcartao = await numSeqCartao.consulta()
          await Database.table('identificador')
            .insert({
              "codigoIdentificador" : codcartao,
              "UIDH" : numserie === "" ? null : numserie,
              "Conteudo" : conteudo === "" ? null : conteudo,
              "numSerie24" : conteudo === "" ? null : conteudo,
              "uso" : data.identificador.tipouso,
              "codVeiculo" : codigo
            })  
          await numSeqCartao.atualiza();
        }
        else if(cadastroCartao === 2){
          await Database.table('identificador')
            .where("CodIdentificador", codcartao)
            .update({"CodVeiculo":codigo})
        }

        reposta ={             
          retorno: true,
          mensagem: "Success",
        }
      }
      else{
        reposta ={
          error: 1,             
          retorno: false,
          mensagem: "Invalid Token",
        } 
      }  
    }
    catch(error){
        var reposta ={
            error: error.message,
            retorno: false,       
        }
    } 

    return JSON.stringify(reposta);
  }

  /////////////////////// Excluir /////////////////////////////////////////////////////////////////// 
  async Excluir ({ request }) {
    var data = await request.raw();
    data = JSON.parse(data)        
    var codigo = data.codigo;

    try{
      if (await DwSession.validarToken(data["token"])){   
        await Database.table('motorista')
          .where("Codveiculo", '=', codigo)
          .delete()

        await Database.table('permissaoacessoveiculo')
          .where("Codveiculo", '=', codigo)
          .delete()

        await Database.table('veiculo')
          .where("Codveiculo", '=', codigo)
          .delete()
      }
      else{
        reposta ={
          error: 1,             
          retorno: false,
          mensagem: "Invalid Token",
        } 
      }
    }
    catch(error){
        var reposta ={
            error: error.message,
            retorno: false,       
        }
    }   
  }


}

module.exports = VeiculoController
