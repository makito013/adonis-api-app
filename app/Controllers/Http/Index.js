'use strict'
const Database = use('Database')
const LocalAcesso = use('App/Models/LocalAcesso')
const Empresa = use('App/Models/Empresa')
const Lotacao = use('App/Models/Lotacao')
const Secao = use('App/Models/Secao')
const DwSession= use('App/Models/DwSession')
class Index {
    //---------------------------------- Nome Maquina ---------------------
    async NomeMaquina ({request}){
        return (request.hostname());
    }
    //-------------------------------Fim Nome Maquina ---------------------

    //----------------------------------- Tempo Permanencia ---------------
    async TempoPermanencia ( { request } ) {
        var data = await request.raw();
        var bodyCategoria, bodyLocaisAcesso, bodyEmpresa, bodyLotacao, bodySecao;
        
        var Categoria=['CodCategoriaPessoa as CodCategoria', 'Nome', 'CodCategoriaSuperior']
        var LocaisAcesso=['CodLocalAcesso', 'Nome']
        var Secao=['CodSecao', 'Nome', 'codLotacao']
        var Lotacao=['CodLotacao', 'Nome', 'codEmpresa']
        var Empresa=['CodEmpresa', 'Nome']
        data = JSON.parse(data)

       //if (token.length > 0){
        if (1 === 1){        
            var QueryCategoria= Database.table('CategoriaPessoa')
            .select(Categoria)
            
            var QueryLocaisAcesso= Database.table('LocalAcesso')
            .select(LocaisAcesso)

            var QueryEmpresa= Database.table('Empresa')
            .select(Empresa)
            
            var QueryLotacao= Database.table('Lotacao')
            .select(Lotacao)
            
            var QuerySecao= Database.table('Secao')
            .select(Secao)
        
            bodyCategoria   = await QueryCategoria.orderBy('Nome','asc');
            bodyLocaisAcesso= await QueryLocaisAcesso.orderBy('Nome','asc');
            bodyEmpresa     = await QueryEmpresa.orderBy('Nome','asc');
            bodyLotacao     = await QueryLotacao.orderBy('Nome','asc');
            bodySecao       = await QuerySecao.orderBy('Nome','asc');

            var reposta ={
                retorno: true,
                mensagem: "ok",
                Categoria:{
                    count:bodyCategoria.length,                                       
                    dados: bodyCategoria
                },
                LocaisAcesso:{
                    count:bodyLocaisAcesso.length,                                       
                    dados: bodyLocaisAcesso
                },
                EmpresaLotacaoSecao:{
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
            
            return JSON.stringify(reposta);

        }
    } 
    //-----------------------------------Fim Tempo Permanencia ---------------


    async PessoaseUltimosAcessos ( { request } ) {
        var data = await request.raw();
        var reposta;
        data = JSON.parse(data);
        var bodyCategoria, bodyLocaisAcesso, bodyEmpresa, bodyLotacao, bodySecao;
        if  ( await DwSession.validarToken(data["token"])){
        var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
            bodyLocaisAcesso = await LocalAcesso.permitido(PermissaoGerenciaAcesso);
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
            bodyEmpresa= await Empresa.permitido(permissao)
            bodyLotacao= await Lotacao.permitido(permissao)
            bodySecao= await Secao.permitido(permissao)

            reposta ={
                ListaLocaisAcesso:bodyLocaisAcesso,
                empresa :bodyEmpresa,
                lotacao:bodyLotacao,
                secao:bodySecao
            }
            }
            return JSON.stringify(reposta);
    }
    async AlteracaoColetivadeJornada ( { request } ) {
        var data = await request.raw();
        var reposta;
        data = JSON.parse(data);
        var bodyCategoria, bodyLocaisAcesso, bodyEmpresa, bodyLotacao, bodySecao,bodyJornada;
        if  ( await DwSession.validarToken(data["token"])){
            var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
            bodyLocaisAcesso = await LocalAcesso.permitido(PermissaoGerenciaAcesso);
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
            bodyEmpresa= await Empresa.permitido(permissao)
            bodyLotacao= await Lotacao.permitido(permissao)
            bodySecao= await Secao.permitido(permissao)
            bodyCategoria  =await  Database.table('CategoriaPessoa').select('codCategoriaPessoa','Nome','codCategoriaSuperior')
            bodyJornada = await  Database.table('Jornada').select('CodJornada','nome','historica')
            reposta ={
                listaCategoria : bodyCategoria,
                listaLocaisAcesso:bodyLocaisAcesso,
                listaJornada :bodyJornada,
                empresa :bodyEmpresa,
                lotacao:bodyLotacao,
                secao:bodySecao,
                retorno :true,
                msg: "ok"
            }
        }
            return JSON.stringify(reposta);
    }
 
    async EditarRegistros ( { request } ) {
        var data = await request.raw();
        var reposta;
        data = JSON.parse(data);
        var bodyEmpresa, bodyLotacao, bodySecao,bodyJornada;
        try{
        if  ( await DwSession.validarToken(data["token"])){
            var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
       //     bodyLocaisAcesso = await LocalAcesso.permitido(PermissaoGerenciaAcesso);
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
            bodyEmpresa= await Empresa.permitido(permissao)
            bodyLotacao= await Lotacao.permitido(permissao)
            bodySecao= await Secao.permitido(permissao)
            
            reposta = {

                listaJornada :bodyJornada,
                empresa :bodyEmpresa,
                lotacao:bodyLotacao,
                secao:bodySecao,
                retorno :true,
                msg: "ok"
            }
        }
        }
        catch(erro){
            reposta ={

              
                retorno :false,
                msg: erro.message
            }
        }
            return JSON.stringify(reposta);
    }

    async AutorizacaoAcesso ( { request } ) {
        var data = await request.raw();
        var resposta;
        data = JSON.parse(data);
        var bodyCategoria, bodyLocaisAcesso, bodyEmpresa, bodyLotacao, bodySecao;
        if  ( await DwSession.validarToken(data["token"])){
        var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
            bodyLocaisAcesso = await LocalAcesso.permitido(PermissaoGerenciaAcesso);
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
            bodyEmpresa= await Empresa.permitido(permissao)
            bodyLotacao= await Lotacao.permitido(permissao)
            bodySecao= await Secao.permitido(permissao)
            bodyCategoria  =await  Database.table('CategoriaPessoa').select('codCategoriaPessoa','Nome','codCategoriaSuperior')
           var body ={
                listaLocaisAcesso:bodyLocaisAcesso,
                empresa :bodyEmpresa,
                lotacao:bodyLotacao,
                secao:bodySecao,
                categoria: bodyCategoria
            }
            resposta={
                dados: body,
                msg:'Ok',
                retorno:true
            }
            }
            return JSON.stringify(resposta);
    }

}

module.exports = Index
