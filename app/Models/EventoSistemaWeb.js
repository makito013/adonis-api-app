'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
// const TTipoEventoSistema = (
//     EVSIS_InicioSistema = 1,
//     EVSIS_SaidaSistema = 2,
//     EVSIS_Exclusao=3,
//     EVSIS_ConcederAutorizacao=4,
//     EVSIS_RevogarAutorizacao=5,
//     EVSIS_IncluirDados=6,
//     EVSIS_AlterarDados=7, 
//     EVSIS_AberturaAcesso=8,
//     EVSIS_FechamentoAcesso=9,
//     EVSIS_DigitalMestre=10,
//     EVSIS_CadastroImpressaoDigital=11,
//     EVSIS_ImprimiuMostraEspelho=12,
//     EVSIS_ExclusaoImpressaoDigital=13,
//     EVSIS_GravacaoCartao=14,
//     EVSIS_AlterouDataHora=15,
//     EVSIS_EfetivarEscala=16,
//     EVSIS_AcionamentoManual=17,
//     EVSIS_GerouRelatorio= 18,
//     EVSIS_AlterouJornadaColetiva= 19)

class EventoSistemaWeb extends Model {

    static get table () {
        return 'EventoSistemaWeb'
    }
    
    static get createdAtColumn () {
        return 'DataHoraEvento'
    }
    static get primaryKey () {    
        return 'CodEventoSistemaWeb'
    }
    static get updatedAtColumn () {
        return null
    }
}

module.exports = EventoSistemaWeb

// Conteudo='S="DokeoWeb 4.0.0";U="Asolivs";T="CategoriaPessoa"', //S=Sistema U= Usuario T=Tabela
// DataHoraEvento: new Date(),
// DataReferenciaInicio: new Date(),
// DataReferenciaFim: new Date(),
// CodigoObjeto:user[0].CODPESSOA,
// CodUsuario:user[0].CODPESSOA,
// TipoEvento:6 //Ver enum eventosistema