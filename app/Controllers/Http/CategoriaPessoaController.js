'use strict'
const Database = use('Database')
const EventoSistemaWeb = use('App/Models/EventoSistemaWeb')
var geral = require('./Geral.js');
const DwSession = use('App/Models/DwSession')
class CategoriaPessoaController {
    async Index ({ request}) { 
        var data = await request.raw();
        data = JSON.parse(data)

        var body = await  Database.table('CategoriaPessoa').select('codCategoriaPessoa','Nome','codCategoriaSuperior')
        var resposta={
            dados:body,
            retorno:true,
            mensagem: 'ok',
            count:body.length,   
        }
        return resposta;

    }  
    async Salvar ({ request, auth }) { 
        var reposta={};
        try{
            var data = await request.raw();
            data = JSON.parse(data)
            var {codigo,nome,codCategoriaSuperior,token} = data;

            const dwsession =await Database.table('DwSession').select('USUARIO.CODPESSOA as CodPessoa','DWSESSION.Token as Token').innerJoin('USUARIO','USUARIO.CODPESSOA','DWSESSION.CODUSUARIO').where('Token','=',data.token)
            // const dwsession =await Database.table(DwSession).validarToken(data["token"]).ids()
  

    
            if (dwsession.length>0){
                
            var affectedRows=0;
            if (codigo > 0 ){
                if (codigo !== codCategoriaSuperior){
                    affectedRows  = await Database.table('CategoriaPessoa').where('CodCategoriaPessoa',codigo).update({Nome:nome}) 
                    reposta = {
                        data:affectedRows,
                        retorno:(affectedRows> 0 && affectedRows < 2)? true: false,
                        msg: (affectedRows> 0 && affectedRows < 2)? "ok":"Erro",
                        count:affectedRows     
                    }
                }
                else{
                    reposta = {
                      
                        retorno:false,
                        msg: "Categoria inválida : Não pode pertencer a ela mesmo"
                        
                    }
                  
                }
       

            }
            else {
            var numSeq = new geral.numeroSequecial('CategoriaPessoa')
                codigo =  await numSeq.consulta();
                codigo=codigo+1;
               var body= await  Database.table('CategoriaPessoa').insert({'CodCategoriaPessoa':codigo,'Nome':nome,'CodCategoriaSuperior':codCategoriaSuperior})
                  numSeq.atualiza();  
                  reposta ={
                    retorno: true,       
                    dados : body,
                    count : body.count,

                 }
                 return JSON.stringify(reposta);
            }
                  
            if (codigo !== codCategoriaSuperior){
              var affectedRows1 = await Database.table('CategoriaPessoa').where('CodCategoriaPessoa',codCategoriaSuperior).update({Nome:nome, CodCategoriaSuperior:codCategoriaSuperior})
                const EventoSistemaWebData={
                    Conteudo:'S="DokeoWeb 4.0.0";U="'+data.Nome+'"'+ 'T="CategoriaPessoa"',
                    DataHoraEvento: new Date(),
                    DataReferenciaInicio: new Date(),
                    DataReferenciaFim: new Date(),
                    CodigoObjeto:codigo,
                    CodUsuario:dwsession[0].CodPessoa,
                    TipoEvento:6
                    
                }
                EventoSistemaWeb.create(EventoSistemaWebData);
            }
            
            }
            else {
                var reposta ={
                    msg: 'token inválido',
                    retorno: false,    
                }
                return JSON.stringify(reposta);
            }
        }
        catch(error){
            var reposta ={
                msg: error.message,
                retorno: false,       
            }
            return JSON.stringify(reposta);
        }  
        

  
    }   
    async insert ({ request, auth }) { 

        var data = await request.raw();
        data = JSON.parse(data)
        var reposta={};
        try{
        body= await  Database.table('CategoriaPessoa').insert({'Nome':data.Nome,'CodCategoriaSuperior':data.CodCategoriaSuperior})
        reposta ={
            retorno: true,       
            dados : body,
            count : body.count
         }
        //  const EventoSistemaWebData={
        //     Conteudo:'S="DokeoWeb 4.0.0";U="'+data.Nome+'"'+ 'T="CategoriaPessoa"',
        //     DataHoraEvento: new Date(),
        //     DataReferenciaInicio: new Date(),
        //     DataReferenciaFim: new Date(),
        //     CodigoObjeto:[0].CODPESSOA,
        //     CodUsuario:dwsession[0].CODPESSOA,
        //     TipoEvento:7
            
        // }
        // EventoSistemaWeb.create(EventoSistemaWebData);
        }
        catch(error){
            reposta ={
                error: error,
                retorno: false,       
            }
        }  
        return JSON.stringify(reposta);
    }   
    async Excluir ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var body;   
        var Codigo = data.codigo;      
        var userId = 0;
        var reposta={};
        try{

            const dwsession =await Database.table('DwSession').select('USUARIO.CODPESSOA as CodPessoa','DWSESSION.Token as Token').innerJoin('USUARIO','USUARIO.CODPESSOA','DWSESSION.CODUSUARIO').where('Token','=',data.token)
           // const dwsession =await Database.table(DwSession).validarToken(data["token"]).ids()
 
            if (dwsession.length>0){
                
                if(Boolean(Codigo)) {                
                    userId = await Database.table('CategoriaPessoa')
                    .where("CodCategoriaPessoa", Codigo)
                    .delete()
                    reposta ={
                        retorno: true,       
      
                     }

                    const EventoSistemaWebData={
                        Conteudo:'S="DokeoWeb 4.0.0";U="'+data.Nome+'"'+ 'T="CategoriaPessoa"',
                        DataHoraEvento: new Date(),
                        DataReferenciaInicio: new Date(),
                        DataReferenciaFim: new Date(),
                        CodigoObjeto:Codigo,
                        CodUsuario:dwsession[0].CodPessoa,
                        TipoEvento:7
                        
                    }
                    EventoSistemaWeb.create(EventoSistemaWebData);
                }  
                else{
                    reposta ={
                        error: 1015,
                        msg: "Codigo 0 não pode ser excluido",
                        retorno: false,       
                    }                        
                }
            }
           
        }
        catch(error){
            var reposta ={
                msg: error.message,
                retorno: false,       
            }
        }  
        return JSON.stringify(reposta);
                      
    } 

}

module.exports = CategoriaPessoaController
