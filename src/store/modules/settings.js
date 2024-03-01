import defaultSettings from '@/settings'
import { queryId } from '../../utils'
import { sessionStorage } from '@/utils/storage'
const { showSettings, fixedHeader, sidebarLogo } = defaultSettings
let settings = []
if (sessionStorage.get('TONE_ConfigUserInfo')) {
  settings = sessionStorage.get('TONE_ConfigUserInfo').FEATURE_SETTING
}
const mapState = queryId('csdt', settings).active === '在线地图' ? 'onLine' : 'offLine'
const jwd = queryId('centetPoint', settings)
const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  routeEnter: false,
  bannerTexts: [],
  mapState: mapState || 'onLine',
  center: { 'lng': Number(jwd.longitude), 'lat': Number(jwd.latitude) } || { 'lng': 116.401969, 'lat': 39.91405 },
  zoom: Number(queryId('mapScale', settings).value) || 12,
  settings: sessionStorage.get('TONE_ConfigUserInfo'),
  version: 'v2.4.2'
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  },
  SET_ROUTEENTER: (state, val) => {
    state.routeEnter = val
  },
  SET_BANNERTEXTS: (state, val) => {
    state.bannerTexts = val
  },
  SET_MAPSTATE: (state, val) => {
    state.mapState = val
  },
  SET_CENTER: (state, val) => {
    state.center = val
  },
  SET_ZOOM: (state, val) => {
    state.zoom = val
  },
  SET_SETTINGS: (state, val) => {
    state.settings = val
  },
  SET_VERSION: (state, val) => {
    state.version = val
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

