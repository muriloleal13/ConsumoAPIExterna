# Consumo de API externa

Este projeto demonstra como realizar o consumo de uma API externa e utilizar o Firebase para armazenar e recuperar dados.

## Getting Started 🚀

Consumindo dados da API e realizando operações com firebase.

Antes de executar o projeto, é necessário configurar algumas variáveis de ambiente. Siga os passos abaixo:

1. Dentro da pasta raiz do projeto, crie um arquivo chamado `.env` com as seguintes configurações:

```sh
API_URL=URL_DA_API_EXTERNADA
TOKEN=SUA_CHAVE_DE_ACESSO
```

Substitua `URL_DA_API_EXTERNADA` pela URL da API externa que você deseja consumir e `SUA_CHAVE_DE_ACESSO` pela chave de acesso necessária para autenticação na API.

2. Na pasta `./frontend`, crie um arquivo chamado `.env` com as configurações do Firebase:

```sh
VITE_API_KEY=SUA_API_KEY_DO_FIREBASE
VITE_AUTH_DOMAIN=SEU_AUTH_DOMAIN_DO_FIREBASE
VITE_PROJECT_ID=SEU_PROJECT_ID_DO_FIREBASE
VITE_STORAGE_BUCKET=SEU_STORAGE_BUCKET_DO_FIREBASE
VITE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID_DO_FIREBASE
VITE_APP_ID=SEU_APP_ID_DO_FIREBASE
```

Substitua cada variável pela informação correspondente obtida a partir do seu projeto Firebase.

### Requirements 📋

_Node.js._

_Vue.js._

_Firebase Realtime Database._

### Run Application 🔧

_Clone the repository._

```sh
git clone https://github.com/muriloleal13/ConsumoAPIExterna
```

_Install dependencies._

```sh
npm init

npm install
```

## Run Test ⚙️

```sh
node app.js

cd ./frontend

npm run dev
```

O projeto será executado e estará acessível em `http://localhost:3000`, sendo a parte backend e `http://localhost:8000` a parte frontend. Certifique-se de que todas as dependências necessárias tenham sido instaladas previamente.

Uso do Swagger para Documentação da API também já está funcional em `http://localhost:3000/api-docs`.

## Autor ✒️

- **Murilo Leal** - [muriloleal13](https://github.com/muriloleal13)

---
