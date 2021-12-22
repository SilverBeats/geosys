import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import './assets/css/global.css'
// 导入ui
// 导入echarts
import './plugins/echarts'
import './plugins/element'
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
