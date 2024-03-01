// import JsSIP from 'jssip'
// 改为script引入压缩文件
// import { Message } from 'element-ui'
// import { sessionStorage } from '@/utils/storage'
// import router from '@/router'
const getDefaultState = () => {
  return {
    mqIsConnected: false,
    mqResponseData: null,
    client: null
  }
}
const state = getDefaultState()
const mutations = {
  SET_MqIsConnected: (state, val) => {
    state.mqIsConnected = val
  },
  SET_MqResponseData: (state, val) => {
    state.mqResponseData = val
  },
  SET_CLIENT: (state, val) => {
    state.client = val
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

