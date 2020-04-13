'use strict'

const Database = use('Database')
const Logger = use('Logger')
Logger.level = 'debug'

class PessoaController {
    async Criar ( { request } ){
        var data = await request.raw();
        data = JSON.parse(data)
        return await  Database.table('Pessoa').select("Nome","CPF")

    }
    async List ( { request } ){
        var data = await request.raw();
        data = JSON.parse(data)
        var nome = "%"+data.nome;
        if (data.qualquerparte)
            nome = nome+"%"
         
        return await  Database.table('Pessoa').select("Nome","CPF").where('Nome','like',nome)

    }
    async Delete ( { request } ){
        var data = await request.raw();
        data = JSON.parse(data)

        
    }
}

module.exports = PessoaController
