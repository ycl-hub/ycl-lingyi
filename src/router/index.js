import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/views/dashboard/index'
import { queryPath } from '@/utils'
import { sessionStorage } from '@/utils/storage'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
// 路由组件化

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  // {
  //   path: '/charts',
  //   component: () => import('@/views/charts/index'),
  //   hidden: true
  // },
  {
    path: '/',
    component: Layout,
    name: 'Layout'
  },
  {
    path: '*',
    component: () => import('@/views/404')
  }
  // }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/dashboard',
    component: Dashboard
  },
  {
    path: '/mars3d',
    component: () => import('@/views/mars3d')
  }, {
    path: '/map',
    id: 'zhdd',
    component: () => import('@/views/map/index')
  },
  {
    path: '/videoScheduling',
    id: 'spdd',
    component: () => import('@/views/videoScheduling/index copy.vue')
  },
  {
    path: '/situation',
    component: () => import('@/views/situation')
  },
  {
    path: '/mapPlotting',
    id: 'dtbh',
    component: () => import('@/views/mapPlotting')
  },
  {
    path: '/record',
    id: 'lsjl',
    component: () => import('@/views/record')
  },
  {
    path: '/setting',
    id: 'pzgl',
    component: () => import('@/views/setting')
  }
]

const createRouter = (v = constantRoutes) => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: v
})

const router = createRouter()
export function resetRouter(v) {
  const newRouter = createRouter(v)
  router.matcher = newRouter.matcher // reset router
}
// 不用body去scroll改用#app，解决弹层显示overflow:hidden,在有、无滚动条情况下navbar固定定位宽度抖动
router.afterEach(route => {
  // 由于跳转动画css都是设置了500ms，这里路由后置钩子可以设置500ms延迟，不会有问题，如果不要动画这里可去掉500延迟
  setTimeout(() => {
    document.getElementById('app').scrollTo(0, 0)
  }, 500)
})

export function patchRouter(settings) {
  // 路由权限划分
  const map = new Map()
  for (const item of asyncRoutes) {
    if (!map.has(item.id) && Array.isArray(settings)) {
      const show = settings.find(v => v.id === item.id)
      if ((show && show.isOpen && show.show && queryPath(item.id, sessionStorage.get('moduleInfo'))?.DISPLAY) || (show && !('isOpen' in show)) || !show) {
        if(show){
          item.text=show.text
        }
        if(item?.path==="/dashboard"){
          item.text='首页'
        }
        map.set(item.id, item)
      }
    }
  }
  // 划分出有权限的路由
  constantRoutes.forEach(item => {
    if (item.path === '/') {
      item.children = [...map.values()]
    }
  })
  return constantRoutes
}

export default router
