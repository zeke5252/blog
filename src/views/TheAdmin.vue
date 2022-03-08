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
export default {
  name: 'TheAdmin'
}
</script>

<script setup>
import router from '../router/'
import { firebase } from '@firebase/app'
import { ref } from 'vue'
require('firebase/auth')
const email = ref(null)
const password = ref(null)

const loginHandler = () => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email.value, password.value)
    .then(userCredential => {
      // Signed in
      var user = userCredential.user
      alert('Login is successful!')
      router.push({ name: 'TheForm' })
    })
    .catch(error => {
      // eslint-disable-next-line no-unused-vars
      let errorCode = error.code
      // eslint-disable-next-line no-unused-vars
      let errorMessage = error.message
    })
}

</script>
