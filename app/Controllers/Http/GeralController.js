'use strict'
const Database = use('Database')
const Autorizado = use('App/Models/Autorizado')
const Pessoa = use('App/Models/Pessoa')
const AutorizadoSecao = use('App/Models/AutorizadoSecao')
const Secao = use('App/Models/Secao')
const DwSession = use('App/Models/DwSession')


class GeralController {

    async GerarArvoredePesquisa ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var {codsecao,incluirresidente,incluirpreautorizado,incluirprecisaliberacao,
            incluirnaoresidenteautorizado,incluirinativos,nome,categoria,token } = data

        var bodyConsulta;
        var query=['b.Nome as nome', 'c.CODPESSOA as codigo', 'c.CodSecao', 'c.TipoAutorizacao']
        // var codsecao= data.codsecao;
        // var incluirresidente = data.incluirresidente;
        // var incluirpreautorizado = data.incluirpreautorizado;
        // var incluirprecisaliberacao = data.incluirprecisaliberacao;
        // var incluirnaoresidenteautorizado = data.incluirnaoresidenteautorizado;
        // var incluirinativos = data.incluirinativos;
        // var token = data.token;
        var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',token)
        
        var bodySecao= await Secao.permitidoIds(permissao)
       //if (token.length > 0){
        if (1 === 1){    
            var queryUnion =   
                Database.table('AutorizadoSecao as b')
                .select("b.CodAutorizadoSecao as codigo","e.Nome as nome","b.codSecao", 'd.TipoAutorizacao')
                .innerJoin('Autorizado as d' , 'b.CodAutorizado', 'd.CODPESSOA')
                .innerJoin('Pessoa as e' , 'b.CodAutorizado', 'e.CODPESSOA')
                .distinct('b.CodAutorizadoSecao') 
            

                if (codsecao != undefined)
                    queryUnion.where('b.CodSecao',codsecao)
                else 
                    queryUnion.whereIn('b.CodSecao',bodySecao).where('e.Nome','like','%'+nome+'%')

            var QueryConsulta = Database.table('Autorizado as a')
            .select("a.CodPessoa as codigo","p.Nome as nome","a.codSecao", 'a.TipoAutorizacao')
            .innerJoin('Pessoa as p' , 'a.CODPESSOA', 'p.CODPESSOA')
            .union([queryUnion])
            .distinct('a.CodPessoa')  

            if (codsecao != undefined)
            QueryConsulta.where('CodSecao',codsecao)
            else 
            QueryConsulta.whereIn('CodSecao',bodySecao).where('p.Nome','like','%'+nome+'%')

            
            if(incluirinativos == false)
                QueryConsulta.andWhere('TipoAutorizacao','!=',4)

            if(incluirresidente == false)
                QueryConsulta.andWhere('TipoAutorizacao','!=',1)

            if(incluirnaoresidenteautorizado == false)
                QueryConsulta.andWhere('TipoAutorizacao','!=',6)

            if(incluirprecisaliberacao == false)
                QueryConsulta.andWhere('TipoAutorizacao','!=',3)
            
            if(incluirpreautorizado == false)
                QueryConsulta.andWhere('TipoAutorizacao','!=',2)

            bodyConsulta   = await QueryConsulta.orderBy('Nome','asc');

            var reposta ={
                count:bodyConsulta.length,
                retorno: true,
                mensagem: "ok",                
                dados: bodyConsulta                   
            }
            return JSON.stringify(reposta);

        }
    }

    ////////////////// CONSULTA PESSOA SEM FILTRO DE PERMISSAO /////////////////////////////////////////////////
    async ConsultaPessoa ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var nome = data.nome;
        if (await DwSession.validarToken(data["token"])){
            // EXEMPLO UNION
            var QueryConsulta = Database.table('pessoa as a')
            .select("a.nome","a.CodPessoa as codigo")
            .leftJoin("autorizado as b", "b.codpessoa", "a.codpessoa")
            .where("b.tipoautorizacao","!=","4")
            .andWhere("a.nome","like",nome+"%")
            
            var bodyConsulta   = await QueryConsulta.orderBy('Nome','asc');  
                    
            var reposta ={
                count:bodyConsulta.length,
                retorno: true,
                mensagem: "ok",                
                dados: bodyConsulta                   
            }
        }else{
            var reposta ={
                error: 1,             
                retorno: false,
                mensagem: "Invalid Token",
            } 
        }
        return JSON.stringify(reposta);
    }

    ////////////////// CONSULTA PESSOA COM FILTRO PERMISSAO /////////////////////////////////////////////////
    async ConsultaPessoaP ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var {nome,  incluirinativos} = data;

        
        if (await DwSession.validarToken(data["token"])){
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
            var  bodySecao= await Secao.permitidoIds(permissao)
            
            var queryPessoa=Pessoa.query().select('Nome as nome','Pessoa.CODPESSOA as codigo').where('Nome','like','%'+nome+'%').InnerJoinAutorizado().whereIn('codsecao',bodySecao)
            if (incluirinativos === undefined || incluirinativos ==true )
                  queryPessoa.where("Tipoautorizacao","<>","4")
            var  bodyConsulta = await queryPessoa.fetch()
            var reposta ={
                count:bodyConsulta.length,
                retorno: true,
                mensagem: "ok",                
                dados: bodyConsulta                   
            }
        }else{
            var reposta ={
                error: 1,             
                retorno: false,
                mensagem: "Invalid Token",
            } 
        }
        return JSON.stringify(reposta);
    }
    async ListaEmpresaLotacaoSecao ( { request } ) {
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

    async ConsultaAcessoPessoa ( { request } ) {
        var data = await request.raw();
        var reposta;
        data = JSON.parse(data);
        var {codpessoa,datainicio,datafim,token} =data
        var bodyEmpresa, bodyLotacao, bodySecao,bodyJornada;
        try{
            if  ( await DwSession.validarToken(data["token"])){
            //    var PermissaoGerenciaAcesso =await Database.table('PermissaoGerenciaAcesso as  P').select('P.CodLocalACesso').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"]);
           
           
                ////  bodyEmpresa= await Empresa.permitido(permissao)
             //   bodyLotacao= await Lotacao.permitido(permissao)
              //  bodySecao= await Secao.permitido(permissao)

              var bodyAcesso = await Database.from('Acesso').where('CODPESSOA',codpessoa).whereBetween('DataHora',[datainicio,datafim]).select('CODACESSO as codigo','DataHora as datahora','DIRECAO AS direcao','FUNCAO as funcao','CODCOLETOR as nomecoletor')

                reposta = {
    
                    dados:bodyAcesso,
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



    

}

module.exports = GeralController