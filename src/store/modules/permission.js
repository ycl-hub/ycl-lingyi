import { asyncRoutes, constantRoutes } from '@/router'
// import { localStorage } from '@/utils/storage'
// import Cookies from 'js-cookie'
/**
 * Use meta.role to determine if the current user has permission
 * @param cluster_rules
 * @param route
 */

function hasPermission(cluster_rules, route) {
  if (route.meta && route.meta.cluster_rule) {
    return false
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param cluster_rules
 */
export function filterAsyncRoutes(routes, cluster_rules) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(cluster_rules, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, cluster_rules)
      }
      res.push(tmp)
    }
  })

  return res
}

// const state = {
//   routes: [],
//   addRoutes: []
// }
const getDefaultState = () => {
  return {
    routes: [], // 所有菜单
    addRoutes: [] // 动态添加的路由
  }
}
const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, cluster_rules) {
    return new Promise(resolve => {
      // let accessedRoutes
      // if (cluster_role.includes('admin')) {
      //   // 超级管理员拥有所有权限
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, cluster_rules)
      // }
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, cluster_rules)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
