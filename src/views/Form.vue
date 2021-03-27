<template>
  <form v-on:submit.prevent>
    <div class="row">
      <div class="col-4 mb-4">
        <label for="formTitle" class="form-label">標題</label>
        <input
          v-model="title"
          type="text"
          class="form-control"
          id="formTitle"
          aria-label="Title"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-4 mb-4">
        <label for="formFile" class="form-label">上傳相片</label>
        <input v-on:change="onFileChange" class="form-control" type="file" id="formFile" multiple/>
      </div>
      <div class="group--container" :style="this.images.length && 'height: 30vh'">
        <div class="group--container__photo" v-for="(image, index) in images" :key="index">
          <div v-if="this.images[index]" >
            <button @click="copySrc(index)">Copy name</button>
            <button @click="removeImage(index)">Remove</button>
            <img :src="image" @load="getImgExif(index)"/>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4 mb-4">
        <label for="formFile" class="form-label">類別</label>
        <select v-model="category" class="form-select" aria-label="Default select example" >
          <option value="photography">攝影</option>
          <option value="design">設計</option>
          <option value="programming">程式</option>
          <option value="life">生活</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col-6 mb-4">
        <label for="area-content" class="form-label">貼文內容</label>
        <textarea v-model="content" class="form-control" id="area-content" rows="5" cols="30" style="white-space: pre-wrap" />
      </div>
    </div>
    <span v-for="progress in progresses" v-show="progress>0" :key="progress">{{progress}}</span>
    <button type="submit" class="btn--submit" v-on:click="submitHandler">
      Submit
    </button>
    <button type="button" class="btn--signout" v-on:click="signoutHandler">
      Sign out
    </button>
  </form>
</template>

<script>
import { firebase } from "@firebase/app";
import { db } from "@/firebaseDB.js";
import { storage } from "../firebaseDB.js";
import router from '../router/';

export default {
  name: "Form",
  data() {
    return {
      title: "",
      category: "photography",
      content: "",
      created: "",
      images: [],
      files: [],
      filesToUpload: [],
      progresses: []
    };
  },
  computed: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.title= "";
      this.category= "photography";
      this.content= "";
      this.images= [];
      this.files= []; // all temporarily selected files 
      this.filesToUpload= [];
      this.progresses= []
    },

    submitHandler() {
      console.log('this.files=', this.files)

      
      this.files.forEach((file, index)=>{
        if(this.content.includes(file.name)){
          this.filesToUpload.push(file)
        }
      })

      // do validation

      // 1. Upload photo
      // 2. get the firestorage path
      // 3. save it to imageSrc.
      var metadata = {
        contentType: "image/png",
      };

      let filesAllPromises = this.filesToUpload.map((file,i)=>{
         let storageRef = storage.ref();
         var uploadTask = storageRef
           .child("photography/" + this.filesToUpload[i].name)
           .put(this.filesToUpload[i], metadata);

        return new Promise((resolve, reject)=>{
          uploadTask.on(
           firebase.storage.TaskEvent.STATE_CHANGED,
           (snapshot) => {
             this.progresses[i] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
            // Upload successfully, now get the download URL
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              this.filesToUpload[i].imageSrc = downloadURL;
              resolve(true)
              });
            }
         );
        })
      })

      Promise.all(filesAllPromises).then(resArr=>{ 
        this.filesToUpload.forEach(file=>{
          if(this.content.includes(file.name)){
            this.content = this.content.replace(file.name,file.imageSrc)
          }
        })

        db.collection("posts").add({
          title: this.title,
          category: this.category,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          imageFiles: JSON.stringify(this.filesToUpload),
          content: this.content
           })
        .then((docRef) => {
          alert("Upload is successful!");
          this.init();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
      })
    },
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files);
    },
    createImage(files) {
      var _this = this;
      files.forEach(file=>{
        var reader = new FileReader();
        reader.onload = (e) => {
          _this.images.push(e.target.result);
        };
        this.files.push(file);
        reader.readAsDataURL(file);
      })
      console.log('files=', this.files)
    },

    removeImage: function(index) {
      this.images.splice(index, 1);
    },

    copySrc: function(index) {
      const el = document.createElement('textarea');
      el.value = this.files[index].name;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },

    signoutHandler(){
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log('sign out')
        alert("Log out!");
        router.push("Admin");
      }).catch((error) => {
        // An error happened.
      });
    },
    getImgExif(index){
      let _this = this
      EXIF.getData(event.target, function() {
        let rawData = EXIF.getAllTags(this);
        let {ApertureValue, DateTime, ExposureBias, ExposureTime, ISOSpeedRatings, Model} = rawData;
        let formattedData = new Map();
        formattedData.set("Aperture", Math.round(ApertureValue*10)/10);
        formattedData.set("Date / Time", DateTime);
        formattedData.set("Exposure bias", Math.round(ExposureBias*10)/10);
        formattedData.set("Exposure time", ExposureTime);
        formattedData.set("ISO", ISOSpeedRatings);
        formattedData.set("Model", Model);

        let allMetaData = JSON.stringify((Object.fromEntries(formattedData.entries())));
      _this.files[index].exif = allMetaData;
      _this.files[index].resolution = [this.naturalWidth, this.naturalHeight]
    });

    }
  },
};
</script>

<style lang="scss">

  @import "../assets/css/app.scss";
  label {
    color: $color-text-grey;
    padding: 8px 0;
  }
  .group--container{
    width: 100%;
    display: flex;

    &__photo {
      width: 160px;
      height: 160px;
      position: relative;
      margin-right: 8px;
      img {
        position: absolute;
        object-fit: cover;
        left:0;
        top: 0;
        width: 160px;
        height: 160px;

      }
      button {
        font-weight: 500;
        display: block;
        position: relative;
        z-index: 300;
        left:0;
        top: 0;
        margin: 8px 8px 0 8px;
        padding: 5px 8px;
      }
    }
  }

  .btn--submit {
    background-color: $color-primary-yellow;
  }

  .btn--signout {
    background-color: transparent;
    color: white;
  }
</style>