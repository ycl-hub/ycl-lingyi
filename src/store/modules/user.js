// import { resetRouter } from '@/router'
// import { localStorage } from '@/utils/storage'
const getDefaultState = () => {
  return {
    list: null,
    TONE_sipUserInfo: null,
    userRouteInfo: null,
    userUnitIdAuth: [], // 用户 单位数据权限
    userListInfo: []
  }
}
const state = getDefaultState()
const mutations = {
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_USER_ROUTE: (state, data) => {
    state.userRouteInfo = data
  },
  SET_USER_AUTH: (state, data) => {
    state.userUnitIdAuth = data
  },
  SET_USER_LIST_INFO: (state, data) => {
    state.userListInfo = data
  }
}
const actions = {
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

