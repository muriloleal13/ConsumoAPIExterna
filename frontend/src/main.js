import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import firebaseConfig from './firebaseConfig.js';
import { initializeApp } from 'firebase/app';
import { getDatabase  } from 'firebase/database';
import { FontAwesomeIcon } from './components/fontawesome.js';

// Inicialize o Firebase com as configurações do firebaseConfig.js
const firebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);

const app = createApp(App);

// Adicione o componente FontAwesomeIcon globalmente
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
