import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import firebaseConfig from './firebaseConfig.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { FontAwesomeIcon } from './components/fontawesome.js';

// Inicialize o Firebase com as configurações do firebaseConfig.js
firebase.initializeApp(firebaseConfig);

export const db = firebase.database();

const app = createApp(App);

// Adicione o componente FontAwesomeIcon globalmente
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
