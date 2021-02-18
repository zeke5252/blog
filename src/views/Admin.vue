<template>
  <form v-on:submit.prevent>
    <div class="mb-3">
      <label for="formTitle" class="form-label">帳號</label>
      <input
        v-model="email"
        type="text"
        class="form-control"
        id="formTitle"
        aria-label="Title"
      />
    </div>
    <div class="mb-3">
      <label for="formTitle" class="form-label">密碼</label>
      <input
        v-model="password"
        type="password"
        class="form-control"
        id="formTitle"
        aria-label="Title"
      />
    </div>
    <button type="submit" class="btn btn-primary" v-on:click="loginHandler">
      登入
    </button>
  </form>
</template>

<script>
import router from '../router/';
import { firebase } from "@firebase/app";
require('firebase/auth');

export default {
  name: "Admin",
  data() {
    return {
      email: null,
      password: null
    };
  },
  computed: {},
    mounted() {
    this.init();
  },
  methods: {
    init() {
    },
    loginHandler() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Login is successful!");
        router.push("Form");
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    }
  },
};
</script>
