<template>
  <form @submit.prevent>
    <div class="row justify-content-end">
      <div class="col-5 col-sm-2">
        <button type="button" class="btn col-12" @click="signOutHandler">
          Sign out
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-6 mb-4">
        <label for="formTitle" class="form-label">標題</label>
        <input v-model="title" type="text" class="form-control" id="formTitle" aria-label="Title" />
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-6 mb-4">
        <label for="formFile" class="form-label">上傳相片</label>
        <input @change="onFileChange" class="form-control" type="file" id="formFile" multiple />
      </div>
      <div class="group--container" :style="{ height: displayImages.length > 0 ? '30vh' : 'auto' }">
        <div class="group--container__photo" v-for="(image, index) in displayImages" :key="index">
          <img :src="image" />
          <button class="btn btn-primary m-0 mb-1 d-block py-1 px-2" @click="copySrc(index)">
            Copy
          </button>
          <button class="btn btn-primary m-0 mb-1 d-block py-1 px-2" @click="copySrc(index, true)">
            Paste to content
          </button>
          <button class="btn m-0 mb-1 d-block py-1 px-2 text-white bg-dark" @click="removeImage(index)">
            Remove
          </button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-6 col-sm-6 mb-4">
        <label for="formCategory" class="form-label">類別</label>
        <select v-model="category" class="form-select" aria-label="Default select example">
          <option value="photography">Photography</option>
          <option value="design">Design</option>
          <option value="programming">Programming</option>
          <option value="life">Life</option>
        </select>
      </div>
      <div class="col-6 col-sm-4 mb-4">
        <label class="form-label col-12">標記</label>
        <button @click="doMark('code')" class="btn btn-primary">
          <font-awesome-icon icon="code" />
        </button>
        <button @click="doMark('bold')" class="btn btn-primary mx-1">
          <font-awesome-icon icon="bold" />
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-10 mb-4">
        <label for="area-content" class="form-label">貼文內容</label>
        <textarea v-model="content" class="form-control fs-3" id="area-content" ref="areaContent" rows="15" cols="30"
          style="white-space: pre-wrap"></textarea>
      </div>
    </div>
    <button class="btn col-12 col-sm-2 mb-3 me-2" @click="setDraft(content)">
      Save draft
    </button>
    <button type="submit" class="btn btn-primary btn col-12 col-sm-2 mb-3" @click="submitHandler">
      Submit
    </button>
    <span v-for="progress in progresses" v-show="progress > 0" class="p-2" :key="progress">{{ progress }}</span>
  </form>
</template>

<script>
import { firebase } from '@firebase/app';
import { db } from '@/firebaseDB.js';
import { storage } from '../firebaseDB.js';
import { useStore } from 'vuex';
import router from '../router/';
import { defineComponent, ref, onMounted } from 'vue';
import { DATA_DB } from '@/store/types';

export default defineComponent({
  name: 'TheForm',
  setup() {
    const store = useStore(),
      title = ref(''),
      category = ref('photography'),
      content = ref(''),
      displayImages = ref([]),
      photoPool = ref([]), // all temporarily selected files
      photosToUpload = ref([]),
      progresses = ref([]),
      areaContent = ref(null);

    onMounted(() => {
      if (!store.state[DATA_DB]) {
        store.dispatch('getFirestoreDB').then(() => {
          init();
        });
      } else {
        init();
      }
    });

    const init = () => {
      title.value = '';
      category.value = 'photography';
      content.value = '';
      displayImages.value = [];
      photoPool.value = [];
      photosToUpload.value = [];
      progresses.value = [];
      getDraft();
    };

    const getDraft = () => {
      var docRef = db.collection('draft').doc('normal');
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data && data.content) {
              content.value = data.content;
            }
          }
        })
        .catch((error) => {
          console.error('Error getting document:', error);
        });
    };

    const setDraft = (val = '') => {
      if (!val) {
        console.error('Draft value cannot be empty');
        return;
      }
      let docRef = db.collection('draft').doc('normal');
      docRef
        .set({
          content: val,
        })
        .then(() => {
          if (val !== '') alert('Draft saved.');
        })
        .catch((error) => {
          console.error('Error setting document:', error);
        });
    };

    const onFileChange = (e) => {
      var localFiles = e.target.files || e.dataTransfer.files;
      if (!localFiles.length) return;
      localFiles.forEach((file, index) => {
        file.index = index;
        readFile(file);
      });
    };

    const readFile = (file) => {
      if (file === null || file === undefined) {
        console.error('Cannot read file: File object is null or undefined');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        if (e.target && e.target.result) {
          buildCanvasImg(e.target.result, file);
        } else {
          console.error(
            'Could not read file: The file object is missing the result property'
          );
        }
      });

      reader.addEventListener('error', (e) => {
        console.error('Could not read file: ', e.target.error);
      });

      reader.readAsDataURL(file);
    };

    const buildCanvasImg = (src, file) => {
      if (!src || !file) {
        console.error('Cannot build canvas image: Invalid arguments');
        return;
      }

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const afterW = 1600;
        const afterH = (image.height / image.width) * afterW;

        canvas.width = afterW;
        canvas.height = afterH;
        ctx.drawImage(image, 0, 0, afterW, afterH);

        const data = canvas.toDataURL('image/jpeg', 0.9);
        if (!displayImages?.value || !photoPool?.value) {
          console.error(
            'Cannot set image data: displayImages or photoPool is null or undefined'
          );
          return;
        }

        displayImages.value[file.index] = data;
        photoPool.value[file.index] = convertToFileObj(data, file);
        getImgExif(file.index);
      };
      image.src = src;
    };

    const convertToFileObj = (data, file) => {
      let arr = data.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], file.name, { type: mime });
    };

    const getImgExif = (index) => {
      EXIF.getData(event.target, function () {
        const {
          ApertureValue,
          DateTime,
          ExposureBias,
          ExposureTime,
          ISOSpeedRatings,
          Model,
        } = EXIF.getAllTags(this);

        const formattedData = {
          Aperture: ApertureValue
            ? (Math.round(ApertureValue * 10) / 10).toString()
            : '',
          'Date / Time': DateTime || '',
          'Exposure bias': ExposureBias
            ? (Math.round(ExposureBias * 10) / 10).toString()
            : '',
          'Exposure time': ExposureTime ? ExposureTime.toFixed(3) : '',
          ISO: ISOSpeedRatings || '',
          Model: Model || '',
        };

        const allMetaData = JSON.stringify(formattedData);

        if (photoPool.value[index]) {
          photoPool.value[index].exif = allMetaData;
          photoPool.value[index].resolution = [
            this.naturalWidth,
            this.naturalHeight,
          ];
        }
      });
    };

    const removeImage = (index) => {
      displayImages.value.splice(index, 1);
      photoPool.value.splice(index, 1);
    };

    const copySrc = (index, isPasteToContent) => {
      const el = document.createElement('textarea');
      el.value = ' ' + photoPool.value[index].name + ' ';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      isPasteToContent && pasteSrcToTextarea(el.value);
    };

    const pasteSrcToTextarea = (str) => {
      content.value += str;
    };

    const doMark = (style) => {
      let selectedStr;
      let { selectionStart, selectionEnd } = areaContent.value;
      selectedStr = content.value.slice(selectionStart, selectionEnd);
      if (selectedStr && selectedStr !== '') {
        content.value =
          content.value.slice(0, selectionStart) +
          `${style}S_${selectedStr}_${style}E` +
          content.value.slice(selectionEnd);
      }
    };

    const submitHandler = () => {
      if (!isValidated()) return;

      let uploadPhotosPromises;
      let postToUpload = {
        title: title.value,
        category: category.value,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        imageFiles: [],
        content: content.value,
      };
      const isPoolWithPhotos = photoPool.value.length > 0;
      if (isPoolWithPhotos) {
        photoPool.value.forEach((file) => {
          if (content.value.includes(file.name))
            photosToUpload.value.push(file);
        });
        uploadPhotosPromises = doUploadPhotos();
      }
      doUploadPost(isPoolWithPhotos, uploadPhotosPromises, postToUpload);
    };

    const isValidated = () => {
      if (title.value === '') {
        alert('Title is empty.');
        return false;
      } else {
        const isTitleExisted = store.getters.IS_POST_EXISTED(title.value);
        if (isTitleExisted) {
          alert('The title has been in use.');
          return false;
        }
      }
      return true;
    };

    const doUploadPhotos = () => {
      return photosToUpload.value.map((file, i) => {
        let storageRef = storage.ref();
        var uploadTask = storageRef
          .child('photography/' + photosToUpload.value[i].name)
          .put(photosToUpload.value[i], { contentType: 'image/png' });
        return new Promise((resolve) => {
          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
              progresses.value[i] =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  // console.log("Upload is paused");
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  // console.log("Upload is running");
                  break;
              }
            },
            (error) => {
              switch (error.code) {
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;
                // ...
                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break;
              }
            },
            getPhotoUrls.bind(this, uploadTask, i, resolve)
          );
        });
      });
    };

    const getPhotoUrls = (uploadTask, i, resolve) => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        photosToUpload.value[i].imageSrc = downloadURL;
        resolve(true);
      });
    };

    const doUploadPost = (isWithPhotos, promises, postToUpload) => {
      if (isWithPhotos) {
        Promise.all(promises).then(() => {
          // console.log("promises: ", promises);
          photosToUpload.value.forEach((_file) => {
            if (content.value.includes(_file.name)) {
              content.value = content.value.replace(_file.name, _file.imageSrc);
            }
          });
          postToUpload.content = content.value;
          postToUpload.imageFiles = JSON.stringify(photosToUpload.value);
          doUploadPostProto(postToUpload);
        });
      } else {
        doUploadPostProto(postToUpload);
      }
    };

    const doUploadPostProto = (postToUpload) => {
      db.collection('posts')
        .add(postToUpload)
        .then(() => {
          alert('Upload is successful!');
          setDraft();
          store.dispatch('getFirestoreDB').then(() => {
            router.push({ name: 'TheHome' });
          });
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
        });
    };

    const signOutHandler = () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful.
          alert('Log out!');
          router.push({ name: 'TheAdmin' });
        })
        .catch(() => {
          // An error happened.
        });
    };
    return {
      title,
      content,
      category,
      displayImages,
      photoPool,
      progresses,
      photosToUpload,
      areaContent,
      setDraft,
      onFileChange,
      removeImage,
      copySrc,
      doMark,
      submitHandler,
      signOutHandler,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/scss/app.scss';

form-label {
  color: $color-text-grey;
  padding: 8px 0;
}

.group--container {
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
      left: 0;
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
