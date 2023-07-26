<template>
  <div class="container">
    <div v-if="isLoading && !isModalOpen" class="info-container">
      <div class="loading"></div>
      <span style="padding: 5px;">Carregando...</span>
    </div>

    <div v-if="isSuccess" class="info-container" style="background-color: rgb(120, 255, 120);">
      <font-awesome-icon icon="check" />
      <span style="padding: 5px;">{{ successMessage }}</span>
    </div>

    <div v-if="isError.value" class="info-container" style="background-color: rgb(255, 116, 116);">
      <font-awesome-icon icon="xmark"/>
      <span style="padding: 5px;">{{ errorMessage }}</span>
    </div>

    <!-- Coluna Única -->
    <div class="main-column">
      <h1>Consumo de API Externa</h1>

      <div class="button-container">
        <button @click="getUserId"><font-awesome-icon icon="user"/>Identificador do Usuário</button>
        <!-- <button v-if="userId" @click="getUserData">Buscar Dados do Usuário</button> -->
        <!-- <button v-if="userId" @click="isModalOpen = true">Criar Repositório</button> -->
        <button v-if="userId" @click="openCreateEnvelopeModal"><font-awesome-icon icon="envelope" />Criar Envelope</button>
        <button v-if="lstEnvelopes.length && lstEnvelopes.filter(env => env.status == 1).length" @click="openEncaminhaEnvelopeModal"><font-awesome-icon icon="share-from-square"/>Encaminhar Envelope</button>
      </div>

      <div>
        <p v-if="userId">Identificador do Usuário: {{ userId }}</p>
      </div>

      <!-- <div class="response-container" v-if="userData">
        <h2>JSON Recebido da API</h2>
        <textarea class="json-textarea" readonly>{{ userData }}</textarea>
      </div> -->
    </div>

    <div v-if="lstRepo.length">
      <div style="display: flex; flex-direction: row; gap: 10px;">
        <select v-model="selectedRepo" class="custom-select" style="width: 100%;">
          <option value="">Selecione um repositório</option>
          <option v-for="repo in lstRepo" :key="repo.id" :value="repo">
            {{ repo.nome }}
          </option>
        </select>
        <button @click="fetchEnvelopesRepo" :disabled="!selectedRepo" class="btn-adicionar"><font-awesome-icon icon="magnifying-glass"/>Buscar envelopes</button>
      </div>
      <div v-if="lstEnvelopes.length > 0">
        <h2>Envelopes:</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Data e Hora de Criação</th>
              <th>Status do Envelope</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="envelope in lstEnvelopes" :key="envelope.id">
              <td>{{ envelope.id }}</td>
              <td>{{ envelope.descricao }}</td>
              <td>{{ envelope.dataHoraCriacao }}</td>
              <td>{{ getStatusDescription(envelope.status) }}</td>
              <td v-if="envelope.status == 3" style="text-align: center;" @click="buscarEnvelopePorId(envelope.id)"><font-awesome-icon icon="download" /></td>
              <td v-else style="text-align: center;">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p style="text-align: center;">Nenhum envelope encontrado no repositório ou pasta</p>
      </div>
    </div>

    <!-- Modal para criar repositório -->
    <!-- <Teleport to="#modal">
      <div class="modal-bg" v-if="isModalOpen">
        <div class="modal">
          <h3>Criar Repositório</h3>
          <p>ID do Usuário: {{ userId }}</p>
          <input type="text" v-model="repoName" placeholder="Insira o nome do repositório">
          <div class="modal-buttons">
            <button @click="createRepo">Confirmar</button>
            <button class="cancel" @click="isModalOpen = false;">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport> -->
    <CustomModal
      :is-open="isModalOpen"
      :title="modalTitle"
      :is-loading="isLoading"
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    >
      <div v-if="isCreateEnvelopeModal">
        <div class="input-container">
          <input type="text" v-model="descricao" placeholder="Descrição do envelope" class="input-field" :class="{ error: isEmpty(descricao) }">
          <select v-model="selectedRepo" class="custom-select" style="width: 100%;">
            <option value="">Selecione um repositório</option>
            <option v-for="repo in lstRepo" :key="repo.id" :value="repo">
              {{ repo.nome }}
            </option>
          </select>
        </div>

        <div class="add-document-container">
          <div class="input-container">
            <input type="file" @change="onFileChange" :class="{ error: !documents.length }">
            <button @click="addDocument" :disabled="!selectedFile" class="btn-adicionar">Adicionar Documento</button>
          </div>
          <ul>
            <li v-for="(document, index) in documents" :key="index" style="padding: 5px;">
              {{ document.nomeArquivo }}
              <button @click="removeDocument(index)" class="btn-remover">Remover</button>
            </li>
          </ul>
        </div>

        <div class="signatarios-container">
          <h3 :class="{error: !signatarios.length}">Adicionar Signatário</h3>
          <div class="signatario" v-for="(signatario, index) in signatarios" :key="index">
            <input v-model="signatario.nome" type="text" placeholder="Nome" class="input-field" :class="{ error: isEmpty(signatario.nome) }">
            <input v-model="signatario.email" type="text" placeholder="Email" class="input-field" :class="{ error: isEmpty(signatario.email) }">
            <select v-model="signatario.tipoAcao" class="custom-select" :class="{ error: isEmpty(signatario.tipoAcao) }">
              <option value="1">Assinar</option>
              <option value="2">Aprovar</option>
              <option value="3">Reconhecer</option>
            </select>
            <button @click="removeSignatario(index)" class="btn-remover">Remover</button>
          </div>
          <button @click="addSignatario" class="btn-adicionar">
            <font-awesome-icon icon="plus" />
            Adicionar Signatário
          </button>
        </div>
      </div>

      <div v-if="isEncaminhaEnvelopeModal">
        <div class="input-container">
          <select v-model="selectedEnvelope" class="custom-select" style="width: 100%;">
            <option value="">Selecione um envelope</option>
            <option v-for="envelope in lstEnvelopes.filter(env => env.status == 1)" :key="envelope.id" :value="envelope.id">
              {{ envelope.descricao }}
            </option>
          </select>
        </div>
      </div>
    </CustomModal>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centraliza a coluna horizontalmente */
  align-items: center; /* Centraliza a coluna verticalmente */
  height: 100vh; /* Altura total da tela */
}

.main-column {
  max-width: 100vw; /* Limita a largura da coluna principal */
  padding: 20px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centraliza verticalmente o conteúdo */
  border: #f2f2f2 1px solid;
  border-radius: 4px;
  margin-bottom: 10px;
}

.error {
  border: 2px solid red;
}

h1, h2 {
  margin-top: 0;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

input {
  width: 100%; /* Ocupa todo o espaço disponível */
  max-width: 300px; /* Limita a largura do input */
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease;
  /* margin-bottom: 10px; */
}

input:focus {
  outline: none;
  border-color: #6c63ff;
}

.button-container {
  display: flex;
  flex-wrap: wrap; /* Adiciona quebra de linha automática para botões */
  gap: 10px;
  justify-content: center; /* Centraliza os botões horizontalmente */
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #6c63ff;
  color: white;
  cursor: pointer;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
}

button:hover {
  background-color: #544dc9;
}

/* CSS para o efeito de carregamento */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  background-color: rgba(69, 69, 69, 0.3);
  border-radius: 4px;
  margin-bottom: 10px;
}

.loading {
  width: 30px;
  height: 30px;
  border: 4px solid rgba(0, 0, 0, 0.3);
  border-top: 4px solid #007bff; /* Cor do spinner */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* Aplica o efeito de rotação */
}

.loading span {
  margin-left: 10px;
  vertical-align: middle;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.response-container {
  margin-top: 20px;
  text-align: center;
}

textarea.json-textarea {
  width: 450px;
  height: 300px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.custom-select {
  width: 100px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  appearance: none;
  /* background-color: #fff; */
  background-image: url('data:image/svg+xml;charset=utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"%3E%3Cpath fill="%23333" d="M299.6 186.9L168 318.5 36.4 186.9C-4.7 147.7 12.3 64 61.5 64h197c49.2 0 66.2 83.7 25.1 122.9z"%3E%3C/path%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  cursor: pointer;
}

.signatario {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.input-field {
  flex: 1;
  width: 200px;
}

.btn-remover,
.btn-adicionar,
.btn-confirm {
  flex-shrink: 0; /* Impede que o botão diminua de tamanho */
  padding: 6px 10px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.btn-remover {
  background-color: red;
}

.btn-remover:hover{
  background-color: rgb(183, 0, 0);
}

.btn-confirm {
  background-color: rgb(120, 255, 120);
}

.btn-adicionar:hover {
  background-color: #544dc9;
}
</style>

<script>
import { ref as vueRef, reactive, computed } from 'vue';
import axios from 'axios';
import CustomModal from './components/CustomModal.vue';
import { db } from './main';
import { ref as firebaseRef, push, set, onValue } from 'firebase/database';

export default {
  components: {
    CustomModal,
  },
  setup() {
    const userId = vueRef(null);
    const userData = vueRef(null);
    const isLoading = vueRef(false);
    const isSuccess = vueRef(false);
    const isError = vueRef(false);
    const isModalOpen = vueRef(false);
    const successMessage = vueRef('');
    const errorMessage = vueRef('');
    const modalTitle = vueRef('');
    const isCreateEnvelopeModal = vueRef(false);
    const isEncaminhaEnvelopeModal = vueRef(false);
    const repoName = vueRef('');
    const lstRepo = vueRef([]);
    const lstEnvelopes = vueRef([]);
    const descricao = vueRef('');
    const selectedRepo = vueRef('');
    const selectedEnvelope = vueRef('');
    const selectedFile = vueRef(null);
    const base64 = vueRef('');
    const documents = vueRef([]);
    const signatario = vueRef(null);
    const signatarios = vueRef([]);

    // Mapear os valores de status para suas descrições correspondentes
    const statusDescriptions = computed(() => {
      return {
        1: 'Em construção',
        2: 'Aguardando Assinaturas',
        3: 'Concluído',
        4: 'Arquivado',
        5: 'Cancelado',
        6: 'Expirado',
      };
    });

    const getUserId = async () => {
      isLoading.value = true;
      try {
        // Chamar a API para buscar o identificador do usuário
        const response = await axios.post(`http://localhost:3000/api/getUserId`, { params: {} }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        userId.value = response.data.response.Usuario.id;
        await fetchAllRepo();
      } catch (error) {
        showErrorMessage(error);
        console.error('Erro ao buscar o identificador do usuário:', error);
      }finally{
        isLoading.value = false;
      }
    };
    const getUserData = async () => {
      try {
        // Chamar a API para buscar os dados do usuário usando o userId
        const response = await axios.post(`http://localhost:3000/api/getUserData`, { params: {idUsuario: userId.value} }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        userData.value = response.data.response;
      } catch (error) {
        console.error('Erro ao buscar os dados do usuário:', error);
      }
    };
    const fetchAllRepo = async () => {
      isLoading.value = true;
      try {
        // Chamar a API para buscar os repositórios do usuário
        const response = await axios.post(`http://localhost:3000/api/fetchAllRepo`, { params: { idProprietario: userId.value } }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        lstRepo.value = response.data.response;
      } catch (error) {
        console.error('Erro ao buscar os repositórios do usuário:', error);
      }finally{
        isLoading.value = false;
      }
    };
    const createRepo = async () => {
      try {
        const params = {
          Repositorio: {
            Usuario: {
              id: userId.value
            },
            nome: repoName.value,
            compartilharCriacaoDocs:"S",
            compartilharVisualizacaoDocs:"S",
            ocultarEmailSignatarios:"N",
            nomeRemetente:null,
            opcaoValidCodigo:"S",
            opcaoValidCertICP:"S",
            opcaoValidDocFoto:"S",
            opcaoValidDocSelfie:"S",
            opcaoValidTokenSMS:"S",
            opcaoValidLogin:"S",
            opcaoValidReconhecFacial:"S",
            opcaoValidPix: "S",
            lembrarAssinPendentes:"S",
          },
        }
        // Chamar a API para criar repositório
        const response = await axios.post(`http://localhost:3000/api/createRepo`, { "params": params }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        let id = response.data.response.data.idRepositorio
        lstRepo.value = [...lstRepo, {id: repoName}];
        // Feche o modal após criar o repositório
        isModalOpen.value = false;
        repoName.value = '';
      } catch (error) {
        console.error('Erro ao criar o repositório:', error);
      }
    };
    const createEnvelope = async () => {
      if(!canCreateEnvelope()){
        return;
      }
      isLoading.value = true;
      try {
        let newSignatarios = [];
        for(let i=0; i<signatarios.value.length;i++){
          let sgn = signatarios.value[i];
          console.log(sgn, sgn.tipoAcao, sgn.nome, sgn.email);
          newSignatarios.push({
            "ordem": sgn.tipoAcao,
            "tagAncoraCampos": null,
            "ConfigAssinatura":{
                "emailSignatario": sgn.email,
                "nomeSignatario":sgn.nome,
                "celularSignatario":null,
                "opcaoAutenticacao":null,
                "tipoAssinatura":1,
                "permitirDelegar":"N",
                "apenasCelular":"N",
                "exigirLogin":"N",
                "exigirCodigo":"N",
                "exigirDadosIdentif":"N",
                "assinaturaPresencial":"N",
                "nomeSignPresencial":null,
                "cpfSignPresencial":null,
                "ignorarRecusa":"N",
                "codigoExigido":null,
                "incluirImagensAutentEnvelope":"N",
                "analisarFaceImagem":"N",
                "percentualPrecisaoFace":0,
                "intervaloPaginaDesenho": "1,3,4-10"
              },
          });
        }

        const params = {
          "Envelope": {
            "descricao": descricao.value,
            "Repositorio": {
                "id": selectedRepo.value.id
            },
            "mensagem": null,
            "mensagemObservadores": null,
            "mensagemNotificacaoSMS": null,
            "dataExpiracao": null,
            "horaExpiracao": null,
            "usarOrdem": "S",
            "ConfigAuxiliar":{
                "documentosComXMLs": "N",
                "urlCarimboTempo": null
            },
            "listaDocumentos":{
                "Documento": documents.value
            },
            "listaSignatariosEnvelope":{
              "SignatarioEnvelope": newSignatarios
            },
            "listaObservadores":{
              "Observador": [
                {"emailObservador": "msleal@inf.ufsm.br"}
              ],
            },
            "listaTags":{
                "Tag":[
                  {"descricao": "Descrição da tag",}
                ]
            },
            "listaInfoAdicional":{
                "InfoAdicional":[
                  {
                    "secao":"Partes",
                    "titulo":"Nome Contrante",
                    "publico":"S",
                    "conteudo":"Carol Fischer Moro"
                  },
                  {
                    "secao":"Validade",
                    "titulo":"Prazo Final",
                    "publico":"S",
                    "conteudo":"10/07/2021"
                  }
                ]
            },
            "incluirHashTodasPaginas":"S",
            "permitirDespachos":"S",
            "ignorarNotificacoes":"N",
            "ignorarNotificacoesPendentes":"N",
            "qrCodePosLeft":null,
            "qrCodePosTop":null,
            "dataIniContrato":null,
            "dataFimContrato":null,
            "objetoContrato":null,
            "numContrato":null,
            "valorContrato":null,
            "descricaoContratante":null,
            "descricaoContratado":null,
            "bloquearDesenhoPaginas": "S"
          },
          "gerarTags":"S",
          "encaminharImediatamente":"N",
          "detectarCampos":"N",
          "verificarDuplicidadeConteudo":"N"
        }

        // Chamar a API para buscar os repositórios do usuário
        const response = await axios.post(`http://localhost:3000/api/createEnvelope`, { "params": params }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log(response.data.response);
        await getEnvelopeData(response.data.response.data.idEnvelope);
        showSuccessMessage(response.data.response.mensagem);
      } catch (error) {
        showErrorMessage(error);
        console.error('Erro ao criar envelope:', error);
      }finally{
        isLoading.value = false;
        isModalOpen.value = false;
        resetData();
      }
    };
    const getEnvelopeData = async (idEnvelope) => {
      try{
        const params = {
          "idEnvelope": idEnvelope,
          "getLobs": "N"
        }
        const response = await axios.post(`http://localhost:3000/api/getEnvelopeData`, { "params": params }, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          console.log(response.data.response);
          await saveDB(response.data.response);
        } catch (error) {
          console.error('Erro ao criar envelope:', error);
        }
    };
    const fetchEnvelopesRepo = async () => {
      isLoading.value = true;
      try {
        // Chamar a API para buscar os envelopes do repositório selecionado
        const response = await axios.post(`http://localhost:3000/api/fetchEnvelopesRepo`, { params: { idRepositorio: selectedRepo.value.id } }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        lstEnvelopes.value = response.data.response;
        if(lstEnvelopes.value && lstEnvelopes.value.length){
          lstEnvelopes.value.forEach((envelope) => {
            buscarEnvelopePorId(envelope.id, true)
          });
        }
      } catch (error) {
        console.error('Erro ao buscar os repositórios do usuário:', error);
      }finally{
        isLoading.value = false;
      }
    };
    const sendEnvelope = async () => {
      isLoading.value = true;
      try {
        const params = {
          "Envelope": {
            "id": selectedEnvelope.value
          },
          "agendarEnvio":"N",
          "detectarCampos":"N",
          "dataEnvioAgendado":null,
          "horaEnvioAgendado":null
        }

        // Chamar a API para buscar os envelopes do repositório selecionado
        const response = await axios.post(`http://localhost:3000/api/sendEnvelope`, { "params": params }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        lstEnvelopes.value = response.data.response;
        showSuccessMessage(response.data.response.mensagem);
      } catch (error) {
        showErrorMessage(error);
        console.error('Erro ao encaminhar envelope:', error);
      }finally{
        isLoading.value = false;
        isModalOpen.value = false;
        resetData();
      }
    };
    const saveDB = async (envelope) => {
      try {
        const envelopesRef = firebaseRef(db, 'envelopes');
        const newEnvelopeRef = push(envelopesRef);
        const envelopeId = newEnvelopeRef.key;

        await set(newEnvelopeRef, envelope);
        console.log('Envelope salvo com sucesso:', envelopeId);
        return envelopeId;
      } catch (error) {
        console.error('Erro ao salvar envelope:', error);
        throw new Error('Erro ao salvar envelope');
      }
    };
    const buscarEnvelopePorId = async (idEnvelope, fromFetch = false) => {
      try {
        const envelopesRef = firebaseRef(db, 'envelopes');
        const snapshot = await new Promise((resolve, reject) => {
          onValue(envelopesRef, (snapshot) => {
            resolve(snapshot);
          }, {
            onlyOnce: true
          });
        });

        if (snapshot.exists()) {
          let found = false;
          snapshot.forEach((childSnapshot) => {
            const envelope = childSnapshot.val();

            if (envelope.id === idEnvelope) {
              if (!fromFetch) {
                downloadPDF(envelope);
              }
              found = true;
            }
          });

          if (!found && fromFetch) {
            getEnvelopeData(idEnvelope);
          }
        } else {
          getEnvelopeData(idEnvelope);
          console.log('Nenhum envelope encontrado na coleção "envelopes"');
        }
      } catch (error) {
        console.error('Erro ao buscar envelope por ID:', error);
      }
    };
    const downloadPDF = async (envelopeData) => {
      try {
        const params = {
          "hashSHA256": envelopeData.hashSHA256,
          "incluirDocs": "N",
          "versaoSemCertificado": null
        }
        const response = await axios.post(`http://localhost:3000/api/downloadPDF`, { "params": params }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        let data = response.data.response;
        const pdfBytes = Uint8Array.from(atob(data.envelopeContent), c => c.charCodeAt(0));

        // Criar um Blob com o PDF convertido
        const pdfBlob = new Blob([pdfBytes], { type: data.mimeType });

        // Criar a URL temporária para o Blob
        const url = URL.createObjectURL(pdfBlob);

        // Criar um link e configurar o download
        const link = document.createElement('a');
        link.href = url;
        link.download = data.nomeArquivo;

        // Clicar no link para iniciar o download
        link.click();

        // Limpar a URL temporária após o download
        URL.revokeObjectURL(url);
      } catch (error) {

      }
    };
    const onFileChange = (event) => {
      selectedFile.value = event.target.files[0];
      toBase64(selectedFile.value).then(
        data => base64.value = data
      );
    };
    const addDocument = () => {
      if (selectedFile.value) {
        let doc = {
          nomeArquivo: selectedFile.value.name,
          mimeType: selectedFile.value.type,
          conteudo: base64.value.replace(`data:${selectedFile.value.type};base64,`,''),
        };
        documents.value.push(doc);
        selectedFile.value = null;
        base64.value = '';
      }
    };
    const removeDocument = (index) => {
      documents.value.splice(index, 1);
    };
    const toBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    };
    const addSignatario = () => {
      signatarios.value.push({
        nome: "",
        email: "",
        tipoAcao: "1",
      });
    };
    const removeSignatario = (index) => {
      signatarios.value.splice(index, 1);
    };
    const getStatusDescription = (status) => {
      return statusDescriptions.value[status] || 'Desconhecido';
    };
    const openModal = (title) => {
      isModalOpen.value = true;
      modalTitle.value = title;
    };
    const onModalConfirm = () => {
      if (isCreateEnvelopeModal.value) {
        createEnvelope();
      } else if (isEncaminhaEnvelopeModal.value) {
        sendEnvelope();
      }
    };
    const onModalCancel = () => {
      isModalOpen.value = false;
      isCreateEnvelopeModal.value = false;
      isEncaminhaEnvelopeModal.value = false;
      resetData();
    };
    const openCreateEnvelopeModal = () => {
      isCreateEnvelopeModal.value = true;
      openModal("Criar Envelope");
    };
    const openEncaminhaEnvelopeModal = () => {
      isEncaminhaEnvelopeModal.value = true;
      openModal("Encaminha Envelope");
    };
    const showSuccessMessage = (message) => {
      successMessage.value = message;
      isSuccess.value = true;
      setTimeout(() => {
        isSuccess.value = false;
      }, 5000);
    };
    const showErrorMessage = (message) => {
      errorMessage.value = message;
      isError.value = true;
      setTimeout(() => {
        isError.value = false;
      }, 5000);
    };
    const isEmpty = (value) => {
      return value.trim() === '';
    };
    const canCreateEnvelope = () => {
      return Boolean(descricao.value ||
         selectedRepo.value ||
         documents.value.length ||
         signatarios.value.length);
    };
    const resetData = () => {
      descricao.value = '';
      selectedRepo.value = '';
      selectedEnvelope.value = '';
      selectedFile.value = null;
      base64.value = '';
      documents.value = [];
      signatario.value = null;
      signatarios.value = [];
    }

    return {
      userId,
      userData,
      isLoading,
      isSuccess,
      isError,
      isModalOpen,
      successMessage,
      errorMessage,
      modalTitle,
      isCreateEnvelopeModal,
      isEncaminhaEnvelopeModal,
      repoName,
      lstRepo,
      lstEnvelopes,
      descricao,
      selectedRepo,
      selectedEnvelope,
      selectedFile,
      base64,
      documents,
      signatario,
      signatarios,
      statusDescriptions,
      getUserId,
      getUserData,
      fetchAllRepo,
      createRepo,
      createEnvelope,
      getEnvelopeData,
      fetchEnvelopesRepo,
      sendEnvelope,
      saveDB,
      buscarEnvelopePorId,
      downloadPDF,
      onFileChange,
      addDocument,
      removeDocument,
      toBase64,
      addSignatario,
      removeSignatario,
      getStatusDescription,
      openModal,
      onModalConfirm,
      onModalCancel,
      openCreateEnvelopeModal,
      openEncaminhaEnvelopeModal,
      showSuccessMessage,
      showErrorMessage,
      isEmpty,
      canCreateEnvelope,
    };
  },
};
</script>
