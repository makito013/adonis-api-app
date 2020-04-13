'use strict'
const Empresa = use('App/Models/Empresa')
const Lotacao = use('App/Models/Lotacao')
const Secao = use('App/Models/Secao')
const DwSession = use('App/Models/DwSession')
const Database = use('Database')

class EmpresaLotacaoSecaoController {
        async EmpresaLotacaoSecao({request}){
            var data = await request.raw();
            data = JSON.parse(data)
            var resposta={}
            try{
              var body={};
              const dwsession =await DwSession.validarToken(data["token"])

             
              if(dwsession.size() >0){
                var  empresa= await  Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
                var codigoEmpresa = empresa.map(prop=>{
                    return prop.CODEMPRESA
                  })  
                var codigolotacao = empresa.map(prop=>{
                      return prop.CODLOTACAO
                  })  
                var codigosecao= empresa.map(prop=>{
                      return prop.CODSECAO
                  })  
                if(empresa.length > 0 && (codigosecao[0]!==null  || codigolotacao[0]!==null  || codigoEmpresa[0]!==null)){
                  const subQuerySecao =  Database.from('SECAO').select('CODLOTACAO').whereIn('CODSECAO',codigosecao)
                  const subQueryLotacao =  Database.from('Lotacao').select('CODEMPRESA').whereIn('CODLOTACAO',codigolotacao).orWhere('CODLOTACAO','in',subQuerySecao)
                  const subQueryEmpresa =  Database.from('Empresa').select('CODEMPRESA').whereIn('CODEMPRESA',codigoEmpresa).orWhere('CODEMPRESA','in',subQueryLotacao)
                  const lotacoespermitidas = Database.from('Lotacao').select('CODLOTACAO').whereIn('CODEMPRESA',codigoEmpresa)
                                              .orWhere('CODLOTACAO','in',codigolotacao)
                                              .orWhere('CODLOTACAO','in', subQuerySecao);
                  const secaopermitidas =  Database.from('Secao').select('CODSECAO').whereIn('CODSECAO',codigosecao)
                                              .orWhere('CODLOTACAO','in',lotacoespermitidas)
                                                

                  var empresa = await Empresa.query().whereIn('CODEMPRESA',subQueryEmpresa).alias().with('children', (busca) =>
                  { 
                    busca.whereIn('CODLOTACAO',lotacoespermitidas).alias().with('children', (busca2) =>{
                    busca2.whereIn('CODSECAO',secaopermitidas).alias();
                      } )
                    } ) .fetch();
                }
                else if  (codigosecao[0]===null  && codigolotacao[0]===null  && codigoEmpresa[0]===null)
                   var empresa = await Empresa.query().alias().with('children', (busca) =>
                      {
                        busca.alias().with('children', (busca2) =>{
                        busca2.alias();
                         })
                      }).fetch();   
                else  empresa  = []    
                      

                body['empresa']=empresa
                // var lotacao = await Lotacao.query().alias().fetch()
                // body['lotacao']=lotacao
                // var secao = await Secao.query().alias().fetch()
                // body['secao']=secao
            
              resposta ={      
                  count:body.length,
                  retorno: true,
                  mensagem: "ok",
                  dados:body,
                  //token:token
              }  
            }
            else{
              resposta ={      
    
                retorno: false,
                mensagem: "Token inválido",
         
                //token:token
            }  
            }
           }
            catch(error){
              resposta={
                  erro:error.message,
                  retorno :false
                  
              }
            }
      
            return JSON.stringify(resposta);
        }

        async ListaEmpresaLotacaoSecao({request}){
          var data = await request.raw();
          data = JSON.parse(data)
          var resposta={}
          try{

            var body={};
            if  ( true){//await DwSession.validarToken(data["token"])){//Boolean(token)) {

              var empresa = await Empresa.query().alias().fetch();    
              body['empresa'] = empresa;
              var lotacao = await Lotacao.query().alias().fetch()
              body['lotacao'] = lotacao;
              var secao = await Secao.query().alias().fetch()
              body['secao'] = secao;
            }
            
            resposta ={
                count:body.length,
                retorno: true,
                mensagem: "ok",
                dados:body,
                //token:token
            }  
         }
          catch(error){
            resposta={
                erro:error,
                retorno :false
                
            }
          }
    
          return JSON.stringify(resposta);
      }        
}

module.exports = EmpresaLotacaoSecaoController
