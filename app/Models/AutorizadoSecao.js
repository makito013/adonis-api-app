'use strict'

const Model = use('Model')

class AutorizadoSecao extends Model {

    static get table(){
        return 'autorizadosecao'
    }

    static get primaryKey (){
        return 'CodAutorizado'
    }

    static scopeAlias (query){
        return query.select(['CodAutorizado as CodPessoa', 'CodSecao'])
    }
}


module.exports = AutorizadoSecao
