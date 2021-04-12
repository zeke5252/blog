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
      <div class="group--container" :style="images.length>0 && 'height: 30vh'">
        <div class="group--container__photo" v-for="(image, index) in images" :key="index">
          <div v-if="images[index]" >
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
const _this = this;

export default {
  name: "Form",

  setup(props, context) {
    const title = ref("");
    const category = ref("photography");
    const content = ref("");
    const created= ref("");
    const images= ref([]);
    const files= ref([]);
    const filesToUpload= ref([]);
    const progresses= ref([]);

    onMounted(()=>{
      init();
    });

    const init = () =>{
      title.value= "";
      category.value= "photography";
      content.value= "";
      images.value= [];
      files.value= []; // all temporarily selected files 
      filesToUpload.value= [];
      progresses.value= []
    };

    // Select photos from the local disk.

    const onFileChange = (e) => {
      var _files = e.target.files || e.dataTransfer.files;
      if (!_files.length) return;
      createImage(_files);
    };

    const createImage = (docs) => {
      docs.forEach(doc=>{
        var reader = new FileReader();
        reader.onload = (e) => {
          images.value.push(e.target.result);
        };
        files.value.push(doc);
        reader.readAsDataURL(doc);
      })
    };

    const removeImage = (index) => {
      images.value.splice(index, 1);
    };

    const copySrc = (index) => {
      const el = document.createElement('textarea');
      el.value = " " + files.value[index].name + " ";
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };

    const getImgExif = (index) => {
      EXIF.getData(event.target, function() {
        let rawData = EXIF.getAllTags(event.target);
        let {ApertureValue, DateTime, ExposureBias, ExposureTime, ISOSpeedRatings, Model} = rawData;
        let formattedData = new Map();
        formattedData.set("Aperture", Math.round(ApertureValue*10)/10);
        formattedData.set("Date / Time", DateTime);
        formattedData.set("Exposure bias", Math.round(ExposureBias*10)/10);
        formattedData.set("Exposure time", ExposureTime);
        formattedData.set("ISO", ISOSpeedRatings);
        formattedData.set("Model", Model);

        let allMetaData = JSON.stringify((Object.fromEntries(formattedData.entries())));
        files.value.[index].exif = allMetaData;
        files.value[index].resolution = [this.naturalWidth, this.naturalHeight]
    });
    };

    const submitHandler = () => {
      files.value.forEach((_file, index)=>{
        if(content.value.includes(_file.name)){
          filesToUpload.value.push(_file)
        }
      })
      // do validation
      // 1. Upload photo
      // 2. get the firestorage path
      // 3. save it to imageSrc.
      var metadata = {
        contentType: "image/png",
      };

      let filesAllPromises = filesToUpload.value.map((file,i)=>{
         let storageRef = storage.ref();
         var uploadTask = storageRef
           .child("photography/" + filesToUpload.value[i].name)
           .put(filesToUpload.value[i], metadata);

        return new Promise((resolve, reject)=>{
          uploadTask.on(
           firebase.storage.TaskEvent.STATE_CHANGED,
           (snapshot) => {
             progresses.value[i] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
              filesToUpload.value[i].imageSrc = downloadURL;
              resolve(true)
              });
            }
         )
        })
      })

      Promise.all(filesAllPromises).then(resArr=>{ 
        filesToUpload.value.forEach(_file=>{
          if(content.value.includes(_file.name)){
            content.value = content.value.replace(_file.name,_file.imageSrc)
          }
        })

        db.collection("posts").add({
          title: title.value,
          category: category.value,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          imageFiles: JSON.stringify(filesToUpload.value),
          content: content.value 
           })
        .then((docRef) => {
          alert("Upload is successful!");
          init();
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
      })
    };

    const signoutHandler = () => {
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log('sign out')
        alert("Log out!");
        router.push("Admin");
      }).catch((error) => {
        // An error happened.
      });
    };

    return {
      title,
      category,
      content,
      created,
      images,
      files,
      filesToUpload,
      progresses,
      submitHandler,
      onFileChange,
      removeImage,
      copySrc,
      signoutHandler,
      getImgExif
    };
  },
};
</script>

<style scoped lang="scss">

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