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
// app.use(express.json());
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));

// Configuração do Swagger JSDoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Consumo de API AVMB',
      version: '1.0.0',
      description: 'Desafio criado para consumir API da AVMB, criar repositórios, envelopes, encaminhar para assinatura e verificar o status dos documentos.',
    },
  },
  apis: ['./*.js'], // Caminho para os arquivos com as anotações Swagger
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Rota para acessar a documentação do Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Middleware para validar o token de acesso
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
  }
});

/**
 * @swagger
 * /api/createEnvelope:
 *   post:
 *     summary: Criar um novo envelope
 *     description: Esta rota permite criar um novo envelope a partir de um conjunto de parâmetros.
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
 *                   descricao:
 *                     type: string
 *                   selectedRepo:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nome:
 *                         type: string
 *                     example:
 *                       id: 456
 *                       nome: Repositório de Teste
 *                   documents:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         nomeArquivo:
 *                           type: string
 *                         arquivo:
 *                           type: string
 *                     example:
 *                       - nomeArquivo: arquivo1.pdf
 *                         arquivo: <base64_encoded_file_data>
 *                       - nomeArquivo: arquivo2.pdf
 *                         arquivo: <base64_encoded_file_data>
 *                   signatarios:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         nome:
 *                           type: string
 *                         email:
 *                           type: string
 *                         tipoAcao:
 *                           type: integer
 *                     example:
 *                       - nome: João
 *                         email: joao@example.com
 *                         tipoAcao: 1
 *                       - nome: Maria
 *                         email: maria@example.com
 *                         tipoAcao: 2
 *     responses:
 *       200:
 *         description: Sucesso na criação do envelope
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: object
 *                   properties:
 *                     idEnvelope:
 *                       type: integer
 *                     statusEnvelope:
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
  }
});

/**
 * @swagger
 * /api/fetchEnvelopesRepo:
 *   post:
 *     summary: Buscar envelopes por repositório ou pasta
 *     description: Esta rota permite buscar envelopes por repositório ou pasta a partir de um conjunto de parâmetros.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               params:
 *                 type: object
 *                 properties:
 *                   idRepositorio:
 *                     type: integer
 *                     description: ID do repositório
 *                   idPasta:
 *                     type: integer
 *                     description: ID da pasta (opcional)
 *     responses:
 *       200:
 *         description: Sucesso na busca dos envelopes
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
 *                       idEnvelope:
 *                         type: integer
 *                       descricao:
 *                         type: string
 *                       dataHoraCriacao:
 *                         type: string
 *                       statusEnvelope:
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
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
 *               params:
 *                 type: object
 *                 properties:
 *                   idEnvelope:
 *                     type: integer
 *                     description: ID do envelope que será encaminhado para assinaturas
 *                   destinatarios:
 *                     type: array
 *                     description: Lista de destinatários do envelope com as seguintes propriedades
 *                     items:
 *                       type: object
 *                       properties:
 *                         nome:
 *                           type: string
 *                           description: Nome do destinatário
 *                         email:
 *                           type: string
 *                           description: Email do destinatário
 *                         tipoAcao:
 *                           enum: [1, 2, 3]  # Adicionando enumeração para os valores permitidos
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
    res.status(500).json({ error: 'Erro ao chamar a API externa' });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
