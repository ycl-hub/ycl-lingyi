// 改为script引入压缩文件
// import { Message } from 'element-ui'
import { sessionStorage, localStorage } from '@/utils/storage'
import router from '@/router'
let CallListStorage = localStorage.get('listenCallList')
CallListStorage = CallListStorage ? CallListStorage[sessionStorage.get('TONE_sipUserInfo') ? sessionStorage.get('TONE_sipUserInfo').userName : ''] : null

const getDefaultState = () => {
  return {
    userAgent: null,
    callNumber: '',
    mediaType: '',
    isMeetingCall: false,
    callList: [],
    listenCallList: [],
    callListListen: CallListStorage || [],
    postionIndex: 0,
    callNumberList: [],
    isQuanXuanVideo: false,
    belong: 'map',
    currentTime: new Date().getTime() / 1000,
    connectStatus: '服务重连中...',
    callListStates: [{// 音视频状态
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    }],
    mapCallListStates: [{// 视频群呼状态
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    },
    {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    }],
    isPolling: false, // 是否在视频轮询
    isVideoMeet: false// 是否在视频会商
  }
}
const state = getDefaultState()
const mutations = {
  SET_UA_CONNECT: (state, val) => {
    state.connectStatus = val
  },
  UA_STOP: (state) => {
    if (state.userAgent) {
      state.userAgent.stop()
      state.userAgent = null
    }
  },
  SET_UA: (state, val) => {
    if (!state.userAgent) {
      state.userAgent = val
      // console.log(JSON.stringify(state.userAgent), 99999)
      // sessionStorage.set('TONE_userAgent', val)
    }
  },
  SET_CALL_LISTEN: (state, val) => {
    state.callListListen = val
  },
  SET_CALL_NUMBER: (state, val) => {
    state.callNumber = val
  },
  SET_MEDIA_TYPE: (state, val) => {
    state.mediaType = val
  },
  SET_IS_MEETING_CALL: (state, val) => {
    state.isMeetingCall = val
  },
  SET_CALL_LIST: (state, val) => {
    state.callList = val
  },
  SPLICE_CALL_LIST: (state, i) => {
    state.callList.splice(i, 1)
  },
  SET_LISTENCALL_LIST: (state, val) => {
    state.listenCallList = val
  },
  SET_POSTION_INDEX: (state, val) => {
    state.postionIndex = val
  },
  SET_QUANXUAN_VIDEO: (state, val) => {
    state.isQuanXuanVideo = val
  },
  SET_BELONG: (state, val) => {
    state.belong = val
  },
  SET_currentTime: (state, val) => {
    state.currentTime = val
  },
  SET_callListStates: (state, val) => {
    state.callListStates = val
  },
  SET_isPolling: (state, val) => {
    state.isPolling = val
  },
  SET_isVideoMeet: (state, val) => {
    state.isVideoMeet = val
  },
  SET_mapCallListStates: (state, val) => {
    state.mapCallListStates = val
  }
}
const actions = {
  UA_START({ commit, state }) {
    const userInfo = sessionStorage.get('TONE_sipUserInfo')
    if (!userInfo.userName) {
      this.$alert('用户信息被清除，请重新登录', '提示', {
        type: 'warning',
        callback: action => {
          router.push({ path: '/login' })
        }
      })
      return false
    }
    if (!state.userAgent) {
      // var socket = new JsSIP.WebSocketInterface('wss://' + userInfo.voipIP + ':7443')
      // var socket = new JsSIP.WebSocketInterface('wss://192.168.60.55:15674/tx')
      const TONE_voip = sessionStorage.get('TONE_voip')
      var socket = new JsSIP.WebSocketInterface(`wss://${TONE_voip.cmd.HOST}:${TONE_voip.cmd.PORT}/tx`)
      // var socket = new JsSIP.WebSocketInterface(`wss://${TONE_voip.cmd.HOST}:7443`)
      // var socket = new JsSIP.WebSocketInterface(`wss://120.211.112.161:7443`)
      var configuration = {
        sockets: [socket],
        uri: 'sip:' + userInfo.userName + '@' + userInfo.voipIP + ':' + userInfo.voipPort,
        password: userInfo.userPwd,
        cusContactName: '',
        register: true,
        contact_uri: 'sip:' + userInfo.userName + '@' + userInfo.voipIP + ';transport=ws'
      }
      const UA = new JsSIP.UA(configuration)
      commit('SET_UA', UA)
      // sessionStorage.set('userAgent', UA)
      state.userAgent.start()
      state.userAgent.on('disconnected', function(e) {
        // alert('连接已断开,请等待')
        console.log(e, 'disconnected')
        window.thisVueRoot.$emit('disconnected')
        setTimeout(() => {
          if (router.app._route.path === '/login') {
            return false
          }
          // 音视频服务连接失败提示优化
          // 成功不提示，失败分两种情况，1、自动断开重连的情况，5s内自动链接成功不提示，5s内未链接成功提示，
          // 2、可自动关闭，关闭提示，5分钟后未连接继续提示
          const timeGap = Number((new Date().getTime() / 1000) - state.currentTime)
          console.log(timeGap)
          if (timeGap > 10) {
            commit('SET_UA_CONNECT', '服务重连中...')
          }
        }, 0)
      })
      state.userAgent.on('connected', (e) => {
        // Message.closeAll()
        console.log(e, 'connected')
        // commit('SET_currentTime', Number(new Date().getTime() / 1000))
        // commit('SET_UA_CONNECT', '服务已连接')
      })
      state.userAgent.on('unregistered', (e) => {
        console.log(e, 'unregistered')
        commit('SET_UA_CONNECT', '服务重连中...')
      })
      state.userAgent.on('registered', (e) => {
        console.log(e, 'registered')
        commit('SET_currentTime', Number(new Date().getTime() / 1000))
        commit('SET_UA_CONNECT', '服务已连接')
      })
      state.userAgent.on('registrationFailed', (e) => {
        console.log(e, 'registrationFailed')
        commit('SET_UA_CONNECT', '服务重连中...')
      })
    }
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

