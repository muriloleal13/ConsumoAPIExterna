<template>
  <div class="container">
    <!-- Coluna Única -->
    <div class="main-column">
      <h1>Consumo de API AVMB</h1>

      <!-- <div class="input-container">
        <input v-if="userId" type="text" v-model="userId" placeholder="Insira o ID do Usuário">
      </div> -->

      <div class="button-container">
        <button @click="getUserId">Buscar Identificador do Usuário</button>
        <!-- <button v-if="userId" @click="getUserData">Buscar Dados do Usuário</button> -->
        <!-- <button v-if="userId" @click="fetchAllRepo">Buscar Repositórios do Usuário</button> -->
        <!-- <button v-if="userId" @click="isModalOpen = true">Criar Repositório</button> -->
        <button v-if="userId" @click="openCreateEnvelopeModal">Criar Envelope</button>
        <button v-if="lstEnvelopes.length" @click="openEncaminhaEnvelopeModal">Encaminhar Envelope</button>
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
        <button @click="fetchEnvelopesRepo" :disabled="!selectedRepo" class="btn-adicionar">Buscar envelopes</button>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="envelope in lstEnvelopes" :key="envelope.id">
              <td>{{ envelope.id }}</td>
              <td>{{ envelope.descricao }}</td>
              <td>{{ envelope.dataHoraCriacao }}</td>
              <td>{{ getStatusDescription(envelope.status) }}</td>
            </tr>
          </tbody>
        </table>
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
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    >
      <div v-if="isCreateEnvelopeModal">
        <!-- <p>ID do Usuário: {{ userId }}</p> -->
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
          <input type="file" @change="onFileChange">
          <button @click="addDocument" :disabled="!selectedFile" class="btn-adicionar">Adicionar Documento</button>
          <ul>
            <li v-for="(document, index) in documents" :key="index">
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
            <option v-for="envelope in lstEnvelopes" :key="envelope.id" :value="envelope.id">
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

.input-container,
.add-document-container {
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
}

button:hover {
  background-color: #544dc9;
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

.signatarios-container {
  /* max-height: 200px; /* Altura máxima da div principal */
  /* overflow-y: auto; Adiciona a barra de rolagem quando o conteúdo exceder o espaço disponível */
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

.btn-confirm {
  background-color: green;
}

.btn-remover:hover,
.btn-adicionar:hover {
  background-color: #544dc9;
}
</style>

<script>
import axios from 'axios';
import CustomModal from './components/CustomModal.vue';

export default {
  data() {
    return {
      userId: null,
      userData: null,
      isModalOpen: false,
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
    // UNUSED
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
        console.error('Erro ao buscar o identificador do usuário:', error);
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
      }
    },
    async createRepo() {
      try {
        let params = {
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
      try {
        let newSignatarios = [];
        for(sgn in this.signatarios){
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


        let params = {
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
        isModalOpen = false;
      } catch (error) {
        console.error('Erro ao criar envelope:', error);
      }
    },
    async fetchEnvelopesRepo() {
      try {
        // Chamar a API para buscar os envelopes do repositório selecionado
        const response = await axios.post(`http://localhost:3000/api/fetchEnvelopesRepo`, { params: { idRepositorio: this.selectedRepo.id } }, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        this.lstEnvelopes = response.data.response;
      } catch (error) {
        console.error('Erro ao buscar os repositórios do usuário:', error);
      }
    },
    async sendEnvelope() {
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
      } catch (error) {
        console.error('Erro ao encaminhar envelope:', error);
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
        tipoAcao: "assinar",
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
    },
    openCreateEnvelopeModal() {
      this.isCreateEnvelopeModal = true;
      this.openModal("Criar Envelope");
    },
    openEncaminhaEnvelopeModal() {
      this.isEncaminhaEnvelopeModal = true;
      this.openModal("Encaminha Envelope");
    },
  },
};
</script>
