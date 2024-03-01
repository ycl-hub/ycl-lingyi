<template>
  <div>
    <!--==视频窗口==-->
    <vue-drag-resize
      v-for="(item,i) in mapCallList"
      v-if="item.type!=='audio'&&!item.isQuanXuanVideo"
      :key="item.sessionId"
      :is-active="false"
      :x="350+i*10"
      :y="200+i*10"
      :w="750"
      :h="450"
      :class="isFullScreen ? 'fullScreen' : ''"
      :z="2000"
      @resizing="resize"
      @dragging="resize"
    >
      <div class="tone_sip_dialog">
        <div class="tone_sip_dialog_tit">
          <span class="tit">视频窗口</span>
          <span class="el-icon-close close" @click="endCall(item.sessionId,item.session,true,i)" />
        </div>
        <div class="tone_sip_con">
          <div :id="item.sessionId+'window'" class="tone_sip_con_c qx_c_single_call">
            <video :id="item.sessionId" />
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundMax"><i class="el-icon-minus" title="缩小" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(3,item.session)" /></span>
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundMin"><i class="el-icon-plus" title="放大" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(1,item.session)" /></span>
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundTop"><i class="el-icon-caret-top" title="向上" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(2,item.session)" /></span>
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundBot"><i class="el-icon-caret-bottom" title="向下" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(8,item.session)" /></span>
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundLeft"><i class="el-icon-caret-left" title="向左" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(4,item.session)" /></span>
            <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundRight"><i class="el-icon-caret-right" title="向右" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(6,item.session)" /></span>
            <div class="info">
              <span> {{ getName(item) }}</span>
              <span>{{ getTime(item.timer) }}</span>
            </div>
            <div class="info_list">
              <span v-if="item.localFrameWidth">本地分辨率：{{ item.localFrameWidth+'x'+item.localFrameHeight }}</span>
              <span v-if="item.remoteFrameWidth">远程分辨率：{{ item.remoteFrameWidth+'x'+item.remoteFrameHeight }}</span>
              <span v-if="item.sendBitrate">视频发送：{{ item.sendBitrate }}</span>
              <span v-if="item.receiveBitrate">视频接收：{{ item.receiveBitrate }}</span>
            </div>
            <div class="vodeocontrol">
              <span
                v-if="isFullScreen"
                title="全屏"
                class="v-btn min fl"
                @click="exitFull()"
              >
                <svg-icon class="full" icon-class="fullMin" />
              </span>
              <span
                v-if="!isFullScreen"
                title="全屏"
                class="v-btn large fl"
                @click="fullScreen(item.sessionId+'window')"
              >
                <svg-icon class="full" icon-class="fullLar" />
              </span>
              <span
                class="v-btn picture-btn fl"
                title="抓拍"
                @click="screenShot(item.sessionId)"
              />
              <span class="v-btn record-btn fl" title="云台控制" @click="changeCloud(item.sessionId)" />
              <span
                v-show="!item.mState"
                title="禁言"
                class="v-btn text-center mute-btn fl"
                @click="muteOrUnmute(item)"
              >
                <svg-icon class="full" icon-class="mute" />
              </span>
              <span
                v-show="item.mState"
                title="取消禁言"
                class="v-btn text-center unmute-btn fl"
                @click="muteOrUnmute(item)"
              >
                <svg-icon class="full" icon-class="unmute" />
              </span>
              <span v-show="item.voiceState" title="静音" class="v-btn text-center mute-btn fl" @click="voiceOrUnVoice(item)">
                <svg-icon class="full" icon-class="voice" />
              </span>
              <span v-show="!item.voiceState" title="取消静音" class="v-btn text-center unmute-btn fl" @click="voiceOrUnVoice(item)">
                <svg-icon class="full" icon-class="unvoice" />
              </span>
              <span
                class="v-btn fenfa-btn fl"
                title="分发"
                @click="issue(item, i)"
              />
              <span
                class="v-btn end-btn fr"
                title="挂断"
                @click.self.prevent="
                  endCall(item.sessionId, item.session, true, i)
                "
              />
            </div>
          </div>
        </div>
      </div>
    </vue-drag-resize>
    <!-- 弹窗 -->
    <el-dialog
      v-el-drag-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      custom-class="organizeDialog bevel"
    >
      <div class="organizeDialog_content">
        <OrganizePer :add-meeting-member-list="addMeetingMemberList" />
      </div>
      <div slot="footer" class="dialog-footer btnWrap">
        <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
        <div class="btn" @click="sureClickHandle"><span>确定</span></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import SliceBorder from '@/components/sliceBorder'
import sip from '@/components/mixins/sip.js'
import OrganizePer from '@/components/organizePer'
import { sessionStorage } from '@/utils/storage'
import { mapGetters } from 'vuex'
import fullScreen from '@/components/mixins/fullScreen.js'
import { getTime } from '@/utils/index'
export default {
  name: 'VideoWindow',
  components: {
    OrganizePer
    // SliceBorder
  },
  mixins: [sip, fullScreen],
  props: {
  },
  data() {
    return {
      videoWidth: 720,
      videoHeight: 450,
      videoLeft: 20,
      videoTop: 200,
      dialogTitle: '', // 弹框标题
      dialogType: '', // 弹框类别add为添加,invite为邀请,distribute为分发
      dialogVisible: false,
      distributeItem: {},
      addMeetingMemberList: [], // 会议添加成员
      userInfo: sessionStorage.get('TONE_sipUserInfo'), getTime, cloundOpenArr: []
    }
  },
  computed: {
    mapCallList: function() {
      const temp = this.callList.filter((item) => {
        return item.belong !== 'videoScheduling'
      })
      return temp
      // return this.callList
    },
    ...mapGetters([
      'userListInfo'
    ])
  },
  activated() {
    // console.log('activated')
    this.mapCallList.forEach((item) => {
      this.setupRemoteMedia(item.session, item.sessionId)
    })
  },
  deactivated() {
    // console.log('deactivated')
  },
  provide: function() {
    return {
    }
  },
  created() {
  },
  mounted() {
    // 不论组件在那个父元素下引用，都将组将插入到body中
    this.$nextTick(() => {
      const body = document.querySelector('.map')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
  },
  methods: {
    // 云台控制
    changeCloud(id) {
      const index = this.cloundOpenArr.indexOf(id)
      if (index !== -1) {
        this.cloundOpenArr.splice(index, 1)
      } else {
        this.cloundOpenArr.push(id)
      }
    },
    getName(item) {
      let to = ''
      if (String(item.from) === String(this.userInfo.userName)) {
        to = item.to
      } else {
        to = item.from
      }
      return this.userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || to
    },
    // 视频窗口弹窗调整大小
    resize(newRect) {
      this.videoWidth = newRect.width
      this.videoHeight = newRect.height
      this.videoTop = newRect.top
      this.videoLeft = newRect.left
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      switch (this.dialogType) {
        case 'distribute':
          this.distributeVideo()
          break
      }
    },
    // 视频分发按钮点击
    issue(item, index) {
      this.dialogType = 'distribute'
      this.dialogTitle = '视频分发'
      this.addMeetingMemberList = []
      this.dialogVisible = true
      this.distributeItem = item
      // this.$store.commit('sip/SET_POSTION_INDEX', index)
    },
    // 分发视频
    distributeVideo() {
      const flag = this.addMeetingMemberList.find(item => parseInt(item.userId) === parseInt(this.distributeItem.from) || parseInt(item.userId) === parseInt(this.distributeItem.to))
      console.log(flag, this.addMeetingMemberList, this.distributeItem)
      if (flag) {
        this.$message.warning('不允许分发给正在通话的用户')
        return
      }
      var exten = this.addMeetingMemberList.map(v => {
        return v.userId
      }).join(',')
      this.$api.common.vdispatchBtn({
        callUser: this.distributeItem.from,
        variableUser: this.distributeItem.to,
        distributionUser: exten,
        isVideo: '0'
      }).then(res => {
        console.log(res, 666)
        this.dialogVisible = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  ::v-deep .tone_sip_dialog{
    width: 100%;
    color: #F1F1F1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(circle, #00273C, #004F78);
    border: 1px solid rgba(52, 193, 218, 0.6);
    box-shadow: inset 0px 0px 10px 2px #35879d;
    .tone_sip_dialog_tit{height: 31px; line-height: 31px; padding:0px 10px; overflow: hidden; cursor: move;}
    .tone_sip_dialog_tit span.tit{float: left;}
    .tone_sip_dialog_tit span.close{float: right; font-size: 16px; cursor: pointer; line-height: 31px;}
    .tone_sip_con{background:rgba(2,51,67,.7); position: absolute; top: 31px; height: calc(100% - 31px); width: 100%;overflow: hidden;}
    .tone_sip_con_c{width: 100%;height: 100%;

        .v_cloundTop{
                  position: absolute;
                  top: 10px;
                  left: 50%;
                  transform: translateX(-50%) scale(1.5);
                  cursor: pointer;
            }
            .v_cloundBot{
                  position: absolute;
                  bottom: 50px;
                  left: 50%;
                  transform: translateX(-50%) scale(1.5);
                  cursor: pointer;
            }
             .v_cloundLeft{
                  position: absolute;
                  top: 50%;
                  left: 10px;
                  transform: translateY(-50%) scale(1.5);
                  cursor: pointer;
            }
             .v_cloundRight{
                  position: absolute;
                  top: 50%;
                  right: 10px;
                  transform: translateY(-50%) scale(1.5);
                  cursor: pointer;
            }
            .v_cloundMax,.v_cloundMin{
                  position: absolute;
                  top: 10px;
                  cursor: pointer;
            }
            .v_cloundMax{
              left: calc(20% - 10px);
            }
            .v_cloundMin{
              left: 25%;
            }
    }
    .tone_sip .vdr.active:before{display: none; position: unset; width: 0; height:0;}
    .tone_sip_con_c video{ width: 100%; height: 100%; background-color: #000;}
    .tone_sip_con_c .info{
     width:100%;position: absolute;left: 0;top: 0;padding: 10px;display: flex;justify-content: space-between;
    }
    .tone_sip_con_c .info_list{
      position: absolute;left: 0;top: 20px;padding: 10px;
      gap: 5px;
      display: flex;
      flex-direction: column;
    }
    .tone_sip_con_c:hover .vodeocontrol{bottom: 0px;}
    .tone_sip_con_c .vodeocontrol{position: absolute;display: flex;
  justify-content: flex-end; height: 40px; width: 100%; bottom: -40px; background:rgba(255,255,255,.2); transition: all .3s;
    .large, .min {
            margin-left: 15px;
            font-size: 14px;
            background: url('../../assets/images/videoScheduling/v_btnBg.png') no-repeat center center; background-size: contain;
            text-align: center;
            // width: 40px;
            height: 40px;
            // margin-top: 3px;
            .full {
              color:#fff;
              margin-top: 11px;
            }
          }
          .min {
            // width: 42px;
            height: 42px;
            .full {
              width: 20px;
              height: 18px;
            }
          }
          .picture-btn {
            // width: 40px;
            height: 40px;
            // margin-top: 3px;
            background: url('../../assets/images/videoScheduling/picture.png') no-repeat center;
            background-size: contain;
          }
    }
    .btn{ display: inline-block; margin:  0 5px;  cursor: pointer;  text-align: center;}
    .btn-circle{ width: 30px; height: 30px; border-radius: 50%; font-size: 18px; background-color:#409EFF; color: #F1F1F1; }
    .btn-circle::before{line-height: 30px;}
  }
</style>
