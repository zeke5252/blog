import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).mount('#app')

// 閱讀三點零的差異
// 要有後台上稿頁面
// 可留言
// 閱讀 noSql 的撰寫知識
// 解決 BootstrapVue 引入問題
// 設計404