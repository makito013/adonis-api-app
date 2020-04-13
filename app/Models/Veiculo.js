'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Veiculo extends Model {
    static get table(){
        return 'veiculo'
    }

    static get primaryKey (){
        return 'CodVeiculo'
    }

    static get createdAtColumn (){
        return null
    }

    static get updatedAtColumn (){
        return null
    }
     

    static scopeGeral (query){
        return query.select(['CodVeiculo','Placa','Modelo','TextoMarca','TextoCor','TextoCategoria','TipoProprietario',
        'Codproprietario', 'veiculo.Codempresa'])
    }

    locaisAcesso () {
        return this.hasMany('App/Models/permissaoacessoveiculo', 'CodVeiculo', 'CodVeiculo')
        //return this.belongsToMany('App/Models/LocalAcesso', 'CodVeiculo', 'CodLocalAcesso', 'CodVeiculo', 'CODLOCALACESSO').pivotTable('permissaoacessoveiculo').withPivot(['CodPermissaoAcessoVeiculo']);
    }

    motoristas () {
        return this.belongsToMany('App/Models/Pessoa', 'CodVeiculo', 'CodPessoa', 'CodVeiculo', 'CodPessoa').pivotTable('motorista').withPivot(['CodMotorista','PIN']);
        //return this.belongsToMany('App/Models/Horario', 'CODJORNADA', 'CODHORARIO', 'CodJornada','CodHorario').pivotTable('linhajornada').withPivot(['tipoDia','Dia']);
    }

    cartoes () {
        return this.hasMany('App/Models/Identificador', 'CodVeiculo', 'CodVeiculo')
    }
}

module.exports = Veiculo
