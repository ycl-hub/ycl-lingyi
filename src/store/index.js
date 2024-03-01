import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import permission from './modules/permission'
import settings from './modules/settings'
import user from './modules/user'
import sip from './modules/sip'
import mq from './modules/mq'
import audioMeet from './modules/audioMeet'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    settings,
    user,
    sip,
    mq,
    audioMeet
  },
  getters
})

export default store
