import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import '@/assets/css/style.css'
import '@/assets/fonts/font/iconfont.css'
import VueDragResize from 'vue-drag-resize'
import VueEasyTree from '@wchbrad/vue-easy-tree'
import md5 from 'js-md5'
Vue.prototype.$md5 = md5
// import x2js from 'x2js' // xml数据处理插件
// Vue.prototype.$x2js = new x2js() // 全局方法挂载

// import 'x2js'
// //或使用es6语法(直接在组件中require('x2js')):
// const x2js = require('x2js')

import App from './App'
import store from './store'
import router from './router'
import api from './api'

import '@/icons' // icon
import '@/permission' // 路由权限全局控制

import * as filters from './filters' // global filters
import permission from '@/directive/permission/index.js' // 按钮权限判断指令全局注册
Vue.directive('permission', permission)
import elDragDialog from '@/directive/el-drag-dialog'
Vue.directive('elDragDialog', elDragDialog)
import out from '@/directive/out'
Vue.directive('out', out)
import move from '@/directive/move'
Vue.directive('move', move)
import has from '@/directive/has'
Vue.directive('has', has)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
Vue.use(api)
Vue.prototype.$md5 = md5
Vue.component('vue-drag-resize', VueDragResize)
Vue.component('VueEasyTree', VueEasyTree)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
