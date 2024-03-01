import { parseTime, getNowTime, getTime } from '@/utils'
import { localStorage } from '@/utils/storage'
export function endCallState(sessionId, key, commonCall) {
  // sessionId  需要更改的数据  是否为正常通话
  const findIndex = this[key].findIndex(obj => obj.sessionId === sessionId)
  if (findIndex !== -1) {
    clearInterval(this[key][findIndex].motor)
    this[key].splice(findIndex, 1, {
      isQuanXuanVideo: true,
      session: {},
      sessionId: false,
      type: 'video'
    })
    if (commonCall) {
      // 普通的通话直接删除
      const index = this[key].findIndex(ob => ob.sessionId === sessionId)
      index !== -1 && this[key].splice(index, 1,)
    }
  }
}
// 静音/解除静音
export function muteOrUnmuteState(key, item, flag) {
  // 需要更改的数据 当前sessoin  静音状态
  const findIndex = this[key].findIndex(v => v.sessionId === item.sessionId)
  if (findIndex !== -1) this.$set(this[key][findIndex], 'mState', flag)
}
// 静音/解除静音
export function voiceOrUnVoiceState(key, item) {
  // 需要更改的数据 当前sessoin  静音状态
  const findIndex = this[key].findIndex(v => v.sessionId === item.sessionId)
  if (findIndex !== -1 && 'voiceState' in this[key][findIndex]) {
    this.$set(this[key][findIndex], 'voiceState', !this[key][findIndex]['voiceState'])
  } else if (findIndex !== -1) {
    this.$set(this[key][findIndex], 'voiceState', true)
  }
}
// 先找是否有拖拽位置的 再找空闲的 主动呼叫的视频 才计入视频调度/群呼中 session对象 通话类型  呼叫来源  需要改变的数据
export function newSessionState(isVideoScheduling, obj, type, originator, key, commonCall) {
  const _this = this
  const findIndex = _this[key].findIndex(ob => ob.toVideo && !ob.state)
  // // 先找是否有拖拽位置的 再找空闲的
  const findIndex2 = _this[key].findIndex(ob => !ob.sessionId)
  const isVideo = originator === 'local' && type === 'video' // 主动呼叫的视频
  const isVideo2 = originator === 'remote' && type === 'video' // 对方呼叫的视频
  if (findIndex === -1 && findIndex2 === -1 && !_this.isPolling) {
    // 视频窗口 没有位置了 非视频轮询的情况下 有分页 应当继续往下添加
    _this[key].push({
      ...obj,
      state: '呼叫中',
      timer: 0,
      motor: null
    })
  } else if (isVideo && !isVideo2 && isVideoScheduling) {
    _this[key].splice(findIndex !== -1 ? findIndex : findIndex2, 1, {
      ...obj,
      state: '呼叫中',
      timer: 0,
      motor: null
    })
  } else if (commonCall && isVideo && !isVideo2 && isVideoScheduling) {
    _this[key].push({
      ...obj,
      state: '呼叫中',
      timer: 0,
      motor: null
    })
  } else if (_this[key].length <= 16 && isVideo && !isVideo2 && isVideoScheduling) {
    _this[key].push({
      ...obj,
      state: '呼叫中',
      timer: 0,
      motor: null
    })
  }
}
// 通话成功状态管理
export function confirmedState(key, sessionId, isVideo, obj, type, session) {
  // 需要改变的数据 sessionId  主动呼叫的视频 当前session 通话类型 session
  const _this = this
  const findIndex = _this[key].findIndex(state => state.sessionId === sessionId)
  const findIndex2 = _this[key].findIndex(ob => !ob.sessionId)
  const setState = function(Index) {
    _this.$set(_this[key][Index], 'state', '已接听')
    const item = _this[key][Index]
    item.motor = setInterval(_ => {
      if (type === 'video') {
        var peerConnection = session.connection
        // 获取 RTCPeerConnection 的统计信息
        peerConnection.getStats(null).then(function(stats) {
          stats.forEach(report => {
          // 判断是否为视频发送的统计信息
            if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
              console.log('视频发送的统计信息:', report)
              if (report.frameWidth && report.frameHeight) {
                item.localFrameWidth = report.frameWidth
                item.localFrameHeight = report.frameHeight
              }
              // 获取视频发送
              const sendBitrate = report.bytesSent
              if (sendBitrate) {
                item.sendBitrate = parseInt(sendBitrate / 1024) + 'Kbps'
              }
            }
            // 判断是否为视频接收的统计信息
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            // console.log('视频接收的统计信息:', report)
              if (report.frameWidth && report.frameHeight) {
                item.remoteFrameWidth = report.frameWidth
                item.remoteFrameHeight = report.frameHeight
              }
              // 获取视频接收
              const receiveBitrate = report.bytesReceived
              if (receiveBitrate) {
                item.receiveBitrate = parseInt(receiveBitrate / 1024) + 'Kbps'
              }
            // // 获取编码时间
            // const encodeTime = report.totalAssemblyTime
            // console.log('编码时间:', encodeTime)
            // // 获取解码时间
            // const decodeTime = report.totalDecodeTime
            // console.log('解码时间:', decodeTime)
            }
          })
        }).catch(function(error) {
          console.error('Error getting RTCPeerConnection stats:', error)
        })
      }
      if ('timer' in item) {
        // item.timer = parseFloat(document.getElementById(sessionId)?.currentTime ?? 0)
        item.timer = (new Date().getTime() - new Date(session._start_time).getTime()) / 1000
        if (document.getElementById(sessionId + 'timer')) {
          document.getElementById(sessionId + 'timer').innerText = getTime(item.timer)
        }
        _this.$forceUpdate()
      } else {
        clearInterval(_this[key][Index].motor)
      }
    }, 1000)
  }
  if (findIndex !== -1) {
    setState(findIndex)
  }
  if (findIndex2 !== -1 && !isVideo && obj[0].belong.indexOf('videoScheduling') !== -1 && type === 'video') {
    _this.$set(obj[0], 'timer', 0)
    _this[key].splice(findIndex2, 1, obj[0])
    setState(findIndex2)
  } else if (findIndex !== -1 && !isVideo && obj[0].belong.indexOf('videoScheduling') !== -1 && type === 'video') {
    _this.$set(obj[0], 'timer', 0)
    _this[key].splice(findIndex, 1, obj[0])
    setState(findIndex)
  }
  if (_this.isPolling) {
    _this.$root.$emit('pollingStateChange', {
      id: session._request.to._uri.user,
      time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
      state: 'confirmed'
    })
  }
}
// 对方挂断状态管理
export function endedState(session, key, isVideo2, flag, timer = 5000, commonCall) {
  // session 需要更改的数据 对方呼叫的视频 是否需要五秒后替换加更改数据 几秒后执行  是否为正常通话
  const _this = this
  for (let i = 0; i < _this[key].length; i++) {
    if (_this[key][i].sessionId === session.id) {
      _this.$set(_this[key][i], 'state', !isVideo2 ? '对方已挂断' : '')
      _this.$set(_this[key][i], 'toVideo', false)
      clearInterval(_this[key][i].motor)
      if (!_this.isPolling) {
        const fn = function() {
          // 5s之后删除
          const index = _this[key].findIndex(ob => ob.sessionId === session.id)
          index !== -1 && _this[key].splice(index, 1, {
            isQuanXuanVideo: true,
            session: {},
            sessionId: false,
            type: 'video'
          })
        }
        if (!flag && !commonCall) {
          // 五秒删除数据
          setTimeout(fn, timer)
        }
        if (commonCall) {
          // 普通的通话直接删除
          const index = _this[key].findIndex(ob => ob.sessionId === session.id)
          index !== -1 && _this[key].splice(index, 1,)
        }
      }
      break
    }
  }
}
// 呼叫失败状态管理
export function failedState(session, data, isVideo2, key) {
  // session 失败data 是否为对方造成的失败 更改的数据 是否为正常通话
  const _this = this
  for (let i = 0; i < _this[key].length; i++) {
    if (_this[key][i].sessionId === session.id) {
      if (data.cause === 'Rejected') {
        _this.$set(_this[key][i], 'state', !isVideo2 ? '对方已挂断' : '')
      } else {
        _this.$set(_this[key][i], 'state', !isVideo2 ? '呼叫失败请稍后再拨' : '')
      }
      _this.$set(_this[key][i], 'toVideo', false)

      if (!_this.isPolling) {
        clearInterval(_this[key][i].motor)
        const fn = function() {
          // 5s之后删除
          const index = _this[key].findIndex(ob => ob.sessionId === session.id)
          index !== -1 && _this[key].splice(index, 1, {
            isQuanXuanVideo: true,
            session: {},
            sessionId: false,
            type: 'video'
          })
        }
        // 五秒删除数据
        setTimeout(fn, 5000)
      } else {
        if (_this.isPolling) {
          _this.$root.$emit('pollingStateChange', {
            id: session._request.to._uri.user,
            time: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
            state: 'failed'
          })
        }
      }
      break
    }
  }
}
// 拒绝/挂断来电状态管理
export function rejectState(event, key) {
  var datasets = event.target.dataset
  // var type = datasets.type
  var sessionId = datasets.sessionid
  for (let i = 0; i < this[key].length; i++) {
    if (this[key][i].sessionId === sessionId) {
      // 直接删除
      clearInterval(this[key][i].motor)
      this[key].splice(i, 1, {
        isQuanXuanVideo: true,
        session: {},
        sessionId: false,
        type: 'video'
      })
      break
    }
  }
}
// 查找 音视频id号对应的名称
export function getName(to) {
  return this.userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || to
}
// 未接来电
export function callListListenState(result, userName, startTime) {
  const _this = this
  _this.callListListen.push(result)
  let obj = {}
  const len = _this.callListListen.length - 1
  obj = _this.callListListen[len]
  if (!obj) return
  obj.session = {}
  if (!result) return
  try {
    const endTime = Math.floor((new Date() - startTime) / 1000)
    _this.$set(_this.callListListen[len], 'forTime', getNowTime())
    _this.$set(_this.callListListen[len], 'ringTime', endTime + 's')
    let CallListStorage = localStorage.get('listenCallList')
    if (!(CallListStorage && Object.keys(CallListStorage).length > 0 && obj)) {
      CallListStorage = {}
    }
    if (CallListStorage && userName in CallListStorage) {
      CallListStorage[userName].push(obj)
    } else {
      CallListStorage[userName] = [obj]
    }
    localStorage.set('listenCallList', CallListStorage)
  } catch (error) {
    console.log(error)
  }
}
