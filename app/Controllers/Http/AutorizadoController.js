'use strict'

const Database = use('Database')
const DwSession = use('App/Models/DwSession')
const Logger = use('Logger')
const EventoSistemaWeb = use('App/Models/EventoSistemaWeb')
var geral = require('./Geral.js');
const Secao = use('App/Models/Secao')
var numSeq = new geral.numeroSequecial('autorizado', 'CodPessoa');
var numSeq2 = new geral.numeroSequecial('PermissaoAcessoLocal', 'CodPermissaoAcessoLocal');
Logger.level = 'debug'

class AutorizadoController {
    async Salvar ( { request } ){
        try{
            var data = await request.raw();
            data = JSON.parse(data)
            if (!await DwSession.validarToken(data["token"]))
                throw "invalid token";
            if (data.codpessoa !== 0){
                var tabela1 = Database.table('Pessoa').where('codpessoa', '=', data.codpessoa);
                await tabela1.update({
                    'nome': data.nome,
                    'sexo': data.sexo,
                    'cpf': data.cpf,
                    'numeroCNH': data.numerocnh,
                    'dataValidadeCNH': data.validadecnh,
                    'dataNascimento': data.datanascimento,
                    'nomeMae': data.mae,
                    'telefone': data.telefone,
                    'email': data.email,
                    'endereco': data.endereco,
                    'observacao': data.observacao,
                    'senhaacesso': data.senha,
                    'autorizaSMS': data.autorizasms,
                    'naoUsaBiometria': data.naobriometrico,
                    'disponivelOffLine': data.disponiveloffline,
                    'semLimiteAcessosDia': data.ignorarlimitedeacessos,
                    'semVerificacaoTempoAcesso': data.ignoratempominimoentreacesos,
                    'podeAbrirFecharSistema': data.permiteaberturafechamentodosistema,
                    'personaNonGrata': data.personnongrata,
                    'usaCartaoComSenha': data.validarcartaosenha,
                });
                var tabela2 = Database.table('Autorizado').where('codpessoa', '=', data.codpessoa);
                await tabela2.update({
                    'codCategoriaPessoa': data.codcategoria,
                    'matricula': data.matricula,
                    'PIN': data.pin,
                    'tipoAutorizacao': data.tipoautorizacao,
                    'dataInicioLiberacao': data.inicio,
                    'dataFimLiberacao': data.fim,
                    'codPessoaResponsavel': data.codresponsavel,
                    'codSecao': data.codsecao,
                    //responsaveis: data.this.state.responsaveis,
                    'dataLimiteSecao': data.datalimitesecao,
                    'ehTitular': data.ehtitular,
                    'PermiteAutorizarVisita': data.permiteautorizarvisita,
                    'codJornada': data.codjornada,
                    //listalocais: this.state.valores["locais"],
                    //fotoperfil: "",	
                });
                var tabelaAutLoc = Database.table('PERMISSAOACESSOLOCAL');
                tabelaAutLoc.where('codPessoa', '=', data.codpessoa).delete();
                let tam = Boolean(data.listalocais) ? data.listalocais.length : 0;
                var vetor = [];
                var idInseridos = [];
                var id = await numSeq2.consulta();
                for (var i = 0; i < tam; i++){
                    idInseridos.push(id+i);
                    vetor.push({
                        'codPermissaoAcessoLocal': idInseridos[i],
                        'codPessoa': data.codpessoa,
                        'codLocalAcesso': data.listalocais[i]
                    })
                }
                var result = await tabelaAutLoc.insert(vetor);
                await numSeq2.atualiza();
                //Antes do retorno registra evento
                var EventoSistemaWebData={
                    Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Autorizado"',
                    DataHoraEvento: new Date(),
                    DataReferenciaInicio: new Date(),
                    DataReferenciaFim: new Date(),
                    CodigoObjeto:data.codpessoa,
                    CodUsuario:0,//user[0].CODPESSOA,
                    TipoEvento:7
                    
                }
                EventoSistemaWeb.create(EventoSistemaWebData);
                var EventoSistemaWebData={
                    Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Pessoa"',
                    DataHoraEvento: new Date(),
                    DataReferenciaInicio: new Date(),
                    DataReferenciaFim: new Date(),
                    CodigoObjeto:data.codpessoa,
                    CodUsuario:0,//user[0].CODPESSOA,
                    TipoEvento:7
                    
                }
                EventoSistemaWeb.create(EventoSistemaWebData);
                return({
                    count:result,
                    retorno: true,
                    mensagem: "ok",
                    dados:{}          
                })
            }
            else {
                var numerosequecialP = await numSeq.consulta();
                var tabela1 = Database.table('Pessoa');
                await tabela1.insert({
                    'codpessoa': numerosequecialP,
                    'nome': data.nome,
                    'sexo': data.sexo,
                    'cpf': data.cpf,
                    'numeroCNH': data.numerocnh,
                    'dataValidadeCNH': data.validadecnh,
                    'dataNascimento': data.datanascimento,
                    'nomeMae': data.mae,
                    'telefone': data.telefone,
                    'email': data.email,
                    'endereco': data.endereco,
                    'observacao': data.observacao,
                    'senhaacesso': data.senha,
                    'autorizaSMS': data.autorizasms,
                    'naoUsaBiometria': data.naobriometrico,
                    'disponivelOffLine': data.disponiveloffline,
                    'semLimiteAcessosDia': data.ignorarlimitedeacessos,
                    'semVerificacaoTempoAcesso': data.ignoratempominimoentreacesos,
                    'podeAbrirFecharSistema': data.permiteaberturafechamentodosistema,
                    'personaNonGrata': data.personnongrata,
                    'usaCartaoComSenha': data.validarcartaosenha,
                });
                var tabela2 = Database.table('Autorizado');
                await tabela2.insert({
                    'codPessoa': numerosequecialP,
                    'codCategoriaPessoa': data.codcategoria,
                    'matricula': data.matricula,
                    'PIN': data.pin,
                    'tipoAutorizacao': data.tipoautorizacao,
                    'dataInicioLiberacao': data.inicio,
                    'dataFimLiberacao': data.fim,
                    'codPessoaResponsavel': data.codresponsavel,
                    'codSecao': data.codsecao,
                    //responsaveis: data.this.state.responsaveis,
                    'dataLimiteSecao': data.datalimitesecao,
                    'ehTitular': data.ehtitular,
                    'PermiteAutorizarVisita': data.permiteautorizarvisita,
                    'codJornada': data.codjornada,
                    //listalocais: this.state.valores["locais"],
                    //fotoperfil: "",	
                });
                await numSeq.atualiza();
                var tabelaAutLoc = Database.table('PERMISSAOACESSOLOCAL');
                tabelaAutLoc.where('codPessoa', '=', data.codpessoa).delete();
                let tam = Boolean(data.listalocais) ? data.listalocais.length : 0;
                var vetor = [];
                var idInseridos = [];
                var id = await numSeq2.consulta();
                for (var i = 0; i < tam; i++){
                    idInseridos.push(id+i);
                    vetor.push({
                        'codPermissaoAcessoLocal': idInseridos[i],
                        'codPessoa': data.codpessoa,
                        'codLocalAcesso': data.listalocais[i]
                    })
                }
                var result = await tabelaAutLoc.insert(vetor);
                await numSeq2.atualiza();
                //Antes do retorno registra evento
                var EventoSistemaWebData={
                    Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Autorizado"',
                    DataHoraEvento: new Date(),
                    DataReferenciaInicio: new Date(),
                    DataReferenciaFim: new Date(),
                    CodigoObjeto:data.codpessoa,
                    CodUsuario:0,//user[0].CODPESSOA,
                    TipoEvento:6
                    
                }
                EventoSistemaWeb.create(EventoSistemaWebData);
                var EventoSistemaWebData={
                    Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Pessoa"',
                    DataHoraEvento: new Date(),
                    DataReferenciaInicio: new Date(),
                    DataReferenciaFim: new Date(),
                    CodigoObjeto:data.codpessoa,
                    CodUsuario:0,//user[0].CODPESSOA,
                    TipoEvento:6
                    
                }
                EventoSistemaWeb.create(EventoSistemaWebData);
                return({
                    count:result,
                    retorno: true,
                    mensagem: "ok",
                    dados:{}          
                })
            }
        }
        catch(error){
            return(JSON.stringify({
                mensagem: error,
                retorno: false
            }))
        }
    }

    async Index ( { request } ){
        try{
            var data = await request.raw();
            data = JSON.parse(data)
            if (!await DwSession.validarToken(data["token"]))
                throw "invalid token";
            var permissao = await Database.table('PermissaoGerencia as P')
                .select('P.CODEMPRESA','P.CODLOTACAO','P.CODSECAO')
                .innerJoin('Dwsession','Dwsession.CodUsuario','P.CodUsuario')
                .where('Dwsession.Token',data["token"])
            var bodySecao = await Secao.permitidoIds(permissao)
            var nome = "%"+data.nome;
            if (data.qualquerparte)
                nome = nome+"%";
            var tabela = Database.table('Autorizado as a')
                .innerJoin('Pessoa as p' , 'a.CODPESSOA', 'p.CODPESSOA')
                .leftJoin('Identificador as i', 'i.CODPESSOA', 'a.CODPESSOA');
            var busca = tabela.select('p.CODPESSOA', 'p.NOME', 'a.TIPOAUTORIZACAO', 'a.MATRICULA', 'a.PIN', 'i.TECNOLOGIA', 'i.NUMSERIE', 'i.CONTEUDO');
            busca.whereIn('a.CodSecao', bodySecao);
            busca.where('p.NOME', 'like', nome);
            if (!data.incluirinativos){
                busca.where('a.TIPOAUTORIZACAO', '<>', '4');
            }
            if (!data.incluirresidente){
                busca.where('a.TIPOAUTORIZACAO', '<>', '1');
            }
            if (!data.incluirPreAutorizado){
                busca.where('a.TIPOAUTORIZACAO', '<>', '2');
            }
            if (!data.incluirPrecisaLiberacao){
                busca.where('a.TIPOAUTORIZACAO', '<>', '3');
            }
            if (!data.incluirNaoResidenteAutorizado){
                busca.where('a.TIPOAUTORIZACAO', '<>', '6')
            }
            if (data.categoria !== 'all' && data.categoria !== null){
                busca.whereIn('a.CODCATEGORIAPESSOA', data.categorias);
            }
            if (data.codsecao !== 0 && data.codsecao !== ''){
                busca.where('a.CODSECAO', '=', data.secao);
            }
            else{
                if (data.codlotacao !== 0 && data.codlotacao !== ''){
                    var aux = Database.select('CODSECAO').from('Secao').where('CODLOTACAO', '=', String(data.codlotacao));
                    busca.whereIn('a.CODSECAO', aux);
                }
                else{
                    if (data.codempresa !== 0 && data.codempresa !== ''){
                        var queryEmpresa = Database.select('CODLOTACAO').from('Lotacao').where('CODEMPRESA', '=', String(data.codempresa));
                        var queryLotacao = Database.select('CODSECAO').from('Secao').whereIn('CODLOTACAO', queryEmpresa);
                        busca.whereIn('a.CODSECAO', queryLotacao);
                        var a = 1;
                    }
                }
            }
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
                mensagem: error,
                retorno: false
            }))
        }
    }

    async Consulta({request}){
        try{
            var data = await request.raw();
            data = JSON.parse(data)
            if (!await DwSession.validarToken(data["token"]))
                throw "invalid token";
            var autorizado = Database.table('Autorizado').where('codPessoa', '=', data.codigo);
            var pessoa = Database.table('Pessoa').where('codPessoa', '=', data.codigo);
            var locais = Database.table('PermissaoAcessoLocal').where('codPessoa', '=', data.codigo);
            var tabela = {
                'Pessoa': await pessoa,
                'Autorizado': await autorizado,
                'Locais': await locais
            };
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
                mensagem: error,
                retorno: false
            }))
        }
    }

    async Excluir ( { request } ){
        if (!await DwSession.validarToken(data["token"]))
            throw "invalid token";
        var data = await request.raw();
        data = JSON.parse(data)
        var tabela1 = await Database.table('Pessoa').where('CODPESSOA', '=', data.codpessoa).delete();
        var tabela2 = await Database.table('Autorizado').where('CODPESSOA', '=', data.codpessoa).delete();
        var tabela3 = await Database.table('PermissaoAcessoLocal').where('CODPESSOA', '=', data.codpessoa).delete();
        var EventoSistemaWebData={
            Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Autorizado"',
            DataHoraEvento: new Date(),
            DataReferenciaInicio: new Date(),
            DataReferenciaFim: new Date(),
            CodigoObjeto: data.codpessoa,
            CodUsuario:0,//user[0].CODPESSOA,
            TipoEvento: 3
        }
        EventoSistemaWeb.create(EventoSistemaWebData);
        var EventoSistemaWebData={
            Conteudo:'S="DokeoWeb 4.0.0";U="'+'username'+'"'+ 'T="Pessoa"',
            DataHoraEvento: new Date(),
            DataReferenciaInicio: new Date(),
            DataReferenciaFim: new Date(),
            CodigoObjeto: data.codpessoa,
            CodUsuario:0,//user[0].CODPESSOA,
            TipoEvento: 3
        }
        EventoSistemaWeb.create(EventoSistemaWebData);
        return tabela2 + tabela1;
    }
}

module.exports = AutorizadoController
