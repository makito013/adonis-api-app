'use strict'

const Empresa = use('App/Models/Empresa')
const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const CmNumsequencial = use('App/Models/CmNumsequencial')
var geral = require('./Geral.js');

class EmpresaController {
    async  Index ({request}) {
        var data = await request.raw();
          data = JSON.parse(data)
          var resposta={}
         try{
           var token= await Database.table('DWSession').select('*').where('token','like',data["token"]);
            //var token = await DwSession.validarToken(data["token"]);
            var body=[];
            if  (Boolean(token)) 
              body = await Empresa.all()
            
            resposta ={      
                count:body.length,
                retorno: true,
                mensagem: "ok",
                dados:body
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
      async Salvar ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var reposta;
        var codigo =data.codigo
        if (codigo == 0){
            var numSeq = new geral.numeroSequecial('Empresa')
            codigo =  await numSeq.consulta();
            codigo=codigo+1;
        }
        var Empresa={   
         CodEmpresa:codigo,
         Nome:data.nome,
         Endereco:data.endereco,
         CGC :data.CGC, 
         DiaInicioMes:data.dataInicioMes,
         DiaFimMes:data.dataFimMes,
         Numero:data.numero,
    //    var CODEMPRESAFOLHA=data.CODEMPRESAFOLHA,
         CODATIVIDADEECONOMICA:data.cnae, 
         NumeroFolha:data.numeroFolha,
         CEI:data.CEI,
         NumeroVagas:data.numeroVagas,
        }
      //  var LATITUDE=data.LATITUDE,
     //   var LONGITUDE=data.LONGITUDE
       //if (token.length > 0){
        
            //var token= await Database.table('DWSession').select('*').where('token','like',data["token"]);
            var token = await DwSession.validarToken(data["token"]);
            var body=[];
            if  (Boolean(token)){   
                 //validacoes
               var Empresanew = await Database.table('Empresa').select('*').where('Numero',Empresa.Numero)
                
                try{
                if(Empresanew.length > 0){
                    reposta ={
                        retorno: false,
                        erro:'Numero em uso pela Empresa: ' +  Empresanew[0].Nome       
                    }
    
                }
                else{
                   var  userId;
                    if(data.codigo == 0) {                
                        userId = await Database.table('Empresa').insert(Empresa);
                        numSeq.atualiza();     
                        //.insert({"CodEmpresa":,"Periodos":Periodos, "TolEntrada":15, "TolSaida": 15, "Flagsrefeitorio": 31, "ToleranciasColetor": toleranciaColetor})
                    }  
                    else{
                        userId = await Database.table('Empresa')
                        .where("CodEmpresa", Empresa.CodEmpresa)
                        .update(Empresa);
                    }

            //        numSeq.atualiza(ID, 'Horario');

                  reposta ={
                        retorno: true,       
                    }
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

                var Lotacao = await Database.table('Lotacao').select('CodLotacao').where('CodEmpresa',data.codigo);

                if (Lotacao.length > 0)
                {
                    reposta={
                        erro : 'Empresa possui lotações',
                        retorno : false
                    }
                }
                else{
                    const empresa2 =await Empresa.find(data.codigo);
                 await empresa2.delete()
               //  console.log(user.id) // works fine
                 reposta={
                    mensagem : 'Empresa Excluida',
                    retorno : true
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
}

module.exports = EmpresaController
