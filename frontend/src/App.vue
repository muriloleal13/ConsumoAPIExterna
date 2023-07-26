<template>
  <div class="container">
    <div v-if="this.isLoading" class="info-container">
      <div class="loading"></div>
      <span style="padding: 5px;">Carregando...</span>
    </div>

    <div v-if="this.isSuccess" class="info-container" style="background-color: rgb(120, 255, 120);">
      <font-awesome-icon icon="check" />
      <span style="padding: 5px;">{{ this.successMessage }}</span>
    </div>

    <div v-if="this.isError" class="info-container" style="background-color: rgb(255, 116, 116);">
      <font-awesome-icon icon="xmark"/>
      <span style="padding: 5px;">{{ this.errorMessage }}</span>
    </div>

    <!-- Coluna Única -->
    <div class="main-column">
      <h1>Consumo de API AVMB</h1>

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
              <td v-if="envelope.status == 3" style="text-align: center;" @click="this.buscarEnvelopePorId(envelope.id)"><font-awesome-icon icon="download" /></td>
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
      :is-open="this.isModalOpen"
      :title="modalTitle"
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    >
      <div v-if="isCreateEnvelopeModal">
        <div class="input-container">
          <input type="text" v-model="descricao" placeholder="Descrição do envelope" class="input-field">
          <select v-model="selectedRepo" class="custom-select" style="width: 100%;">
            <option value="">Selecione um repositório</option>
            <option v-for="repo in lstRepo" :key="repo.id" :value="repo">
              {{ repo.nome }}
            </option>
          </select>
        </div>

        <div class="add-document-container">
          <div class="input-container">
            <input type="file" @change="onFileChange">
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
          <h3>Adicionar Signatário</h3>
          <div class="signatario" v-for="(signatario, index) in signatarios" :key="index">
            <input v-model="signatario.nome" type="text" placeholder="Nome" class="input-field">
            <input v-model="signatario.email" type="text" placeholder="Email" class="input-field">
            <select v-model="signatario.tipoAcao" class="custom-select">
              <option value="1">Assinar</option>
              <option value="2">Aprovar</option>
              <option value="3">Reconhecer</option>
            </select>
            <button @click="removeSignatario(index)" class="btn-remover">Remover</button>
          </div>
          <button @click="addSignatario" class="btn-adicionar">Adicionar Signatário</button>
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
import axios from 'axios';
import CustomModal from './components/CustomModal.vue';
import { db } from './main';

export default {
  data() {
    return {
      userId: null,
      userData: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      isModalOpen: false,
      successMessage: '',
      errorMessage: '',
      modalTitle: '',
      isCreateEnvelopeModal: false,
      isEncaminhaEnvelopeModal: false,
      repoName: '',
      lstRepo: [],
      lstEnvelopes: [],
      descricao: '',
      selectedRepo: "",
      selectedEnvelope: "",
      selectedFile: null,
      base64: '',
      documents: [],
      signatario: null,
      signatarios: [],
    };
  },
  components: {
    CustomModal,
  },
  computed: {
    // Mapear os valores de status para suas descrições correspondentes
    statusDescriptions() {
      return {
        1: 'Em construção',
        2: 'Aguardando Assinaturas',
        3: 'Concluído',
        4: 'Arquivado',
        5: 'Cancelado',
        6: 'Expirado',
      };
    },
  },
  methods: {
    async getUserId() {
      this.isLoading = true;
      try {
        // Chamar a API para buscar o identificador do usuário
        const response = await axios.post(`http://localhost:3000/api/getUserId`, { params: {} }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        this.userId = response.data.response.Usuario.id;
        await this.fetchAllRepo();
        // await this.getUserData();
      } catch (error) {
        this.showErrorMessage(error);
        console.error('Erro ao buscar o identificador do usuário:', error);
      }finally{
        this.isLoading = false;
      }
    },
    async getUserData() {
      try {
        // Chamar a API para buscar os dados do usuário usando o userId
        const response = await axios.post(`http://localhost:3000/api/getUserData`, { params: {idUsuario: this.userId} }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        this.userData = response.data.response;
      } catch (error) {
        console.error('Erro ao buscar os dados do usuário:', error);
      }
    },
    async fetchAllRepo() {
      this.isLoading = true;
      try {
        // Chamar a API para buscar os repositórios do usuário
        const response = await axios.post(`http://localhost:3000/api/fetchAllRepo`, { params: { idProprietario: this.userId } }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        this.lstRepo = response.data.response;
      } catch (error) {
        console.error('Erro ao buscar os repositórios do usuário:', error);
      }finally{
        this.isLoading = false;
      }
    },
    async createRepo() {
      try {
        const params = {
          Repositorio: {
            Usuario: {
              id: this.userId
            },
            nome: this.repoName,
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
        this.lstRepo = [...this.lstRepo, {id: this.repoName}];
        // Feche o modal após criar o repositório
        this.isModalOpen = false;
        this.repoName = '';
      } catch (error) {
        console.error('Erro ao criar o repositório:', error);
      }
    },
    async createEnvelope() {
      this.isLoading = true;
      try {
        let newSignatarios = [];
        for(let i=0; i<this.signatarios.length;i++){
          let sgn = this.signatarios[i];
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
            "descricao": this.descricao,
            "Repositorio": {
                "id": this.selectedRepo.id
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
                "Documento": this.documents
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
        await this.getEnvelopeData(response.data.response.data.idEnvelope);
        this.isModalOpen = false;
        this.showSuccessMessage(response.data.response.mensagem);
      } catch (error) {
        this.showErrorMessage(error);
        console.error('Erro ao criar envelope:', error);
      }finally{
        this.isLoading = false;
      }
    },
    async getEnvelopeData(idEnvelope) {
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
          await this.saveDB(response.data.response);
        } catch (error) {
          console.error('Erro ao criar envelope:', error);
        }
    },
    async fetchEnvelopesRepo() {
      this.isLoading = true;
      try {
        // Chamar a API para buscar os envelopes do repositório selecionado
        const response = await axios.post(`http://localhost:3000/api/fetchEnvelopesRepo`, { params: { idRepositorio: this.selectedRepo.id } }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        this.lstEnvelopes = response.data.response;
        if(this.lstEnvelopes && this.lstEnvelopes.length){
          this.lstEnvelopes.forEach((envelope) => {
            this.buscarEnvelopePorId(envelope.id, true)
          });
        }
      } catch (error) {
        console.error('Erro ao buscar os repositórios do usuário:', error);
      }finally{
        this.isLoading = false;
      }
    },
    async sendEnvelope() {
      this.isLoading = true;
      try {
        const params = {
          "Envelope": {
            "id": this.selectedEnvelope
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

        this.lstEnvelopes = response.data.response;
        this.showSuccessMessage(response.data.response.mensagem);
      } catch (error) {
        this.showErrorMessage(error);
        console.error('Erro ao encaminhar envelope:', error);
      }finally{
        this.isLoading = false;
      }
    },
    async saveDB(envelope) {
      try {
        const ref = await db.ref('envelopes').push();
        const envelopeId = ref.key;

        await ref.set(envelope);
        console.log('Envelope salvo com sucesso:', envelopeId);
        return envelopeId;
      } catch (error) {
        console.error('Erro ao salvar envelope:', error);
        throw new Error('Erro ao salvar envelope');
      }
    },
    async buscarEnvelopePorId(idEnvelope, fromFetch = false) {
      try {
        const envelopesRef = db.ref('envelopes');
        const snapshot = await envelopesRef.once('value');
        let found = false;

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const envelope = childSnapshot.val();

            if (envelope.id === idEnvelope) {
              if(!fromFetch){
                this.downloadPDF(envelope);
              }
              found = true;
            }
          });

          if(!found && fromFetch){
            this.getEnvelopeData(idEnvelope);
          }
        } else {
          this.getEnvelopeData(idEnvelope);
          console.log('Nenhum envelope encontrado na coleção "envelopes"');
        }
      } catch (error) {
        console.error('Erro ao buscar envelope por ID:', error);
      }
    },
    async downloadPDF(envelopeData) {
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
    },
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.toBase64(this.selectedFile).then(
        data => this.base64 = data
      );
    },
    addDocument() {
      if (this.selectedFile) {
        let doc = {
          nomeArquivo: this.selectedFile.name,
          mimeType: this.selectedFile.type,
          conteudo: this.base64.replace(`data:${this.selectedFile.type};base64,`,''),
        };
        this.documents.push(doc);
        this.selectedFile = null;
        this.base64 = '';
      }
    },
    removeDocument(index) {
      this.documents.splice(index, 1);
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    },
    addSignatario() {
      this.signatarios.push({
        nome: "",
        email: "",
        tipoAcao: "1",
      });
    },
    removeSignatario(index) {
      this.signatarios.splice(index, 1);
    },
    getStatusDescription(status) {
      return this.statusDescriptions[status] || 'Desconhecido';
    },
    openModal(title) {
      this.isModalOpen = true;
      this.modalTitle = title;
    },
    onModalConfirm() {
      if (this.isCreateEnvelopeModal) {
        this.createEnvelope();
      } else if (this.isEncaminhaEnvelopeModal) {
        this.sendEnvelope();
      }

      this.isModalOpen = false;
    },
    onModalCancel() {
      this.isModalOpen = false;
      this.isCreateEnvelopeModal = false;
      this.isEncaminhaEnvelopeModal = false;
    },
    openCreateEnvelopeModal() {
      this.isCreateEnvelopeModal = true;
      this.openModal("Criar Envelope");
    },
    openEncaminhaEnvelopeModal() {
      this.isEncaminhaEnvelopeModal = true;
      this.openModal("Encaminha Envelope");
    },
    showSuccessMessage(message) {
      this.successMessage = message;
      this.isSuccess = true;
      setTimeout(() => {
        this.isSuccess = false;
      }, 5000);
    },
    showErrorMessage(message) {
      this.errorMessage = message;
      this.isError = true;
      setTimeout(() => {
        this.isError = false;
      }, 5000);
    },
  },
};
</script>
