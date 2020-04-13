'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const EventoSistemaWeb = use('App/Models/EventoSistemaWeb')
const DwSession = use('App/Models/DwSession')
const PermissaoMaquina = use('App/Models/PermissaoMaquina')
const moment = require("moment");
var geral = require('./Geral.js');
var numSeqLogin = new geral.numeroSequecial('dwsession', 'CodDWSession');
var numSeqConfFlex = new geral.numeroSequecial('configuracaoflexivel', 'CodConfiguracaoFlexivel');

class DwSessionController {
    constructor(){
      this.vetor =['0','1','2','3','4','5','6','7','8','9' , 'A','B','C','D','E','F', 'a','b','c','d','e','f'];
    }
    async create ({ request, auth }) { 
      var data = await request.raw();
      data = JSON.parse(data)
      const  nomeusuario= data.user;
      const senha = data.password
      var user = await Database.table('Usuario').select('*').where('nomeusuario','=',nomeusuario).limit(1);
      var token ='';
      var msg ='';
      var retorno = false;
      var permissoes = {}
      if (user[0]){
        var senhanormal =user[0].SENHA;
        if (senha=== this.Desencriptar(senhanormal)){
          token= this.gerarToken(user[0])
          retorno = true;
          msg = 'login ok';
          
         var Permissaogerenciaacesso =await Database.table('Permissaogerenciaacesso').select('*').where('CodUsuario','=',user[0].CODPESSOA);
         var  Permissaogerencia = await Database.table('Permissaogerencia').select('CodEmpresa','CodLotacao','CodSecao').where('CodUsuario','=',user[0].CODPESSOA);
         var Perfil = await Database.table('Perfil').select('CodPerfil','Nome','TodasPermissoes')
         // var locaisPermitidos=[];

          permissoes = {
            permissaogerenciaacesso :Permissaogerenciaacesso,
            permissaogerenciaacessoall: Permissaogerenciaacesso.count == 1 && Permissaogerenciaacesso.CodLocalAcesso == null,
            Permissaogerencia:Permissaogerencia,
            Permissaogerenciaall: Permissaogerencia.CodEmpresa == null && Permissaogerencia.CodLotacao == null && Permissaogerencia.CodSecao == null
            
          }
          var querylocais = Database.table('LocalAcesso').select('CodLocalAcesso','Nome')
          if(!permissoes.permissaogerenciaacessoall)
          {
            //  var locais = permissoes.permissaogerenciaacesso.map(prop =>{
            //     return prop.CodLocalAcesso;
            //   })
            querylocais.where('CodLocalAcesso','in',Database.table('Permissaogerenciaacesso').select('CodLocalAcesso').where('CodUsuario','=',user[0].CODPESSOA))
          }
          permissoes["locaisPermitidos"] = await querylocais;

          var numerosequecial = await Database.table('cm_numsequencial').select('Nr_Atual').where('No_Campo','Like','DWSession')

          
        await DwSession.query().where('CodUsuario', user[0].CODPESSOA).delete()
        var ExpiryDate= moment().add(1,"days").format("YYYY-MM-DD hh:mm:ss")
        var DwSession1  = await  DwSession.create(
          {'Token' : token, 'CodUsuario':user[0].CODPESSOA,'ExpiryDate':ExpiryDate, "codDwSession": numerosequecial[0].Nr_Atual}
          )

        var affectedRows = await Database.table('cm_numsequencial')
        .where('No_Campo','DWSession').update('Nr_Atual',numerosequecial[0].Nr_Atual+1);                          
        if (Boolean(DwSession1)){
            // const tokenID = await Database
            // .table('DWSession')
            // .insert({'CodDWSession':numerosequecial[0].Nr_Atual+1,'Token' : token, 'CodUsuario':user[0].CODPESSOA, 'CreationDate': new Date(),'ExpiryDate': new Date()})
            const EventoSistemaWebData={
              Conteudo:'S=DokeoWeb 4.0.0;U="'+user[0].NOMEUSUARIO+'"',
              DataHoraEvento: new Date(),
              DataReferenciaInicio: new Date(),
              DataReferenciaFim: new Date(),
              CodigoObjeto:user[0].CODPESSOA,
              CodUsuario:user[0].CODPESSOA,
              TipoEvento:1
            }
            EventoSistemaWeb.create(EventoSistemaWebData);
          }
        }
        else  msg ="01"// 'Usuário ou senha inválida';
      }
      else  msg = "01"//'Usuário ou senha inválida';
      var reposta ={     
        count:1,
        retorno: retorno,
        mensagem: msg,
        token:token,
        permissoes : permissoes,
        //  categoria: await  Database.table('CategoriaPessoa').select('CodCategoriaPessoa','Nome','CodCategoriaSuperior')
        //user:user[0]
      }
      return JSON.stringify(reposta);

      }


  /////////////////// LOGIN PORTARIA //////////////////////////////    
  async loginPortaria ({ request, auth }) {
    var data = await request.raw();
    data = JSON.parse(data);
    const  nomeusuario= data.user;    
    var user = await Database.table('Usuario').select('SENHA', 'u.TODASPERMISSOES', 'CODPESSOA', 'NOMEUSUARIO', 'ATIVO').where('nomeusuario','=',nomeusuario).leftJoin('perfil as u', 'u.codperfil', 'usuario.codperfil').limit(1);        
    var maquinaId = await Database.table('configuracaoflexivel').select('*').where('NomeItem','Like',data.id).limit(1);
    var senhanormal =user[0].SENHA;
    var resposta ={retorno: null, mensagem: null}
    var token = this.gerarToken(user[0]);
    if (user[0]){
      if(maquinaId[0]){
        if (data.password === this.Desencriptar(senhanormal)){
          try{
            var codLogin = await numSeqLogin.consulta();          
            var ExpiryDate= moment().add(1,"days").format("YYYY-MM-DD hh:mm:ss");
            await DwSession.query().where('CodUsuario', user[0].CODPESSOA).delete()      
            await  DwSession.create({
              'Token' : token, 
              'CodUsuario':user[0].CODPESSOA,
              'ExpiryDate':ExpiryDate, 
              "codDwSession": codLogin
            })
            await numSeqLogin.atualiza();

            const EventoSistemaWebData={
              Conteudo:'S=DokeoPortaria 4.0.0;U="'+user[0].NOMEUSUARIO+'"',
              DataHoraEvento: new Date(),
              DataReferenciaInicio: new Date(),
              DataReferenciaFim: new Date(),
              CodigoObjeto:user[0].CODPESSOA,
              CodUsuario:user[0].CODPESSOA,
              TipoEvento:1
            }
            EventoSistemaWeb.create(EventoSistemaWebData);

            resposta.mensagem = "Login OK";
            resposta.retorno = true;
            resposta.token= token;
          }
          catch(erro){
            resposta.mensagem = erro.message;
            resposta.retorno = false;
            resposta.error = 2;
          }
          
        }
        else{
          resposta.mensagem = "Usuario ou Senha inválido";
          resposta.error = 1;
          resposta.retorno = false;
        }      
      }
      else{
        if(user[0].TODASPERMISSOES === 1 && geral.notNull(data.id)){
          if(data.locaisAcesso === undefined){
            var LocaisAcesso= await Database
              .table('LocalAcesso')
              .select('CodLocalAcesso', 'Nome')
              .orderBy('Nome','asc');          

            resposta.mensagem = "Cadastrar Máquina";
            resposta.codigo = 1
            resposta.dados = LocaisAcesso;
            resposta.retorno = true;
          }
          else{
            var codMaquina = await numSeqConfFlex.consulta(); 
            await Database.table('configuracaoflexivel')
            .insert({
              "CodConfiguracaoflexivel" : codMaquina,
              "Escopo" : 2,
              "NomeItem" : data.id,
              "Apelido" : data.nome
            })
            await numSeqConfFlex.atualiza(); 
            
            var arrayLocais = data.locaisAcesso.map((prop,key) => {             
              return({
                "CodMaquina":codMaquina,
                "CodLocalAcesso":prop, 
                "DataPermissao":new Date()
              })
            })
            
            var permissoes = await PermissaoMaquina
            .createMany(arrayLocais)

            const EventoSistemaWebData = permissoes.map(prop => {
              return ({
                Conteudo:'S=DokeoWeb 4.0.0;U="'+user[0].NOMEUSUARIO+'"',
                DataHoraEvento: new Date(),
                DataReferenciaInicio: new Date(),
                DataReferenciaFim: new Date(),
                CodigoObjeto:user[0].prop,
                CodUsuario:user[0].CODPESSOA,
                TipoEvento:4
              })
            })
            
            EventoSistemaWeb.createMany(EventoSistemaWebData);

            resposta.mensagem = "Success";
            resposta.retorno = true;
          }
        }
        else{
          resposta.mensagem = "Usuário sem permissão para cadastrar máquina";
          resposta.error = 3;
          resposta.retorno = false;
        }
      }
    }
    else{
      resposta.mensagem = "Usuario ou Senha inválido";
      resposta.error = 1;
      resposta.retorno = false;
    }

    return JSON.stringify(resposta);
  }
  /////////////////// FIM LOGIN PORTARIA //////////////////////////////


  EhNumeroHexa(texto)
  {
    return texto.length >= 2 &&  (this.vetor.indexOf(texto[0],0) !== -1) &&   (this.vetor.indexOf(texto[1],0) !== -1)
  }
    
  Desencriptar(textoCifrado){
      var chave ='neok0ro5k3y';
      var vetor = this.vetor;
      var tamanhoChave = chave.length
      var posChave = 0;
      var result = '';
      var   textoHexa =  textoCifrado.substring(0,2);
      if (!this.EhNumeroHexa(textoHexa)){
        return ''
      }
      var offset= parseInt(textoHexa,16);
      var posTextoCifrado = 2;
      while (true)
      {
        textoHexa =   textoCifrado.substring(posTextoCifrado,posTextoCifrado+2);
        if (!this.EhNumeroHexa(textoHexa)){
          return ''
        }
        var codigoTemp = parseInt(textoHexa,16);
        if (posChave < tamanhoChave)
          posChave = posChave + 1
        else
        posChave = 1;
        var a= chave.charCodeAt(posChave-1);
        var codigoCaractereDecifrado = codigoTemp ^ a ;
        if (codigoCaractereDecifrado <= offset)
        codigoCaractereDecifrado = 255 + codigoCaractereDecifrado - offset
        else
          codigoCaractereDecifrado = codigoCaractereDecifrado - offset;
          
        result = result + String.fromCharCode(codigoCaractereDecifrado);  
        offset = codigoTemp;
        posTextoCifrado = posTextoCifrado + 2;

        if(posTextoCifrado >= textoCifrado.length)
          return result;
      }

    }  //alteração no env não foi salva ainda
    gerarToken(user){
      // let header = {
      //   "typ": "JWT",
      //   "alg": "HS256"
      //  }
    
     // header = JSON.stringify(header);
  //    header = Buffer.from(header).toString('base64');

      let payload = {
        iss : 'ipdamaquina',//origem do token
        iat : new Date().toLocaleString(),// timestamp de quando o token foi gerado
        exp : new Date().setMinutes(60).toLocaleString(),// timestamp de quando o token expira
        sub : user.codpessoa
      
      };
      payload = JSON.stringify(payload);
      payload = Buffer.from(payload).toString('base64');
      let signature = Encryption.encrypt(payload)
     // let key = 'neok0ro5k3y';
     // var crypto = new Crypto();
    //  let signature = Encryption.encrypt(header + "." + payload)
          // .update(header + "." + payload)
          // .digest('base64');

     // signature = Buffer.from(signature).toString('base64');

    //  let token = header + "." + payload + "." + signature;
    
    return signature;
    }

}

module.exports = DwSessionController
