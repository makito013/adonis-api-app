'use strict'
const Database = use('Database')
const Autorizado = use('App/Models/Autorizado')
const AutorizadoSecao = use('App/Models/AutorizadoSecao')
const DwSession = use('App/Models/DwSession')

function numeroSequecial(campo, CampoCodigo){
    this.consulta = async function (){     
        var numerosequecial = await Database.table('cm_numsequencial').select('Nr_Atual').where('No_Campo','=',campo)               
        return numerosequecial[0].Nr_Atual + 1;        
    }

    this.atualiza = async function (){
        try{
            var numerosequecial = await Database.from(campo).getMax(CampoCodigo)
            var affectedRows = await Database.table('cm_numsequencial')
            .where('No_Campo',campo).update('Nr_Atual',numerosequecial);   
            return 1  
        }catch(erro){
            return 0;
        }
    }
    
    this.atualizanum = async function (num){
        try{
            var numerosequecial = await Database.from(campo).getMax(CampoCodigo)
            var affectedRows = await Database.table('cm_numsequencial')
            .where('No_Campo',campo).update('Nr_Atual',numerosequecial + num);   
            return 1  
        }catch(erro){
            return 0;
        }
    }
}

function hhmmToMinutes(time){
    var sep = time.split(':');
    return (parseInt(sep[0]) * 60 + parseInt(sep[1]));
}

async function consultaPessoasParaArvore(arvore){
    var empresa = arvore.empresav.split(','), 
        lotacao = arvore.lotacaov.split(','), 
        secao = arvore.secaov.split(','), 
        pessoa = arvore.pessoav.split(',');
    var table = Database.table('Autorizacao as a');
    if (empresa.length() > 0){
        table.innerJoin('Secao as s', 's.CodSecao', 'a.CodSecao')
        .innerJoin('Lotacao as l', 'l.CodLotacao', 's.CodLotacao')
        .innerJoin('Empresa as e', 'e.CodEmpresa', 'l.CodEmpresa');
    }
    else if (lotacao.length() > 0){
        table.innerJoin('Secao as s', 's.CodSecao', 'a.CodSecao')
        .innerJoin('Lotacao as l', 'l.CodLotacao', 's.CodLotacao');
    }
    else if (secao.length() > 0){
        table.innerJoin('Secao as s', 's.CodSecao', 'a.CodSecao')
    }
    table.select('a.CodAutorizado')
    .whereIn('a.CodAutorizado', pessoa)
    .orWhereIn('s.CodSecao', secao)
    .orWhereIn('l.CodLotacao', lotacao)
    .orWhereIn('e.CodEmpresa', empresa);
    return await table;
}

function notNull(valor){
    if(valor === null || valor === "" || valor == undefined)
        return false
    else
        return true  
}
module.exports = {numeroSequecial, hhmmToMinutes, notNull, consultaPessoasParaArvore}