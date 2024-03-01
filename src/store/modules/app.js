// import Cookies from 'js-cookie'
import { sessionStorage } from '@/utils/storage'
// const state = {
//   device: 'desktop',
//   mapType: sessionStorage.get('mapType') || 'BMAP_NORMAL_MAP',
//   imList: sessionStorage.get('imList') || [],
//   imListActiveId: sessionStorage.get('imListActiveId') || ''
// }
const getDefaultState = () => {
  return {
    device: 'desktop',
    mapType: sessionStorage.get('mapType') || 'BMAP_NORMAL_MAP',
    imList: sessionStorage.get('imList') || [],
    imListActiveId: sessionStorage.get('imListActiveId') || '',
    devlist: [],
    userTree: [],
    devTree: [],
    checkResourcelist: [],
    sceneType:sessionStorage.get('sceneType') || 'ThreeScene'
  }
}
const state = getDefaultState()
const mutations = {
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_MAP_TYPE: (state, val) => {
    state.mapType = val
    sessionStorage.set('mapType', val)
  },
  SET_IM_LIST: (state, val) => {
    state.imList = val
    sessionStorage.set('imList', val)
  },
  SET_IM_LIST_ACTIVE_ID: (state, val) => {
    state.imListActiveId = val
    sessionStorage.set('imListActiveId', val)
  },
  SET_devlist: (state, val) => {
    state.devlist = val
  },
  SET_devlist_push: (state, val) => {
    state.devlist.push(val)
  },
  SET_userTree: (state, val) => {
    state.userTree = val
  },
  SET_devTree: (state, val) => {
    state.devTree = val
  },
  SET_checkResourceList: (state, val) => {
    state.checkResourcelist = val
  },
  SET_SCENE_TYPE: (state, val) => {
    state.sceneType = val
    sessionStorage.set('sceneType', val)
  },
}

const actions = {
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
