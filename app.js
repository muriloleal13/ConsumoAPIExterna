const express = require('express');
const cors = require('cors');
const axios = require('axios');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware para habilitar o CORS
app.use(cors());

// Middleware para parsear JSON no corpo das requisições
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Configuração do Swagger JSDoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Consumo de API',
      version: '1.0.0',
      description: 'Projeto criado para consumir API externa, criar repositórios, envelopes, encaminhar para assinatura e verificar o status dos documentos.',
    },
  },
  apis: ['./*.js'], // Caminho para os arquivos com as anotações Swagger
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Rota para acessar a documentação do Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use((req, res, next) => {
  if (process.env.TOKEN === undefined) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
});

// Rotas para enviar as requisições à API externa
/**
 * @swagger
 * /api/getUserId:
 *   post:
 *     summary: Obtém o ID do usuário
 *     description: Esta rota permite obter o ID do usuário a partir de um token.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de autenticação para acessar a API externa
 *                 example:
 *                   '56ht9p-Li8k5zHaQ2Dzxzijr...'
 *               params:
 *                 type: object
 *                 properties:
 *                 example:
 *                   '{}'
 *     responses:
 *       200:
 *         description: Sucesso na obtenção do ID do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     Usuario:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *     500:
 *       description: Erro ao chamar a API externa
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 */
app.post('/api/getUserId', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/getIdentificador', { token: process.env.TOKEN, params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

app.post('/api/getUserData', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/getDadosUsuario', { token: process.env.TOKEN, params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/fetchAllRepo:
 *   post:
 *     summary: Obter todos os repositórios do usuário
 *     description: Esta rota permite obter todos os repositórios do usuário a partir de um parâmetro.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de autenticação para acessar a API externa
 *                 example:
 *                   '56ht9p-Li8k5zHaQ2Dzxzijr...'
 *               params:
 *                 type: object
 *                 properties:
 *                   idProprietario:
 *                     type: integer
 *                 example:
 *                   idProprietario: 3
 *     responses:
 *       200:
 *         description: Sucesso na obtenção dos repositórios do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                       descricao:
 *                         type: string
 *                       dataCriacao:
 *                         type: string
 *       500:
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/fetchAllRepo', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/getRepositoriosDoUsuario', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/createRepo:
 *   post:
 *     summary: Criar um novo repositório
 *     description: Esta rota permite criar um novo repositório a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   Repositorio:
 *                     type: object
 *                     properties:
 *                       Usuario:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                         example:
 *                           Usuario:
 *                             id: 123
 *                   nome:
 *                     type: string
 *                   compartilharCriacaoDocs:
 *                     type: string
 *                   compartilharVisualizacaoDocs:
 *                     type: string
 *                   ocultarEmailSignatarios:
 *                     type: string
 *                   nomeRemetente:
 *                     type: string
 *                   opcaoValidCodigo:
 *                     type: string
 *                   opcaoValidCertICP:
 *                     type: string
 *                   opcaoValidDocFoto:
 *                     type: string
 *                   opcaoValidDocSelfie:
 *                     type: string
 *                   opcaoValidTokenSMS:
 *                     type: string
 *                   opcaoValidLogin:
 *                     type: string
 *                   opcaoValidReconhecFacial:
 *                     type: string
 *                   opcaoValidPix:
 *                     type: string
 *                   lembrarAssinPendentes:
 *                     type: string
 *                 example:
 *                   Repositorio:
 *                     Usuario:
 *                       id: 123
 *                   nome: Repositório de Teste
 *                   compartilharCriacaoDocs: S
 *                   compartilharVisualizacaoDocs: S
 *                   ocultarEmailSignatarios: N
 *                   nomeRemetente: João
 *                   opcaoValidCodigo: S
 *                   opcaoValidCertICP: S
 *                   opcaoValidDocFoto: S
 *                   opcaoValidDocSelfie: S
 *                   opcaoValidTokenSMS: S
 *                   opcaoValidLogin: S
 *                   opcaoValidReconhecFacial: S
 *                   opcaoValidPix: S
 *                   lembrarAssinPendentes: S
 *     responses:
 *       200:
 *         description: Sucesso na criação do repositório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     idRepositorio:
 *                       type: integer
 *                     statusRepositorio:
 *                       type: string
 *                     msg:
 *                       type: string
 *       500:
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/createRepo', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/inserirRepositorio', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/createEnvelope:
 *   post:
 *     summary: Inserir envelope
 *     description: Esta rota permite inserir um novo envelope a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de autenticação para acessar a API externa
 *               params:
 *                 type: object
 *                 properties:
 *                   Envelope:
 *                     type: object
 *                     properties:
 *                       descricao:
 *                         type: string
 *                         description: Descrição do envelope
 *                       Repositorio:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID do repositório do envelope
 *                       mensagem:
 *                         type: null
 *                         description: Mensagem do envelope (nulo)
 *                       mensagemObservadores:
 *                         type: null
 *                         description: Mensagem para observadores (nulo)
 *                       mensagemNotificacaoSMS:
 *                         type: null
 *                         description: Mensagem de notificação por SMS (nulo)
 *                       dataExpiracao:
 *                         type: null
 *                         description: Data de expiração (nulo)
 *                       horaExpiracao:
 *                         type: null
 *                         description: Hora de expiração (nulo)
 *                       usarOrdem:
 *                         type: string
 *                         description: Indica se o envelope utilizará ordem (S ou N)
 *                       ConfigAuxiliar:
 *                         type: object
 *                         properties:
 *                           documentosComXMLs:
 *                             type: string
 *                             description: Indica se o envelope possui documentos com XMLs (S ou N)
 *                           urlCarimboTempo:
 *                             type: null
 *                             description: URL do carimbo do tempo (nulo)
 *                       listaDocumentos:
 *                         type: object
 *                         properties:
 *                           Documento:
 *                             type: array
 *                             description: Lista de documentos do envelope com as seguintes propriedades
 *                             items:
 *                               type: object
 *                               properties:
 *                                 nomeArquivo:
 *                                   type: string
 *                                   description: Nome do arquivo
 *                                 mimeType:
 *                                   type: string
 *                                   description: Tipo do arquivo (MIME type)
 *                                 conteudo:
 *                                   type: string
 *                                   description: Conteúdo do arquivo
 *                                 listaXMLAuxiliar:
 *                                   type: object
 *                                   properties:
 *                                     XMLAuxiliar:
 *                                       type: array
 *                                       description: Lista de XMLs auxiliares do documento
 *                                       items:
 *                                         type: object
 *                                         properties:
 *                                           nomeArquivo:
 *                                             type: null
 *                                             description: Nome do arquivo XML (nulo)
 *                                           conteudoXML:
 *                                             type: null
 *                                             description: Conteúdo do arquivo XML (nulo)
 *                                           listaXMLSignatario:
 *                                             type: object
 *                                             properties:
 *                                               XMLSignatario:
 *                                                 type: array
 *                                                 description: Lista de XMLs do signatário
 *                                                 items:
 *                                                   type: object
 *                                                   properties:
 *                                                     emailSignatario:
 *                                                       type: null
 *                                                       description: Email do signatário (nulo)
 *                                                     idNodeAssinatura:
 *                                                       type: null
 *                                                       description: ID do nó da assinatura (nulo)
 *                                                     restringirTiposCertificados:
 *                                                       type: null
 *                                                       description: Restringir tipos de certificados (nulo)
 *                                                     restringirPessoaFisica:
 *                                                       type: null
 *                                                       description: Restringir pessoa física (nulo)
 *                                                     restringirPessoaJuridica:
 *                                                       type: null
 *                                                       description: Restringir pessoa jurídica (nulo)
 *                                                     carimboInterno:
 *                                                       type: null
 *                                                       description: Carimbo interno (nulo)
 *                       listaSignatariosEnvelope:
 *                         type: object
 *                         properties:
 *                           SignatarioEnvelope:
 *                             type: array
 *                             description: Lista de signatários do envelope
 *                             items:
 *                               type: object
 *                               properties:
 *                                 # Propriedades do signatário (preencher conforme necessário)
 *                       listaObservadores:
 *                         type: object
 *                         properties:
 *                           Observador:
 *                             type: array
 *                             description: Lista de observadores do envelope
 *                             items:
 *                               type: object
 *                               properties:
 *                                 # Propriedades do observador (preencher conforme necessário)
 *                       listaTags:
 *                         type: object
 *                         properties:
 *                           Tag:
 *                             type: array
 *                             description: Lista de tags do envelope
 *                             items:
 *                               type: object
 *                               properties:
 *                                 # Propriedades da tag (preencher conforme necessário)
 *                       listaInfoAdicional:
 *                         type: object
 *                         properties:
 *                           InfoAdicional:
 *                             type: array
 *                             description: Lista de informações adicionais do envelope
 *                             items:
 *                               type: object
 *                               properties:
 *                                 # Propriedades da informação adicional (preencher conforme necessário)
 *                       incluirHashTodasPaginas:
 *                         type: string
 *                         description: Indica se deve incluir hash em todas as páginas (S ou N)
 *                       permitirDespachos:
 *                         type: string
 *                         description: Indica se deve permitir despachos (S ou N)
 *                       ignorarNotificacoes:
 *                         type: string
 *                         description: Indica se deve ignorar notificações (S ou N)
 *                       ignorarNotificacoesPendentes:
 *                         type: string
 *                         description: Indica se deve ignorar notificações pendentes (S ou N)
 *                       qrCodePosLeft:
 *                         type: null
 *                         description: Posição esquerda do QR code (nulo)
 *                       qrCodePosTop:
 *                         type: null
 *                         description: Posição superior do QR code (nulo)
 *                       dataIniContrato:
 *                         type: null
 *                         description: Data inicial do contrato (nulo)
 *                       dataFimContrato:
 *                         type: null
 *                         description: Data final do contrato (nulo)
 *                       objetoContrato:
 *                         type: null
 *                         description: Objeto do contrato (nulo)
 *                       numContrato:
 *                         type: null
 *                         description: Número do contrato (nulo)
 *                       valorContrato:
 *                         type: null
 *                         description: Valor do contrato (nulo)
 *                       descricaoContratante:
 *                         type: null
 *                         description: Descrição do contratante (nulo)
 *                       descricaoContratado:
 *                         type: null
 *                         description: Descrição do contratado (nulo)
 *                       bloquearDesenhoPaginas:
 *                         type: string
 *                         description: Indica se deve bloquear desenho das páginas (S ou N)
 *                   gerarTags:
 *                     type: string
 *                     description: Indica se deve gerar tags (S ou N)
 *                   encaminharImediatamente:
 *                     type: string
 *                     description: Indica se deve encaminhar imediatamente (S ou N)
 *                   detectarCampos:
 *                     type: string
 *                     description: Indica se deve detectar campos (S ou N)
 *                   verificarDuplicidadeConteudo:
 *                     type: string
 *                     description: Indica se deve verificar duplicidade de conteúdo (S ou N)
 *     responses:
 *       200:
 *         description: Sucesso ao inserir o envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       500:
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 */
app.post('/api/createEnvelope', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/inserirEnvelope', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/getEnvelopeData:
 *   post:
 *     summary: Buscar dados do envelope
 *     description: Esta rota permite buscar os dados de um envelope a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               params:
 *                 type: object
 *                 properties:
 *                   idEnvelope:
 *                     type: integer
 *                     description: ID do envelope a ser buscado
 *                   getLobs:
 *                     type: string
 *                     description: Indica se deve buscar informações adicionais (Y) ou não (N)
 *             required:
 *               - idEnvelope
 *               - getLobs
 *           example:
 *             token: "56ht9p-Li8k5zHaQ2Dzxzijr..."
 *             params:
 *               idEnvelope: 1951
 *               getLobs: "N"
 *     responses:
 *       '200':
 *         description: Sucesso ao buscar os dados do envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       '500':
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/getEnvelopeData', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/getDadosEnvelope', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/fetchEnvelopesRepo:
 *   post:
 *     summary: Obter envelopes de um repositório
 *     description:  Busca os envelopes do repositório ou pasta.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               params:
 *                 type: object
 *                 properties:
 *                   idRepositorio:
 *                     type: integer
 *                 required:
 *                   - idRepositorio
 *             required:
 *               - token
 *               - params
 *           example:
 *             token: "56ht9p-Li8k5zHaQ2Dzxzijr..."
 *             params:
 *               idRepositorio: 281
 *     responses:
 *       '200':
 *         description: Descrição da resposta de sucesso aqui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       '500':
 *         description: Descrição do erro 500 aqui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/api/fetchEnvelopesRepo', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/getEnvelopesByRepositorioOuPasta', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/sendEnvelope:
 *   post:
 *     summary: Encaminhar envelope para assinaturas
 *     description: Esta rota permite encaminhar um envelope para assinaturas a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de autenticação
 *               params:
 *                 type: object
 *                 properties:
 *                   Envelope:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID do envelope que será encaminhado para assinaturas
 *                   agendarEnvio:
 *                     type: string
 *                     description: Indica se o envio será agendado (S ou N)
 *                   detectarCampos:
 *                     type: string
 *                     description: Indica se os campos serão detectados (S ou N)
 *                   dataEnvioAgendado:
 *                     type: null
 *                     description: Data de envio agendado (nulo)
 *                   horaEnvioAgendado:
 *                     type: null
 *                     description: Hora de envio agendado (nulo)
 *     responses:
 *       200:
 *         description: Sucesso ao encaminhar o envelope para assinaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: Mensagem de sucesso
 *       500:
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 */
app.post('/api/sendEnvelope', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/encaminharEnvelopeParaAssinaturas', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

/**
 * @swagger
 * /api/downloadPDF:
 *   post:
 *     summary: Fazer download do PDF
 *     description: Esta rota permite fazer o download de um PDF a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               params:
 *                 type: object
 *                 properties:
 *                   hashSHA256:
 *                     type: string
 *                     description: Hash SHA256 do PDF a ser baixado
 *                   incluirDocs:
 *                     type: string
 *                     description: Indica se deve incluir documentos (Y) ou não (N) no PDF
 *                   versaoSemCertificado:
 *                     type: string
 *                     description: Versão sem certificado do PDF (opcional)
 *             required:
 *               - hashSHA256
 *               - incluirDocs
 *           example:
 *             token: "56ht9p-Li8k5zHaQ2Dzxzijr..."
 *             params:
 *               hashSHA256: "125bc811ff75103031ab20c06484924f1b317ae95748481cd790509b24e01d5d"
 *               incluirDocs: "N"
 *               versaoSemCertificado: null
 *     responses:
 *       '200':
 *         description: Sucesso ao fazer o download do PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       '500':
 *         description: Erro ao chamar a API externa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

app.post('/api/downloadPDF', async (req, res) => {
  try {
    const { params } = req.body;

    const response = await axios.post(process.env.API_URL + '/downloadPDFEnvelope', { "token": process.env.TOKEN, "params": params }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Erro ao chamar a API externa: ${error}` });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
