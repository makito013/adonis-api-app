'use strict'
const Database = use('Database')
const numSequencial = use('App/Controllers/Http/Geral')
const Jornada = use('App/Models/Horario')
const DwSession = use('App/Models/DwSession')
class HorarioController {

    //----------------------------------- Atualizar / Criar Horario ---------------
    async Salvar ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var body;   
        var Periodos = data.Periodos;
        var Codigo = data.codigo;      
        var NumPeriodos = data.NumPeriodos;
        var toleranciaColetor = "015-015/015-015";
        var userId = 0;
        for(var i= 1; i < NumPeriodos; i++){
            toleranciaColetor += "/015-015/015-015"
        }
 
        try{
            if  ( await DwSession.validarToken(data["token"])){
                //const ID = numSequencial.consulta('Horario')+1;
                const ID = await Database.table('cm_numsequencial').select('Nr_Atual').where('No_Campo','=','Horario')
                
                if(!Boolean(Codigo)) {                
                    userId = await Database.table('horario')
                    .insert({"CodHorario":ID[0].Nr_Atual+1,"Periodos":Periodos, "TolEntrada":15, "TolSaida": 15, "Flagsrefeitorio": 31, "ToleranciasColetor": toleranciaColetor})

                    var affectedRows = await Database.table('cm_numsequencial')
                    .where('No_Campo','Horario').update('Nr_Atual',ID[0].Nr_Atual+1);
                }  
                else{
                    userId = await Database.table('horario')
                    .where("CodHorario", Codigo)
                    .update({"Periodos":Periodos})
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
        var JornadasVinculadas = 0;
    
        try{
            if (await DwSession.validarToken(data["token"])){
                if(Boolean(Codigo)) {  
                    var JornadasVinculadas = Database.table('linhajornada')
                    .select("*")
                    .where("CodHorario","=",Codigo)
                    if(JornadasVinculadas.length > 0){
                        var reposta ={
                            error: 1,
                            msg:"Horarios vinculados a essa jornada!",
                            retorno: false,       
                        }
                    }
                    else{
                        userId = await Database.table('horario')
                        .where("CodHorario", '=', Codigo)
                        .delete()
                    }                    
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
                    msg: "Seccess",  
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


    //----------------------------------- Index ---------------
    async Index ( { request } ) {
        var data = await request.raw();
        data = JSON.parse(data)
        var body;        
        var select=['CodHorario as Codigo', 'Periodos'];

        if (await DwSession.validarToken(data["token"])){       
            var Query = Database.table('horario')
            .select(select)
        
            body   = await Query.orderBy('Codigo','asc');

            var reposta ={
                count:body.length,
                retorno: true,
                mensagem: "ok",
                dados: body            
            }            
        }
        return JSON.stringify(reposta);
    } 
    //-----------------------------------Fim Index ---------------
    
}

module.exports = HorarioController
