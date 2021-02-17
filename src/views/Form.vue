<template>
  <form v-on:submit.prevent>
    <div class="mb-3">
      <label for="formTitle" class="form-label">標題</label>
      <input
        v-model="title"
        type="text"
        class="form-control"
        id="formTitle"
        aria-label="Title"
      />
    </div>
    <div v-if="!image" class="mb-3">
      <label for="formFile" class="form-label">上傳相片</label>
      <input
        v-on:change="onFileChange"
        class="form-control"
        type="file"
        id="formFile"
      />
    </div>
    <div v-else>
      <img :src="image" style="width: 400px; height:auto"/>
      <button @click="removeImage">Remove image</button>
    </div>
    <div class="mb-3">
      <label for="formFile" class="form-label">類別</label>
      <select
        v-model="category"
        class="form-select"
        aria-label="Default select example"
      >
        <option value="photography">攝影</option>
        <option value="design">設計</option>
        <option value="programming">程式</option>
        <option value="life">生活</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="area-content" class="form-label">貼文內容</label>
      <textarea
        v-model="content"
        class="form-control"
        id="area-content"
        rows="3"
        style="white-space: pre"
      ></textarea>
    </div>
    <span v-show="progress>0">{{progress}}</span>
    <button type="submit" class="btn btn-primary" v-on:click="submitHandler">
      Submit
    </button>
  </form>
</template>

<script>
import { firebase } from "@firebase/app";
import { db } from "@/firebaseDB.js";
import { storage } from "../firebaseDB.js";
export default {
  name: "Form",
  data() {
    return {
      title: "",
      imageSrc: "",
      category: "photography",
      content: "",
      created: "",
      image: "",
      file: null,
      progress: 0
    };
  },
  computed: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.title= "",
      this.imageSrc= "",
      this.category= "photography",
      this.content= "",
      this.image= "",
      this.file= null,
      this.progress= 0
    },
    submitHandler() {
      // do validation

      // Upload photo, get the firestorage path, save it to imageSrc.
      var metadata = {
        contentType: "image/png",
      };
      let storageRef = storage.ref();
      var uploadTask = storageRef
        .child("photography/" + this.file.name)
        .put(this.file, metadata);
      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log("Upload is paused");
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          switch (error.code) {
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;
            // ...
            case "storage/unknown":
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {

            // get created, title, category, and content.
            this.imageSrc = downloadURL;

            db.collection("posts").add({
              title: this.title,
              category: this.category,
              created: firebase.firestore.FieldValue.serverTimestamp(),
              imageSrc: this.imageSrc,
              content: this.content
              })
              .then((docRef) => {
                alert("Upload is successful!");
                this.init();
              })
              .catch((error) => {
                  console.error("Error adding document: ", error);
              });

          });
        }
      );
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var reader = new FileReader();
      var vm = this;
      reader.onload = (e) => {
        vm.image = e.target.result;
      };
      this.file = file;
      reader.readAsDataURL(file);
    },
    removeImage: function(e) {
      this.image = "";
    },
  },
};
</script>