import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '../view/Welcome/index'
Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default new Router({
  routes: [
    { 
      path: '/', 
      name: 'welcome', 
      component: Welcome 
    },
    {
      path: '/nav',
      name: 'nav',
      component: ()=>import('../view/Nav/index')
    },
    {
      path: '/param_input',
      name: 'param_input_view',
      component: () => import('@/view/ParamInput/index')
    },
    {
      path: '/history',
      name: 'history_view',
      component: () => import('@/view/History/index')
    },
    {
      path: '/garbage',
      name: 'garbage_view',
      component: () => import('@/view/Garbage/index')
    },
    {
      path: '/param_set',
      name: 'param_set',
      component: () => import('@/view/ParamSet/index')
    },
    {
      path: '/ri',
      name: 'ri_set',
      component: () => import('@/view/RiSet/index')
    }
  ]
})
