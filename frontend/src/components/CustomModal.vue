<template>
  <Teleport to="#modal">
    <div class="modal-bg" v-if="isOpen">
      <div class="modal">
        <h3>{{ title }}</h3>
        <div style="position: absolute; top: 5%; left: 95%;" @click="onCancel">
          <font-awesome-icon icon="xmark"/>
        </div>
        <slot></slot>
        <div class="modal-buttons">
          <button @click="onConfirm" class="btn-confirm">
            <div v-if="isLoading" style="display: flex;">
              <div class="loading"></div>
              <span style="padding: 5px;">Carregando...</span>
            </div>
            <div v-else>
              <font-awesome-icon icon="check" />
              {{ confirmButtonText }}
            </div>
          </button>
          <button class="cancel" @click="onCancel">
            <font-awesome-icon icon="ban" />
            {{ cancelButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    confirmButtonText: {
      type: String,
      default: "Confirmar",
    },
    cancelButtonText: {
      type: String,
      default: "Cancelar",
    },
  },
  methods: {
    onConfirm() {
      this.$emit("confirm");
    },
    onCancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style>
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  position: relative;
  max-width: 600px;
  max-height: 450px; /* Altura máxima da div principal */
  overflow-y: auto; /* Adiciona a barra de rolagem quando o conteúdo exceder o espaço disponível */
  background: #242424;
  padding: 50px 100px;
  border-radius: 5px;
  box-shadow: 0px 10px 5px 2px rgba(0, 0, 0, 0.1);
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.modal-buttons button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.modal-buttons button.cancel {
  background-color: #ccc;
}

.modal-buttons button.cancel:hover {
  background-color: #868484;
}

.modal-buttons button.btn-confirm:hover {
  background-color: hsl(139, 53%, 50%);
}
</style>
