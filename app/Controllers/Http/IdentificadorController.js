'use strict'

const DwSession = use('App/Models/DwSession')
const Database = use('Database')
var geral = require('./Geral.js');
var numSeqCartao = new geral.numeroSequecial('identificador', 'CodIdentificador')

class CartoesController {
  async Consulta ( { request } ) {
    var data = await request.raw();
    data = JSON.parse(data)
    var tipo = data.tipo;
    var valor, campoPesquisa;

    if (await DwSession.validarToken(data["token"])){
        // EXEMPLO UNION
        var QueryConsulta = Database.table('identificador as a')
        .select("a.Uso","a.NumSerie24 as NumSerie","a.Tecnologia","a.codIdentificador","a.Conteudo", "b.Nome", "c.Placa", "c.Modelo")
        .leftJoin("pessoa as b", "b.codpessoa", "a.codpessoa")
        .leftJoin("veiculo as c", "c.codveiculo", "a.codveiculo")
        .where(1,"=",1)

        switch (tipo){
            case 1:
                valor = data.conteudo;  
                campoPesquisa = "a.conteudo";                  
            break;

            case 2:
                valor = data.numSerie
                campoPesquisa = "a.numserie24";  
            break;

            case 3:
                valor = parseInt(data.numSeria, 16);
                campoPesquisa = "a.numserie24";
            break;
            ///VERIFICAR COMO FUNCIONA A PARTE DO HEXADECIMAL
        }

        if(data.qualquerParte === true)
            valor += "%"  
            
        QueryConsulta.andWhere(campoPesquisa,"like",valor);
        
        if(data.soDisponiveis == true)
            QueryConsulta.whereNull('a.codPessoa','a.codveiculo')
                    
        var bodyConsulta   = await QueryConsulta.orderBy('NumSerie','asc');  
                
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

    async VerificaCartao (data){
    ////////////////VERIFICAR SE JÀ EXISTE UM CARTÂO IGUAL
        if(data.identificador.codigoIdentificador === 0)
        {
            if(data.identificador.conteudo !== "" || data.identificador.numserie !== "")
            {
                //TECNOLOGIA 1 = MIFARE
                var totalCartoes;
                var cartoes = Database
                .table('identificador')        
                .where(1,'=',1)
                if(data.identificador.conteudo !== "")
                cartoes.andWhere('conteudo','like',data.identificador.conteudo)            
                
                if(data.identificador.numserie !== "")
                cartoes.andWhere('UIDH','like',data.identificador.numserie)       

                totalCartoes = await cartoes.count('CodIdentificador as Count') 

                if(totalCartoes[0].Count > 0){
                return JSON.stringify({
                    error: 1,             
                    retorno: false,
                    mensagem: "Cartão já cadastrado",
                });
                }
                else
                {                            
                    return 1
                }
            }
        }
        else{
            var totalCartoes;
            var cartoes = Database
                .table('identificador')        
                .where(1,'=',1)
            if(conteudo !== "")
                cartoes.andWhere('conteudo','like',data.identificador.conteudo)            

            if(numserie !== "")
                cartoes.andWhere('UIDH','like',data.identificador.numserie)       

            totalCartoes = await cartoes.count('CodIdentificador as Count') 

            if(totalCartoes[0].Count > 0){
                return JSON.stringify({
                error: 1,             
                retorno: false,
                mensagem: "Cartão já cadastrado",
                });
            }
            else
            {                            
                cadastroCartao = 1
            }          
        }        
    } 
}

module.exports = CartoesController
