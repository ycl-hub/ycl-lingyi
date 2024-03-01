<template>
  <div class="videoMeet">
    <!-- 视频会商 -->
    <el-dialog
      v-el-drag-dialog
      title="视频会议"
      :visible.sync="isShow"
      width="1160px"
      append-to-body
      :close-on-click-modal="false"
      custom-class="videoMeetDialog bevel"
      @close="endVideoMeet"
    >
      <div :class="'videoMeetDialog_content'">
        <div class="videoMeet-con">
          <iframe id="iframe123" style="width:100%; height:100%;" :src="videoMeetUrl" allow="microphone;camera;midi;encrypted-media;" />
          <el-button size="mini" type="danger" class="endVideoMeet" @click="endVideoMeet">结束会议</el-button>
        </div>
        <div class="videoMeet-ctrl">
          <div class="meetCtrl">管理成员</div>
          <ul>
            <li v-for="(item, i) in speaklist" :key="i" class="li">
              <span class="left ellipsis" style="width: 50%;" :title="item.nickname" :class="item.isonline?'online':'offline'">
                <!-- {{ item.terminalip===''? userInfo.userName: item.terminalip.slice(2) }} -->
                {{ item.nickname }}
              </span>
              <div v-if="item.isonline" class="right">
                <img :src="item.ismuted ? mute : unmute" alt="" class="img" @click="muteHandle(item)">
                <img :src="get(item, 'cameras[0].iscameraon', '') ? camera : uncamera" alt="" class="img" @click="cameraHandle(item)">
                <img v-if="item.terminalip&&!(item.terminaltype===1&&item.type===3)" :src="end" alt="" class="img" @click="endHandle(item)">
                <img v-if="item.terminalip" :src="tichu" alt="" class="img" @click="tichuHandle(item)">
              </div>
              <div v-if="(!item.isonline)&&(!(item.type===3&&item.terminaltype===1))" class="right">
                <img :src="zhuihu" alt="" class="img" title="追呼" @click="inviteSipOne(item, 'chaseCall')">
              </div>
            </li>
          </ul>
          <div class="btn">
            <!-- 快速邀请 -->
            <!-- <div class="inp">
              <el-input v-model.trim="callNumber" class="filter" placeholder="快速邀请人员或设备">
                <img slot="suffix" :src="add" alt="" class="img" @click="inviteSipOne({terminalip: `${TONE_voip.sphyQz}${callNumber}`}, 'invite')">
              </el-input>
            </div> -->
            <!-- <el-button size="mini" type="success" @click="() => renyuanHandle()">邀请人员</el-button>
            <el-button size="mini" type="success" @click="() => shebeiHandle()">邀请设备</el-button> -->
            <el-button size="mini" type="success" @click="() => shebeiHandle()">邀请</el-button>
          </div>
        </div>
      </div>
      <div class="inner">
        <!-- 弹窗 -->
        <el-dialog
          v-el-drag-dialog
          :title="'邀请成员'"
          :visible.sync="dialogVisible"
          width="700px"
          append-to-body
          custom-class="organizeDialog bevel organizeDialog_videoMeet"
          :show-close="false"
          :close-on-click-modal="false"
        >
          <div class="organizeDialog_content_videoMeet">
            <Organize v-if="dialogVisible" :add-meeting-member-list="addList" :dialog-type="'视频会商'" :tab-nav="lefFtabNav" :meeting-member-list="[]" :call-type="'videoMeet'" />
          </div>
          <div slot="footer" class="dialog-footer btnWrap">
            <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
            <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
          </div>
        </el-dialog>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import add from '@/assets/images/videoMeet/add.png'
import mute from '@/assets/images/videoMeet/mute.png'
import unmute from '@/assets/images/videoMeet/unmute.png'
import camera from '@/assets/images/videoMeet/camera.png'
import uncamera from '@/assets/images/videoMeet/uncamera.png'
import end from '@/assets/images/videoMeet/end.png'
import tichu from '@/assets/images/videoMeet/tichu.png'
import zhuihu from '@/assets/images/videoMeet/zhuihu.png'
import { get } from 'lodash'
import { sessionStorage } from '@/utils/storage'
import axios from 'axios'
const qs = require('qs')
// import { sr } from '@/api/env'
import Organize from '@/components/organize'

export default {
  name: 'VideoMeet',
  components: { Organize },
  props: {
    videoMeetDialog: {
      required: true,
      type: Boolean
    },
    videoDev: {
      required: false,
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      isMeeting: false,
      lefFtabNav: [
        {
          name: '人员',
          isActive: true
        }, {
          name: '设备',
          isActive: false
        }, {
          name: '终端',
          isActive: false
        }, {
          name: 'mcu',
          isActive: false
        }, {
          name: '外部联系人',
          isActive: false
        }
      ],
      get, add, mute, unmute, camera, uncamera, end, tichu, zhuihu,
      appId: 'beb7da4ced7c42a085c3c99697f9aa42',
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      videoMeetUrl: '',
      srMeet: null,
      srToken: '',
      // 会控相关
      websock: null,
      reconnectData: null,
      lockReconnect: false, // 避免重复连接，因为onerror之后会立即触发 onclose
      timeout: 10000, // 5s一次心跳检测
      timeoutObj: null,
      serverTimeoutObj: null,
      clientId: '',
      suid: 0,
      hkToken: '',
      status: 0,
      speaklist: [],
      callNumber: '',
      dialogTitle: '', // 弹框标题
      dialogVisible: false,
      addList: [], // 添加成员
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      guanlianData: null,
      TONE_voip: sessionStorage.get('TONE_voip'),
      sr: process.env.NODE_ENV === 'development' ? '/devSr' : `https://${sessionStorage.get('TONE_voip').sphyIP}:${sessionStorage.get('TONE_voip').sphyPort}`
    }
  },
  computed: {
    isShow: {
      get() {
        return this.videoMeetDialog
      },
      set(val) {
        this.$emit('update:videoMeetDialog', val)
        this.$store.commit('sip/SET_isVideoMeet', val)
      }
    }
  },
  watch: {
    isShow: {
      handler: function(val) {
        val && this.loginSR()
        this.$store.commit('sip/SET_isVideoMeet', val)
      },
      immediate: true
    }
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
    // this.lockReconnect = true
    // this.websock.close() // 离开路由之后断开websocket连接
    // clearTimeout(this.reconnectData) // 离开清除 timeout
    // clearInterval(this.timeoutObj) // 离开清除 timeout
    // clearTimeout(this.serverTimeoutObj) // 离开清除 timeout
  },
  destroyed() {
  },
  methods: {
    renyuanHandle() {
      this.dialogTitle = `邀请人员`
      this.dialogVisible = true
      // this.addList = data.plottingYonghu
      // if (this.speaklist && this.speaklist.length > 0) {
      //   this.speaklist.forEach((item) => {
      //     this.addList.push(
      //       {
      //         userId: item.id,
      //         userName: item.yonghuname,
      //         yonghuzxbj: item.yonghuzxbj
      //       }
      //     )
      //   })
      // }
    },
    shebeiHandle() {
      this.dialogTitle = `邀请设备`
      this.dialogVisible = true
      // this.guanlianData = data
      // this.addList = data.plottingDev
      // if (data.plottingDev && data.plottingDev.length > 0) {
      //   data.plottingDev.forEach((item) => {
      //     this.addList.push(
      //       {
      //         devId: item.id,
      //         UnitName: item.name,
      //         type: item.dev_type
      //       }
      //     )
      //   })
      // }
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      console.log(this.addList)
      if (this.addList.length > 0) {
        const sipArr = this.addList.filter((item) => {
          return !(item.devType === 'zd' || item.devType === 'mcu')
        })
        sipArr.forEach((item) => {
          console.log(item, 666)
          // axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
          //   appId: this.appId,
          //   token: this.srToken,
          //   confId: this.srMeet.confId,
          //   'terminal.protocolType': 1,
          //   'terminal.deviceType': 5,
          //   'terminal.bandwidth': 2048,
          //   'terminal.ip': `${this.TONE_voip.sphyQz}${item.userId || item.devId}`,
          //   'terminal.name': item.userName
          // })).then((response) => {
          // }).catch(function(error) {
          //   console.log(error)
          // })
          if (item.hsUser) {
            axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              participants: item.hsUser,
              sendMsg: '1'
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          } else {
            axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              'terminal.protocolType': 1,
              'terminal.deviceType': 5,
              'terminal.bandwidth': 2048,
              'terminal.ip': `${this.TONE_voip.sphyQz}${item.userId || item.devId}`,
              'terminal.name': item.userName || item.name
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          }
        })
        // 过滤出终端
        const zdArr = this.addList.filter((item) => {
          return item.devType === 'zd'
        })
        var zdrooms = zdArr.map(v => {
          return v.userId
        }).join(',')
        if (zdrooms) {
          axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
            appId: this.appId,
            token: this.srToken,
            confId: this.srMeet.confId,
            rooms: zdrooms,
            sendMsg: '1'
          })).then((response) => {
          }).catch(function(error) {
            console.log(error)
          })
        }
        // 过滤出mcu
        const mcuArr = this.addList.filter((item) => {
          return item.devType === 'mcu'
        })
        if (mcuArr.length > 0) {
          mcuArr.forEach((item) => {
            axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              rooms: item.userId,
              sendMsg: '1',
              callOption: item.pwd ? (item.number + '#' + item.pwd) : item.number + '#'
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          })
        }
      }
      this.dialogVisible = false
      this.addList = []
    },
    dialogcancle() {
      this.dialogVisible = false
      this.addList = []
    },
    // loginSR() {
    //   // 登录随锐账号
    //   axios.post(`${this.sr}/api/v3/user/login`, qs.stringify({
    //     appId: this.appId,
    //     account: this.TONE_voip.cmd.POLICE_ID,
    //     pwd: this.$md5(this.TONE_voip.cmd.POLICE_ID),
    //     type: '1'
    //   })).then((res) => {
    //     this.srToken = res.data.data.token
    //     // 获取改账号下的会议列表，用于判断该账号有没有创建该账号为会议号的会议
    //     axios.post(`${this.sr}/api/v3/conference/list`, qs.stringify({
    //       appId: this.appId,
    //       token: res.data.data.token,
    //       currentPage: 1,
    //       pageSize: 100000
    //     })).then((response) => {
    //       const meetList = response.data.data.list
    //       const filterMeet = meetList.filter(m => {
    //         return m.thirdConfId === this.userInfo.userName
    //       })
    //       if (filterMeet.length === 0) {
    //         // 创建会议
    //         axios.post(`${this.sr}/api/v3/conference/create`, qs.stringify({
    //           appId: this.appId,
    //           token: res.data.data.token,
    //           thirdConfId: this.userInfo.userName,
    //           confName: this.userInfo.userName
    //         })).then((r) => {
    //           this.srMeet = r.data.data
    //           this.joinVideoMeet()
    //         }).catch(function(error) {
    //           console.log(error)
    //         })
    //       } else {
    //         // 该凌智账号已经创建了会议，所以直接使用此会议号去入会，拉取sip终端
    //         // console.log(filterMeet[0])
    //         this.srMeet = filterMeet[0]
    //         this.joinVideoMeet()
    //       }
    //     }).catch(function(error) {
    //       console.log(error)
    //     })
    //   }).catch(function(error) {
    //     console.log(error)
    //   })
    // },
    loginSR() {
      // 登录随锐账号
      axios.post(`${this.sr}/api/v3/user/login`, qs.stringify({
        appId: this.appId,
        account: this.TONE_voip.cmd.POLICE_ID,
        pwd: this.$md5(this.TONE_voip.cmd.POLICE_ID),
        type: '1'
      })).then((res) => {
        this.srToken = res.data.data.token
        // 创建会议
        axios.post(`${this.sr}/api/v3/conference/create`, qs.stringify({
          appId: this.appId,
          token: res.data.data.token,
          confName: this.userInfo.userName
        })).then((r) => {
          this.srMeet = r.data.data
          this.joinVideoMeet()
        }).catch(function(error) {
          console.log(error)
        })
      }).catch(function(error) {
        console.log(error)
      })
    },
    // 入会拉会
    joinVideoMeet() {
      // this.videoMeetUrl = `https://${this.TONE_voip.sphyIP}:${this.TONE_voip.sphyPort}/sfu/?token=${this.srToken}&confId=${this.srMeet.thirdConfId}&videoMute=false&audioMute=false&password=&targetName=null`
      const sr = process.env.NODE_ENV === 'development' ? '/devSr' : `https://${sessionStorage.get('TONE_voip').sphyIP}:${sessionStorage.get('TONE_voip').sphyPort}`
      this.videoMeetUrl = `${sr}/sfu/?token=${this.srToken}&confId=${this.srMeet.thirdConfId}&videoMute=false&audioMute=false&password=&targetName=null`
      // 首先确保会议开起来，再去邀请sip入会
      console.log('入会拉会-----')
      this.$nextTick(() => {
        var iframe = document.getElementById('iframe123')
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', () => {
            this.inviteSip()
            this.isMeeting = true
          })
        } else {
          iframe.onload = () => {
            this.inviteSip()
            this.isMeeting = true
          }
        }
      })
    },
    // 邀请sip端视频会议
    inviteSip() {
      setTimeout(() => {
        // 邀请sip终端
        console.log(this.videoDev, '视频会商邀请人员')
        // 过滤出sip终端
        const sipArr = this.videoDev.filter((item) => {
          return !(item.devType === 'zd' || item.devType === 'mcu')
        })
        sipArr.forEach((item) => {
          // axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
          //   appId: this.appId,
          //   token: this.srToken,
          //   confId: this.srMeet.confId,
          //   'terminal.protocolType': 1,
          //   'terminal.deviceType': 5,
          //   'terminal.bandwidth': 2048,
          //   'terminal.ip': `${this.TONE_voip.sphyQz}${item.userId || item.devId}`,
          //   'terminal.name': item.userName
          // })).then((response) => {
          // }).catch(function(error) {
          //   console.log(error)
          // })
          if (item.hsUser) {
            axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              participants: item.hsUser,
              sendMsg: '1'
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          } else {
            axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              'terminal.protocolType': 1,
              'terminal.deviceType': 5,
              'terminal.bandwidth': 2048,
              'terminal.ip': `${this.TONE_voip.sphyQz}${item.userId || item.devId}`,
              'terminal.name': item.userName || item.name
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          }
        })
        // 过滤出终端
        const zdArr = this.videoDev.filter((item) => {
          return item.devType === 'zd'
        })
        var zdrooms = zdArr.map(v => {
          return v.userId
        }).join(',')
        if (zdrooms) {
          axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
            appId: this.appId,
            token: this.srToken,
            confId: this.srMeet.confId,
            rooms: zdrooms,
            sendMsg: '1'
          })).then((response) => {
          }).catch(function(error) {
            console.log(error)
          })
        }
        // 过滤出mcu
        const mcuArr = this.videoDev.filter((item) => {
          return item.devType === 'mcu'
        })
        if (mcuArr.length > 0) {
          mcuArr.forEach((item) => {
            axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
              appId: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId,
              rooms: item.userId,
              sendMsg: '1',
              callOption: item.pwd ? (item.number + '#' + item.pwd) : item.number + '#'
            })).then((response) => {
            }).catch(function(error) {
              console.log(error)
            })
          })
        }
        this.initWebSocket()
      }, 500)
    },
    inviteSipOne(item, type) {
      console.log(item, 888)
      if (type === 'chaseCall') {
        // 追呼除了人员、设备、mcu
        if (item.terminaltype === 0) {
          axios.post(`${this.sr}/api/v3/conference/invite`, qs.stringify({
            appId: this.appId,
            token: this.srToken,
            confId: this.srMeet.confId,
            rooms: item.id,
            sendMsg: '1'
          })).then((response) => {
          }).catch(function(error) {
            console.log(error)
          })
          return false
        }
        axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
          appId: this.appId,
          token: this.srToken,
          confId: this.srMeet.confId,
          'terminal.protocolType': 1,
          'terminal.deviceType': 5,
          'terminal.bandwidth': 2048,
          'terminal.ip': item.terminalip,
          'terminal.name': item.nickname || item.name
        })).then((response) => {
        }).catch(function(error) {
          console.log(error)
        })
      }
      // 快速邀请隐藏
      // if (type === 'invite' && !this.callNumber) {
      //   return
      // }
      // if (type === 'invite' && this.callNumber) {
      //   axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
      //     appId: this.appId,
      //     token: this.srToken,
      //     confId: this.srMeet.confId,
      //     'terminal.protocolType': 1,
      //     'terminal.deviceType': 5,
      //     'terminal.bandwidth': 2048,
      //     'terminal.ip': item.terminalip,
      //     'terminal.name': this.callNumber
      //   })).then((response) => {
      //   }).catch(function(error) {
      //     console.log(error)
      //   })
      //   this.callNumber = ''
      // }
    },
    endVideoMeet(force) {
      if (force) {
        axios.post(`${this.sr}/api/v3/conference/end`, qs.stringify({
          appId: this.appId,
          secretKey: this.appId,
          token: this.srToken,
          confId: this.srMeet.confId
        })).then((response) => {
          // 结束会议成功，或者被其他人结束了会议
          if (response.data.isSuccess || response.data.code === '80011') {
            this.isShow = false
            // 关闭弹层
            this.lockReconnect = true
            this.websock.close() // 离开路由之后断开websocket连接
            clearTimeout(this.reconnectData) // 离开清除 timeout
            clearInterval(this.timeoutObj) // 离开清除 timeout
            clearTimeout(this.serverTimeoutObj) // 离开清除 timeout
            this.clientId = ''
            this.suid = 0
            this.hkToken = ''
            this.status = 0
            this.speaklist = []
          }
        }).catch(function(error) {
          console.log(error)
        }).finally(() => {
          this.isShow = false
        })
      } else {
        // 非强插，正常关闭
        this.isShow = true
        if (this.isMeeting) {
          // 表示正在会议中 // 表示正有会议进行中
          this.$confirm(`当前正在会议期间，是否确认关闭?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            axios.post(`${this.sr}/api/v3/conference/end`, qs.stringify({
              appId: this.appId,
              secretKey: this.appId,
              token: this.srToken,
              confId: this.srMeet.confId
            })).then((response) => {
              // 结束会议成功，或者被其他人结束了会议
              if (response.data.isSuccess || response.data.code === '80011') {
                // 退出会议，把会议中的设备全部踢出去
                // this.speaklist.forEach((item) => {
                //   this.tichuHandle(item)
                // })
                this.isShow = false
                // 关闭弹层
                this.lockReconnect = true
                this.websock.close() // 离开路由之后断开websocket连接
                clearTimeout(this.reconnectData) // 离开清除 timeout
                clearInterval(this.timeoutObj) // 离开清除 timeout
                clearTimeout(this.serverTimeoutObj) // 离开清除 timeout
                this.clientId = ''
                this.suid = 0
                this.hkToken = ''
                this.status = 0
                this.speaklist = []
              }
            }).catch(function(error) {
              console.log(error)
            }).finally(() => {
              this.isShow = false
            })
          })
        } else {
          this.isShow = false
        }
      }
    },
    initWebSocket() {
      console.log('启动中')
      // const TONE_voip = sessionStorage.get('TONE_voip')
      const wsurl = `wss://${this.TONE_voip.sphyIP}:${this.TONE_voip.sphyPort}/ctrlws`
      this.websock = new WebSocket(wsurl)
      this.websock.onopen = this.websocketonopen // 连接成功
      this.websock.onmessage = this.websocketonmessage // 广播成功
      this.websock.onerror = this.websocketonerror // 连接断开，失败
      this.websock.onclose = this.websocketclose // 连接关闭
    }, // 初始化weosocket
    websocketonopen() {
      console.log('连接成功')
      this.websocketsend({ 'op': 'heartbeat', 'token': '', 'confid': null, 'clientId': '', 'status': 0 })
      this.heatBeat()
    }, // 连接成功
    websocketonerror() {
      console.log('连接失败')
    }, // 连接失败
    websocketclose() {
      console.log('断开连接')
    }, // 各种问题导致的 连接关闭
    websocketonmessage(data) {
      // this.heatBeat() // 收到消息会刷新心跳检测，如果一直收到消息，就推迟心跳发送
      const msgData = JSON.parse(data.data)
      console.log(msgData, 678)
      // 心跳返回数据
      if (msgData.op === 'rspHeartbeat' && !this.clientId) {
        this.clientId = msgData.clientId
        this.websocketsend({ 'op': 'login', 'account': this.TONE_voip.cmd.POLICE_ID, 'pwd': this.$md5(this.TONE_voip.cmd.POLICE_ID), 'appid': this.appId, 'clientId': this.clientId })
      }
      // 登录返回数据
      if (msgData.op === 'rspLogin' && !this.suid) {
        this.suid = msgData.suid
        this.hkToken = msgData.token
        this.websocketsend({ 'status': 1, 'confid': this.srMeet.confId, 'token': this.hkToken, 'op': 'confcontrol', 'appid': this.appId, 'clientId': this.clientId })
      }
      // 控制会议返回数据
      if (msgData.op === 'rspConfControl') {
        this.status = msgData.status
        if (msgData.msg === '会议未开始或者已经结束') {
          // this.lockReconnect = true
          // this.websock.close() // 离开路由之后断开websocket连接
          // clearTimeout(this.reconnectData) // 离开清除 timeout
          // clearInterval(this.timeoutObj) // 离开清除 timeout
          // clearTimeout(this.serverTimeoutObj) // 离开清除 timeout
          // this.clientId = ''
          // this.suid = 0
          // this.hkToken = ''
          // this.status = 0
          // this.speaklist = []
          this.websocketsend({ 'status': 1, 'confid': this.srMeet.confId, 'token': this.hkToken, 'op': 'confcontrol', 'appid': this.appId, 'clientId': this.clientId })
          return false
        }
        // 切换布局模式（主席模式、自由者模式）
        // this.websocketsend({ 'op': 'setconfmode', 'newconfmode': 1, 'confid': this.srMeet.confId, 'token': this.hkToken,
        //   'appid': this.appId, 'clientId': this.clientId })
        // 获取终端列表
        this.getSpeaklist()
      }
      // 控制会议返回数据
      if (msgData.op === 'rspGetConfTerList') {
        this.speaklist = msgData.speaklist
        console.log(this.speaklist, 'speaklist')
      }
      if (msgData.op === 'rspTerJoinConf' || msgData.op === 'rspMuteOne' || msgData.op === 'rspCancelMuteOne' || msgData.op === 'indCloseCamara' || msgData.op === 'indOpenCamara' || msgData.op === 'rspTerLeaveConf') {
        // 有人加入重新获取终端列表
        this.getSpeaklist()
      }
    }, // 数据接收
    websocketsend(data) {
      this.websock.send(JSON.stringify(data))
    }, // 数据发送
    reconnect() {
      console.log('重新连接')
      if (this.lockReconnect) { // 这里很关键，因为连接失败之后之后会相继触发 连接关闭，不然会连接上两个 WebSocket
        return
      }
      this.lockReconnect = true
      this.reconnectData && clearTimeout(this.reconnectData)
      this.reconnectData = setTimeout(() => {
        this.initWebSocket()
        this.lockReconnect = false
      }, 5000)
    }, // socket重连
    heatBeat() {
      this.timeoutObj && clearInterval(this.timeoutObj)
      this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
      this.timeoutObj = setInterval(() => {
        this.websocketsend({ 'op': 'heartbeat', 'token': this.hkToken, 'confid': this.srMeet.confId, 'clientId': this.clientId, 'status': this.status }) // 根据后台要求发送
        // this.serverTimeoutObj = setTimeout(() => {
        //   this.websock.close() // 如果  5秒之后我们没有收到 后台返回的心跳检测数据 断开socket，断开后会启动重连机制
        // }, 5000)
      }, this.timeout)
    }, // 心跳检测
    // 关闭摄像头
    closeCam(item) {
      this.websocketsend({ 'op': 'closecamera', 'terid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, 'srcid': item.cameras[0].srcid, 'appid': this.appId, 'clientId': this.clientId })
    },
    // 获取列表
    getSpeaklist() {
      this.websocketsend({ 'op': 'getconfterlist', 'confid': this.srMeet.confId, 'token': this.hkToken, 'appid': this.appId, 'clientId': this.clientId })
    },
    // 静音解除静音
    muteHandle(item) {
      if (item.ismuted) {
        this.websocketsend({ 'op': 'cancelmute', 'jointerid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, 'appid': this.appId, 'clientId': this.clientId })
      }
      if (!item.ismuted) {
        this.websocketsend({ 'op': 'muteone', 'jointerid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, 'appid': this.appId, 'clientId': this.clientId })
      }
    },
    // 打开关闭摄像头
    cameraHandle(item) {
      if (item.cameras[0].iscameraon) {
        this.websocketsend({ 'op': 'closecamera', 'terid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, srcid: item.srcid, 'appid': this.appId, 'clientId': this.clientId })
      }
      if (!item.cameras[0].iscameraon) {
        this.websocketsend({ 'op': 'opencamera', 'terid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, srcid: item.srcid, 'appid': this.appId, 'clientId': this.clientId })
      }
    },
    // 挂断
    endHandle(item) {
      this.websocketsend({ 'op': 'dropter', 'jointerid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, 'suid': item.suid, 'locked': false, 'appid': this.appId, 'clientId': this.clientId })
    },
    tichuHandle(item) {
      this.websocketsend({ 'op': 'dropter', 'jointerid': item.terid, 'confid': this.srMeet.confId, 'token': this.hkToken, 'suid': item.suid, 'locked': true, 'appid': this.appId, 'clientId': this.clientId })
    },
    searchBtn() {
      if (!this.callNumber) {
        return
      }
      this.callNumber = ''
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
