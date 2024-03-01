import { mapGetters } from 'vuex'
import { sessionStorage, localStorage } from '@/utils/storage'
import { checkDeviceSupport } from '@/utils/checkDeviceSupport'
import { parseTime, getTime } from '@/utils'
import { cloneDeep } from 'lodash'
import { endCallState, muteOrUnmuteState, newSessionState, confirmedState, endedState, failedState, rejectState, callListListenState, voiceOrUnVoiceState } from '../../utils/controlSipState'
import { setInterval, setTimeout } from 'core-js'
import axios from 'axios'
const qs = require('qs')
import voice from '@/assets/images/voice.png'
import unvoice from '@/assets/images/unvoice.png'
import mute from '@/assets/images/mute.png'
import unmute from '@/assets/images/unmute.png'
export default {
  name: 'Sip',
  data() {
    return {
      endCallState, muteOrUnmuteState, newSessionState, confirmedState, endedState, failedState, rejectState, callListListenState, voiceOrUnVoiceState,
      TONE_voip: sessionStorage.get('TONE_voip'),
      sr: '/devSr'
      // mixins数据不共享，放到vuex中
      // callNumber: '',
      // mediaType: '',
      // isMeetingCall: false,
      // callList: [],
      // listenCallList: [],
      // postionIndex: 0
    }
  },
  computed: {
    ...mapGetters([
      'userAgent',
      'callNumber',
      'mediaType',
      'isMeetingCall',
      'callList',
      'listenCallList',
      'postionIndex',
      'isQuanXuanVideo',
      'belong',
      'callListListen',
      'isPolling',
      'callListStates',
      'userListInfo',
      'mapCallListStates'
    ])
  },
  created() {
    if (!this.userAgent) {
      this.$store.dispatch('sip/UA_START')
      this.listenCall()
    }
  },
  methods: {
    // 拨打电话
    makeCall({ callNumber, audioOrVideo, isMeeting = false, isQuanXuanVideo = false, belong = 'map', Polling = false, confirmedFunc = () => {} }) {
      if (!this.userAgent.isConnected() || !this.userAgent.isRegistered()) return
      if (this.isPolling && !Polling) {
        this.$message.closeAll()
        this.$message.warning('正在进行视频轮询，无法进行其他音视频通信!')
        return // 视频轮询期间不能进行任何通话
      }
      const userInfo = sessionStorage.get('TONE_sipUserInfo')
      if (callNumber + '' === userInfo.userName + '') {
        this.$message.closeAll()
        this.$message.warning('不可以呼叫自己！')
        return false
      }
      if (!isMeeting && Array.isArray(this.callList) && this.callList.length > 0 && this.callList.findIndex(item => item.to === callNumber + '') !== -1) {
        this.$message.closeAll()
        this.$message.warning('不可以重复呼叫对方！')
        return false
      }
      this.$store.commit('sip/SET_MEDIA_TYPE', audioOrVideo)
      checkDeviceSupport().then((res) => {
        const options = {
          'mediaConstraints': {
            'audio': res.hasMicrophone,
            'video': res.hasWebcam
          },
          'rtcOfferConstraints': {
            'offerToReceiveAudio': audioOrVideo === 'video' || audioOrVideo === 'audio',
            'offerToReceiveVideo': audioOrVideo === 'video'
          },
          'eventHandlers': {
            // 'progress':   function(data){ console.log(data, 'progressCall') },
            // 'failed':     function(data){ console.log(data, 'failedCall') },
            // 'confirmed':  function(data){ console.log(data, new Date().getTime(), 'confirmedCall') },
            'confirmed': confirmedFunc
            // 'ended':      function(data){ console.log(data, 'endedCall') }
          }
        }
        if (!res.hasMicrophone && !res.hasWebcam) { // 1、没有音频设备、没有摄像头
          this.$message.closeAll()
          this.$message({
            showClose: true,
            message: '检测到您的电脑没有摄像头和音频输入设备!',
            type: 'warning',
            duration: 0
          })
          options['mediaConstraints']['audio'] = res.hasMicrophone
          options['mediaConstraints']['video'] = res.hasWebcam
        } else if (res.hasMicrophone && !res.hasWebcam) { // 2、有音频设备、没有摄像头
          if (!res.isMicrophoneAlreadyCaptured) { // 2.1、浏览器禁止了音频设备
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站麦克风使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.hasWebcam
          } else { // 2.1、浏览器未禁止了音频设备
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.hasWebcam
          }
        } else if (!res.hasMicrophone && res.hasWebcam) { // 3、没有音频设备、有摄像头
          if (!res.isWebcamAlreadyCaptured) { // 3.1、浏览器禁止了摄像头
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站摄像头使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
          } else { // 3.2、浏览器未禁止了摄像头
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.hasWebcam
          }
        } else { // 4、有音频设备、有摄像头
          if (!res.isWebcamAlreadyCaptured && res.isMicrophoneAlreadyCaptured) { // 4.1、浏览器禁止了摄像头
            if (audioOrVideo === 'video') {
              this.$message.closeAll()
              this.$message({
                showClose: true,
                message: '请先允许浏览器对该网站摄像头使用的设置，并重新加载页面!',
                type: 'warning',
                duration: 0
              })
            }
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
          } else if (!res.isMicrophoneAlreadyCaptured && res.isWebcamAlreadyCaptured) { // 4.2、浏览器禁止了麦克风
            if (audioOrVideo === 'audio') {
              this.$message.closeAll()
              this.$message({
                showClose: true,
                message: '请先允许浏览器对该网站麦克风使用的设置，并重新加载页面!',
                type: 'warning',
                duration: 0
              })
            }
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = audioOrVideo === 'video'
          } else if (!res.isMicrophoneAlreadyCaptured && !res.isWebcamAlreadyCaptured) { // 4.3、浏览器禁止了麦克风和摄像头
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站麦克风及摄像头使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
            // 都设置为true，首次进入网站弹出询问窗口，这个是jssip源码里面已经写入了，这里jssip有个问题，是点击允许了，打电话，接通不了，需要重载页面就好了
            // options['mediaConstraints']['audio'] = true
            // options['mediaConstraints']['video'] = true
          } else { // 4.4、均未禁止
            options['mediaConstraints']['audio'] = audioOrVideo === 'video' || audioOrVideo === 'audio'
            options['mediaConstraints']['video'] = audioOrVideo === 'video'
          }
        }
        console.log(options, 78)
        this.$store.commit('sip/SET_IS_MEETING_CALL', isMeeting)
        this.$store.commit('sip/SET_QUANXUAN_VIDEO', isQuanXuanVideo)
        this.$store.commit('sip/SET_BELONG', belong)
        const cn = isMeeting ? callNumber : ('sip:' + callNumber + '@' + userInfo.voipIP + ':' + userInfo.voipPort)
        this.$store.commit('sip/SET_CALL_NUMBER', cn)
        console.log(this.callNumber, options, '拨打信息', this.callList)
        this.userAgent.call(this.callNumber, options)
      })
    },
    // 点击关闭清除sessionId即关闭并销毁视频窗口(结束通话)
    endCall(sessionId, session, isBye, index) {
      console.log('endCall', sessionId, session, isBye, index)
      // isBay用来控制监听远程的挂断还是pc端本地的挂断
      if (isBye) {
        session.terminate()
      }
      for (let i = 0; i < this.callList.length; i++) {
        if (this.callList[i].sessionId === sessionId) {
          var mediaElement = document.getElementById(sessionId)
          if (mediaElement) {
            mediaElement.pause()
            mediaElement.ontimeupdate = null
            mediaElement.srcObject = null
          }
          this.$store.commit('sip/SPLICE_CALL_LIST', i)
          break
        }
      }
      this.endCallState(sessionId, 'callListStates')// 视频调度数据状态
      this.endCallState(sessionId, 'mapCallListStates')// 视频调度数据状态
    },
    // 添加媒体流
    setupRemoteMedia(session, elementId) {
      // var remoteStream = new MediaStream()
      // var mediaElement = document.getElementById(elementId)
      // remoteStream = session.connection.getRemoteStreams()[0]
      // if (mediaElement) {
      //   mediaElement.srcObject = remoteStream
      //   mediaElement.play()
      // }
      const stream = new MediaStream()
      var mediaElement = document.getElementById(elementId)
      const receivers = session.connection?.getReceivers()
      if (receivers) receivers.forEach((receiver) => stream.addTrack(receiver.track))
      if (mediaElement) {
        mediaElement.srcObject = stream
        const playPromise = mediaElement.play()
        if (playPromise !== undefined) {
          // 防止播放报错
          playPromise.then(() => {
            mediaElement.play()
          }).catch(err => console.log(err))
        }
      }
    },
    // 禁言/解除禁言
    muteOrUnmute(item) {
      var session = item.session
      var state = session.isMuted()
      const findIndex = this.callList.findIndex(v => v.sessionId === item.sessionId)
      if (state.audio === true || state.video === true) {
        session.unmute()
        this.$set(this.callList[findIndex], 'mState', false)
        this.muteOrUnmuteState('callListStates', item, false)
        this.muteOrUnmuteState('mapCallListStates', item, false)
      } else {
        session.mute()
        this.$set(this.callList[findIndex], 'mState', true)
        this.muteOrUnmuteState('callListStates', item, true)
        this.muteOrUnmuteState('mapCallListStates', item, true)
      }
    },
    // 静音、解除静音
    voiceOrUnVoice(item) {
      var sessionId = item.sessionId
      this.voiceOrUnVoiceState('callListStates', item)
      this.voiceOrUnVoiceState('mapCallListStates', item)
      for (var i = 0; i < this.callList.length; i++) {
        if (this.callList[i].sessionId === sessionId) {
          // 右下角语音通话提示
          if (this.callList[i].voiceState) {
            this.$set(this.callList[i], 'voiceState', false)
            document.getElementById(sessionId).volume = 0
          } else {
            this.$set(this.callList[i], 'voiceState', true)
            document.getElementById(sessionId).volume = 1
          }
          break
        }
      }
    },
    // 保持/非保持
    holdOrUnhold(item) {
      const session = item.session
      var state = session.isOnHold()
      console.log(state, 2)
      // const findIndex = this.callList.findIndex(v => v.sessionId === item.sessionId)
      if (!state.local) {
        session.hold(
          {
            'useUpdate': true
          }
        )
        // this.$set(this.callList[findIndex], 'mState', false)
      }
      if (state.local) {
        session.unhold(
          {
            'useUpdate': true,
            'extraHeaders': ['X-Foo: foo', 'X-Bar: bar']
          }
        )
        // this.$set(this.callList[findIndex], 'mState', true)
      }
    },
    // 监听来电
    listenCall() {
      var _this = this
      var h = this.$createElement
      const userInfo = sessionStorage.get('TONE_sipUserInfo')
      this.userAgent.on('newRTCSession', (data) => {
        console.log(data, 'newRTCSession')
        var originator = data.originator
        var session = data.session
        var sessionId = session._id
        var request = data.request.body
        const startTime = new Date()
        var type = originator === 'remote' ? (request.indexOf('video') > -1 ? 'video' : 'audio') : _this.mediaType
        var obj = {
          sessionId: sessionId,
          session: session,
          type: type,
          timer: 0, // 通话时长
          state: '呼叫中', // 通话状态
          from: data.request.from._uri._user,
          to: originator === 'remote' ? userInfo.userName : data.request.to._uri._user,
          isQuanXuanVideo: _this.isQuanXuanVideo,
          belong: originator === 'remote' ? cloneDeep(_this.$route.path.split('/')[1]) : _this.belong, // 动态获取当前的路由 若只在makeCall 呼叫时获取当前this.belong，接听切换路由到下个界面会有Bug 接听不到通话
          voiceState: true
        }
        // 登录随锐账号
        // axios.post(`${this.sr}/api/v3/user/login`, qs.stringify({
        //   appId: 'beb7da4ced7c42a085c3c99697f9aa42',
        //   account: this.TONE_voip.cmd.POLICE_ID,
        //   pwd: this.$md5(this.TONE_voip.cmd.POLICE_ID),
        //   type: '1'
        // })).then((res) => {
        //   this.srToken = res.data.data.token
        //   // 获取改账号下的会议列表，用于判断该账号有没有创建该账号为会议号的会议
        //   axios.post(`${this.sr}/api/v3/conference/get`, qs.stringify({
        //     appId: 'beb7da4ced7c42a085c3c99697f9aa42',
        //     token: res.data.data.token,
        //     thirdConfId: obj.from,
        //   })).then((response) => {
        //     console.log(response, 123)
        //   }).catch(function(error) {
        //     console.log(error)
        //   })
        // }).catch(function(error) {
        //   console.log(error)
        // })
        // 判断是否重复呼叫某一个号码, 重复护呼叫则不执行一下代码
        if (_this.listenCallList.some((val) => { return val.to === obj.to && val.from === obj.from })) {
          return false
        }
        _this.listenCallList.push(obj)
        const isLocalVideo = originator === 'local' && type === 'video' // 主动呼叫的视频
        const isRemoteVideo = originator === 'remote' && type === 'video' // 对方呼叫的视频
        _this.newSessionState(obj.belong.indexOf('videoScheduling') !== -1, obj, type, originator, 'callListStates', false)
        _this.newSessionState(obj.belong.indexOf('isVideoGroupCall') !== -1, obj, type, originator, 'mapCallListStates', false)
        const notify = _this.$notify({
          title: (type === 'video' ? '视频' : '音频') + '电话',
          message: h('div', null, [
            h('div', {
              attrs: {
                class: 'w260 user-info'
              }
            }, [
              h('span',
                originator === 'remote' ? (_this.getName(data.request.from.uri.user)) : (_this.getName(data.request.to.uri.user))
              ),
              h('span', {
                attrs: {
                  id: type === 'audio' ? sessionId + 'timer' : '',
                  class: 'timer'
                }
              }, obj.timer ? getTime(obj.timer) : '')
            ]
            ),
            h('div', {
              attrs: {
                class: 'w260 text-center user-info',
                id: sessionId + 'state'
              }
            }, originator === 'remote' ? (type === 'video' ? '视频' : '音频') + '来电' : '呼叫中',
            ),
            h('audio', {
              attrs: {
                id: type === 'audio' ? sessionId : ''
              }
            }),
            h('div', {
              class: 'text-center'
            }, [
              // 接听
              h('span', {
                attrs: {
                  class: 'el-icon-phone agree',
                  'data-sessionid': sessionId,
                  'data-type': type,
                  'data-session': session
                },
                style: {
                  display: originator === 'remote' ? 'inline-block' : 'none'
                },
                on: {
                  click: _this.agree
                }
              }),
              // 禁言
              h('span', {
                attrs: {
                  class: 'agree',
                  'data-sessionid': sessionId,
                  'data-type': type,
                  'data-session': session,
                  id: sessionId + 'mute'
                },
                style: {
                  display: 'none',
                  backgroundImage: 'url(' + mute + ')',
                  backgroundSize: '20px 20px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: 'translateY(12px)'
                },
                on: {
                  click: _this.microphone
                }
              }),
              // 取消禁言
              h('span', {
                attrs: {
                  class: 'reject',
                  'data-sessionid': sessionId,
                  'data-type': type,
                  'data-session': session,
                  id: sessionId + 'unmute'
                },
                style: {
                  display: 'none',
                  backgroundImage: 'url(' + unmute + ')',
                  backgroundSize: '20px 20px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: 'translateY(12px)'
                },
                on: {
                  click: _this.microphone
                }
              }),
              // 静音
              h('span', {
                attrs: {
                  class: 'agree',
                  'data-sessionid': sessionId,
                  'data-type': type,
                  'data-session': session,
                  id: sessionId + 'voice'
                },
                style: {
                  display: 'none',
                  backgroundImage: 'url(' + voice + ')',
                  backgroundSize: '20px 20px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: 'translateY(12px)'
                },
                on: {
                  click: _this.voiceHandle
                }
              }),
              // 取消静音
              h('span', {
                attrs: {
                  class: 'reject',
                  'data-sessionid': sessionId,
                  'data-type': type,
                  'data-session': session,
                  id: sessionId + 'unvoice'
                },
                style: {
                  display: 'none',
                  backgroundImage: 'url(' + unvoice + ')',
                  backgroundSize: '20px 20px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: 'translateY(12px)'
                },
                on: {
                  click: _this.voiceHandle
                }
              }),
              // 挂断
              h('span', {
                attrs: {
                  class: 'el-icon-phone reject',
                  'data-sessionid': session.id,
                  'data-type': type,
                  'data-ismeeting': _this.isMeetingCall
                },
                on: {
                  click: function(event) {
                    console.log(session.isEnded())
                    session.isEnded() ? (originator === 'local' ? notify.close() : '') : _this.reject(event)
                    // originator==='local' ? notify.close() : ''
                    // _this.reject(event)
                  }
                }
              })
            ])
          ]),
          duration: 0,
          position: 'bottom-right',
          showClose: false
        })
        if (obj.from.search('8878') !== -1) {
          // 该逻辑为是否接听电话为对讲
          // 自动接听、不现实接听弹窗
          notify.close()
        }
        // if (obj.from.search('8858') !== -1) {
        //   // 该逻辑为是否接听电话为会议
        // }
        _this.isMeetingCall ? notify.close() : ''
        _this.isQuanXuanVideo ? notify.close() : ''
        obj.belong.indexOf('videoScheduling') !== -1 && isLocalVideo ? notify.close() : ''
        obj.belong.indexOf('isVideoGroupCall') !== -1 && isLocalVideo ? notify.close() : ''
        session.on('progress', (e) => {
          if (session.connection) {
            var remoteStream = new MediaStream()
            var mediaElement = document.getElementById('early')
            remoteStream = session.connection.getRemoteStreams()[0]
            if (mediaElement && remoteStream) {
              mediaElement.srcObject = remoteStream
              mediaElement.play()
            }
          }
        })
        session.on('failed', function(data) {
          console.log(data, 'failed')
          const userName = sessionStorage.get('TONE_sipUserInfo').userName
          const result = _this.listenCallList.find(item => item.sessionId === session._id)
          _this.failedState(session, data, isRemoteVideo, 'callListStates', 5000, false)
          _this.failedState(session, data, isRemoteVideo, 'mapCallListStates', 5000, false)
          _this.failedState(session, data, originator === 'remote', 'callList')
          if (data.originator === 'remote' &&
          (data.cause === 'Rejected' ||
          data.message.status_code === 404 ||
          data.message.status_code === 480
          )
          ) {
            data.cause === 'Rejected' ? document.getElementById(sessionId + 'state').innerText = '对方正忙' : ''
            console.log((new Date().getTime() - startTime.getTime()) / 1000, 666)
            if ((new Date().getTime() - startTime.getTime()) / 1000 > 58) {
              data.message.status_code === 480 ? document.getElementById(sessionId + 'state').innerText = '呼叫超时' : ''
            } else {
              data.message.status_code === 480 ? document.getElementById(sessionId + 'state').innerText = '您拨打的号码未在线' : ''
            }
            data.message.status_code === 404 ? document.getElementById(sessionId + 'state').innerText = '您拨打的号码是空号' : ''
            setTimeout(() => {
              notify.close()
              for (let i = 0; i < _this.listenCallList.length; i++) {
                if (_this.listenCallList[ i].sessionId === session.id) {
                  _this.listenCallList.splice(i, 1)
                  break
                }
              }
              for (let i = 0; i < _this.callList.length; i++) {
                if (_this.callList[i].sessionId === session.id) {
                  _this.callList.splice(i, 1)
                  break
                }
              }
            }, 5000)
          } else {
            notify.close()
            for (let i = 0; i < _this.listenCallList.length; i++) {
              if (_this.listenCallList[ i].sessionId === session.id) {
                _this.listenCallList.splice(i, 1)
                break
              }
            }
            for (let i = 0; i < _this.callList.length; i++) {
              if (_this.callList[i].sessionId === session.id) {
                _this.callList.splice(i, 1)
                break
              }
            }
          }
          if (result && result.from === userName) {
            // 若是自己呼叫不计入未接来电
            return
          }
          _this.callListListenState(result, userName, startTime)
        })
        session.on('confirmed', function(data) {
          console.log(data, 'confirmed')
          document.getElementById(sessionId + 'state').innerText = '通话中'
          // 广播不展示禁言按钮
          if (data.originator === 'remote' && data.ack.from._uri._user.search('8868') !== -1) {
            document.getElementById(sessionId + 'mute').style.display = 'none'
          } else {
            document.getElementById(sessionId + 'mute').style.display = 'inline-block'
          }
          // 接通显示静音按钮
          document.getElementById(sessionId + 'voice').style.display = 'inline-block'
          for (let i = 0; i < _this.listenCallList.length; i++) {
            if (_this.listenCallList[i].sessionId === sessionId) {
              var obj = _this.listenCallList.splice(i, 1)
              _this.callList.push(obj[0])
              // 接听成功后 更改对应数据的状态
              _this.confirmedState('mapCallListStates', sessionId, isLocalVideo, obj, type, session)
              _this.confirmedState('callListStates', sessionId, isLocalVideo, obj, type, session)
              _this.confirmedState('callList', sessionId, false, obj, type, session)
              setTimeout(() => {
                _this.$nextTick(() => {
                  _this.setupRemoteMedia(obj[0].session, obj[0].sessionId)
                })
              }, 10)
              break
            }
          }
          if (type === 'video') {
            notify.close()
          }
          if (data.originator === 'remote' && data.ack.from._uri._user.search('8858') !== -1) {
            // 语音会议来电，将会议列表中没有会议的来电弹框展示
            _this.$api.common.getMeetingList({
              userId: userInfo.userName,
              type: 2,
              userPwd: _this.$md5(userInfo.userPwd)
            }).then((res) => {
              const flag = res.data.some((meet) => {
                return meet.Conference_Id === data.ack.from._uri._user
              })
              flag ? notify.close() : ''
            }).catch((err) => {
              console.log(err)
            })
          }
        })
        session.on('ended', function(data) {
          console.log(data, 'end')
          if (data.originator === 'local') {
            notify ? notify.close() : ''
          }
          // notify.close()
          // 每次挂断后将是否为会议初始化为false，避免上一次呼出（会议/对讲）后，状态为true，下一次接听就不会显示接听按钮的问题
          _this.$store.commit('sip/SET_IS_MEETING_CALL', false)
          if (_this.isPolling) {
            _this.$root.$emit('pollingStateChange', {
              id: session._request.to._uri.user,
              time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
              state: 'failed'
            })
          }
          if (data.originator === 'remote') {
            _this.endedState(session, 'callListStates', isRemoteVideo)
            _this.endedState(session, 'mapCallListStates', isRemoteVideo, false, 5000, false)
            _this.endedState(session, 'callList', originator === 'remote', false, 5000, true)
            // 音频对方挂断、显示对方正忙，5s之后删去通话信息，并关闭弹窗
            document.getElementById(sessionId + 'state').innerText = '对方挂断'
            setTimeout(() => {
              notify.close()
              for (let i = 0; i < _this.callList.length; i++) {
                if (_this.callList[i].sessionId.search(data.message.call_id) !== -1) {
                  var mediaElement = document.getElementById(_this.callList[i].sessionId)
                  if (mediaElement) {
                    mediaElement.ontimeupdate = null
                    mediaElement.pause()
                    mediaElement.srcObject = null
                    const arr = cloneDeep(_this.callList)
                    arr.splice(i, 1)
                    _this.$store.commit('sip/SET_CALL_LIST', [])
                    _this.$store.commit('sip/SET_CALL_LIST', arr)
                  }
                }
              }
            }, 5000)
          }
        })
      })
    },
    // 接听来电
    agree(event) {
      console.log('agree')
      var datasets = event.target.dataset
      var type = datasets.type
      var sessionId = datasets.sessionid
      checkDeviceSupport().then((res) => {
        const options = {
          'mediaConstraints': {
            'audio': res.hasMicrophone,
            'video': res.hasWebcam
          },
          'rtcOfferConstraints': {
            'offerToReceiveAudio': type === 'video' || type === 'audio',
            'offerToReceiveVideo': type === 'video'
          }
        }
        if (!res.hasMicrophone && !res.hasWebcam) { // 1、没有音频设备、没有摄像头
          options['mediaConstraints']['audio'] = res.hasMicrophone
          options['mediaConstraints']['video'] = res.hasWebcam
        } else if (res.hasMicrophone && !res.hasWebcam) { // 2、有音频设备、没有摄像头
          if (!res.isMicrophoneAlreadyCaptured) { // 2.1、浏览器禁止了音频设备
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站麦克风使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.hasWebcam
          } else { // 2.1、浏览器未禁止了音频设备
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.hasWebcam
          }
        } else if (!res.hasMicrophone && res.hasWebcam) { // 3、没有音频设备、有摄像头
          if (!res.isWebcamAlreadyCaptured) { // 3.1、浏览器禁止了摄像头
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站摄像头使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
          } else { // 3.2、浏览器未禁止了摄像头
            options['mediaConstraints']['audio'] = res.hasMicrophone
            options['mediaConstraints']['video'] = res.hasWebcam
          }
        } else { // 4、有音频设备、有摄像头
          if (!res.isWebcamAlreadyCaptured && res.isMicrophoneAlreadyCaptured) { // 4.1、浏览器禁止了摄像头
            if (type === 'video') {
              this.$message.closeAll()
              this.$message({
                showClose: true,
                message: '请先允许浏览器对该网站摄像头使用的设置，并重新加载页面!',
                type: 'warning',
                duration: 0
              })
            }
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
          } else if (!res.isMicrophoneAlreadyCaptured && res.isWebcamAlreadyCaptured) { // 4.2、浏览器禁止了麦克风
            if (type === 'audio') {
              this.$message.closeAll()
              this.$message({
                showClose: true,
                message: '请先允许浏览器对该网站麦克风使用的设置，并重新加载页面!',
                type: 'warning',
                duration: 0
              })
            }
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = type === 'video'
          } else if (!res.isMicrophoneAlreadyCaptured && !res.isWebcamAlreadyCaptured) { // 4.3、浏览器禁止了麦克风和摄像头
            this.$message.closeAll()
            this.$message({
              showClose: true,
              message: '请先允许浏览器对该网站麦克风及摄像头使用的设置，并重新加载页面!',
              type: 'warning',
              duration: 0
            })
            options['mediaConstraints']['audio'] = res.isMicrophoneAlreadyCaptured
            options['mediaConstraints']['video'] = res.isWebcamAlreadyCaptured
            // 都设置为true，首次进入网站弹出询问窗口，这个是jssip源码里面已经写入了，这里jssip有个问题，是点击允许了，打电话，接通不了，需要重载页面就好了
            // options['mediaConstraints']['audio'] = true
            // options['mediaConstraints']['video'] = true
          } else { // 4.4、均未禁止
            options['mediaConstraints']['audio'] = type === 'video' || type === 'audio'
            options['mediaConstraints']['video'] = type === 'video'
          }
        }
        console.log(options, 789)
        for (var i = 0; i < this.listenCallList.length; i++) {
          if (this.listenCallList[i].sessionId === sessionId) {
            var obj = this.listenCallList[i]
            obj.session.answer(options)
            // this.listenCallList.splice(i, 1)
            break
          }
        }
        event.target.style.display = 'none'
      })
    },
    // 禁言、解除禁言按钮
    microphone(event) {
      var datasets = event.target.dataset
      var sessionId = datasets.sessionid
      for (var i = 0; i < this.callList.length; i++) {
        if (this.callList[i].sessionId === sessionId) {
          var obj = this.callList[i]
          this.muteOrUnmute(obj)
          const audioState = obj.session.isMuted().audio
          // 右下角语音通话提示
          if (audioState) {
            document.getElementById(sessionId + 'mute').style.display = 'none'
            document.getElementById(sessionId + 'unmute').style.display = 'inline-block'
          } else {
            document.getElementById(sessionId + 'mute').style.display = 'inline-block'
            document.getElementById(sessionId + 'unmute').style.display = 'none'
          }
          break
        }
      }
    },
    // 静音、解除静音
    voiceHandle(event) {
      var datasets = event.target.dataset
      var sessionId = datasets.sessionid
      for (var i = 0; i < this.callList.length; i++) {
        if (this.callList[i].sessionId === sessionId) {
          // 右下角语音通话提示
          if (this.callList[i].voiceState) {
            this.$set(this.callList[i], 'voiceState', false)
            document.getElementById(sessionId).volume = 0
            document.getElementById(sessionId + 'voice').style.display = 'none'
            document.getElementById(sessionId + 'unvoice').style.display = 'inline-block'
          } else {
            this.$set(this.callList[i], 'voiceState', true)
            document.getElementById(sessionId).volume = 1
            document.getElementById(sessionId + 'voice').style.display = 'inline-block'
            document.getElementById(sessionId + 'unvoice').style.display = 'none'
          }
          break
        }
      }
    },
    // 拒绝/挂断来电
    reject(event) {
      console.log('reject')
      var datasets = event.target.dataset
      // var type = datasets.type
      var sessionId = datasets.sessionid
      var isMeeting = datasets.ismeeting
      if (isMeeting && isMeeting.toString() === 'true') {
        // this.controlMeeting('killAll')
        // this.meetingAcitve.state = false
      }
      for (let i = 0; i < this.listenCallList.length; i++) {
        if (this.listenCallList[i].sessionId === sessionId) {
          // 状态码 403 603 为挂断
          if (this.listenCallList[i].session.isEstablished()) {
            this.listenCallList[i].session.terminate()
          } else {
            this.listenCallList[i].session.terminate({
              status_code: 403
            })
          }
          this.listenCallList.splice(i, 1)
          break
        }
      }
      for (let i = 0; i < this.callList.length; i++) {
        if (this.callList[i].sessionId === sessionId) {
          // 状态码 403 603 为挂断
          if (this.callList[i].session.isEstablished()) {
            this.callList[i].session.terminate()
          } else {
            this.callList[i].session.terminate({
              status_code: 403
            })
          }
          this.callList.splice(i, 1)
          break
        }
      }
      this.rejectState(event, 'callListStates')
      this.rejectState(event, 'mapCallListStates')
    },
    // 实时抓拍图片下载
    screenShot(id) {
      const canvas = document.createElement('canvas')
      const video = document.getElementById(id)
      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const url = canvas.toDataURL('image/png', 0.5)
      const elt = document.createElement('a')
      elt.setAttribute('href', url)
      elt.setAttribute('download', id + '.png')
      elt.style.display = 'none'
      document.body.appendChild(elt)
      elt.click()
      document.body.removeChild(elt)
    },
    // 云台控制  触发一个动作 会一直执行  需要发指令主动触发取消动作
    sendDTMF(number, session) {
      // 上 2
      // 下 8
      // 左  4
      // 右  6
      // 放大 1
      // 缩小 3
      // 取消动作  5
      if (session && session.sendDTMF) {
        session.sendDTMF(number)
      }
    },
    getName(to) { // 查找 音视频id号对应的名称
      return this.userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || to
    }
  }
}
