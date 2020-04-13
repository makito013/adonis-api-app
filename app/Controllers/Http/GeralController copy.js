'use strict'
const Database = use('Database')
const Autorizado = use('App/Models/Autorizado')
const Pessoa = use('App/Models/Pessoa')
const AutorizadoSecao = use('App/Models/AutorizadoSecao')
const Secao = use('App/Models/Secao')
const DwSession = use('App/Models/DwSession')


class AcessoController {

    async GerarArvoredePesquisa ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)

        var bodyConsulta;
        var query=['b.Nome as nome', 'c.CODPESSOA as codigo', 'c.CodSecao', 'c.TipoAutorizacao']
        var {codsecao,incluirresidente,incluirpreautorizado,incluirprecisaliberacao,
            incluirnaoresidenteautorizado,incluirinativos,nome,categoria,token } = data

           
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
           
           var bodySecao= await Secao.permitidoIds(permissao)

       //if (token.length > 0){
        if (1 === 1){    
            
            
            var QueryConsulta =Database.table('Autorizado')
            .innerJoin ('Pessoa','Pessoa.CODPESSOA','Autorizado.CODPESSOA')
            .leftJoin('Autorizadosecao','Autorizadosecao.CodAutorizado','Autorizado.CODPESSOA')


            if (nome!== undefined)    
       


            var QueryConsulta = Database.table('Autorizado as a')
            .select("a.CodPessoa as codigo","p.Nome as nome","a.CodSecao", 'a.TipoAutorizacao')
            .innerJoin('Pessoa as p' , 'a.CODPESSOA', 'p.CODPESSOA')
            .union(
                [
                    Database.table('AutorizadoSecao as b')
                    .select("b.CodAutorizadoSecao as codigo","e.Nome as nome","b.CodSecao", 'd.TipoAutorizacao')
                    .innerJoin('Autorizado as d' , 'b.CodAutorizado', 'd.CODPESSOA')
                    .innerJoin('Pessoa as e' , 'b.CodAutorizado', 'e.CODPESSOA')
                    .distinct('b.CodAutorizadoSecao') 
                    .where('b.CodSecao','=',codsecao)
                ]
            )
            .distinct('a.CodPessoa')  
   

              
            // if(codsecao !== undefined)
            // QueryConsulta.where('CodSecao','=',codsecao)  
            // else   QueryConsulta.where('p.Nome','like','%'+nome+'%').whereIn('p.CODCATEGORIAPESSOA',categoria)                           

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

            bodyConsulta   = await QueryConsulta.()orderBy('Nome','asc');

            var reposta ={
                count:bodyConsulta.length,
                retorno: true,
                mensagem: "ok",                
                dados: bodyConsulta                   
            }
            return JSON.stringify(reposta);

        }
    }

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
    async ConsultaPessoaP ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var {nome,  incluirinativos} = data;

        
        if (await DwSession.validarToken(data["token"])){
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])

            var bodySecao= await Secao.permitidoIds(permissao)
            if (incluirinativos !== undefined && incluirinativos ==true )
            queryPessoa.where("Tipoautorizacao","<>","4").

           queryPessoa = Pessoa.query().select('Nome as nome','Pessoa.CODPESSOA as codigo').where('Nome','like','%'+nome+'%').InnerJoinAutorizado().whereIn('codsecao',bodySecao).fetch()
                               
             
            var  bodyConsulta =  queryPessoa 
            var reposta ={
                count:bodyConsulta.size(),
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
    async ConsultaPessoaPComFiltros ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var {
            cmd,
            nome,   
            incluirinativos,
            qualquerparte,
            codempresa,
            codlotacao,
            codsecao,
            incluirresidente,
            incluirPreAutorizado,
            incluirPrecisaLiberacao,
            incluirNaoResidenteAutorizado,
            token}=data

        
        if (await DwSession.validarToken(data["token"])){
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])

            var bodySecao= await Secao.permitido(permissao)

        
             
            var  bodyConsulta =  await Pessoa.query().select('Nome as nome','Pessoa.CODPESSOA as codigo').where('Nome','like','%'+nome+'%').InnerJoinAutorizado().where("Tipoautorizacao","<>","4").whereIn('codsecao',bodySecao).fetch()
                               
            var reposta ={
                count:bodyConsulta.size(),
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
   async ConsultaAcessoPessoas ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)

        
        
        if (await DwSession.validarToken(data["token"])){
            var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])

            var bodySecao= await Secao.permitidoIds(permissao)

            var  bodyConsulta =  await Acessos.query().select('Nome as nome','Pessoa.CODPESSOA as codigo').where('Nome','like','%'+nome+'%').InnerJoinAutorizado().where("Tipoautorizacao","<>","4").whereIn('codsecao',bodySecao).fetch()
                               
   
   }
}

module.exports = AcessoController