<template>
  <form v-on:submit.prevent>
    <div class="row justify-content-end">
      <div class="col-5 col-sm-2">
        <button type="button" class="col-12" style="background-color: transparent; color: white; border: 1px solid !important" v-on:click="signoutHandler">
          Sign out
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-4 mb-4">
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
      <div class="col-12 col-sm-4 mb-4">
        <label for="formFile" class="form-label">上傳相片</label>
        <input v-on:change="onFileChange" class="form-control" type="file" id="formFile" multiple/>
      </div>
      <div class="group--container" :style="images.length>0 && 'height: 30vh'">
        <div class="group--container__photo" v-for="(image, index) in images" :key="index">
          <img :src="image"/>
          <button class="m-2 mb-0 d-block" @click="copySrc(index)">Copy name</button>
          <button class="m-2 mb-0 d-block" @click="removeImage(index)">Remove</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-4 mb-4">
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
      <div class="col-12 col-sm-6 mb-4">
        <label for="area-content" class="form-label">貼文內容</label>
        <textarea v-model="content" class="form-control fs-3" id="area-content" rows="15" cols="30" style="white-space: pre-wrap" />
      </div>
    </div>
    <button class="btn col-12 col-sm-2 mb-3 me-2" style="background-color: transparent; color: white; outline: 1px solid !important; outline-offset: -1px;" v-on:click="doDraft(content)">
      Save draft
    </button>
    <button type="submit" class="btn col-12 col-sm-2 mb-3" v-on:click="submitHandler">
      Submit
    </button>
    <span v-for="progress in progresses" v-show="progress>0" class="p-2" :key="progress">{{progress}}</span>
  </form>
</template>

<script>
import { firebase } from "@firebase/app";
import { db } from "@/firebaseDB.js";
import { storage } from "../firebaseDB.js";
import { useStore } from "vuex";
import router from '../router/';
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { GET_DB, GET_DB_ALL, IS_POST_EXISTED, DATA_DB } from "@/store/types";

export default {
  name: "Form",
  setup(props, context) {
    const store = useStore();

    const title = ref("");
    const category = ref("photography");
    const content = ref("");
    const created= ref("");
    const images= ref([]);
    const photoPool= ref([]); // all temporarily selected files 
    const photosToUpload= ref([]);
    const progresses= ref([]);
    const GET_DB_ALL = computed(()=> store.getters.GET_DB())

    onMounted(() => {
      
      if (!store.state[DATA_DB]) {
        store.dispatch("getFirestoreDB").then((res) => {
        init();
        });
      } else {
        init();
      }
      }
    );

    const init = () =>{
      title.value= "";
      category.value= "photography";
      content.value= "";
      images.value= [];
      photoPool.value= [];
      photosToUpload.value= [];
      progresses.value= [];

      // Set draft
      var docRef = db.collection("draft").doc("normal");
      docRef.get().then((doc) => {
          if (doc.data().content) {
              content.value = doc.data().content;
          } else {
              // doc.data() will be undefined in this case
          }
      }).catch((error) => {
          console.log("Error getting document:", error);
      });
    };
    // Select photos from the local disk.
    const onFileChange = (e) => {
      var localFiles = e.target.files || e.dataTransfer.files;
      
      if (!localFiles.length) return;
      localFiles.forEach((file, index)=>{
        console.log('file: ', file);
        
        // 讀取檔案
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          let src = e.target.result;
          
          // 讀取圖片
          let image = new Image();
          image.src = src;
          image.onload = function(){
            // 建立 canvas 壓縮圖片
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let imageW = image.width;
            let imageH = image.height;
            let afterW = 1024;
            let afterH = imageH / imageW * afterW;
            canvas.width = afterW;
            canvas.height = afterH;
            ctx.drawImage(image, 0, 0, afterW, afterH);
            let data = canvas.toDataURL('image/jpeg', 0.8);
            console.log('data: ', data);

            // 把base64轉回檔案
            var arr = data.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
              u8arr[n] = bstr.charCodeAt(n);
            }
            file = new File([u8arr], file.name, {type:mime});
            photoPool.value.push(file);
            getImgExif(index);
            images.value.push(data);
          };
        };
      });
    };

    const removeImage = (index) => {
      images.value.splice(index, 1);
    };

    const copySrc = (index) => {
      const el = document.createElement('textarea');
      el.value = " " + photoPool.value[index].name + " ";
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
        formattedData.set("Aperture", ApertureValue ? Math.round(ApertureValue*10)/10 : "");
        formattedData.set("Date / Time", DateTime ? DateTime : "");
        formattedData.set("Exposure bias", ExposureBias ? Math.round(ExposureBias*10)/10  : "");
        formattedData.set("Exposure time", ExposureTime ? ExposureTime.toFixed(3) : "");
        formattedData.set("ISO", ISOSpeedRatings ? ISOSpeedRatings : "");
        formattedData.set("Model", Model ? Model : "");
        let allMetaData = JSON.stringify((Object.fromEntries(formattedData.entries())));

        photoPool.value[index].exif = allMetaData;
        photoPool.value[index].resolution = [this.naturalWidth, this.naturalHeight]
      });
    };

    const doDraft = (val = '') => {
      var docRef = db.collection("draft").doc("normal");
      docRef.set({
        content: val
      }).then((doc) => {
          if(val !== '') alert("Draft saved.");
      }).catch((error) => {
          console.log("Error getting document:", error);
      });
    };

    const submitHandler = () => {
      let isTitleExisted = store.getters.IS_POST_EXISTED(title.value);
      if(isTitleExisted) {
        alert("The title has been in use.");
        return;
      };

      let dataToUpload = {
        title: title.value,
        category: category.value,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        imageFiles: [],
        content: content.value 
      };

      // If photos are selected in the text content, push them to photoUpload.
      if(photoPool.value.length > 0){
        console.log('with photos');
        photoPool.value.forEach((file, index)=>{
          if(content.value.includes(file.name)) photosToUpload.value.push(file)
        });

        var metadata = { contentType: "image/png"};

        let filesAllPromises = photosToUpload.value.map((file,i)=>{
          let storageRef = storage.ref();
          var uploadTask = storageRef
            .child("photography/" + photosToUpload.value[i].name)
            .put(photosToUpload.value[i], metadata);
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
                // get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                photosToUpload.value[i].imageSrc = downloadURL;
                console.log('url=', downloadURL);
                resolve(true);

                });
              }
          )
          })
        });

        Promise.all(filesAllPromises).then(resArr=>{ 
          console.log("photosToUpload.value=", photosToUpload.value)
          photosToUpload.value.forEach(_file=>{
            if(content.value.includes(_file.name)){
              content.value = content.value.replace(_file.name,_file.imageSrc);
            }
          });
          console.log("dataToUpload.imageFiles=", dataToUpload.imageFiles)
          dataToUpload.content = content.value;
          dataToUpload.imageFiles = JSON.stringify(photosToUpload.value);
                    console.log("dataToUpload.imageFiles=", dataToUpload.imageFiles)

          db.collection("posts").add(dataToUpload)
          .then((docRef) => {
            alert("Upload is successful!");
            doDraft();
            init();
            router.push("/");
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
        });

      } else {
        console.log('no photos');
        db.collection("posts").add(dataToUpload)
          .then((docRef) => {
            alert("Upload is successful!");
            doDraft();
            init();
            router.push("/");
          })
          .catch((error) => {
            console.error("Error adding document: ", error);
          });
      };
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
      photoPool,
      photosToUpload,
      progresses,
      doDraft,
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
        position: relative;
      }
    }
  }
</style>