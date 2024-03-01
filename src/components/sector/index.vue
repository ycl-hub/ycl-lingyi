<template>
  <div v-if="sectorList.length>0" class="sectorWrap">
    <!-- 扇形 -->
    <div class="sector">
      <vue-drag-resize :is-active="true" :x="-200" :y="-200" :w="'auto'" :h="'auto'" :is-resizable="false" @dragstop="onDragstop($event)">
        <div class="sectorDrag" @mousedown="mousedown" @mouseup="mouseup">
          <div class="smartcmsht-button" @click="clickBtn($event)">
            <img :src="btn" alt="">
          </div>
          <div class="smartcmsht-wrapper" :class="active ? 'active' : ''">
            <ul>
              <li v-for="(val, i) in sectorList" :key="i" class="smartcmshtlist" :class="val.text===itemActive?'itemActive':''" @click="sectorClick(val)">
                <a>
                  <span>{{ val.text }}</span>
                  <div class="icon">
                    <svg-icon class="iconImg" :icon-class="val.icon" :class="val.icon" />
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </vue-drag-resize>
    </div>
    <!-- 拨号盘 -->
    <el-dialog
      v-el-drag-dialog
      title="拨号盘"
      :visible.sync="bohaopan"
      width="230px"
      :close-on-click-modal="false"
      custom-class="bohaopan bevel"
      @close="closeBohaopan"
    >
      <div class="tone_sip_dialog">
        <div class="tone_sip_con">
          <div class="tone_sip_con_c">
            <el-form ref="bohaopanForm" :model="bohaopanForm" :rules="bohaopanRules">
              <el-form-item prop="dialInputText">
                <el-input ref="dialInput" v-model="bohaopanForm.dialInputText" size="small" class="dial-input" placeholder="请输入呼叫号码" clearable @input.native="changeValue" />
              </el-form-item>
            </el-form>
            <div class="over-hidden numWrap">
              <div class="over-hidden num-box">
                <span v-for="item in keyText" :key="item" class="left num-btn" @click="dialKey(item)">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <div class="btn left" title="音频呼叫" @click="hujiao('audio')">
          <span class="el-icon-phone" />
        </div>
        <div class="btn right" title="视频呼叫" @click="hujiao('video')">
          <span class="el-icon-video-camera-solid" />
        </div>
      </div>
    </el-dialog>
    <!-- 语音会议 -->
    <AudioMeet ref="audioMeet" />
    <!-- 视频会商 -->
    <el-dialog
      v-el-drag-dialog
      title="视频会商"
      :visible.sync="dialogVisibleVideo"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
      custom-class="organizeDialog bevel organizeDialog_videoMeet"
    >
      <div class="organizeDialog_content_videoMeet">
        <Organize :tab-nav="lefFtabNav" :call-type="'videoMeet'" :add-meeting-member-list="addMeetingMemberList" dialog-type="视频会商" />
      </div>
      <div slot="footer" class="dialog-footer btnWrap">
        <div class="btn" @click="dialogVisibleVideo = false"><span>取 消</span></div>
        <div class="btn" @click="sureClickHandleVideo"><span>创 建</span></div>
      </div>
    </el-dialog>
    <VideoMeet v-if="videoMeetDialog" ref="videoMeet" :video-dev="videoDev" :video-meet-dialog.sync="videoMeetDialog" />
    <!-- 活跃线路 -->
    <el-dialog
      v-el-drag-dialog
      title="活跃线路"
      :visible.sync="activeLine"
      width="520px"
      :close-on-click-modal="false"
      custom-class="activeLine bevel"
      @close="closeActiveLine"
    >
      <div class="tone_sip_dialog">
        <div class="tone_sip_con">
          <div class="tone_sip_con_c">
            <el-table
              :data="callList"
              style="width: 100%"
              :row-class-name="tableRowClassName"
            >
              <el-table-column
                label="序号"
                type="index"
                width="60"
              />
              <el-table-column
                label="发起人"
                width="120"
                prop="from"
              />
              <el-table-column
                label="被叫人"
                width="120"
                prop="to"
              />
              <el-table-column
                label="类型"
                width="120"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.type==="audio"?"语音呼出":"视频呼出" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="{row}">
                  <span v-show="row.mState" class="el-icon-turn-off-microphone unmute-btn btn" @click="muteOrUnmute(row)" />
                  <span v-show="!row.mState" class="el-icon-microphone mute-btn btn" @click="muteOrUnmute(row)" />
                  <!-- <span class="el-icon-video-play mute-btn btn" @click="holdOrUnhold(row)" /> -->
                  <span class="el-icon-phone end-btn btn" @click="endCall(row.sessionId,row.session,true)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 未接来电 -->
    <MissCalls v-if="missedCallDialog" @closeDialog="closeMissedCallDialog" />
    <!-- IM -->
    <IM ref="IM" :message-dialog.sync="messageDialog" />
    <!-- 广播 -->
    <Broadcast v-show="broadcastDialog" ref="broadcast" :broadcast-dialog.sync="broadcastDialog" />
  </div>
</template>

<script>
import btn from '@/assets/images/equipment/btn.png'
import sip from '@/components/mixins/sip.js'
import videoImg from '@/assets/images/equipment/video.png'
import AudioMeet from '@/components/audioMeet'
import VideoMeet from '@/components/videoMeet'
import MissCalls from '@/components/MissCalls'
import Broadcast from '@/components/broadcast'
import IM from '@/components/IM'
import { mapGetters } from 'vuex'
// import { validateNumber811 } from '@/utils/validate'
import { sessionStorage, localStorage } from '@/utils/storage'
import Organize from '@/components/organize'
import { getName } from '@/utils'

export default {
  name: 'Sector',
  components: {
    AudioMeet, IM, VideoMeet, Organize, MissCalls, Broadcast
  },
  mixins: [sip],
  props: {},
  data() {
    return {
      TONE_voip: sessionStorage.get('TONE_voip'),
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
      dialogVisibleVideo: false,
      videoDev: [],
      btn: btn,
      sectorList: [
        // { text: '未接来电', icon: 'guiji' },
        // { text: '即时消息', icon: 'jishi' },
        // { text: '拨号盘', icon: 'dial' },
        // { text: '语音会议', icon: 'yuyin' },
        // { text: '视频会商', icon: 'guiji' },
        // { text: '历史轨迹', icon: 'guiji' },
        // { text: '活跃线路', icon: 'xianlu' }
        // { text: '广播', icon: 'guiji' }
      ],
      active: false,
      itemActive: '',
      firstTime: '',
      lastTime: '',
      isDrag: false,
      // 拨号盘
      bohaopan: false,
      bohaopanForm: {
        dialInputText: '' // 拨号盘文字
      },
      bohaopanRules: {
        dialInputText: [
          { required: true, message: '请输入呼叫号码', trigger: 'blur' }
          // { required: true, trigger: 'blur', validator: validateNumber811 }
        ]
      },
      keyText: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], // 键盘数字
      videoImg: videoImg,
      // 活跃线路
      activeLine: false,
      // 即时消息
      messageDialog: false,
      // 未接来电
      missedCallDialog: false,
      // 视频会商
      videoMeetDialog: false,
      // 广播
      broadcastDialog: false
    }
  },
  computed: {
    ...mapGetters([
      'mqResponseData',
      'userListInfo',
      'callList',
      'callListListen',
      'meetDialog',
      'addMeetingMemberList',
      'checkResourcelist',
      'isPolling'
    ])
  },
  watch: {
    meetDialog: function(val) {
      if (!val) {
        this.itemActive = ''
      }
    },
    videoMeetDialog: function(val) {
      if (!val) {
        this.itemActive = ''
      }
    },
    dialogVisibleVideo: function(val) {
      if (!val) {
        this.itemActive = ''
      }
    },
    messageDialog: function(val) {
      if (!val) {
        this.itemActive = ''
      }
    },
    broadcastDialog: function(val) {
      if (!val) {
        this.itemActive = ''
      }
    },
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        if (json.MSG_KEY === 'FORCECALL') {
          const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
          // 关闭当前正在进行的所有通话
          if (this.callList.length > 0) {
            this.$message.warning(`已被 ${getName(this.userListInfo, json.CALLER_USER)} 强制拆线！`)
            // 关闭对讲、关闭语音会议、关闭广播、关闭视频会商
            this.callList.forEach((item) => {
              if (item.from.search('8878') !== -1 || item.to.search('8878') !== -1) {
                // 对讲在外面统一挂断所有的
              } else if (item.from.search('8858') !== -1 || item.to.search('8858') !== -1) {
                // 挂断语音会议
                this.$refs.audioMeet.closeMeetForce()
              } else if (item.from.search('8868') !== -1 || item.to.search('8868') !== -1) {
                // 挂断广播
                this.$refs.broadcast.closeMeetForce()
              } else {
                // 挂断音视频通话
                this.endCall(item.sessionId, item.session, true)
              }
            })
            // 关闭对讲
            this.$root.$emit('jtIntercomAll', true)
          }
          // 关闭视频会商
          if (this.videoMeetDialog) {
            this.$message.warning(`已被 ${getName(this.userListInfo, json.CALLER_USER)} 强制拆线！`)
            this.$refs.videoMeet.endVideoMeet(true)
          }
          // 强插回执
          this.$api.common.forceCallBack({
            token: TOKEN,
            policeNo: POLICE_ID,
            callerUser: json.CALLER_USER,
            dialedUser: json.DIALED_USER,
            id: json.ID
          }).then(res => {
            console.log(res.data.result)
          })
        }
      },
      immediate: true
    }
  },
  created() {
    const kjcd = sessionStorage.get('kjcd')
    const dictionaries = {
      'bhp': 'dial',
      'wjld': 'guiji',
      'jsxx': 'jishi',
      'yyhy': 'yuyin',
      'sphs': 'guiji',
      'hyxl': 'xianlu',
      'gb': 'guiji'
    }
    // console.log(kjcd)
    this.sectorList = kjcd.map(item => {
      return {
        text: item.TEXT,
        icon: dictionaries[item.PATH] || 'guiji',
        id: item.PATH
      }
    })
    this.$root.$on('broadcast', async(v) => {
      if (v !== 'save') {
        // 创建广播并发起
        await this.$refs.broadcast.getMeetingList(true)
      } else {
        await this.$refs.broadcast.getMeetingList()
      }
      this.broadcastDialog = true
    })
    this.$root.$on('IM', async(v) => {
      if (v.type === 'common') {
        await this.$refs.IM.getGroupList()
        const find = this.$refs.IM.groupList.find(obj => obj && String(obj.GROUP_ID) === String(v.ID))
        if (find) this.$refs.IM.goMessage(find)
      } else if (v.type === 'single') {
        // 单人群聊
        const find = this.$refs.IM.userList.find(obj => obj && String(obj.yonghuid) === String(v.yonghuid))
        this.$refs.IM.goMessage(find)
      } else if (v.type === 'message') {
        this.$refs.IM.tabClick({
          name: 'message',
          title: '聊天记录'
        })
      } else {
        await this.$refs.IM.getGroupList()
        this.$refs.IM.goMessage(this.$refs.IM.groupList[1])
      }
      this.messageDialog = true
    })
  },
  mounted() {
    this.creatSector()
  },
  beforeDestroy() {
    this.$root.$off('broadcast')
    this.$root.$off('IM')
  },
  methods: {
    // 创建扇形动态排列
    creatSector() {
      if (this.sectorList && this.sectorList.length > 0) {
        var list = document.querySelectorAll('.smartcmshtlist')
        // console.log(list);
        if (this.sectorList.length === 1) {
          list[0].setAttribute('style', 'transform: rotate(67.5deg) skew(45deg)')
        } else if (this.sectorList.length === 2) {
          list[0].setAttribute('style', 'transform: rotate(45deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(90deg) skew(45deg)')
        } else if (this.sectorList.length === 3) {
          list[0].setAttribute('style', 'transform: rotate(22.5deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(67.5deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(112.5deg) skew(45deg)')
        } else if (this.sectorList.length === 4) {
          list[0].setAttribute('style', 'transform: rotate(0deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(45deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(90deg) skew(45deg)')
          list[3].setAttribute('style', 'transform: rotate(135deg) skew(45deg)')
        } else if (this.sectorList.length === 5) {
          list[0].setAttribute('style', 'transform: rotate(-22.5deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(22.5deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(67.5deg) skew(45deg)')
          list[3].setAttribute('style', 'transform: rotate(112.5deg) skew(45deg)')
          list[4].setAttribute('style', 'transform: rotate(157.5deg) skew(45deg)')
        } else if (this.sectorList.length === 6) {
          list[0].setAttribute('style', 'transform: rotate(-45deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(0deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(45deg) skew(45deg)')
          list[3].setAttribute('style', 'transform: rotate(90deg) skew(45deg)')
          list[4].setAttribute('style', 'transform: rotate(135deg) skew(45deg)')
          list[5].setAttribute('style', 'transform: rotate(180deg) skew(45deg)')
        } else if (this.sectorList.length === 7) {
          list[0].setAttribute('style', 'transform: rotate(-67.5deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(-22.5deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(22.5deg) skew(45deg)')
          list[3].setAttribute('style', 'transform: rotate(67.5deg) skew(45deg)')
          list[4].setAttribute('style', 'transform: rotate(112.5deg) skew(45deg)')
          list[5].setAttribute('style', 'transform: rotate(157.5deg) skew(45deg)')
          list[6].setAttribute('style', 'transform: rotate(202.5deg) skew(45deg)')
        } else if (this.sectorList.length === 8) {
          list[0].setAttribute('style', 'transform: rotate(-90deg) skew(45deg)')
          list[1].setAttribute('style', 'transform: rotate(-45deg) skew(45deg)')
          list[2].setAttribute('style', 'transform: rotate(0deg) skew(45deg)')
          list[3].setAttribute('style', 'transform: rotate(45deg) skew(45deg)')
          list[4].setAttribute('style', 'transform: rotate(90deg) skew(45deg)')
          list[5].setAttribute('style', 'transform: rotate(135deg) skew(45deg)')
          list[6].setAttribute('style', 'transform: rotate(180deg) skew(45deg)')
          list[7].setAttribute('style', 'transform: rotate(225deg) skew(45deg)')
        }
      }
    },
    changeValue(e) {
      const str = '0123456789*#'
      const arr = e.target.value.split('')
      let result = ''
      arr.forEach(item => {
        if (str.indexOf(item) !== -1) {
          result += item
        }
      })
      e.target.value = result
      this.bohaopanForm.dialInputText = result
    },
    // 过滤人员设备
    filterUserDev() {
      this.videoDev = []
      // console.log(this.checkResourcelist, 123456789)
      this.addMeetingMemberList.forEach((item) => {
        // if (item.power.search('2') !== -1) {
        item.id = item.userId
        this.videoDev.push(item)
        // }
      })
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
    },
    async sureClickHandleVideo() {
      if (this.isPolling) {
        this.$message.warning('正在进行视频轮询，无法进行其他音视频通信!')
        return
      }
      await this.filterUserDev()
      this.dialogVisibleVideo = false
      this.$nextTick(_ => {
        this.videoMeetDialog = true
      })
    },
    deleteListen(i, flag = true) {
      // 删除当前 未接记录
      const arr = JSON.parse(JSON.stringify(this.callListListen))
      const userName = sessionStorage.get('TONE_sipUserInfo').userName
      const CallListStorage = localStorage.get('listenCallList')
      if (flag) {
        i = arr.findIndex(item => item.forTime === i)
        arr.splice(i, 1)
        this.$store.commit('sip/SET_CALL_LISTEN', arr)
        if (CallListStorage) {
          CallListStorage[userName].splice(i, 1)
          localStorage.set('listenCallList', CallListStorage)
        }
      } else {
        this.$store.commit('sip/SET_CALL_LISTEN', [])
        CallListStorage[userName] = []
        localStorage.set('listenCallList', CallListStorage)
      }
    },
    sectorClick(val) {
      // console.log(val)
      if (this.isDrag) return // 拖拽情况不执行内部点击事件
      // this.itemActive = this.itemActive === val.text ? '' : val.text
      this.itemActive = val.text
      // 拨号盘
      if (val.id === 'bhp') {
        this.bohaopan = true
        this.$nextTick(() => {
          this.$refs['bohaopanForm'].resetFields()
        })
      }
      // 语言会议
      if (val.id === 'yyhy') {
        this.$store.commit('audioMeet/SET_meetDialog', true)
      }
      // 视频会商
      if (val.id === 'sphs') {
        this.dialogVisibleVideo = true
        // this.videoMeetDialog = true
      }
      if (val.id === 'jsxx') {
        this.messageDialog = true
      }
      // 活跃线路
      if (val.id === 'hyxl') {
        this.activeLine = true
      }
      // 未接来电
      if (val.id === 'wjld') {
        this.missedCallDialog = true
      }
      // 广播
      if (val.id === 'gb') {
        this.broadcastDialog = true
      }
    },
    clickBtn(e) {
      if (this.isDrag) return // 拖拽情况不执行内部点击事件
      this.active = !this.active
    },
    onDragstop(e) {
      this.isDrag = this.lastTime - this.firstTime > 200
    },
    mousedown() {
      this.firstTime = new Date().getTime()
    },
    mouseup() {
      this.lastTime = new Date().getTime()
    },
    // 拨号盘
    activateEv(element) {
      this.$refs[element].focus()
    },
    // 拨号盘输入
    dialKey(val) {
      this.bohaopanForm.dialInputText += val
    },
    isShowDial() {
      this.itemActive = ''
      this.bohaopan = false
    },
    closeBohaopan() {
      this.itemActive = ''
    },
    // 活跃线路
    closeActiveLine() {
      this.itemActive = ''
    },
    handleEdit(index, row) {
      console.log(index, row)
    },
    handleDelete(index, row) {
      console.log(index, row)
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'deep-row'
      }
      return ''
    },
    // 呼叫
    hujiao(audioOrVideo, userName) {
      // console.log(audioOrVideo, userName, this.bohaopanForm.dialInputText + '123')
      let path = this.$route.path
      path = path.slice(1)
      this.$refs['bohaopanForm'].validate((valid) => {
        if (valid) {
          this.makeCall({ callNumber: this.bohaopanForm.dialInputText || userName, audioOrVideo: audioOrVideo, belong: path })
          this.bohaopan = false
        } else {
          return false
        }
      })
    },
    // 关闭未接来电弹层
    closeMissedCallDialog() {
      this.missedCallDialog = false
      this.itemActive = ''
    }
  }
}
</script>
<style lang="scss" scoped>
* {
  // position: relative;
	list-style: none;
}
.sectorWrap {
  .sector {
    position: fixed;
    right: 4rem;
    bottom: 30px;
    // width: 208px;
    // height: 208px;
    z-index: 1000;
    .vdr {
      // position: relative;
      // width: 210px;
      // height: 210px;
    }
    .sectorDrag {
      // width: 208px;
      // height: 208px;
    }
    .smartcmsht-wrapper {
      width: 208px;
      height: 208px;
      overflow: hidden;
      position: absolute;
      z-index: 10;
      border-radius: 50%;
      transform: scale(0.1);
      pointer-events: none;
      transition: all .3s ease;
      ul {
        position: relative;
      }
    }
    .active {
      pointer-events: auto;
      transform: scale(1) rotate(0.1deg);
    }

    .smartcmsht-button {
      border: none;
      background: none;
      color: #14FF00;
      text-align: center;
      height: 50.4px;
      width: 50.4px;
      position: absolute;
      left: 77px;
      top: 72px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 11;
      img {
        height: 50.4px;
        width: 50.4px;
      }
    }
    .smartcmsht-wrapper li {
      position: absolute;
      width: 120px;
      height: 120px;
      transform-origin: 100% 100%;
      overflow: hidden;
      left: 50%;
      top: 50%;
      margin-top: -20.4px;
      margin-left: -120px;
      background: radial-gradient(circle, rgba(0, 39, 60, 0.8), rgba(0, 79, 120, 0.8));
      border: 1px solid rgba(52, 193, 218, 0.6);
      box-shadow: inset 0px 0px 10px 2px #35879d;
      .icon {
        width: 16px;
        height: 18px;
        margin: 12px auto;
        .iconImg {
          width: 100%;
          height: 100%;
        }
        .jishi {
          transform: rotate(90deg);
        }
        .dial {
          transform: rotate(45deg);
        }
        .xianlu {
          width: 20px;
          height: 20px;
        }
      }
      &:hover, &.itemActive {
        background: #eb873f;
        border: 1px solid #f1f278;
        box-shadow: inset 0px 0px 10px 2px #f1f278;
        a {
          color: #fff;
        }
        .icon {
          .iconImg {
            color: #fff !important;
          }
        }
      }
    }

    .smartcmsht-wrapper li a {
      display: block;
      font-size: 12px;
      height: 176px;
      width: 176px;
      position: absolute;
      bottom: -58px;
      right: -44px;
      border-radius: 50%;
      text-decoration: none;
      color: rgba(43, 227, 250, 1);
      padding-top: 82px;
      text-align: center;;
      transform: skew(-45deg) rotate(-67.5deg);
    }
    // .smartcmsht-wrapper li:first-child {
    //   transform: rotate(-22.5deg) skew(45deg);
    // }
    // .smartcmsht-wrapper li:nth-child(2) {
    //   transform: rotate(22.5deg) skew(45deg);
    // }
    // .smartcmsht-wrapper li:nth-child(3) {
    //   transform: rotate(67.5deg) skew(45deg)
    // }
    // .smartcmsht-wrapper li:nth-child(4) {
    //   transform: rotate(112.5deg) skew(45deg);
    // }
    // .smartcmsht-wrapper li:nth-child(5) {
    //   transform: rotate(157.5deg) skew(45deg);
    // }
  }
  ::v-deep .bohaopan {
    height: 360px;
    .el-dialog__header {
      padding: 15px 15px 10px;
      border-bottom: 1px solid #497a7a;
      .el-dialog__title,.el-dialog__close {
        font-size: 14px;
        font-family: PingFang SC;
        color: rgba(250, 253, 255, 1);
      }
      .el-dialog__headerbtn {
        top: 17px;
        right: 15px;
      }
    }
    .el-dialog__body {
      height: 260px;
      padding: 0px !important;
      .tone_sip_dialog{
        width: 100%;
        height: 100%;
      }
      .tone_sip_con{
        width: 100%;
        height: 100%;
        padding: 10px 15px 15px;
      }
      .tone_sip_con_c{
        width: 100%;
        height: 100%;
        .el-form-item {
          margin-bottom: 0;
        }
        .numWrap {
          padding-top: 15px;
        }
        .num-box {
          width: 205px;
          color: #FAFDFF;
        }
        .num-btn{
          user-select: none;
          width: 63px;
          height: 42px;
          line-height: 42px;
          text-align: center;
          border: 1px solid #096688;
          margin-right: 5px;
          margin-top: 5px;
          border-radius: 3px; cursor: pointer;
        }
        .dail-makecall{
          height: 30px; font-size: 30px; color: #30deff;
        }
        .dail-makecall .callbtn{
          float: left;
          height: 42px;
          line-height: 42px;
          width: 63px;
        }
        .el-input__inner {
          background-color: rgba(0, 85, 128, 0.6);
          border: 1px solid #01cfff;
          font-size: 14px;
          font-weight: bold;
          color: #FAFDFF;
          &::-webkit-input-placeholder {
            font-size: 12px;
          }
          &:-moz-placeholder {
            font-size: 12px;
          }
          &::-moz-placeholder {
            font-size: 12px;
          }
          &:-ms-input-placeholder {
            font-size: 12px;
          }
        }
      }
    }
    .el-dialog__footer {
      border-top: 1px solid #497a7a;
      padding: 10px 15px 15px;
      height: 24px;
      .btn{
        cursor: pointer;
        background: url('../../assets/images/equipment/btnBg.png') no-repeat;
        background-size: 100% 100%;
        width: 63px;
        height: 24px;
        line-height: 24px;
        font-size: 16px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        margin-right: 5px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
  ::v-deep .activeLine {
    height: 578px;;
    .el-dialog__header {
      padding: 15px 15px 10px;
      border-bottom: 1px solid #497a7a;
      .el-dialog__title,.el-dialog__close {
        font-size: 14px;
        font-family: PingFang SC;
        color: rgba(250, 253, 255, 1);
      }
      .el-dialog__headerbtn {
        top: 17px;
        right: 15px;
      }
    }
    .el-dialog__body {
      height: 528px;
      padding: 0px !important;
      .tone_sip_dialog{
        width: 100%;
        height: 100%;
      }
      .tone_sip_con{
        width: 100%;
        height: calc(100% - 10px);
        // border-bottom: 1px solid #497a7a;

      }
      .tone_sip_con_c{
        width: 100%;
        height: 100%;
        overflow: auto;
        .el-table {
          background-color: transparent;
          &::before {
            height: 0px;
          }
          .deep-row {
            background: rgba(0, 85, 128, 0.7);
          }
          .listenCall{
          &>div{
            display: flex;
            justify-content: space-between;
            color: #01cfff;
            cursor: pointer;
          }
        }
          thead {
            color:#fff;
            font-size: 12px;
            th {
              &:first-child>.cell {
                padding-left: 17px;
              }
            }
          }
          .el-table__body-wrapper {
            tbody {
              color:#fff;
              font-size: 12px;
              font-weight: 500;
              tr td {
                &:first-child>.cell {
                  padding-left: 17px;
                }
              }
            }
          }
          .el-table__row:hover td{
            background-color: rgba(0, 85, 128, 0.7) !important;
          }
          th, tr {
            background-color: #004466;
          }
          td, th.is-leaf {
            border-bottom: none !important;
          }
          .btn {
            display: inline-block;
            text-align: center;
            width: 23px;
            height: 23px;
            margin-right: 7px;
            border-radius: 50%;
            cursor: pointer;
            line-height: 23px !important;
          }
        }
      }
    }
  }
}
</style>
