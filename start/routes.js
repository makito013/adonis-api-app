'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/',({request})=>{
  return 'Ok';
})
//AUTORIZADOS
Route.post('/Autorizado/Index', 'AutorizadoController.Index');
Route.post('/Autorizado/Salvar', 'AutorizadoController.Salvar');
Route.post('/Autorizado/Excluir', 'AutorizadoController.Excluir');
Route.post('/Autorizado/Consulta', 'AutorizadoController.Consulta');

//AUTORIZAÇÃO ACESSO
Route.post('/AutorizacaoAcesso/Autorizar', 'AutorizacaoAcessoController.Autorizar');
Route.post('/AutorizacaoAcesso/Revogar', 'AutorizacaoAcessoController.Revogar');


//Ajustes
Route.post('/Ajustes/AjustesJornada','AlteracaoColetivadeJornadaController.Alterar')
Route.post('/Ajustes/EditarAcessos/SalvaAcessoMan','Ajustes.SalvaAcessoMan')



//LOCALACESSO
Route.post('/LocalAcesso/Index', 'LocalAcessoController.Index');
Route.post('/LocalAcesso/Salvar', 'LocalAcessoController.Salvar');
Route.post('/LocalAcesso/Excluir', 'LocalAcessoController.Excluir');
Route.post('/LocalAcesso/Ambientes/Index', 'AmbientesConectadosController.Index');
Route.post('/LocalAcesso/Ambientes/Salvar', 'AmbientesConectadosController.Salvar');
Route.post('/LocalAcesso/Ambientes/Excluir', 'AmbientesConectadosController.Excluir');

//COLETOR
Route.post('/Coletor/Index', 'ColetorController.Index');
Route.post('/Coletor/Salvar', 'ColetorController.Salvar');
Route.post('/Coletor/Exluir', 'ColetorController.Excluir');
Route.post('/Coletor/Acionamento/Index', 'AcionamentoProgramadoController.Index');
Route.post('/Coletor/Acionamento/Salvar', 'AcionamentoProgramadoController.Salvar');
Route.post('/Coletor/Acionamento/Excluir', 'AcionamentoProgramadoController.Excluir');
//CategoriaPessoa
Route.post('/CategoriaPessoa/Salvar', 'CategoriaPessoaController.Salvar');
Route.post('/CategoriaPessoa/Excluir', 'CategoriaPessoaController.Excluir');
Route.post('/CategoriaPessoa/Index', 'CategoriaPessoaController.Index');


//RELATÓRIOS
Route.post('/Relatorio/HistoricoAcesso', 'RelatorioController.HistoricoAcesso');
Route.post('/Relatorio/DevolucaoCartao', 'RelatorioController.DevolucaoCartao');
Route.post('/Relatorio/AcessosPorSecao', 'RelatorioController.AcessosPorSecao');
Route.post('/Relatorio/AcessosPorLocal', 'RelatorioController.AcessosPorLocal');
Route.post('/Relatorio/TempoPermanencia', 'RelatorioController.TempoPermanencia');
Route.post('/Relatorio/PessoaseUltimosAcessos', 'RelatorioController.PessoaseUltimosAcessos');
Route.post('/Relatorio/AcessosPorPessoa', 'RelatorioController.AcessosPorPessoa');
Route.post('/Relatorio/AcessosPorColetor', 'RelatorioController.AcessosPorColetor');
Route.post('/Relatorio/DevolucaodeCartao', 'RelatorioController.DevolucaoCartao');
//INDEX
Route.post('/Index/TempoPermanencia', 'Index.TempoPermanencia');
Route.post('/Index/PessoaseUltimosAcessos', 'Index.PessoaseUltimosAcessos');
Route.post('Index/AlteracaoColetivadeJornada','Index.AlteracaoColetivadeJornada');
Route.post('Index/EditarRegistros','Index.EditarRegistros');
Route.post('/Index/NomeMaquina', 'Index.NomeMaquina');
Route.post('/Index/AutorizacaoAcesso', 'Index.AutorizacaoAcesso');

//HORARIO
Route.post('/Horario/Salvar', 'HorarioController.Salvar');
Route.post('/Horario/Excluir', 'HorarioController.Excluir');
Route.post('/Horario/Index', 'HorarioController.Index');

//JORNADA
Route.post('/Jornada/Salvar', 'JornadaController.Salvar');
Route.post('/Jornada/Excluir', 'JornadaController.Excluir');
Route.post('/Jornada', 'JornadaController.Index');

//EMPRESA
Route.post('/Empresa/Salvar', 'EmpresaController.Salvar');
Route.post('/Empresa/Excluir', 'EmpresaController.Excluir');
Route.post('/Empresa', 'EmpresaController.Index');

//LOTACAO
Route.post('/Lotacao/Salvar', 'LotacaoController.Salvar');
Route.post('/Lotacao/Excluir', 'LotacaoController.Excluir');
Route.post('/Lotacao', 'LotacaoController.Index');

//SECAO
Route.post('/Secao/Salvar', 'SecaoController.Salvar');
Route.post('/Secao/Excluir', 'SecaoController.Excluir');
Route.post('/Secao', 'SecaoController.Index');

//EmpresaLotacaoSecao
Route.post('/Empresa/All', 'EmpresaLotacaoSecaoController.EmpresaLotacaoSecao');

Route.post('/Empresa/Lista', 'EmpresaLotacaoSecaoController.ListaEmpresaLotacaoSecao');

//GERAL
Route.post('/Geral/GerarArvoredePesquisa', 'GeralController.GerarArvoredePesquisa');
Route.post('/Pessoa/Criar','PessoaController.Criar');
Route.post('/Pessoa/List','PessoaController.List');
Route.post('/Geral/ConsultaPessoa', 'GeralController.ConsultaPessoa');
Route.post('/Geral/ConsultaPessoaP', 'GeralController.ConsultaPessoaP');
Route.post('/Geral/ConsultaAcessoPessoa', 'GeralController.ConsultaAcessoPessoa');

//CARTOÕES
Route.post('/Cartoes/Consulta', 'CartoesController.Consulta')

//VEICULOS
Route.post('/Veiculos/Pesquisa','VeiculoController.Pesquisa');
Route.post('/Veiculos/PesquisaId','VeiculoController.PesquisaId');
Route.post('/Veiculos','VeiculoController.Index');
Route.post('/Veiculos/Salvar','VeiculoController.Salvar');
Route.post('/Veiculos/Excluir','VeiculoController.Excluir');

//LOGIN
Route.post('/Login','DwSessionController.create');
Route.post('/Login/Portaria','DwSessionController.loginPortaria');

//PORTARIA

Route.post('/Portaria/Monitor/ConsultaAcessos','MonitorAcessoController.ConsultaAcessos')
Route.post('/Portaria/Pesquisa/NomeDocPlaca','PesquisaPortariaController.NomeDocPlaca')
Route.post('/Portaria/Pesquisa/Matricula','PesquisaPortariaController.Matricula')
Route.post('/Portaria/Pesquisa/EmpresaLotacaoSecao','PesquisaPortariaController.EmpresaLotacaoSecao')
Route.post('/Portaria/Pesquisa/Crachar','PesquisaPortariaController.Crachar')

Route.get('/PC',({request})=>{
  return request.intended();
});

