<template>
	<form v-on:submit.prevent>
		<div class="row justify-content-end">
			<div class="col-5 col-sm-2">
				<button type="button" class="col-12" style="background-color: transparent; color: white; border: 1px solid !important" v-on:click="signOutHandler">Sign out</button>
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
				<input v-on:change="onFileChange" class="form-control" type="file" id="formFile" multiple />
			</div>
			<div class="group--container" :style="displayImages.length > 0 && 'height: 30vh'">
				<div class="group--container__photo" v-for="(image, index) in displayImages" :key="index">
					<img :src="image" />
					<button class="m-0 mb-1 d-block py-1 px-2" @click="copySrc(index)">Copy</button>
					<button class="m-0 mb-1 d-block py-1 px-2" @click="copySrc(index, true)">Paste to content</button>
					<button class="m-0 mb-1 d-block py-1 px-2 text-white bg-dark" @click="removeImage(index)">Remove</button>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-6 col-sm-6 mb-4">
				<label for="formFile" class="form-label">類別</label>
				<select v-model="category" class="form-select" aria-label="Default select example">
					<option value="photography">Photography</option>
					<option value="design">Design</option>
					<option value="programming">Programming</option>
					<option value="life">Life</option>
				</select>
			</div>
			<div class="col-6 col-sm-4 mb-4">
				<label class="form-label col-12">標記</label>
				<button @click="doMark('code')">
					<font-awesome-icon icon="code" />
				</button>
				<button @click="doMark('bold')" class="mx-1">
					<font-awesome-icon icon="bold" />
				</button>
			</div>
		</div>
		<div class="row">
			<div class="col-12 col-sm-10 mb-4">
				<label for="area-content" class="form-label">貼文內容</label>
				<textarea v-model="content" class="form-control fs-3" id="area-content" ref="areaContent" rows="15" cols="30" style="white-space: pre-wrap" />
			</div>
		</div>
		<button class="btn col-12 col-sm-2 mb-3 me-2" style="background-color: transparent; color: white; outline: 1px solid !important; outline-offset: -1px" v-on:click="setDraft(content)">Save draft</button>
		<button type="submit" class="btn col-12 col-sm-2 mb-3" v-on:click="submitHandler">Submit</button>
		<span v-for="progress in progresses" v-show="progress > 0" class="p-2" :key="progress">{{ progress }}</span>
	</form>
</template>

<script>
	import { firebase } from "@firebase/app";
	import { db } from "@/firebaseDB.js";
	import { storage } from "../firebaseDB.js";
	import { useStore } from "vuex";
	import router from "../router/";
	import { ref, onMounted } from "vue";
	import { DATA_DB } from "@/store/types";

	export default {
		name: "Form",
		setup() {
			const store = useStore(),
				title = ref(""),
				category = ref("photography"),
				content = ref(""),
				created = ref(""),
				displayImages = ref([]),
				photoPool = ref([]), // all temporarily selected files
				photosToUpload = ref([]),
				progresses = ref([]),
				areaContent = ref(null);

			onMounted(() => {
				if (!store.state[DATA_DB]) {
					store.dispatch("getFirestoreDB").then(() => {
						init();
					});
				} else {
					init();
				}
			});

			const init = () => {
				title.value = "";
				category.value = "photography";
				content.value = "";
				displayImages.value = [];
				photoPool.value = [];
				photosToUpload.value = [];
				progresses.value = [];
				getDraft();
			};

			const getDraft = () => {
				var docRef = db.collection("draft").doc("normal");
				docRef
					.get()
					.then((doc) => {
						if (doc.data().content) {
							content.value = doc.data().content;
						} else {
							// doc.data() will be undefined in this case
						}
					})
					.catch((error) => {
						console.log("Error getting document:", error);
					});
			};

			const setDraft = (val = "") => {
				var docRef = db.collection("draft").doc("normal");
				docRef
					.set({
						content: val,
					})
					.then(() => {
						if (val !== "") alert("Draft saved.");
					})
					.catch((error) => {
						console.log("Error getting document:", error);
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
				let reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = (e) => {
					let src = e.target.result;
					buildCanvasImg(src, file);
				};
			};

			const buildCanvasImg = (src, file) => {
				let image = new Image();
				image.src = src;
				image.onload = function () {
					let canvas = document.createElement("canvas");
					let ctx = canvas.getContext("2d");
					let imageW = image.width;
					let imageH = image.height;
					let afterW = 1600;
					let afterH = (imageH / imageW) * afterW;
					canvas.width = afterW;
					canvas.height = afterH;
					ctx.drawImage(image, 0, 0, afterW, afterH);
					let data = canvas.toDataURL("image/jpeg", 0.9);
					displayImages.value[file.index] = data;
					photoPool.value[file.index] = convertToFileObj(data, file);
					getImgExif(file.index);
				};
			};

			const convertToFileObj = (data, file) => {
				let arr = data.split(","),
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
					let rawData = EXIF.getAllTags(event.target);
					let { ApertureValue, DateTime, ExposureBias, ExposureTime, ISOSpeedRatings, Model } = rawData;
					let formattedData = new Map();
					formattedData.set("Aperture", ApertureValue ? Math.round(ApertureValue * 10) / 10 : "");
					formattedData.set("Date / Time", DateTime ? DateTime : "");
					formattedData.set("Exposure bias", ExposureBias ? Math.round(ExposureBias * 10) / 10 : "");
					formattedData.set("Exposure time", ExposureTime ? ExposureTime.toFixed(3) : "");
					formattedData.set("ISO", ISOSpeedRatings ? ISOSpeedRatings : "");
					formattedData.set("Model", Model ? Model : "");
					let allMetaData = JSON.stringify(Object.fromEntries(formattedData.entries()));
					if (photoPool.value[index]) {
						photoPool.value[index].exif = allMetaData;
						photoPool.value[index].resolution = [this.naturalWidth, this.naturalHeight];
					}
				});
			};

			const removeImage = (index) => {
				displayImages.value.splice(index, 1);
				photoPool.value.splice(index, 1);
			};

			const copySrc = (index, isPasteToContent) => {
				const el = document.createElement("textarea");
				el.value = " " + photoPool.value[index].name + " ";
				document.body.appendChild(el);
				el.select();
				document.execCommand("copy");
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
				if (selectedStr && selectedStr !== "") {
					content.value = content.value.slice(0, selectionStart) + `${style}S_${selectedStr}_${style}E` + content.value.slice(selectionEnd);
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
						if (content.value.includes(file.name)) photosToUpload.value.push(file);
					});
					uploadPhotosPromises = doUploadPhotos();
				}
				doUploadPost(isPoolWithPhotos, uploadPhotosPromises, postToUpload);
			};

			const isValidated = () => {
				if (title.value === "") {
					alert("Title is empty.");
					return false;
				} else {
					const isTitleExisted = store.getters.IS_POST_EXISTED(title.value);
					if (isTitleExisted) {
						alert("The title has been in use.");
						return false;
					}
				}
				return true;
			};

			const doUploadPhotos = () => {
				return photosToUpload.value.map((file, i) => {
					let storageRef = storage.ref();
					var uploadTask = storageRef.child("photography/" + photosToUpload.value[i].name).put(photosToUpload.value[i], { contentType: "image/png" });
					return new Promise((resolve) => {
						uploadTask.on(
							firebase.storage.TaskEvent.STATE_CHANGED,
							(snapshot) => {
								progresses.value[i] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
				db.collection("posts")
					.add(postToUpload)
					.then(() => {
						alert("Upload is successful!");
						setDraft();
						store.dispatch("getFirestoreDB").then(() => {
							router.push({ path: "/" });
						});
					})
					.catch((error) => {
						console.error("Error adding document: ", error);
					});
			};

			const signOutHandler = () => {
				firebase
					.auth()
					.signOut()
					.then(() => {
						// Sign-out successful.
						alert("Log out!");
						router.push("Admin");
					})
					.catch(() => {
						// An error happened.
					});
			};
			return {
				title,
				category,
				content,
				created,
				displayImages,
				photoPool,
				photosToUpload,
				progresses,
				setDraft,
				submitHandler,
				onFileChange,
				removeImage,
				copySrc,
				signOutHandler,
				getImgExif,
				doMark,
				areaContent,
			};
		},
	};
</script>

<style scoped lang="scss">
	@import "../assets/css/app.scss";
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
