'use strict'
const Database = use('Database');
const LocalAcesso = use('App/Models/LocalAcesso')
const Autorizado = use('App/Models/Autorizado')
const Acesso = use('App/Models/Acesso')
const DwSession = use('App/Models/DwSession')
const Secao  = use('App/Models/Secao')
const moment = require("moment");
var geral = require('./Geral.js');
class RelatorioController {

  async HistoricoAcesso ( { request } ) {
    //   const posts = await request.raw()
    var data = await request.raw();
    var body;
    var consulta;
    data = JSON.parse(data)
    var dataInicio=data.dataInicio;
    var dataFim=data.dataFim;
    var horaInicio =data.horaInicio;
    var horaFim = data.horaFim;
    var tentativaAcesso = data.tentativaAcesso;
    var dadosVeiculos = data.dadosVeiculos;
    var apenasAutorizado = data.apenasAutorizado;
    var pessoaVisitada = data.pessoaVisitada;

    var DataHoraInicio = dataInicio +" "+horaInicio;
    var DataHoraFim = dataFim +" "+horaFim;
    var token= await Database.table('DWSession').select('*').where('token','like',data["token"]);
    var array =['Acesso.Codacesso','Acesso.DataHora','p.Codpessoa','p.Nome as NomePessoa','Acesso.Direcao'] 
    const dwsession =await DwSession.validarToken(data["token"])

    if(dwsession.size() >0){
        var  permissao=  await Database.table('PermissaoGerencia as P').select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO').innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario').where('Dwsession.Token',data["token"])
    
//       var bodyEmpresa= await Empresa.permitidoIds(permissao)
 //      var bodyLotacao= await Lotacao.permitidoIds(permissao)
       var bodySecao= await Secao.permitidoIds(permissao)
      //if (token.length > 0){
    // if (1 === 1){
      var query= Database.table('Acesso');
      var array = ['Acesso.Codacesso','Acesso.DataHora','p.Codpessoa','p.Nome as NomePessoa','Acesso.Direcao','s.Nome as NomeSecao','l.Nome as NomeLotacao'];
      if (pessoaVisitada == true)
        array.push('p2.Nome as Visitou')
      
      if (dadosVeiculos === true)
        array.push('AcessoExtra.ModeloCarro','AcessoExtra.PlacaCarro');


      query.select(array)
          .innerJoin('Pessoa as p', 'p.Codpessoa', 'Acesso.Codpessoa')
          .leftJoin('Pessoa as p2','p2.Codpessoa','Acesso.CodPessoaContato')
          .innerJoin('Autorizado','Autorizado.Codpessoa','Acesso.Codpessoa')
          .innerJoin('Secao as s', 's.CodSecao', 'Acesso.CodSecaoDestino')
          .innerJoin('Lotacao as l', 'l.codLotacao', 's.codlotacao')
          .innerJoin('Empresa as e', 'l.codEmpresa', 'e.codEmpresa')
          .where('Acesso.DataHora','>',DataHoraInicio)
          .andWhere('Acesso.DataHora','<',DataHoraFim)
          .andWhere('Acesso.Funcao','<>','LIB')
          .orderBy('Acesso.DataHora','Desc') 

      if(bodySecao.length > 0 )
        query.whereIn('Autorizado.CODSECAO',bodySecao)
      else  
      {
        var reposta ={      
        
          retorno: false,
          mensagem: "sem permissão gerencial",
 
        }
          return JSON.stringify(reposta);
      }

      if (dadosVeiculos === true)
        query.leftJoin('AcessoExtra','AcessoExtra.CodAcesso','Acesso.CodAcesso')

    //  if (apenasAutorizado === true)
      //   query.innerJoin('Autorizado','Autorizado.Codpessoa','Acesso.Codpessoa')
    if (tentativaAcesso === false)
        query.andWhere('Acesso.Direcao','<>',12)

      body = await query.on('query', console.log);
        
      var reposta ={      
        count:body.length,
        retorno: true,
        mensagem: "ok",
        dados:body
      }
        return JSON.stringify(reposta);  

    }
    else{

            var reposta ={      
              count:body.length,
              retorno: true,
              mensagem: "ok",
              dados:body
            }
            return JSON.stringify(reposta);
 
  

    }
    
      
  }


  async DevolucaoCartao ( { request } ) {
      
    var data = await request.raw();
    var body;
    var consulta;
    data = JSON.parse(data)
    console.log(data)
    var dataInicio = data.datainicio;
    var dataFim = data.datafim;
    var localacessso = data.localacesso;
    var empresas =data.itensbusca.empresav==='' ?[0]: data.itensbusca.empresav.split(',');
    var lotacoes =data.itensbusca.lotacaov==='' ?[0]: data.itensbusca.lotacaov.split(',');
    var secoes =data.itensbusca.secaov==='' ?[0]: data.itensbusca.secaov.split(',');
    var pessoas =data.itensbusca.pessoav==='' ?[0]: data.itensbusca.pessoav.split(',');
    
    // body=await Database.table('AcessoIdentificador')
    // .innerJoin('Acesso as a', 'a.Codpessoa', 'p.Codpessoa')
    // .innerJoin('Pessoa as p', 'p.Codpessoa', 'Identificador.Codpessoa')
    try{

    
      if (!await DwSession.validarToken(data["token"]))
        throw "invalid token";

      var PermissaoGerenciaAcesso = await Database.table('PermissaoGerenciaAcesso as  P')
          .select('P.CodLocalAcesso')
          .innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario')
          .where('Dwsession.Token',data["token"]);
          var LocaisAcesso = await LocalAcesso.permitidoIds(PermissaoGerenciaAcesso);
          var coletores = Database.table('Coletor as c').select('c.CodColetor').whereIn('c.CodLocalAcesso', LocaisAcesso);    


       if(PermissaoGerenciaAcesso.length > 0){

      var autorizado = await Autorizado.query()
      .innerJoin('Secao as s', 'Autorizado.codSecao', 's.codSecao')
      .innerJoin('Lotacao as l', 'l.codLotacao', 's.codLotacao')
      .innerJoin('Empresa as e', 'e.codEmpresa', 'l.codEmpresa')
      .where('Autorizado.codPessoa','in', pessoas)
      .orWhere('s.codSecao', 'in', secoes)
      .orWhere('l.codLotacao','in', lotacoes)
      .orWhere('e.codEmpresa','in', empresas).ids();

      var queryIdenficador  = Database.table('Identificador')
        .select('Identificador.Conteudo','p.Nome','p.CodPessoa','a.Direcao','a.DataHora as Entrada')
        .innerJoin('Pessoa as p', 'p.Codpessoa', 'Identificador.Codpessoa')
        .innerJoin('Autorizado as au', 'au.Codpessoa', 'Identificador.Codpessoa')
        .innerJoin('Acesso as a', 'a.Codpessoa', 'p.Codpessoa')
        .innerJoin('Coletor as c', 'a.CodColetor', 'c.CodColetor')
        .innerJoin('AcessoIdentificador','AcessoIdentificador.CodIdentificador','Identificador.CodIdentificador')
        
        .whereBetween('a.DataHora',[dataInicio,dataFim])
        .andWhere('au.TipoAutorizacao','=',3)
        .andWhere('a.direcao', 1)
        .andWhere('c.CodlocalAcesso','in', LocaisAcesso )
        .andWhere('a.Funcao','<>', 'LIB')
        //.andWhere('a.codpessoa','in', autorizado)

       
        //.where('a.DataHora','>',dataInicio)
        //.andWhere('a.DataHora','<',dataFim)
 
        .groupBy('Identificador.CodIdentificador').max('a.Direcao').max('a.DataHora')

        if (localacessso.length > 0)
        queryIdenficador.andWhere('c.CodlocalAcesso','in', localacessso)
        
        body = await queryIdenficador
        var reposta ={  
          count:body.length,
          retorno: true,
          mensagem: "ok",
          dados:body
        }
    return JSON.stringify(reposta);
  }
}
catch(erro){
  body = await queryIdenficador
  var reposta ={  

    retorno: false,
    msg: erro.message,
    
  }
  return JSON.stringify(reposta);
}
}



  async AcessosPorSecao ( { request } ) {
    var data = await request.raw();
    var body;    
    var array=['p.Nome','Acesso.DataHora','au.TipoAutorizacao','Acesso.Direcao','p2.Nome as NomeContato','e.Nome as Empresa','l.Nome as Lotacao','s.Nome as Secao','c.Nome as NomeColetor']
    data = JSON.parse(data)
    console.log(data);
    var tipo  = data.tipo;
    var codELS = data.codELS;
    var dataInicio = data.dataInicio;
    var dataFim = data.dataFim;
    var soVisitantes= data.soVisitantes;
    var mostrarPlacas= data.mostrarPlacas;
    var soVeiculos= data.soVeiculos;

    if (mostrarPlacas)
      array.push('AcessoExtra.PlacaCarro')           

    var Query= Database.table('Acesso')
    .select(array)
    .innerJoin('Pessoa as p', 'p.Codpessoa', 'Acesso.Codpessoa')
    .innerJoin('Autorizado as au', 'au.Codpessoa', 'Acesso.Codpessoa')
    .leftJoin('Pessoa as p2','p2.Codpessoa','Acesso.CodPessoaContato')
    .innerJoin('Secao as s', 's.CodSecao', 'Acesso.CodSecaoDestino')
    .innerJoin('Lotacao as l', 'l.codLotacao', 's.codlotacao')
    .innerJoin('Empresa as e', 'l.codEmpresa', 'e.codEmpresa')
    .innerJoin('Coletor as c', 'c.CodColetor', 'Acesso.codColetor')
    .leftJoin('AcessoExtra','AcessoExtra.CodAcesso','Acesso.CodAcesso')
    .where('Acesso.DataHora','>',dataInicio)
    .andWhere('Acesso.DataHora','<',dataFim)
    .andWhere('Acesso.Direcao','<>',12)
    .andWhere('Acesso.Funcao','<>', 'LIB')
    
    if(soVeiculos)
      Query.andWhere('AcessoExtra.PlacaCarro','<>', '')
    if (soVisitantes)
      Query.andWhere('au.TIPOAUTORIZACAO','=', 3)
    if (tipo=='empresa')
      Query.andWhere('e.CodEmpresa','=',codELS)
    else if (tipo=='lotacao')
      Query.andWhere('l.CodLotacao','=',codELS)
    else if (tipo =='secao')
      Query.andWhere('s.CodSecao','=',codELS)

    body= await Query.orderBy('Acesso.DataHora','desc');
      var reposta ={
      count:body.length,
      retorno: true,
      mensagem: "ok",
      dados:body
    }

    return JSON.stringify(reposta);
  }



  async AcessosPorLocal ({ request }) {
    var data = await request.raw();
    data = JSON.parse(data);
    var body;
    var token = data.token;
    var pessoa = data.pessoas.pessoav.split(",")
    var secao= data.pessoas.secaov.split(",");
    var lotacao= data.pessoas.lotacaov.split(",");
    var empresa = data.pessoas.empresav.split(",");
    var locaisAcesso = data.locaisAcesso.split(",");
    var dataInicio = data.dataInicio;
    var dataFim = data.dataFim;
    var soVisitantes= data.soVisitantes;
    var incluirDesativados= data.incluirDesativados;
    var soVeiculos= data.soVeiculos;
    var array=['Loc.Nome as NomeLocalAcesso','p.Nome as NomePessoa','p.CodPessoa','Acesso.DataHora','Acesso.Direcao','p2.Nome as NomeContato','c.Numero','c.Nome as NomeColetor']
      

    var Query= Database.table('Acesso')
    .select(array)
    .innerJoin('Pessoa as p', 'p.Codpessoa', 'Acesso.Codpessoa')
    .innerJoin('Autorizado as au', 'au.Codpessoa', 'Acesso.Codpessoa')
    .leftJoin('Pessoa as p2','p2.Codpessoa','Acesso.CodPessoaContato')
    .innerJoin('Secao as s', 's.CodSecao', 'Acesso.CodSecaoDestino')
    .innerJoin('Lotacao as l', 'l.codLotacao', 's.codlotacao')
    .innerJoin('Empresa as e', 'l.codEmpresa', 'e.codEmpresa')
    .innerJoin('Coletor as c', 'c.CodColetor', 'Acesso.codColetor')
    .innerJoin('LocalAcesso as Loc','loc.CodLocalAcesso','c.CodLocalAcesso')
    .leftJoin('AcessoExtra','AcessoExtra.CodAcesso','Acesso.CodAcesso')
    .where('Acesso.DataHora','>',dataInicio)
    .andWhere('Acesso.DataHora','<',dataFim)
    .andWhere('Acesso.Direcao','<>',12)
    .andWhere('Acesso.Funcao','<>', 'LIB')
    .andWhere('loc.CodLocalAcesso','in',locaisAcesso)

    if (pessoa.length > 0 )
      Query.orWhere('Acesso.Codpessoa','in',pessoa)
    if (secao.length > 0 )
      Query.orWhere('s.codsecao','in',secao)
    if (lotacao.length > 0)
      Query.orWhere('l.codlotacao','in',lotacao)
    if (empresa.length > 0)
      Query.orWhere('e.codempresa','in',empresa)

    body= await Query.orderBy('Acesso.DataHora','desc');
      var reposta ={   
      count:body.length,
      retorno: true,
      mensagem: "ok",
      dados:body
    }
    return JSON.stringify(reposta);
  }

  //----------------------------------- Tempo Permanencia ---------------
  async TempoPermanencia ( { request } ) {
    var data = await request.raw();
    data = JSON.parse(data)

    var body;    
    var select=['b.DataHora', 'b.Direcao', 'b.CodPessoa', 'c.Nome as Pessoa', 'd.nome as NomeLocal']
    var retorno;
    var dataInicio = data.dataInicio;
    var dataFim = data.dataFim;
    var codLocaisAcesso = data.codLocaisAcesso;    
    var pessoas = data.pessoas;
    

    //if (token.length > 0){
    if (1 === 1){        
      var Query= Database.table('coletor as a')
      .select(select)
      .innerJoin("acesso as b","a.CodColetor", "b.CodColetor")
      .innerJoin("pessoa as c","b.CodPessoa", "c.CodPessoa")
      .innerJoin("localacesso as d","a.CodLocalAcesso", "d.CodLocalAcesso")
      .where("b.DataHora",">", dataInicio)
      .andWhere("b.DataHora","<", dataFim)

      pessoas.pessoav.split(',').forEach(prop => {
        Query.andWhere("b.CodPessoa","=",prop)
      });
    
      codLocaisAcesso.split(',').forEach(prop => {
        Query.andWhere("d.CodlocalAcesso","=",prop)
      });

      body = await Query.orderBy('b.DataHora','asc');
      var keyEntrada;
      var keySaida;
      body.categoria.dados.forEach(prop, key => {
        if(retorno[LocalAcesso] == undefined){
          retorno[LocalAcesso] = {
            pessoa: prop.Pessoa,
            data: moment(prop.DataHora, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD"),
            localAcesso: prop.NomeLocal
          }
                    
          if(prop.direcao === 1){
            keyEntrada[LocalAcesso] = 1;
            retorno[LocalAcesso].entrada1 = moment(prop.DataHora, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss")
          }            
          else if(prop.direcao === 2){
            keySaida[LocalAcesso] = 1;
            retorno[LocalAcesso].saida1 = moment(prop.DataHora, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss")
          }
        }    
        else{
          key[LocalAcesso]++;
          var data = moment(prop.DataHora, "YYYY-MM-DD hh:mm:ss").format("hh:mm:ss");

          if(prop.direcao === 1){
            keyEntrada[LocalAcesso]++;
            if(keyEntrada[LocalAcesso] === 2)
              retorno[LocalAcesso].entrada2 = data;
            if(keyEntrada[LocalAcesso] === 3)
              retorno[LocalAcesso].entrada3 = data;
            if(keyEntrada[LocalAcesso] === 4)
              retorno[LocalAcesso].entrada4 = data;              
            if(keyEntrada[LocalAcesso] === 5)
              retorno[LocalAcesso].entrada5 = data;
          }            
          else if(prop.direcao === 2){
            keySaida[LocalAcesso]++;
            if(keySaida[LocalAcesso] === 2)
              retorno[LocalAcesso].entrada2 = data;
            if(keySaida[LocalAcesso] === 3)
              retorno[LocalAcesso].entrada3 = data;
            if(keySaida[LocalAcesso] === 4)
              retorno[LocalAcesso].entrada4 = data;              
            if(keySaida[LocalAcesso] === 5)
              retorno[LocalAcesso].entrada5 = data;
          }

        }   
      });

      var reposta ={
        retorno: true,
        mensagem: "ok",
        Categoria:{
          count:body.length,                                       
          dados: body
        }                            
      }
      
      return JSON.stringify(reposta);
    }
  }
  //-----------------------------------Fim Tempo Permanencia ---------------
  async PessoaseUltimosAcessos({request}){
      var data = await request.raw();
      data = JSON.parse(data);
      try{
          var acessos1=[];
          const {autorizado, visitantes, qualquerData, posicao, usoCartao,
                localAcesso, dataInicio, pessoas, secaov, lotacaov, empresav } = data;
          var PermissaoGerenciaAcesso = await Database.table('PermissaoGerenciaAcesso as  P')
                                        .select('P.CodLocalAcesso')
                                        .innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario')
                                        .where('Dwsession.Token',data["token"]);
          if(PermissaoGerenciaAcesso.length > 0){
              var LocaisAcesso = await LocalAcesso.permitidoIds(PermissaoGerenciaAcesso);
              var coletores = Database.table('Coletor as c').select('c.CodColetor').whereIn('c.CodLocalAcesso', LocaisAcesso);
              var consulta = Database.table('Acesso as a')
                            .innerJoin('Pessoa as p', 'p.CodPessoa', 'a.CodPessoa')
                            .innerJoin('Autorizado as au', 'au.CodPessoa', 'a.CodPessoa')
                            .innerJoin('Coletor as c', 'c.CodColetor', 'a.CodColetor');
              if (usoCartao === 2){
                  consulta.innerJoin('AcessoIdentificador as ai', 'ai.CodAcesso', 'a.CodAcesso');
              }
              else if (usoCartao === 3){
                  consulta.leftOuterJoin('AcessoIdentificador as ai', 'ai.CodAcesso', 'a.CodAcesso');
              }
              else if (usoCartao === 1){
                  consulta.leftJoin('AcessoIdentificador as ai', 'ai.CodAcesso', 'a.CodAcesso');
              }
              consulta.groupBy('a.CodPessoa');
              if (posicao === 1){
                consulta.havingNotNull('in')
                  .havingNull('out')
                  .orHaving('in', '>', Database.raw('out'));
              }
              else if (posicao === 2){
                consulta.havingNotNull('out')
                  .havingNull('in')
                  .orHaving('out', '>', Database.raw('in'));
              }
              else if (posicao === 2){
                consulta.having((builder) =>{
                  builder.havingNotNull('out')
                  .havingNotNull('in')
                })
              }
              var coluna = await Database.table('acessos').columnInfo('Acesso');
              var queryOut = Database.table('Acesso as a2').max('a2.DataHora').where('a2.Direcao', '=', '2').where({'a2.CodPessoa':Database.raw(`a.CodPessoa`)});
              var queryIn = Database.table('Acesso as a2').max('a2.DataHora').where('a2.Direcao', '=', '1').where({'a2.CodPessoa':Database.raw(`a.CodPessoa`)});
              var queryOutCol = Database.table('Acesso as a2').max('a2.CodColetor').where('a2.Direcao', '=', '2').where({'a2.CodPessoa':Database.raw(`a.CodPessoa`)}).orderBy('a2.DataHora','desc');
              var queryInCol = Database.table('Acesso as a2').max('a2.CodColetor').where('a2.Direcao', '=', '1').where({'a2.CodPessoa':Database.raw(`a.CodPessoa`)}).orderBy('a2.DataHora','desc');
              consulta.select({'codAcesso': 'a.CodAcesso'},
                                                  {'codPessoa': 'p.CodPessoa'},
                                                  {'name': 'p.Nome'},
                                                  {'out': queryOut},
                                                  {'in': queryIn}, 
                                                  {'outC':queryOutCol}, 
                                                  {'inC': queryInCol});
              consulta.whereIn('a.CodColetor', coletores);
              var tipoAutorizado = [];
              if (autorizado)
                  tipoAutorizado.push(1,6)
              if(visitantes)
                  tipoAutorizado.push(2,3)
              consulta.whereIn('au.TipoAutorizacao', tipoAutorizado);
              if (!qualquerData){
                  var dataI = moment(dataInicio, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
                  consulta.where('a.DataHora', '>', dataI);
              }
              var acessos = await consulta;
              var whereLocais;
              //return LocaisAcesso;
              if (localAcesso == 0){
                  whereLocais = ' where a.CODCOLETOR in (select CODCOLETOR from Coletor where CodLocalAcesso in ('+ LocaisAcesso +')) '
              } 
              else if(LocaisAcesso.indexOf(localAcesso)!==-1){
                  whereLocais = ' where a.CODCOLETOR in (select CODCOLETOR from Coletor where CodLocalAcesso in ('+ localAcesso +')) ' 
              }

              var whereData;
              var JoinC;
              var whereAutorizado = whereLocais
              if (qualquerData)
                  whereData = ' and Datahora > 0'
              else  
                  whereData =" and DataHora > '"+ dataInicio +"'";
              if (usoCartao=== 2)
                  JoinC = ' inner join AcessoIdentificador ai on ai.CODACESSO = a.CODACESSO'
              else if (usoCartao ===3) 
                  JoinC = ' left join  AcessoIdentificador ai on ai.CODACESSO <> a.CODACESSO'  
              else if (usoCartao === 1) 
                  JoinC = ' left join AcessoIdentificador ai on ai.CODACESSO = a.CODACESSO' 
  
              var innneJoin = ' inner join Autorizado au on au.CODPESSOA = a.CODPESSOA' 
              whereAutorizado = whereAutorizado+'and au.TipoAutorizacao in ('+tipoAutorizado+')'  
              // var acessos =  await Database.from('Acesso as a').select('a.CODPESSOA as CodPessoa','MAX(p.NOME) as Nome',
              // '( select max(DataHora) from Acesso ac where ac.DIRECAO = 2 and ac.CODPESSOA= a.CODPESSOA) as Saida',
              // '( select max(ac.CODCOLETOR) from Acesso ac where ac.DIRECAO =2 and ac.CODPESSOA= a.CODPESSOA) as ColetorS',
              // '( select max(DataHora)  from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as Entrada',
              // ' ( select max(ac.CODCOLETOR) from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as ColetorE'
              // )
              // .innerJoin(' Pessoa as p', 'p.CODPESSOA','a.CODPESSOA ').groupBy('a.CODPESSOA')
              var selectS=('SELECT  a.CODPESSOA as cod,MAX(p.NOME) as name,( select max(DataHora)  from Acesso ac where ac.DIRECAO =2 and ac.CODPESSOA= a.CODPESSOA) as "out" ,( select max(ac.CODCOLETOR)  from Acesso ac where ac.DIRECAO =2 and ac.CODPESSOA= a.CODPESSOA) as "outC" ,  ( select max(DataHora)  from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as "in" , ( select max(ac.CODCOLETOR)  from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as "inC"')
              var fromS = ' from ACESSO a'
              var inneJoinS= ' inner join Pessoa p on p.CODPESSOA = a.CODPESSOA '+innneJoin+ JoinC;
              var whereS = whereAutorizado +whereData; 

              var groupbyS =' group by a.CODPESSOA'
              //var consulta = '';
              //consulta=consulta+ selectS+fromS+inneJoinS+whereS+groupbyS
              //var acessos =  await Database.raw(consulta)
              //var acessos =  await Database.raw('SELECT  a.CODPESSOA as CodPessoa,MAX(p.NOME) as Nome,( select max(DataHora)  from Acesso ac where ac.DIRECAO =2 and ac.CODPESSOA= a.CODPESSOA) as "Saida" ,( select max(ac.CODCOLETOR)  from Acesso ac where ac.DIRECAO =2 and ac.CODPESSOA= a.CODPESSOA) as "ColetorS" ,  ( select max(DataHora)  from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as "Entrada" , ( select max(ac.CODCOLETOR)  from Acesso ac where ac.DIRECAO = 1 and ac.CODPESSOA=a.CODPESSOA)  as "ColetorE"  from ACESSO a  inner join Pessoa p on p.CODPESSOA = a.CODPESSOA '+innneJoin+ whereAutorizado +'group by a.CODPESSOA')
              //  return acessos
              // if(posicao ===1){
              //     acessos[0].forEach (prop =>{
              //         if ((prop.in > prop.out) )  
              //         acessos1.push(prop);
              //     })
              //     //   return acessos1
              // }
              // else if(posicao ===2){
              //     acessos[0].forEach (prop =>{
              //         if ((prop.out > prop.in))
              //         acessos1.push(prop);
              //     })
              //     //    return acessos1
              // }
              // else if(posicao ===3 ||posicao ===4   ){
              //     acessos[0].forEach (prop =>{
              //         if (prop.out !== null || prop.in !== null){
              //             acessos1.push(prop);
              //         }

              //     })
              //     //   return acessos1
              // }
              var resposta={
                  dados: acessos,
                  count: acessos.length,
                  retorno: true,
                  msq:"ok"
              }
              return JSON.stringify(resposta)
          }
          else {    
              var resposta={
                  dados: {},
                  count: 0,
                  retorno: true,
                  msq:"ok"
              }
              return JSON.stringify(resposta)
          }
      }
      catch (error){
          return(JSON.stringify({
              erro: error,
              retorno: false
          }))
      }
  } 

  async AcessosPorPessoa({request}){
    var data = await request.raw();
    data = JSON.parse(data)
  
    const {dataInicio, dataFim, soVisitantes, soPermanentes, nome,
      codigo, token} = data;

    var QueryAcesso =   Acesso.query().innerJoin('Autorizado','Autorizado.CODPESSOA','Acesso.CODPESSOA').whereBetween('Datahora',[dataInicio,dataFim]).alias()

      if (codigo > 0)
          QueryAcesso.where('Autorizado.CODPESSOA',codigo)
      if (soVisitantes)
        QueryAcesso.andWhere('Autorizado.TipoAutorizacao','in' [2,3])
      else if (soPermanentes)   QueryAcesso.where('Autorizado.TipoAutorizacao','in' [1,6])

      const acessos=await QueryAcesso.fetch();

      var resposta={
        dados: acessos,
        count: acessos.length,
        retorno: true,
        msq:"ok"
       }
       return JSON.stringify(resposta)
  
   }

   async AcessosPorColetor({request}){
      var data = await request.raw();
      data = JSON.parse(data);
      try{
          if (!await DwSession.validarToken(data["token"]))
            throw "invalid token";
          var tabela = Database.table('Acesso as a')
              .innerJoin('Pessoa as p' , 'a.CODPESSOA', 'p.CODPESSOA')
              .innerJoin('Autorizado as au', 'au.CODPESSOA', 'a.CODPESSOA')
              .innerJoin('Coletor as c', 'c.CodColetor', 'a.CodColetor')
              .innerJoin('LocalAcesso as l', 'l.codLocalAcesso', 'c.codLocalAcesso');
          var busca = tabela.select('p.NOME as pessoa', 'p.codPessoa', 'c.Nome as coletor', 'a.DataHora', 'a.Direcao', 'a.CodAcesso', 'l.nome as localAcesso', 'c.numero as numColetor');
          if (data.dataInicio !== null){
            var dataI = moment(data.dataInicio, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
            busca.where('a.DataHora', '>', dataI);
          }
          if (data.dataFim !== null){
            var dataF = moment(data.dataFim, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
            busca.where('a.DataHora', '<', dataF);
          }
          var nome = data.nome+"%";
          // if (data.qualquerparte)
          //     nome = "%"+nome;
          // busca.where('p.NOME', 'like', nome);
          if (!data.incluirDesativados){
              busca.where('au.TIPOAUTORIZACAO', '<>', '4');
          }
          if (!data.incluirVisitantes){
              busca.where('au.TIPOAUTORIZACAO', '<>', '3');
          }
          if (Boolean(data.categoria) && data.categoria !== 'all'){
              busca.whereIn('au.CODCATEGORIAPESSOA', data.categorias);
          }
          // if (data.codsecao !== 0 && data.codsecao !== ''){
          //     busca.where('au.CODSECAO', '=', data.secao);
          // }
          // else{
          //   if (data.codlotacao !== 0 && data.codlotacao !== ''){
          //       var aux = Database.select('CODSECAO').from('Secao').where('CODLOTACAO', '=', String(data.codlotacao));
          //       busca.whereIn('au.CODSECAO', aux);
          //   }
          //   else{
          //       if (data.codempresa !== 0 && data.codempresa !== ''){
          //           var queryEmpresa = Database.select('CODLOTACAO').from('Lotacao').where('CODEMPRESA', '=', String(data.codempresa));
          //           var queryLotacao = Database.select('CODSECAO').from('Secao').whereIn('CODLOTACAO', queryEmpresa);
          //           busca.whereIn('au.CODSECAO', queryLotacao);
          //           var a = 1;
          //       }
          //   }
          // }
          if (Boolean(data.locaisAcesso)){
            var queryLocalAcesso = Database.select('CodColetor').from('Coletor').whereIn('CodLocalAcesso', data.locaisAcesso.split(','))
            busca.whereIn('au.CodColetor', queryLocalAcesso);
          }
          busca.orderBy('l.codLocalAcesso', 'desc');
          busca.orderBy('c.codColetor', 'desc');
          busca.orderBy('p.codPessoa', 'desc');
          busca.orderBy('a.DataHora', 'desc');
          var tabela = await busca;
          var count = tabela.length;
          return({
              count:count,
              retorno: true,
              mensagem: "ok",
              dados:tabela           
          })
      }
      catch(error){
          return(JSON.stringify({
              erro: error,
              retorno: false
          }))
      }
   }

   async TotalHorasAmbiente({request}){
    var data = await request.raw();
    data = JSON.parse(data);
    try{
        if (!await DwSession.validarToken(data["token"]))
          throw "invalid token";
        var tabela = Database.table('Acesso as a')
            .innerJoin('Pessoa as p' , 'a.CODPESSOA', 'p.CODPESSOA')
            .innerJoin('Autorizado as au', 'au.CODPESSOA', 'a.CODPESSOA')
            .innerJoin('Coletor as c', 'c.CodColetor', 'a.CodColetor')
            .innerJoin('LocalAcesso as l', 'l.codLocalAcesso', 'c.codLocalAcesso');
        var busca = tabela.select('p.NOME as pessoa', 'p.codPessoa', 'c.Nome as coletor', 'a.DataHora', 'a.Direcao', 'a.CodAcesso', 'l.nome as localAcesso', 'c.numero as numColetor');
        var autorizados = geral.consultaPessoasParaArvore(data.pessoas);
        busca.where((builder) =>{
          return(builder.whereNotNull('l.CodAmbienteInterno')
          .orWhereNotNull('l.CodAmbienteExterno'))
        })
        busca.whereIn('a.CodPessoa', autorizados);
        if (data.dataInicio !== null){
          var dataI = moment(data.dataInicio, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
          busca.where('a.DataHora', '>', dataI);
        }
        if (data.dataFim !== null){
          var dataF = moment(data.dataFim, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
          busca.where('a.DataHora', '<', dataF);
        }
        var tipoAutorizado = [];
        if (autorizado)
            tipoAutorizado.push(1,6)
        if(visitantes)
            tipoAutorizado.push(2,3)
        consulta.whereIn('a.TipoAutorizacao', tipoAutorizado);
        // if (data.codsecao !== 0 && data.codsecao !== ''){
        //     busca.where('au.CODSECAO', '=', data.secao);
        // }
        // else{
        //   if (data.codlotacao !== 0 && data.codlotacao !== ''){
        //       var aux = Database.select('CODSECAO').from('Secao').where('CODLOTACAO', '=', String(data.codlotacao));
        //       busca.whereIn('au.CODSECAO', aux);
        //   }
        //   else{
        //       if (data.codempresa !== 0 && data.codempresa !== ''){
        //           var queryEmpresa = Database.select('CODLOTACAO').from('Lotacao').where('CODEMPRESA', '=', String(data.codempresa));
        //           var queryLotacao = Database.select('CODSECAO').from('Secao').whereIn('CODLOTACAO', queryEmpresa);
        //           busca.whereIn('au.CODSECAO', queryLotacao);
        //           var a = 1;
        //       }
        //   }
        // }
        if (Boolean(data.locaisAcesso)){
          var queryLocalAcesso = Database.select('CodColetor').from('Coletor').whereIn('CodLocalAcesso', data.locaisAcesso.split(','))
          busca.whereIn('au.CodColetor', queryLocalAcesso);
        }
        busca.orderBy('l.codLocalAcesso', 'desc');
        busca.orderBy('c.codColetor', 'desc');
        busca.orderBy('p.codPessoa', 'desc');
        busca.orderBy('a.DataHora', 'desc');
        var tabela = await busca;
        var count = tabela.length;
        return({
            count:count,
            retorno: true,
            mensagem: "ok",
            dados:tabela           
        })
    }
    catch(error){
        return(JSON.stringify({
            erro: error,
            retorno: false
        }))
    }
   }

    async RelatorioPortarias({request}){
      var data = await request.raw();
      data = JSON.parse(data);
      var filtro = data.filtro;
      var reposta;

      try{
        if (!await DwSession.validarToken(data["token"])){
          if(filtro.DataFinal === null) filtro.DataFinal = moment().format("YYYY-MM-DD hh:mm:ss")
          if(filtro.DataInicial === null) filtro.DataInicial = moment().subtract(4, 'months').format("YYYY-MM-DD 00:00:00")
          var Query= Acesso.Acessos()
            .where('1','=','1')
          
            .fetch()
        }else{
          reposta ={
            error: 1,             
            retorno: false,
            mensagem: "Invalid Token",
          } 
        }
      }
      catch(error){
        reposta ={
          erro: error.message,
          retorno: false
        }         
      }
      
      return(JSON.stringify(resposta))
    }
}
module.exports = RelatorioController
