<template>
	<Loading v-if="postsCollector.length === 0" />
	<div v-else class="home">
		<div class="d-flex justify-content-end fixed-top pe-3 pe-md-4 mt-1">
			<select class="search--input py-1 px-3 me-3" v-model="category" id="categoryLabel" aria-label="categoryLabel">
				<option value="" selected>全部分類</option>
				<option value="photography">照相</option>
				<option value="programming">程式</option>
				<option value="life">生活</option>
			</select>
			<label id="searchLabel" for="searchInput">
				<font-awesome-icon icon="search" />
			</label>
			<input class="search--input p-1" v-model="keyword" type="text" list="keywordListOptions" id="searchInput" aria-label="searchInput" />
		</div>
		<datalist id="keywordListOptions">
			<option v-for="post in GET_DB_ALL" :key="post.title" :value="post.title" />
		</datalist>
		<div class="row row-cols-1 row-cols-md-3 g-4 pe-sm-0 pe-md-2">
			<div class="col" v-for="post in keywordPosts.length > 0 ? keywordPosts : postsCollector" :key="post.title">
				<button v-if="isLogin" class="removeButton" @click="removePost(post)">
					<font-awesome-icon icon="trash" />
				</button>
				<router-link :to="`/posts/${post.title}`" style="color: white" :class="post.imageFiles.length > 0 ? 'card styleImg border-0' : 'card styleImg styleTxt'">
					<div v-if="post.imageFiles.length > 0" style="overflow: hidden">
						<Photo :Url="PhotoAPI.getSrc(post.imageFiles, true)" :Images="post.imageFiles" :showExif="false" :showBorder="false" />
					</div>
					<div class="card-body">
						<div class="createdDate">{{ getConvertTime(post.created) }}</div>
						<h5 class="card-title">{{ post.title }}</h5>
						<p class="card-text my-2">
							{{ getFirstParagraph(post.content) }}
							<em class="moreContent">more >> </em>
						</p>
					</div>
				</router-link>
			</div>
		</div>
		<Loading v-if="isInMoreStatus && postsCollector.length !== 0" />
	</div>
</template>

<script>
	import { db, storage } from "@/firebaseDB.js";
	import { firebase } from "@firebase/app";
	import { ref, watch, onBeforeUnmount, onMounted } from "vue";
	import { useStore } from "vuex";
	import { convertTime, ContentAPI, PhotoAPI } from "../utils/common.js";
	import _ from "lodash";

	import Photo from "../components/Photo.vue";
	import Loading from "../components/Loading.vue";

	export default {
		name: "TheHome",

		setup() {
			const store = useStore();
			const isLogin = ref();
			const postsAmount = ref(7);
			const postsTimes = ref(0);
			const isInMoreStatus = ref(false);
			const category = ref("");
			const keyword = ref("");

			const postsCollector = ref([]);
			const keywordPosts = ref([]);
			const GET_DB_ALL = ref(() => store.getters.GET_DB_ALL());

			firebase.auth().onAuthStateChanged(function (user) {
				if (user != null) {
					isLogin.value = true;
				} else {
					isLogin.value = false;
				}
			});

			const filterPost = (posts) => {
				if (category.value !== "") {
					let filteredResults = posts.filter((post) => post["category"] === category.value);
					return filteredResults;
				} else {
					return posts;
				}
			};

			const loadMore = () => {
				// console.log("loadMore");
				const getWindowHeight = document.documentElement.clientHeight || document.body.clientHeight;
				const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
				const scrollHeight = document.documentElement.scrollHeight;
				const isMouseNearAllContentBottom = scrollTop + getWindowHeight >= (scrollHeight * 4) / 5;

				if (!isInMoreStatus.value && isMouseNearAllContentBottom) {
					isInMoreStatus.value = true;
					setTimeout(() => {
						let postsToAdd;
						isInMoreStatus.value = false;
						postsToAdd = store.getters.GET_DB_SCROLL({
							times: postsTimes.value,
							amount: postsAmount.value,
						});
						postsCollector.value = postsCollector.value.concat(filterPost(postsToAdd));
						postsTimes.value++;
						if (postsToAdd.length === 0) document.removeEventListener("scroll", loadMore, true);
					}, 1000);
				}
			};

			store.dispatch("getFirestoreDB").then(() => {
				loadMore();
			});

			document.addEventListener("scroll", loadMore, true);

			const getConvertTime = (time) => convertTime(time, false);

			const getFirstParagraph = (content) => {
				let contentsArr;
				contentsArr = ContentAPI.splitPost(content);
				if (!contentsArr) return "No contents!";
				else if (!Array.isArray(contentsArr)) return contentsArr;
				else {
					let result = contentsArr.find((el) => el.substring(0, 4) !== "http");
					return ContentAPI.limitStrSize(result, 150);
				}
			};

			const removePost = (post) => {
				let posts = db.collection("posts");
				let query = posts.where("title", "==", post.title);
				query
					.get()
					.then((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							posts
								.doc(doc.id)
								.delete()
								.then(() => {
									store.dispatch("getFirestoreDB").then(() => {
										postsCollector.value = GET_DB_ALL.value();
									});
								})
								.then(() => {
									post.imageFiles.length !== 0 && removeDBImages(post);
								})
								.catch((error) => {
									console.error("Error removing document: ", error);
								});
						});
					})
					.catch((error) => {
						console.log("Error getting documents: ", error);
					});
			};

			const removeDBImages = (post) => {
				if (post.imageFiles === 0) return;
				let imagesUrls = PhotoAPI.getSrc(post.imageFiles);
				// Need to use new RegExg() instead of .match(/.../) to avoid error in js
				let re = new RegExp("(?<=%2F).*(?=,)|(?<=%2F).*(?=\\?)", "g");
				let imagesToDelete = imagesUrls.map((url) => url.match(re)[0]);
				let filesAllPromises = imagesToDelete.map((image) => {
					let storageRef = storage.ref();
					storageRef.child(`${post.category}/${image}`).delete();
				});

				Promise.all(filesAllPromises).then(() => {
					alert("The post has been deleted!");
				});
			};

			const stopWatchCategory = watch(category, () => {
				keyword.value = "";
				postsCollector.value = filterPost(GET_DB_ALL.value());
			});

			const stopWatchKeyword = watch(keyword, (val) => {
				_.debounce(function () {
					keywordPosts.value = postsCollector.value.filter((post) => post.title.includes(val));
				}, 300)();
			});

      onMounted(() => {
				console.log("process.env.NODE_ENV=", process.env.NODE_ENV);
			});

			onBeforeUnmount(() => {
				stopWatchKeyword();
				stopWatchCategory();
				document.removeEventListener("scroll", loadMore, true);
			});

			return {
				isLogin,
				isInMoreStatus,
				PhotoAPI,
				category,
				keyword,
				removePost,
				getConvertTime,
				getFirstParagraph,
				postsCollector,
				keywordPosts,
				GET_DB_ALL,
			};
		},

		components: {
			Photo,
			Loading,
		},
	};
</script>

<style lang="scss">
	@import "../assets/css/app.scss";

	.createdDate {
		font-size: 11px;
		position: absolute;
		right: 0;
		bottom: 0;
		text-align: center;
		letter-spacing: 4px;
		padding: 0 0 0 10px;
		margin: 5px 10px 8px 5px;
		border-left: 1px dotted $color-text-grey;
		font-weight: 300;
		color: $color-primary-yellow;
	}

	#searchLabel {
		width: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.moreContent {
		font-size: 10px;
		border: $color-primary-yellow 1px dotted;
		border-radius: 10px;
		color: $color-primary-yellow;
		padding: 1px 5px 2px 6px;
		margin-top: 10px;
	}

	.removeButton {
		border-radius: 20px !important;
		position: relative;
		transform: translate(-50%, 50%);
		z-index: 1;
	}

	@media (hover: hover) {
		.styleImg:hover {
			outline: $color-primary-yellow 8px solid;
		}

		.styleImg:hover img[src*="https"] {
			transform: scale(1.2);
		}
	}

	.styleImg {
		background-color: $color-card-bg;
		outline: $color-bg 0px solid;
		transition: 0.2s ease-out;
		animation: cardAnimation ease-out 0.4s;
		overflow: hidden;
		border-radius: 0;
		height: 100%;

		.card-text {
			line-height: 2.1;
			letter-spacing: 0.5px;
			color: $color-text-grey;

			&::before {
				content: "";
				background-color: $color-primary-yellow;
				position: absolute;
				margin-top: 7px;
				margin-left: -8px;
				width: 2px;
				height: 12px;
			}
		}

		// Select every <img> element whose src attribute value contains the substring "https"
		img[src*="https"] {
			transform: scale(1);
			height: 24vh;
			object-fit: cover;
			transition: 0.2s ease-out;
		}
	}

	.styleTxt {
		background-color: $color-card-bg-notice;
		transition: 0.2s ease-out;
		height: 100%;
		animation: cardAnimation ease-out 0.4s;
		overflow: hidden;
		border-width: 0px;
		border-radius: 0px;

		.card-text {
			line-height: 2.1;
			letter-spacing: 0.5px;
			color: #888;

			&::before {
				content: "";
				background-color: $color-primary-yellow;
				position: absolute;
				margin-top: 7px;
				margin-left: -8px;
				width: 2px;
				height: 12px;
			}
		}
	}

	.card-body {
		position: relative;
		padding: 26px 20px 30px 20px;
	}

	.loading {
		border-top: white 2px solid;
		border-bottom: white 2px solid;
		width: 80px;
		display: flex;
		justify-content: center;
		animation: moreAnimation ease 0.3s;
		animation-fill-mode: forwards;
		position: relative;
		margin: auto;
		top: 40vh;

		&::before {
			content: "";
			position: absolute;
			background-color: white;
			width: 12px;
			height: 4px;
			left: 0;
			top: -6px;
		}

		div {
			width: 22px;
			height: 22px;
			border: 8px solid $color-primary-yellow;
			border-radius: 16px;
			position: relative;
			animation: loadAnimation ease 1s infinite;

			&::after {
				content: "";
				position: absolute;
				background-color: white;
				width: 4px;
				height: 4px;
				right: -10px;
				top: -10px;
				border-radius: 10px;
			}
		}
	}

	.search--input {
    	width: 30%;
		max-width: 200px;
		height: 36px;
		background-color: $color-bg;
		opacity: 0.8;
		color: white;
		border-bottom: 1px white solid !important;
	}

	.search--img {
		width: 36px;
		height: 36px;
		background-color: $color-bg;
	}

	@keyframes cardAnimation {
		from {
			top: -30px;
			opacity: 0;
		}
		to {
			top: 0px;
			opacity: 1;
		}
	}

	@keyframes loadAnimation {
		0% {
			border-width: 2px;
		}
		50% {
			border-width: 8px;
		}
		100% {
			border-width: 2px;
		}
	}
</style>
