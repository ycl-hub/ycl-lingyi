<template>
  <div>
    <!-- 圈选视频呼叫 -->
    <vue-drag-resize
      id="quanxuanVideo"
      :x="divLeft"
      :y="divTop"
      :w="divWidth"
      :h="divHeight"
      :z="2000"
      :is-active="true"
      class="quanxuanDialog"
      :class="isFullScreen ? 'fullScreen' : ''"
      :is-resizable="true"
      :is-draggable="true"
      @resizestop="resize"
      @dragstop="resize"
      @clicked="$refs['drag-input'].focus()"
      @activated="$refs['drag-input'].focus()"
    >
      <div class="quanxuan_header">
        <span class="tit">视频群呼</span>
        <span class="el-icon-close close" @click="closeQuanXuan(true)" />
        <span v-if="isFullScreen" class="el-icon-copy-document min" @click="exitFull()" />
        <span v-if="!isFullScreen" class="el-icon-full-screen large" @click="fullScreen('quanxuanVideo')" />
      </div>
      <div ref="rightVideoBox" class="quanxuan_con">
        <div class="left quanxuan_con_left">
          <div
            v-for="(item, i) in mapCallListStates.slice(
              (pageCount - 1) * pageSum,
              pageCount * pageSum
            )"
            :id="'quanxuanVideo,' + i"
            :key="i"
            :class="[
              'four quanxuanItem',
              isDragIng === 'quanxuanVideo,' + i ? 'videoDrag' : ''
            ]"
            :draggable="item.sessionId && item.state"
            @mousedown="
              e => {
                e.stopPropagation();
                return false;
              }
            "
            @mousemove="
              e => {
                e.stopPropagation();
                return false;
              }
            "
            @mouseup="
              e => {
                e.stopPropagation();
                return false;
              }
            "
            @drop="domDrop"
            @dragstart="domDropStart(item, $event)"
            @dragover.stop.prevent="
              e => {
                if (e.stopPropagation) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }
            "
            @dragend="domDragEnd"
            @dragenter="domDragEnter"
            @dragleave="domDragLeave"
          >
            <div class="info">
              <span v-if="item.sessionId && item.state">{{
                getName(item.to)
              }}</span><span v-if="item.sessionId && item.state === '已接听'">{{
                getTime(item.timer)
              }}</span>
            </div>
            <div v-if="item.state !== '已接听'" class="kongxian">
              <!-- <svg-icon class="kongxian_icon" icon-class="camera" /> -->
              <p class="kongxian_text">{{ item.state }}</p>
              <p
                v-if="item.state === '呼叫中'"
                :draggable="false"
                title="挂断"
                class="endCall"
                @click.self.prevent="
                  endCall(item.sessionId, item.session, true, i)
                "
              />
              <p v-if="!item.sessionId" class="kongxian_text">
                可拖动呼叫或交换窗口
              </p>
            </div>
            <div v-if="item.state === '已接听'" class="qx_con">
              <div class="qx_c">
                <video :id="item.sessionId" />
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundMax"><i
                  class="el-icon-minus"
                  title="缩小"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(3, item.session)"
                /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundMin"><i
                  class="el-icon-plus"
                  title="放大"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(1, item.session)"
                /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundTop"><i
                  class="el-icon-caret-top"
                  title="向上"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(2, item.session)"
                /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundBot"><i
                  class="el-icon-caret-bottom"
                  title="向下"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(8, item.session)"
                /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundLeft"><i
                  class="el-icon-caret-left"
                  title="向左"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(4, item.session)"
                /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId) !== -1" class="v_cloundRight"><i
                  class="el-icon-caret-right"
                  title="向右"
                  @mouseup="sendDTMF(5, item.session)"
                  @mousedown="sendDTMF(6, item.session)"
                /></span>
                <div class="vodeocontrol">
                  <span v-if="isFullScreen" title="全屏" class="v-btn min fl" @click="exitFull()">
                    <svg-icon class="full" icon-class="fullMin" />
                  </span>
                  <span
                    v-if="!isFullScreen"
                    title="全屏"
                    class="v-btn large fl"
                    @click="fullScreen('quanxuanVideo,' + i)"
                  >
                    <svg-icon class="full" icon-class="fullLar" />
                  </span>
                  <span class="v-btn picture-btn fl" title="抓拍" @click="screenShot(item.sessionId)" />
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
                  <span
                    v-show="item.voiceState"
                    title="静音"
                    class="v-btn text-center mute-btn fl"
                    @click="voiceOrUnVoice(item)"
                  >
                    <svg-icon class="full" icon-class="voice" />
                  </span>
                  <span
                    v-show="!item.voiceState"
                    title="取消静音"
                    class="v-btn text-center unmute-btn fl"
                    @click="voiceOrUnVoice(item)"
                  >
                    <svg-icon class="full" icon-class="unvoice" />
                  </span>
                  <span class="v-btn fenfa-btn fl" title="分发" @click="issue(item, i)" />
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
        </div>
        <div class="right quanxuan_con_right">
          <div class="right_header">
            <!-- <span class="left">选中设备</span>
            <span class="right">选中设备号码</span> -->
            <el-input
              ref="drag-input"
              v-model.trim="filterText"
              class="filter"
              type="text"
              placeholder="关键字搜索"
              @mousedown="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @mousemove="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @mouseup="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @keyup.enter.native="searchBtn"
            >
              <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
            </el-input>
          </div>
          <ul class="rightInfo">
            <li
              v-for="(item, i) in videoDevCopy"
              :key="i"
              :draggable="true"
              class="rightInfoLi"
              @mousedown="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @mousemove="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @mouseup="
                e => {
                  e.stopPropagation();
                  return false;
                }
              "
              @dragover="
                e => {
                  if (e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }
              "
              @dragstart="userDropStart(item, $event)"
              @dragend="userDropEnd"
              @dblclick="videoGroupCall(item)"
            >
              <span
                class="left"
                :style="{ color: item.yonghuzxbj == '1' ? '#32b16c' : '#999' }"
                :title="item.name || item.userName"
                @click="skip(item.id)"
              >{{ item.name || item.userName }}</span>
              <span class="center">{{ videoIng(item) }}</span>
              <span class="right" :title="item.id || item.userId">
                <img
                  draggable="false"
                  :src="camera"
                  alt=""
                  title="视频"
                  style="background-color: transparent;"
                  class="tree-btn"
                  @click="
                    rightCall({
                      callNumber: item.id,
                      audioOrVideo: 'video',
                      belong: 'isVideoGroupCall',
                      isQuanXuanVideo: true
                    })
                  "
                >
                <img
                  :src="dragPng"
                  alt="拖拽可视频呼叫"
                  title="拖拽可视频呼叫"
                  class="tree-btn"
                  draggable="false"
                  style="background-color: transparent;"
                >
                <img
                  class="tree-btn"
                  style="width: 18px;height: 18px;background-color: transparent;"
                  :src="del"
                  title="删除"
                  alt=""
                  @click="delSession(item, i)"
                >
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="quanxuan_footer">
        <div style="width:22px;" />
        <el-pagination
          class="paging"
          layout="prev, pager, next"
          :total="videoLen"
          :prev-text="'上一页'"
          :page-size="pageSum"
          :next-text="'下一页'"
          :current-page.sync="current_page"
          @current-change="handleCurrentChange"
        />
        <div class="btnWrap">
          <div class="btn" @click="inviteVideo"><span>邀请</span></div>
          <div class="btn" @click="closeQuanXuan(false)"><span>结束</span></div>
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
        <OrganizePer :add-meeting-member-list="addMeetingMemberListData" />
      </div>
      <div slot="footer" class="dialog-footer btnWrap">
        <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
        <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
      </div>
    </el-dialog>
    <!-- 创建视频群呼 -->
    <CreateDialog
      v-if="dialogVisibleVideoGroup"
      :call-type="'video'"
      :dialog-title="'视频群呼'"
      :dialog-visible="dialogVisibleVideoGroup"
      :is-video-group="true"
      :video-dev="videoDev"
      @closeVisible="dialogVisibleVideoGroup = false"
      @sureClick="sureClickHandleVideoGroup"
    />
  </div>
</template>

<script>
import sip from '@/components/mixins/sip.js'
import fullScreen from '@/components/mixins/fullScreen.js'
import { sessionStorage } from '@/utils/storage'
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'
import { getTime } from '@/utils/index'
import del from '@/assets/images/videoScheduling/remove.png'
import search from '@/assets/images/equipment/search.png'
import OrganizePer from '@/components/organizePer'
import camera from '@/assets/images/videoScheduling/shipin.png'
import dragPng from '@/assets/images/videoScheduling/dragPng.png'
import CreateDialog from '@/components/createDialog'
export default {
  name: 'VideoGroupCall',
  components: {
    OrganizePer,
    CreateDialog
    // SliceBorder
  },
  mixins: [sip, fullScreen],
  props: {
    videoDev: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      divWidth: 950,
      filterText: '',
      dialogVisibleVideoGroup: false,
      divHeight: 500,
      camera,
      dragPng,
      del,
      search,
      divLeft: 300,
      divTop: 150,
      tempCall: [],
      dragIndex: 0,
      isDragIng: '',
      dragSessionArr: [],
      dragItem: {},
      pageCount: 1, // 分页默认第一页
      pageSum: 4, // 窗口可容纳视频数量
      TONE_voip: sessionStorage.get('TONE_voip'),
      getTime,
      cloundOpenArr: [],
      dialogTitle: '', // 弹框标题
      dialogType: '', // 弹框类别add为添加,invite为邀请,distribute为分发
      dialogVisible: false,
      distributeItem: {},
      addMeetingMemberListData: [], // 会议添加成员
      videoDevCopy: [],
      current_page: 1
    }
  },
  computed: {
    ...mapGetters([
      'mapCallListStates',
      'addMeetingMemberList',
      'mqResponseData'
    ]),
    videoLen() {
      return this.mapCallListStates.filter(obj => obj.sessionId).length
    }
  },
  watch: {
    videoLen: {
      handler(val, oldVal) {
        const { mapCallListStates, pageCount, pageSum } = this
        let filter = mapCallListStates.slice(
          (pageCount - 1) * pageSum,
          pageCount * pageSum
        )
        filter = filter.filter(obj => obj.sessionId)
        if (pageCount !== 1 && filter.length === 4) {
          // 当前不在第一页   且仅剩的通话刚好只有四个  回到第一页
          this.pageCount = 1
        }
        // 当前分页的通话
        if (pageCount !== 1 && filter.length > 0) {
          return
          // 当前分页还有通话 不为第一页 无变化
        }
        if (pageCount !== 1 && filter.length === 0) {
          // 当前分页无通话自动切到第一页
          this.pageCount = 1
        }
        if (
          pageCount === 1 &&
          filter.length < 4 &&
          mapCallListStates.filter(obj => obj.sessionId).length >= 4
        ) {
          // 在第一页时 通话未铺满 还有多余的通话 继续补充
          this.pageHandler()
        }
      }
    },
    filterText: {
      handler(val) {
        if (!val) this.searchBtn()
      }
    },
    videoDev: {
      handler(val) {
        this.videoDevCopy = cloneDeep(val)
      },
      immediate: true
    },
    pageCount: {
      // 监听分页变化
      handler(val, oldVal) {
        if (val === oldVal) return
        this.pageHandler()
      }
    },
    mqResponseData: {
      handler(val) {
        if (!val) return false
        const json = JSON.parse(val)
        if (
          json.MSG_KEY === 'POLICE_STATUS' ||
          json.MSG_KEY === 'DEV_ONLINE_STATUS'
        ) {
          this.videoDevCopy.forEach((item, index) => {
            if (
              String(item.id) === String(json.POLICE_ID) ||
              String(item.id) === String(json.GPSID)
            ) {
              this.$set(
                this.videoDevCopy[index],
                'yonghuzxbj',
                Number(json.STATUS)
              )
              this.$set(
                this.videoDev[index],
                'yonghuzxbj',
                Number(json.STATUS)
              )
            }
          })
        }
      }
    }
  },
  activated() { },
  deactivated() {
    // console.log('deactivated')
  },
  provide: function() {
    return {}
  },
  created() { },
  beforeDestroy() {
    document.removeEventListener('drop', this.userDrop, false)
  },
  mounted() {
    // 不论组件在那个父元素下引用，都将组将插入到body中
    this.$nextTick(() => {
      const body = document.querySelector('.yujing')
      if (body && body.append) {
        body.append(this.$el)
      } else if (body && body.appendChild) {
        body.appendChild(this.$el)
      }
    })
    document.addEventListener('drop', this.userDrop, false)
    // 初始化呼叫选中的监控
    // this.videoDev.forEach((item) => {
    //   this.makeCall({ callNumber: item.DEV_ID, audioOrVideo: 'video', isQuanXuanVideo: true, belong: 'jiankong' })
    // })
  },
  methods: {
    pageHandler() {
      const filter = this.mapCallListStates.filter(obj => obj.sessionId)
      this.mapCallListStates.forEach(obj => {
        if (obj.motor) {
          clearInterval(obj.motor)
        }
      })
      this.$store.commit('sip/SET_mapCallListStates', [])
      const obj = {
        isQuanXuanVideo: true,
        session: {},
        sessionId: '',
        type: 'video'
      }
      for (let i = 0; i < 4 * this.pageCount; i++) {
        this.mapCallListStates.push(JSON.parse(JSON.stringify(obj)))
      }
      const setMotor = function(item) {
        if (item.state === '已接听') {
          item.motor = setInterval(_ => {
            if ('timer' in item) {
              item.timer = parseFloat(
                document.getElementById(item.sessionId)?.currentTime ?? 0
              )
            } else {
              clearInterval(item.motor)
            }
          }, 1000)
        }
      }
      filter.forEach((item, index) => {
        // 如果非 视频轮询  或者少屏切换多屏 顺序排列
        if (index >= this.mapCallListStates.length) {
          this.mapCallListStates.push(item)
        } else {
          setMotor(item)
          this.mapCallListStates.splice(index, 1, item)
        }
      })
      // console.log(filter, '切换的视频')
      this.$nextTick(() => {
        this.mapCallListStates.forEach(item => {
          if (item.session && item.sessionId && item.state === '已接听') {
            this.setupRemoteMedia(item.session, item.sessionId)
          }
        })
      })
    },
    skip(id) {
      const { mapCallListStates, pageCount, pageSum } = this
      const filter = mapCallListStates.slice(
        (pageCount - 1) * pageSum,
        pageCount * pageSum
      )
      const findIndex = filter.findIndex(
        item => String(item.to) === String(id)
      )
      // 看看在当前分页中是否存在该用户 存在不做操作   否则切换至该用户所在的分页
      if (findIndex !== -1) return
      // 当前用户所在的位置
      const resultIndex = mapCallListStates.findIndex(
        item => String(item.to) === String(id)
      )
      if (resultIndex !== -1) {
        this.current_page = Math.ceil((resultIndex + 1) / 4)
        this.pageCount = Math.ceil((resultIndex + 1) / 4)
      }
    },
    delSession(item, i) {
      // 删除列表成员并挂断
      this.videoDev.splice(i, 1)
      const findIndex = this.mapCallListStates.findIndex(
        obj => String(obj.to) === String(item.id)
      )
      if (findIndex !== -1) {
        const item = this.mapCallListStates[findIndex]
        if (item.state === '呼叫中' || item.state === '已接听') {
          this.endCall(item.sessionId, item.session, true, findIndex)
        } else {
          this.mapCallListStates.splice(findIndex, 1, {
            isQuanXuanVideo: true,
            session: {},
            sessionId: false,
            type: 'video'
          })
        }
      }
    },
    inviteVideo() {
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.dialogVisibleVideoGroup = true
    },
    sureClickHandleVideoGroup() {
      const that = this
      const arr = this.addMeetingMemberList.filter(
        item =>
          !this.videoDevCopy.find(obj => String(obj.id) === String(item.userId))
      )
      arr.forEach((item, index) => {
        this.videoDev.push({
          id: item.userId || item.POLICE_ID,
          name: item.name || item.userName,
          yonghuzxbj: item.yonghuzxbj,
          power: item.power,
          devId: item.devId,
          type: item.devId === 'phone' ? '2' : '1'
        });
        (function(it, i) {
          setTimeout(() => {
            that.makeCall({
              callNumber: item.userId || item.POLICE_ID,
              audioOrVideo: 'video',
              isQuanXuanVideo: true,
              belong: 'isVideoGroupCall'
            })
          }, 120 * i)
        })(item, index)
      })
      this.dialogVisibleVideoGroup = false
    },
    searchBtn() {
      if (!this.filterText) {
        this.videoDevCopy = cloneDeep(this.videoDev)
      } else {
        this.videoDevCopy = this.videoDev.filter(
          item => item?.name?.search(this.filterText) !== -1
        )
      }
    },
    // 用户是否在视频中
    videoIng(data) {
      if ('countYh' in data) {
        return ''
      } else {
        const find0 = this.mapCallListStates.find(
          item =>
            String(item.to) ===
            (String(data.id) || String(item.from) === String(data.id)) &&
            item.state === '呼叫中'
        )
        const find = this.mapCallListStates.find(
          item =>
            String(item.to) ===
            (String(data.id) || String(item.from) === String(data.id)) &&
            item.state === '已接听'
        )
        const find2 = this.mapCallListStates.find(
          item =>
            String(item.to) ===
            (String(data.id) || String(item.from) === String(data.id)) &&
            item.state !== '呼叫中' &&
            item.state !== '已接听'
        )
        if (String(this.TONE_voip.ddtinfo.ddtid) === String(data.id)) {
          return ''
        } else if (find0) {
          return '呼叫中'
        } else if (find2) {
          return find2?.state === '对方已挂断' ? '对方挂断' : '呼叫失败'
        } else if (find) {
          return '视频中'
        } else {
          return '空闲'
        }
      }
    },
    rightCall({
      callNumber,
      isQuanXuanVideo = true,
      belong = 'isVideoGroupCall'
    }) {
      if (
        Array.isArray(this.mapCallListStates) &&
        this.mapCallListStates.filter(item => item.to).length > 0 &&
        this.mapCallListStates.findIndex(
          item => item.to + '' === callNumber + ''
        ) !== -1
      ) {
        this.$message.closeAll()
        this.$message.warning('不可以重复呼叫对方！')
        return false
      }
      this.makeCall({
        callNumber,
        audioOrVideo: 'video',
        belong,
        isQuanXuanVideo
      })
    },
    userDrop(e) {
      this.$message.closeAll()
      // console.log(e)
      if (Object.keys(this.dragItem).length <= 0) {
        return
      }
      this.isDragIng = ''
      if (this.isPolling) {
        this.$message.warning('正在进行视频轮询，无法单呼!')
        return
      }
      const move = this?.$refs?.rightVideoBox?.contains(e.target)
      const { dragItem } = this
      const _this = this
      const fn = v => {
        const find = _this.mapCallListStates.find(
          item =>
            String(item.to) === String(dragItem[v]) &&
            (item.state === '已接听' || item.state === '呼叫中')
        )
        if (find) {
          _this.$message.warning('该用户已在视频中，请不要重复拨打视频')
        } else {
          let Index = -1
          if (e?.toElement?.id?.indexOf('quanxuanVideo') !== -1) {
            Index = e.toElement.id
          } else if (
            e?.target?.className === 'kongxian' &&
            e?.target?.parentElement?.id?.indexOf('quanxuanVideo') !== -1
          ) {
            Index = e?.target?.parentElement?.id
          }
          if (Index === -1) return
          Index = Number(Index.split(',')[1])
          _this.makeCall({
            callNumber: dragItem[v],
            audioOrVideo: 'video',
            belong: 'isVideoGroupCall',
            isQuanXuanVideo: true
          })
          _this.mapCallListStates[Index]['toVideo'] = String(dragItem[v])
          _this.dragItem = {}
          _this.isDragIng = ''
        }
      }
      if (move) {
        fn('id')
      }
    },
    userDropStart(item, event) {
      this.dragItem = item
    },
    userDropEnd() {
      this.isDragIng = ''
      this.dragItem = {}
    },
    handleCurrentChange(val) {
      this.pageCount = val
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
      this.addMeetingMemberListData = []
      this.dialogVisible = true
      this.distributeItem = item
    },
    // 分发视频
    distributeVideo() {
      const flag = this.addMeetingMemberListData.find(
        item =>
          String(item.userId) === String(this.distributeItem.from) ||
          String(item.userId) === String(this.distributeItem.to)
      )
      if (flag) {
        this.$message.warning('不允许分发给正在通话的用户')
        return
      }
      var exten = this.addMeetingMemberListData
        .map(v => {
          return v.userId
        })
        .join(',')
      this.$api.common
        .vdispatchBtn({
          callUser: this.distributeItem.from,
          variableUser: this.distributeItem.to,
          distributionUser: exten,
          isVideo: '0'
        })
        .then(res => {
          this.dialogVisible = false
        })
    },
    // 云台控制
    changeCloud(id) {
      const index = this.cloundOpenArr.indexOf(id)
      if (index !== -1) {
        this.cloundOpenArr.splice(index, 1)
      } else {
        this.cloundOpenArr.push(id)
      }
    },
    // 拖拽开始
    domDropStart(item, e) {
      // console.log('拖拽开始')
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
      const Index = this.mapCallListStates.findIndex(
        obj => obj.sessionId === item.sessionId
      )
      this.dragSessionArr.push(item)
      this.dragIndex = Index
    },
    // 拖入的目标元素
    domDrop(e) {
      // console.log('拖入的目标元素')
      e.target.style.cursor = 'default'
      if (Object.keys(this.dragItem).length > 0) {
        return
      }
      let Index = -1
      if (e.target.tagName !== 'VIDEO') {
        // 可能拖到空闲状态里 还有其他div中
        if (e.target.id.indexOf('quanxuanVideo') !== -1) {
          Index = Number(e.target.id.split(',')[1])
        } else if (
          e.target?.parentElement?.className.indexOf('quanxuanItem') !== -1
        ) {
          Index = Number(e.target?.parentElement?.id.split(',')[1])
        } else if (
          e.target?.parentElement?.parentElement?.className.indexOf(
            'quanxuanItem'
          ) !== -1
        ) {
          Index = Number(
            e.target?.parentElement?.parentElement?.id.split(',')[1]
          )
        }
      } else {
        Index = this.mapCallListStates.findIndex(
          obj => String(obj?.sessionId) === String(e.target.id)
        )
      }
      if (Index === this.dragIndex) {
        // 拖动到当前视频 无动作
        this.dragSessionArr = []
        this.isDragIng = ''
        return
      }
      const isSplit = this.pageCount > 1
      if (Index >= 0 && this.dragIndex >= 0) {
        this.isDragIng = ''
        const _this = this
        this.dragSessionArr.push(this.mapCallListStates[Index])
        // 交换位置 this.dragIndex
        if (isSplit) {
          if (Index === 0) {
            Index = (this.pageCount - 1) * 4
          } else {
            Index = (this.pageCount - 1) * 4 + Index
          }
        }
        const dragObj = this.mapCallListStates[this.dragIndex]
        const dragObj2 = this.mapCallListStates[Index]
        _this.$set(this.mapCallListStates, _this.dragIndex, dragObj2)
        _this.$set(this.mapCallListStates, Index, dragObj)
      }
    },
    // 拖拽到元素上方
    domDragEnter(e) {
      // console.log(e, this.dragSessionArr, e?.toElement?.id, e?.toElement?.id?.indexOf('quanxuanVideo'))
      this.isDragIng = ''
      // if (Object.keys(this.dragItem).length > 0) return
      if (e?.toElement?.id?.indexOf('quanxuanVideo') !== -1) {
        this.isDragIng = e.toElement.id
      } else if (
        e?.target?.className === 'kongxian' &&
        e?.target?.parentElement?.id?.indexOf('quanxuanVideo') !== -1
      ) {
        this.isDragIng = e?.target?.parentElement?.id
      } else {
        this.isDragIng = ''
      }
    },
    // 拖拽离开该元素
    domDragLeave(e) {
      // console.log('离开')
    },
    // 拖拽结束
    domDragEnd(e) {
      // console.log('拖拽视频结束', e)
      if (this?.dragSessionArr?.length > 0) {
        const that = this
        setTimeout(_ => {
          that.dragSessionArr.forEach(item => {
            if (
              item &&
              item.session &&
              item.sessionId &&
              item.state === '已接听'
            ) {
              that.setupRemoteMedia(item.session, item.sessionId)
            }
          })
          this.dragSessionArr = []
        }, 10)
      }
      this.isDragIng = ''
    },
    videoGroupCall(item) {
      this.makeCall({
        callNumber: item.id || item.userId,
        audioOrVideo: 'video',
        isQuanXuanVideo: true,
        belong: 'isVideoGroupCall'
      })
    },
    // 视频窗口弹窗调整大小
    resize(newRect) {
      this.divWidth = newRect.width
      this.divHeight = newRect.height
      this.divTop = newRect.top
      this.divLeft = newRect.left
    },
    closeQuanXuan(flag) {
      this.$confirm(
        `此操作会关闭所有通话${flag ? '并关闭页面' : ''}，是否关闭?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        this.mapCallListStates.forEach((item, i) => {
          if (
            item.session &&
            item.sessionId &&
            (item.state === '已接听' || item.state === '呼叫中')
          ) {
            this.endCall(item.sessionId, item.session, true, i)
          }
        })
        flag && this.$emit('changeDialog')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
// 圈选视频
.quanxuanDialog123 {
  background: radial-gradient(circle, #00273c, #004f78);
  border: 1px solid rgba(52, 193, 218, 0.6);
  box-shadow: inset 0px 0px 10px 2px #35879d;
  opacity: 1;
  color: #fff;

  .quanxuan_header {
    height: 40px;
    line-height: 40px;
    padding: 0px 10px;
    overflow: hidden;
    cursor: move;
    border-bottom: 1px solid #497a7a;

    span.tit {
      float: left;
    }

    .min {
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 40px;
      margin-right: 10px;
    }

    border-bottom: 1px solid #497a7a;

    .large {
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 40px;
      margin-right: 10px;
    }

    border-bottom: 1px solid #497a7a;

    .close {
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 40px;
      margin-right: 0px;
    }
  }

  .quanxuan_con {
    height: calc(100% - 40px);
    width: 100%;

    .quanxuan_con_left {
      width: calc(100%);
      height: 100%;
      background: #00111a;

      .quanxuanItem {
        width: 100%;
        height: 100%;
        color: #f1f1f1;
        overflow: hidden;
        position: relative;

        .qx {
          width: 100%;
          height: 100%;
        }

        .qx_con {
          width: 100%;
          height: 100%;
        }

        .qx_c {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .qx_c video {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }

        .qx_c:hover .vodeocontrol {
          bottom: 0px;
        }

        .qx_c .vodeocontrol {
          position: absolute;
          height: 40px;
          width: 100%;
          bottom: -40px;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .info {
          position: absolute;
          height: 30px;
          line-height: 30px;
          color: #fff;
          width: 100%;
          top: -40px;
          // background:rgba(255,255,255,.2);
          transition: all 0.3s;
          left: 10px;
        }

        .qx_c:hover .info {
          top: 0;
        }

        .kongxian {
          width: 100%;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          text-align: center;

          .kongxian_icon {
            width: 30px;
            height: 30px;
          }

          .kongxian_text {
            padding: 3px 0;
            color: #5e708e;
            font-size: 12px;
          }
        }
      }

      .four {
        float: left;
        width: 50%;
        height: 50%;
        background: rgb(2, 18, 51);

        &:first-child {
          border-right: 1px solid #497a7a;
          border-bottom: 1px solid #497a7a;
        }

        &:nth-child(2) {
          border-bottom: 1px solid #497a7a;
        }

        &:nth-child(3) {
          border-right: 1px solid #497a7a;
        }
      }
    }

    // .quanxuan_con_right {
    //   width: 200px;
    //   height: 100%;
    //   padding: 0px 10px;
    //   border-left: 1px solid #497a7a;
    //   .right_header {
    //     height: 30px;
    //     line-height: 30px;
    //     border-bottom: 1px solid #497a7a;
    //     .left {
    //       width: 50%;
    //     }
    //     .right {
    //       width: 50%;
    //     }
    //   }
    //   .rightInfo {
    //     overflow: auto;
    //     height: calc(100% - 30px);
    //     .rightInfoLi {
    //       color: #01d3f9;
    //       height: 30px;
    //       line-height: 30px;
    //       border-bottom: 1px solid #497a7a;
    //       .left {
    //         width: 50%;
    //         cursor: pointer;
    //       }
    //       .right {
    //         width: 50%;
    //       }
    //       &:last-child {
    //         border-bottom: none;
    //       }
    //     }
    //   }
    // }
  }

  .quanxuan_footer {
    border-top: 1px solid #497a7a;
    height: 40px;
    line-height: 40px;
    padding: 0px 10px;
    display: flex;
    justify-content: space-around;
  }
}
</style>
