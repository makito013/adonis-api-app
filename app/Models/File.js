'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Env = use('Env')

class File extends Model {
  /**
   * Cria um campo virtual(não existe no BD) com o caminho da imagem
   * Dessa maneira não é necessário montar a url no front, basta retornar o campo virtual
   */
  static get computed () {
    return ['url']
  }

  /**
   * Utiliza o Env APP_URL para montar o campo virtual
   */
  getUrl ({ id }) {
    return `${Env.get('APP_URL')}/files/${id}`
  }
}

module.exports = File