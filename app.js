const express = require('express');
const cors = require('cors');
const axios = require('axios');
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

// Middleware para validar o token de acesso
app.use((req, res, next) => {
  if (process.env.TOKEN === undefined) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
});

// Rota para enviar as requisições à API externa
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
