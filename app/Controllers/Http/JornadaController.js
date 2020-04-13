'use strict'
const Database = use('Database')
var geral = require('./Geral.js');
var numSeqLista = new geral.numeroSequecial('linhajornada', 'CodLinhaJornada');
var numSeqJornada = new geral.numeroSequecial('jornada', 'CodJornada');
const Jornada = use('App/Models/Jornada')
const moment = require("moment");
const DwSession = use('App/Models/DwSession')

class JornadaController {
    
    //----------------------------------- Index ---------------
    async Index ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)        
        var body;                

        
        if (await DwSession.validarToken(data["token"])){      
           // const jornadas = await Jornada.query().alias().fetch();             
            const jornadas = await Jornada.query().alias()
            .with('LinhaJornada', (busca) => {busca.select('CodHorario','Periodos')})
            .fetch()                         
        
            const Horarios = await Database
            .table('horario')
            .select('CodHorario', 'Periodos')
            .orderBy('CodHorario','asc');

            var reposta ={
                count:jornadas.length,                
                retorno: true,
                mensagem: "ok",
                dados: jornadas,
                listaHorarios: Horarios                  
            }
            return JSON.stringify(reposta);

        }
    } 
    //-----------------------------------Fim Index ---------------


    //----------------------------------- Atualizar / Criar Horario ---------------
    async Salvar ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)

        var Periodos = data.listadeHorarios;      
        var Codigo = data.codigo;
        
        try{
            if (await DwSession.validarToken(data["token"])){                                                       
                if(!Boolean(Codigo)) {                                
                    var codJornada = await numSeqJornada.consulta();
         
                    await Database.table('jornada')
                        .insert({
                            "CodJornada":codJornada,
                            "Nome":data.nome, 
                            "DataInicio":"2020-03-22 00:00:00", 
                            "TipoEscala": 1, 
                            "Historica": 0, 
                            "CargaHoraria": 0
                        })

                    await numSeqJornada.atualiza();

                    
                    var IdLinha = await numSeqLista.consulta()+1;

                    var LinhasJornada = Periodos.map((prop, key) => {
                        if(prop === 0) Periodos[key] = 1
                        return {
                            "CodLinhaJornada":IdLinha+key,
                            "CodJornada":codJornada === 0 ? 1 : codJornada, 
                            "Dia":key+1, 
                            "TipoDia": prop === 0 ? 5 : 1, 
                            "CodHorario": prop === 0 ? 1 : prop, 
                        }
                    })

                    await Database.table('linhajornada')
                        .insert(LinhasJornada)
                        
                    await numSeqLista.atualiza()                        
                    

                }  
                else{
                    await Database.table('jornada')
                    .where("CodJornada", Codigo)
                    .update({"Nome":data.nome})

                    await Database.table('linhajornada')
                    .where("CodJornada", '=', Codigo)
                    .delete()

                    var IdLinha = await numSeqLista.consulta()+1;

                    var LinhasJornada = {};

                    LinhasJornada = Periodos.map((prop, key) => {                        
                        if(prop != null){
                            return ({
                                "CodLinhaJornada":IdLinha+key,
                                "CodJornada":Codigo, 
                                "Dia":key+1, 
                                "TipoDia": prop == 0 ? 5 : 1, 
                                "CodHorario": prop == 0 ? 1 : prop, 
                            })                       
                        }

                    })

                    await Database.table('linhajornada')
                        .insert(LinhasJornada)
                        
                    await numSeqLista.atualiza()                    
                }

                var reposta ={
                    retorno: true,       
                }
            }
        }
        catch(error){
            var reposta ={
                error: error.message,
                retorno: false,       
            }
        }     
        return JSON.stringify(reposta);           
    } 
    //-----------------------------------Atualizar / Criar Horario ---------------

    //----------------------------------- Excluir Horario -------------------
    async Excluir ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var body;   
        var Codigo = data.codigo;      
        var userId = 0;
    
        try{       
            if (await DwSession.validarToken(data["token"])){  
                
                if(Boolean(Codigo)) {                        
                    userId = await Database.table('linhajornada')
                    .where("CodJornada", '=', Codigo)
                    .delete() 
                    
                    userId = await Database.table('jornada')
                    .where("CodJornada", '=', Codigo)
                    .delete()
                }  
                else{
                    var reposta ={
                        error: 1015,
                        msg: "Codigo 0 não pode ser excluido",
                        retorno: false,       
                    }                        
                }

                var reposta ={
                    retorno: true,       
                }                
            }
        }
        catch(error){
            var reposta ={
                error: error.message,
                retorno: false,       
            }
        }    
        
        return JSON.stringify(reposta);
    } 
    //----------------------------------- Excluir Horario ---------------


    

}

module.exports = JornadaController
