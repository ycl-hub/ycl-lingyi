<template>
  <div class="magorVideoMeet">
    <div v-move="{parent: '.pj_dialog', childrenHeader: '.pj_dialog_tit'}" class="pj_dialog bevel">
      <div class="pj_dialog_tit">
        <span class="tit">视频会商</span>
        <span class="el-icon-close close" @click="endVideoMeet" />
      </div>
      <div class="pj_con">
        <div class="pj_con_c">
          <div class="videoMeetDialog">
            <div :class="'videoMeetDialog_content'">
              <div class="videoMeet-con">
                <iframe id="iframe123" style="width:100%; height:100%;" :src="videoMeetUrl" allow="microphone;camera;midi;encrypted-media;" />
                <el-button size="mini" type="danger" class="endVideoMeet" @click="endVideoMeet">结束会议</el-button>
              </div>
              <div class="videoMeet-ctrl">
                <div class="meetCtrl">管理成员</div>
                <ul>
                  <li v-for="(item, i) in speaklist" :key="i" class="li">
                    <span class="left" :class="item.isonline?'online':'offline'">
                      {{ item.terminalip===''? userInfo.userName: item.terminalip.slice(2) }}
                    </span>
                    <div v-if="item.isonline" class="right">
                      <img :src="item.ismuted ? mute : unmute" alt="" class="img" @click="muteHandle(item)">
                      <img :src="get(item, 'cameras[0].iscameraon', '') ? camera : uncamera" alt="" class="img" @click="cameraHandle(item)">
                      <img v-if="item.terminalip" :src="end" alt="" class="img" @click="endHandle(item)">
                      <img v-if="item.terminalip" :src="tichu" alt="" class="img" @click="tichuHandle(item)">
                    </div>
                    <div v-if="!item.isonline" class="right">
                      <img :src="zhuihu" alt="" class="img" @click="inviteSipOne(item, 'chaseCall')">
                    </div>
                  </li>
                </ul>
                <div class="btn">
                  <div class="inp">
                    <el-input v-model.trim="callNumber" class="filter" placeholder="快速邀请人员或设备">
                      <img slot="suffix" :src="add" alt="" class="img" @click="inviteSipOne({terminalip: `${TONE_voip.sphyQz}${callNumber}`}, 'invite')">
                    </el-input>
                  </div>
                  <el-button size="mini" type="success" @click="() => renyuanHandle()">邀请人员</el-button>
                  <el-button size="mini" type="success" @click="() => shebeiHandle()">邀请设备</el-button>
                </div>
              </div>
            </div>
            <div class="inner">
              <!-- 弹窗 -->
              <el-dialog
                v-el-drag-dialog
                :title="dialogTitle"
                :visible.sync="dialogVisible"
                width="700px"
                append-to-body
                custom-class="organizeDialog bevel"
                :show-close="false"
                :close-on-click-modal="false"
              >
                <div class="organizeDialog_content">
                  <Organize v-if="dialogVisible" :add-meeting-member-list="addList" :dialog-type="'视频会商'" :tab-nav="lefFtabNav" :meeting-member-list="[]" />
                </div>
                <div slot="footer" class="dialog-footer btnWrap">
                  <div class="btn" @click="dialogcancle = false"><span>取 消</span></div>
                  <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
                </div>
              </el-dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
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
export default {
  name: 'VideoMeet',
  components: {
  },
  props: {
    videoMeetDialog: {
      required: true,
      type: Boolean
    },
    videoDev: {
      required: true,
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      lefFtabNav: [
        {
          name: '人员',
          isActive: true
        }, {
          name: '设备',
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
      unitListTree: [], // 组织机构
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      unitListTreeTongXin: [],
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
      }
    }
  },
  watch: {
    isShow: {
      handler: function(val) {
        val && this.loginSR()
      },
      immediate: true
    }
  },
  created() {
  },
  mounted() {
    // 不论组件在那个父元素下引用，都将组将插入到body中
    this.$nextTick(() => {
      const body = document.querySelector('body')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
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
    // 组织机构数加载子节点
    loadNodeHand(node, reslove) {
      var unitid = node.data.UnitId
      if (!unitid) {
        this.$api.common.getPowerById({
          yonghuid: this.userInfo.userName
        }).then(res => {
          this.unitListTree = res.data
        })
      } else {
        this.$api.common.loadUnitList({
          unitid: unitid
        }).then(res => {
          var data = res.data
          this.$api.common.loadYonghuDDTByUnitid({
            unitid: unitid
          }).then(res => {
            if (res.data.length > 0) {
              var dataPeople = res.data.map(v => {
                return {
                  UnitName: v.yonghuname,
                  UnitId: v.UnitId,
                  yonghuid: v.yonghuid,
                  yonghuyxj: v.yonghuyxj,
                  yonghuzxbj: v.yonghuzxbj,
                  leaf: true,
                  type: 'people'
                }
              })
              data = data.concat(dataPeople)
              reslove(data)
            } else {
              return reslove(data)
            }
          })
        })
      }
    },
    // 通信资源组织机构树
    loadNodeHandDevType(node, reslove) {
      if (node.level === 0) {
        // 如果没有树的节点获取设备类型，（前20个）
        this.$api.common.extype().then(res => {
          var data = res.data.records
          var nodeData = data.map(v => {
            return {
              UnitName: v.name,
              devType: v.name,
              isType: true,
              devPower: v.power
            }
          })
          this.unitListTreeTongXin = nodeData
        })
      } else {
        var unitid = node.data.UnitId
        var devType = node.data.devType
        var devPower = node.data.devPower
        // 根据设备类型及权限获取组织
        this.$api.common.loadUnitList({
          unitid: unitid || '0',
          dev_type: devType
        }).then(res => {
          var data = res.data
          var unitData = data.filter(v => {
            if (v.countExt > 0) {
              v.devPower = devPower
              v.devType = devType
              return v
            }
          })
          if (unitData[0] === undefined) {
            unitData = []
          }
          // 获取组织下的设备
          this.$api.common.getExtUserList({
            unitid: unitid || '0',
            dev_type: devType
          }).then(res => {
            var devData = res.data
            // map循环，返回想要的数据格式
            var rootDevData = devData.map(v => {
              return {
                UnitName: v.name,
                devPower: devPower,
                leaf: true,
                type: 'dev',
                devType: devType,
                devId: v.id
              }
            })
            // 将组织与设备组合
            var rootData = unitData.concat(rootDevData)
            // 格式化数据，映射至树形结构
            reslove(rootData)
          })
        })
      }
    },
    // 添加成员
    addMember1(data) {
      var obj = {
        userId: data.yonghuid,
        userName: data.UnitName,
        yonghuzxbj: data.yonghuzxbj
      }
      for (let i = 0; i < this.addList.length; i++) {
        if (this.addList[i].userId === obj.userId) {
          this.$alert('该用户已添加', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      this.addList.push(obj)
    },
    addMember2(data) {
      console.log(data)
      var obj = data
      for (let i = 0; i < this.addList.length; i++) {
        if (this.addList[i].devId === obj.devId) {
          this.$alert('该设备已添加', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      this.addList.push(obj)
    },
    // 删除添加会议成员
    munusMember(index) {
      this.addList.splice(index, 1)
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      if (this.addList.length > 0) {
        this.addList.forEach((item) => {
          axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
            appId: this.appId,
            token: this.srToken,
            confId: this.srMeet.confId,
            'terminal.protocolType': 1,
            'terminal.deviceType': 5,
            'terminal.bandwidth': 2048,
            'terminal.ip': `${this.TONE_voip.sphyQz}${this.dialogTitle.search('邀请人员') !== -1 ? item.userId : item.devId}`
          })).then((response) => {
          }).catch(function(error) {
            console.log(error)
          })
        })
      }
      this.dialogVisible = false
      this.addList = []
    },
    dialogcancle() {
      this.dialogVisible = false
      this.addList = []
    },
    loginSR() {
      // 登录随锐账号
      axios.post(`${this.sr}/api/v3/user/login`, qs.stringify({
        appId: this.appId,
        account: this.TONE_voip.cmd.POLICE_ID,
        pwd: this.$md5(this.TONE_voip.cmd.POLICE_ID),
        type: '1'
      })).then((res) => {
        this.srToken = res.data.data.token
        // 获取改账号下的会议列表，用于判断该账号有没有创建该账号为会议号的会议
        axios.post(`${this.sr}/api/v3/conference/list`, qs.stringify({
          appId: this.appId,
          token: res.data.data.token,
          currentPage: 1,
          pageSize: 100000
        })).then((response) => {
          const meetList = response.data.data.list
          const filterMeet = meetList.filter(m => {
            return m.thirdConfId === this.userInfo.userName
          })
          if (filterMeet.length === 0) {
            // 创建会议
            axios.post(`${this.sr}/api/v3/conference/create`, qs.stringify({
              appId: this.appId,
              token: res.data.data.token,
              thirdConfId: this.userInfo.userName,
              confName: this.userInfo.userName
            })).then((r) => {
              this.srMeet = r.data.data
              this.joinVideoMeet()
            }).catch(function(error) {
              console.log(error)
            })
          } else {
            // 该凌智账号已经创建了会议，所以直接使用此会议号去入会，拉取sip终端
            // console.log(filterMeet[0])
            this.srMeet = filterMeet[0]
            this.joinVideoMeet()
          }
        }).catch(function(error) {
          console.log(error)
        })
      }).catch(function(error) {
        console.log(error)
      })
    },
    // 入会拉会
    joinVideoMeet() {
      const sr = process.env.NODE_ENV === 'development' ? '/devSr' : `https://${this.TONE_voip.sphyIP}:${this.TONE_voip.sphyPort}`
      this.videoMeetUrl = `${sr}/sfu/?token=${this.srToken}&confId=${this.srMeet.thirdConfId}&videoMute=false&audioMute=false&password=&targetName=null`
      // this.videoMeetUrl = `https://${this.TONE_voip.sphyIP}:${this.TONE_voip.sphyPort}/sfu/?token=${this.srToken}&confId=${this.srMeet.thirdConfId}&videoMute=false&audioMute=false&password=&targetName=null`
      // 首先确保会议开起来，再去邀请sip入会
      this.$nextTick(() => {
        var iframe = document.getElementById('iframe123')
        if (iframe.attachEvent) {
          iframe.attachEvent('onload', () => {
            this.inviteSip()
          })
        } else {
          iframe.onload = () => {
            this.inviteSip()
          }
        }
      })
    },
    // 邀请sip端视频会商
    inviteSip() {
      setTimeout(() => {
        // 邀请sip终端
        this.videoDev.forEach((item) => {
          axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
            appId: this.appId,
            token: this.srToken,
            confId: this.srMeet.confId,
            'terminal.protocolType': 1,
            'terminal.deviceType': 5,
            'terminal.bandwidth': 2048,
            'terminal.ip': `${this.TONE_voip.sphyQz}${item.POLICE_ID || item.id}`
          })).then((response) => {
          }).catch(function(error) {
            console.log(error)
          })
        })
      }, 500)
      this.initWebSocket()
    },
    inviteSipOne(item, type) {
      if (type === 'chaseCall') {
        axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
          appId: this.appId,
          token: this.srToken,
          confId: this.srMeet.confId,
          'terminal.protocolType': 1,
          'terminal.deviceType': 5,
          'terminal.bandwidth': 2048,
          'terminal.ip': item.terminalip
        })).then((response) => {
        }).catch(function(error) {
          console.log(error)
        })
      }
      if (type === 'invite' && !this.callNumber) {
        return
      }
      if (type === 'invite' && this.callNumber) {
        axios.post(`${this.sr}/api/v3/terminal/invite`, qs.stringify({
          appId: this.appId,
          token: this.srToken,
          confId: this.srMeet.confId,
          'terminal.protocolType': 1,
          'terminal.deviceType': 5,
          'terminal.bandwidth': 2048,
          'terminal.ip': item.terminalip
        })).then((response) => {
        }).catch(function(error) {
          console.log(error)
        })
        this.callNumber = ''
      }
    },
    endVideoMeet() {
      axios.post(`${this.sr}/api/v3/conference/end`, qs.stringify({
        appId: this.appId,
        secretKey: this.appId,
        token: this.srToken,
        confId: this.srMeet.confId
      })).then((response) => {
        if (response.data.isSuccess) {
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
      })
    },
    initWebSocket() {
      console.log('启动中')
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
      // console.log(msgData, 678)
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
        this.status = msgData.status
        this.speaklist = msgData.speaklist
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
      this.timeoutObj && clearTimeout(this.timeoutObj)
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
// 视频会商
.pj_dialog{
  width: 1164px;
  height: 550px;
  color: #fff;
  position: absolute;
  top: calc(50% - 275px);
  left: calc(50% - 580px);
  .pj_dialog_tit{
    box-sizing: content-box;
    padding: 5px 10px;
    height: 30px; line-height: 30px;
    border-bottom: 1px solid #497a7a;
    font-size: 14px;
    font-family: PingFang SC;
    .tit{float: left;}
    .close{
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 30px;
      width: 30px;
      height: 30px;
      text-align: right;
    }
  }
  .pj_con{
    width: 100%;
    height: calc(100% - 40px);
    .pj_h {
      .title {
        padding-top: 10px;
        &.title2 {
          margin-top: 10px;
        }
      }
    }
    .pj_con_c{
      height: calc(100%);
      // margin-top: 10px;
      ::v-deep .videoMeetDialog {
        // height: 500px;
        width: 100%;
        height: 100%;
        .inner {
          display: none;
        }
        .videoMeetDialog_content {
          .videoMeet-con{
            background-color: #313131;
            float: left;
            width: 960px;
            height: 505px;
            position: relative;
            .endVideoMeet {
              position: absolute;
              bottom: 15px;
              // padding: 8px 20px;
              right: 10px;
            }
          }
          .videoMeet-ctrl {
            width: 200px;
            height: 505px;
            float: right;
            background-color: #313131;
            padding: 5px;
            .meetCtrl {
              color: rgba(250, 253, 255, 1);
              height: 20px;
              line-height: 20px;
              font-size: 14px;
            }
            ul {
              width: 100%;
              height: calc(100% - 108px);
              overflow-y: auto;
              li {
                padding: 0px 2px;
                width: 100%;
                height: 30px;
                line-height: 30px;
                border-bottom: 1px solid #497a7a;
                .left {
                }
                .online {
                  color: #01d3f9;
                }
                .offline {
                  color: #999;
                }
                .right {
                  width: 50%;
                  height: 30px;
                  .img {
                    width: 18px;
                    margin-top: 6px;
                    cursor: pointer;
                    margin-right: 4px;
                    &:last-child {
                      margin-right: 0px;
                    }
                  }
                }
                &:last-child {
                  border-bottom: none;
                }
              }
            }
            .btn {
              .inp {
                margin: 10px 0;
              }
              .filter {
                height: 30px;
                .el-input__inner {
                  height: 30px;
                  border: 1px solid #197491;
                  background-color: #265872;
                  color: #fff;
                  font-size: 12px;
                  &::-webkit-input-placeholder {
                    color:#0fabd4;
                    font-size: 12px;
                  }
                  &:-moz-placeholder {
                    color:#0fabd4;
                    font-size: 12px;
                  }
                  &::-moz-placeholder {
                    color:#0fabd4;
                    font-size: 12px;
                  }
                  &:-ms-input-placeholder {
                    color:#0fabd4;
                    font-size: 12px;
                  }
                }
                .el-input__suffix {
                  right: 2px;
                  .img {
                    width: 26px;
                    margin-top: 2px;
                    cursor: pointer;
                  }
                }
              }
              .el-button {
                &:last-child {
                  margin-left: 30px;
                }
              }
            }
          }
          .videoMeet-con_left{
            // border-right: 1px solid #DCDFE6;
            width: 330px;
            height: 100%;
            overflow: auto;
            .el-tree {
              background: transparent;
            }
            .t01_tree {
              .el-tree-node__content {
                height: 35px;
              }
              .el-tree-node.is-current>.el-tree-node__content {
                background: rgba(0, 183, 238, .1) !important;
              }
              .el-tree-node__content:hover {
                background: rgba(0, 183, 238, .1) !important;
              }
              .el-tree-node:focus>.el-tree-node__content{
                background: rgba(0, 183, 238, .1) !important;
              }
            }
          }
          .videoMeet-con_right {
            height: 100%;
            overflow: auto;
            .add-member-list {
              li {
                height: 30px; line-height: 30px; position: relative; transition: all .1s;
                &:hover {
                  background: rgba(0,0,0,.1);
                }
                .name {
                  padding-left: 10px;
                  font-size: 12px;
                }
                .tree-btn{ position: absolute; right: 5px; top:4px;}
              }
            }
          }
        }
      }
    }
  }
}
</style>
