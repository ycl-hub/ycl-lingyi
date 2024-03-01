<template>
  <div class="videoScheduling">
    <div class="videoScheduling-container clearfix">
      <div class="left bevel">
        <!--===漂浮模块==-->
        <div class="posi-panel">
          <ul class="tab-cards">
            <li v-for="(item,i) in tabNav" :key="i" :class="navActive==item.id?'active':''" @click="isShowPanel(item.id)"><span>{{ item.name }}</span></li>
          </ul>
          <div class="posi-right">
            <el-tabs v-model="isAll">
              <el-tab-pane label="全部" name="全部" />
              <el-tab-pane label="在线资源" name="在线资源" />
            </el-tabs>
            <!-- <ul class="tab" @click="selectTab($event)">
              <li :class="isAll==='全部'? 'active' : ''">全部</li>
              <li :class="isAll === '在线资源' ? 'active' : ''">在线资源</li>
              <div ref="btnLine" class="btnLine" />
            </ul> -->
            <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
              <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
            </el-input>
            <div class="tab-con">
              <div :class="['tab-con-item',navActive=='spdd-lb-ddt'?'active':'']">
                <VueEasyTree
                  ref="tree1"
                  :data="userTree"
                  class="t01_tree t01_checkBox_tree"
                  :default-expanded-keys="[String(TONE_voip.cmd.UNIT_ID)]"
                  node-key="UnitId"
                  :props="unitProps"
                  height="100%"
                  :filter-node-method="filterNode"
                  :icon-class="'el-icon-arrow-right'"
                >
                  <span
                    slot-scope="{ data }"
                    class="custom-tree-node"
                    :draggable="data.type=='people'&&data.yonghuzxbj == '1'"
                    @dragover="(e)=>{if (e.preventDefault) {
                      e.preventDefault();
                      e.stopPropagation()
                    }}"
                    @dragstart="userDropStart(data,$event)"
                    @dragend="userDropEnd"
                  >
                    <span class="ellipsis" :style="{ color: data.type=='people'? (data.yonghuzxbj == '1' ? '#32b16c':'#999'):'#01d3f9',flex:1,width:'130px'}" :title="data.UnitName"><i :class="data.type== 'people'? 'el-icon-s-custom' :''" />{{ data.UnitName+onLine(data)+videoIng(data) }}</span>
                    <span v-if="data.type=='people'&&data.yonghuzxbj == '1'">
                      <img draggable="false" :src="camera" alt="" title="视频" style="background-color: transparent;" class="tree-btn" @click="makeCall({callNumber:data.yonghuid,audioOrVideo:'video',belong:'videoScheduling'})">
                      <img
                        :src="dragPng"
                        alt="拖拽可视频呼叫"
                        title="拖拽可视频呼叫"
                        class="tree-btn"
                        draggable="false"
                        style="background-color: transparent;"
                      >
                    </span>
                  </span>
                </VueEasyTree>
              </div>
              <div :class="['tab-con-item dev-type-list',navActive=='spdd-lb-sb'?'active':'']">
                <VueEasyTree
                  ref="tree2"
                  class="t01_tree t01_checkBox_tree"
                  :data="devTree"
                  :props="unitProps"
                  :accordion="true"
                  :icon-class="'el-icon-arrow-right'"
                  :filter-node-method="filterNode"
                  height="100%"
                  node-key="UnitId"
                >
                  <span
                    slot-scope="{ data }"
                    class="custom-tree-node"
                    :draggable="data.type=='dev'"
                    @dragover="(e)=>{if (e.preventDefault) {
                      e.preventDefault();
                      e.stopPropagation()
                    }}"
                    @dragstart="userDropStart(data,$event)"
                    @dragend="userDropEnd"
                  >
                    <span class="ellipsis" :style="{ color: data.isType||data.countExt ? '#01d3f9':(data.status== '1'?'#32b16c':'#999'),flex:1,width:'130px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.UnitName+onLine( data, 'children', 'countExt')+videoIngDev(data) }}</span>
                    <span v-if="data.status== '1'">
                      <img v-if="data.power&&data.power.search('2') !== -1" style="background-color: transparent;" :src="camera" alt="视频" title="视频" class="tree-btn" @click="makeCall({callNumber:data.devId,audioOrVideo:'video',belong:'videoScheduling'})">
                      <img
                        v-if="data.power&&data.power.search('2') !== -1"
                        :src="dragPng"
                        alt="拖拽可视频呼叫"
                        title="拖拽可视频呼叫"
                        class="tree-btn"
                        draggable="false"
                        style="background-color: transparent;"
                      >
                    </span>
                  </span>
                </VueEasyTree>
              </div>
              <div :class="['tab-con-item polling-type-list',navActive=='spdd-lb-lxqz'?'active':'']">
                <el-tree
                  ref="tree3"
                  class="t01_tree t01_checkBox_tree"
                  :data="pollingDataCopy"
                  :props="pollingProps"
                  :default-expanded-keys="defaultExpandIds"
                  :filter-node-method="filterNode2"
                  :expand-on-click-node="true"
                  :icon-class="'el-icon-arrow-right'"
                  node-key="ID"
                  height="100%"
                  @node-expand="handleNodeExpand"
                  @node-collapse="handleNodeCollapse"
                >
                  <span slot-scope="{ node, data }" class="custom-tree-node">
                    <span class="ellipsis" :style="{ color: data.GROUP_NAME ? '#01d3f9':(data.TYPE=='2'?'#32b16c':getZxbj(data)),flex:1,width:'130px',overflow:'hidden',textOverflow:'ellipsis'}" :title="(data.GROUP_NAME||data.NAME)+(data.GROUP_NAME?'('+data.zxCount+'/'+data.DEVS.length+')':'')"><i class="labelName ellipsis" />{{ data.TYPE=='2'?data.NAME+data.CALL_NO: (data.GROUP_NAME||data.NAME) }}{{ data.GROUP_NAME?'('+data.zxCount+'/'+data.DEVS.length+')':'' }}{{ getLxState(data) }}</span>
                    <span v-if="data.GROUP_NAME" class="listBtn">
                      <img :src="editPng" title="编辑" alt="" @click="edit(node, data,$event)">
                      <img :src="del" title="删除" alt="" @click="remove(node, data,$event)">
                      <a href="javascript:void(0);" @click="startPolling(data,$event)">{{ (startPollingData&&startPollingData.ID===data.ID)?'结束':'开启' }}</a>
                    </span>
                  </span>
                </el-tree>
                <span class="btnWrap" @click="createPolling">
                  新建轮询组
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref="rightVideoBox"
        class="right"
      >
        <div class="splitScreenBtnWrap">
          <div class="splitScreenBox">
            <div v-for="(itemBtn,k) in splitScreenList" :key="k" class="btn" @click="splitScreenBtn(itemBtn)">
              <img :src="itemBtn.name===activeName?itemBtn.activeSrc:itemBtn.src" :alt="itemBtn.name" :title="itemBtn.name">
            </div>
          </div>
          <div v-if="navActive!=='spdd-lb-lxqz'&&videoLen>pageSum" class="paging">
            <el-pagination
              layout="prev, pager, next"
              :total="videoLen"
              :hide-on-single-page="false "
              :page-size="pageSum"
              @current-change="handleCurrentChange"
            />
          </div>
          <div class="domain">
            <span v-show="navActive==='spdd-lb-lxqz'" class="btnWrap" @click="$router.push('/record?name=videoScheduling')">轮询历史记录</span>
            <span v-show="!AllMute" title="静音" class="v-btn text-center fl" @click="allMute">
              <svg-icon class="full" icon-class="mute" />
            </span>
            <span v-show="AllMute" title="取消静音" class="v-btn text-center fl" @click="allMute">
              <svg-icon class="full" icon-class="unmute" />
            </span>
            <p title="全部挂断" class="endCall" @click="endAllCall" />
          </div>
        </div>
        <div class="quanxuan_con_left" :draggable="false">
          <div
            v-for="(item,i) in callListStates.slice((pageCount-1)*pageSum,pageCount*pageSum)"
            :id="'quanxuanVideo,' + i"
            :key="i"
            class="quanxuanItem"
            :class="[ isFullScreen?'fullScreen' : '', splitScreenNumber,isDragIng===('quanxuanVideo,' + i)?'videoDrag':'']"
            :draggable="item&&item.state"
            @drop="domDrop"
            @dragstart="domDropStart(item,$event)"
            @dragover="(e)=>{if (e.preventDefault) {
              e.preventDefault();
              e.stopPropagation()
            }}"
            @dragend="domDragEnd"
            @dragenter="domDragEnter"
            @dragleave="domDragLeave"
          >
            <div class="info">
              <span v-if="item.sessionId" class="ellipsis">
                {{ getName(item.to==TONE_voip.ddtinfo.ddtid?item.from:item.to) }}
              </span>
              <span v-if="item.sessionId&&item.state==='已接听'">{{ getTime(item.timer) }}</span>
            </div>
            <div v-if="!item.sessionId||item.state!=='已接听'" class="kongxian">
              <!-- <svg-icon class="kongxian_icon" icon-class="camera" /> -->
              <!-- <p class="kongxian_text">点击设备图标或设备列表</p>
              <p class="kongxian_text">查看视频</p> -->
              <img src="../../assets/images//videoScheduling/yh.png" :draggable="false" class="meta" alt="">
              <p class="kongxian_text" :draggable="false">{{ item.state }}</p>
              <!-- <p v-if="item.state!=='呼叫中'" class="kongxian_text">{{ item.to }}</p> -->
              <p v-if="item.state==='呼叫中'" :draggable="false" title="挂断" class="endCall" @click.self.prevent="endCall(item.sessionId,item.session,true,i)" />
            </div>
            <div v-if="item.sessionId&&item.state==='已接听'" class="qx_con" :class="'quanxuanVideo,' + i">
              <div class="qx_c">
                <video :id="item.sessionId" :key="item.sessionId" :title="startPollingData?!isPauseLX?'点击暂停轮询':'点击开始轮询':''" :draggable="false" @dragover="()=>{}" @click="pauseLx(true)" />
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundMax"><i class="el-icon-minus" title="缩小" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(3,item.session)" /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundMin"><i class="el-icon-plus" title="放大" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(1,item.session)" /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundTop"><i class="el-icon-caret-top" title="向上" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(2,item.session)" /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundBot"><i class="el-icon-caret-bottom" title="向下" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(8,item.session)" /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundLeft"><i class="el-icon-caret-left" title="向左" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(4,item.session)" /></span>
                <span v-if="cloundOpenArr.indexOf(item.sessionId)!==-1" class="v_cloundRight"><i class="el-icon-caret-right" title="向右" @mouseup="sendDTMF(5,item.session)" @mousedown="sendDTMF(6,item.session)" /></span>
                <div class="vodeocontrol">
                  <span v-if="isFullScreen" title="全屏" class="v-btn min fl" @click="exitFull()">
                    <svg-icon class="full" icon-class="fullMin" />
                  </span>
                  <span v-if="!isFullScreen" title="全屏" class="v-btn large fl" @click="fullScreen('quanxuanVideo,' + i)">
                    <svg-icon class="full" icon-class="fullLar" />
                  </span>
                  <span class="v-btn picture-btn fl" title="抓拍" @click="screenShot(item.sessionId)" />
                  <span class="v-btn record-btn fl" title="云台控制" @click="changeCloud(item.sessionId)" />
                  <span v-show="!item.mState" title="禁言" class="v-btn text-center mute-btn fl" @click="muteOrUnmute(item)">
                    <svg-icon class="full" icon-class="mute" />
                  </span>
                  <span v-show="item.mState" title="取消禁言" class="v-btn text-center unmute-btn fl" @click="muteOrUnmute(item)">
                    <svg-icon class="full" icon-class="unmute" />
                  </span>
                  <span v-show="item.voiceState" title="静音" class="v-btn text-center mute-btn fl" @click="voiceOrUnVoice(item)">
                    <svg-icon class="full" icon-class="voice" />
                  </span>
                  <span v-show="!item.voiceState" title="取消静音" class="v-btn text-center unmute-btn fl" @click="voiceOrUnVoice(item)">
                    <svg-icon class="full" icon-class="unvoice" />
                  </span>
                  <span class="v-btn fenfa-btn fl" title="分发" @click="issue(item,i)" />
                  <span class="v-btn end-btn fr" title="挂断" @click.self.prevent="endCall(item.sessionId,item.session,true,i)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <!-- 添加或者编辑轮询组弹窗 -->
    <createPolling v-if="dialogPolling" :polling-data="editPollingData" :dialog-visible="dialogPolling" :dialog-title="PollingTitle" @closeVisible="dialogPolling = false" @sureClick="sureClickPolling" />
  </div>
</template>
<script>
import phone from '@/assets/images/equipment/phone.png'
import camera from '@/assets/images/videoScheduling/shipin.png'
import search from '@/assets/images/equipment/search.png'
import dragPng from '@/assets/images/videoScheduling/dragPng.png'
import sip from '@/components/mixins/sip.js'
import { sessionStorage } from '@/utils/storage'
import fullScreen from '@/components/mixins/fullScreen.js'
import OrganizePer from '@/components/organizePer'
import { mapGetters } from 'vuex'
import { throttle, cloneDeep } from 'lodash'
import { queryId } from '@/utils'
import del from '@/assets/images/videoScheduling/remove.png'
import editPng from '@/assets/images/videoScheduling/edit.png'
import one from '@/assets/images/videoScheduling/1.png'
import one_ from '@/assets/images/videoScheduling/1-.png'
import four from '@/assets/images/videoScheduling/4.png'
import four_ from '@/assets/images/videoScheduling/4-.png'
import six from '@/assets/images/videoScheduling/6.png'
import six_ from '@/assets/images/videoScheduling/6-.png'
import nine from '@/assets/images/videoScheduling/9.png'
import nine_ from '@/assets/images/videoScheduling/9-.png'
import sixteen from '@/assets/images/videoScheduling/16.png'
import sixteen_ from '@/assets/images/videoScheduling/16-.png'
import createPolling from '@/components/createPolling'
import { parseTime, formatDuring, getTime } from '@/utils/index'
export default {
  name: 'VideoScheduling',
  components: {
    OrganizePer, createPolling
  },
  mixins: [sip, fullScreen],
  data() {
    return {
      getTime,
      defaultExpandIds: [],
      dragPng, del, editPng,
      TONE_voip: sessionStorage.get('TONE_voip'),
      phone: phone,
      camera: camera,
      navActive: 'spdd-lb-ddt',
      tabNav: [
        {
          name: '指挥调度',
          id: 'spdd-lb-ddt',
          isActive: true
        }, {
          name: '通信资源',
          id: 'spdd-lb-sb',
          isActive: false
        }, {
          name: '轮询群组',
          id: 'spdd-lb-lxqz',
          isActive: false
        }
        // {
        //   name: '视频预案',
        //   isActive: false
        // },
        // {
        //   name: '视频点名',
        //   isActive: false
        // }
      ],
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      filterText: '',
      search: search,
      videoWidth: 720,
      videoHeight: 450,
      videoLeft: 20,
      videoTop: 200,
      meetingList: [], // 会议列表
      meetingAcitve: {},
      meetingShow: false,
      dialogTitle: '', // 弹框标题
      dialogType: '', // 弹框类别add为添加,invite为邀请,distribute为分发
      dialogVisible: false,
      dialogPolling: false,
      distributeItem: {},
      addMeetingMemberListData: [], // 会议添加成员
      splitScreenList: [
        {
          name: '一屏',
          num: 'one',
          src: one,
          activeSrc: one_
        },
        {
          name: '四屏',
          num: 'four',
          src: four,
          activeSrc: four_
        },
        {
          name: '六屏',
          num: 'six',
          src: six,
          activeSrc: six_
        },
        {
          name: '九屏',
          num: 'nine',
          src: nine,
          activeSrc: nine_
        },
        {
          name: '十六屏',
          num: 'sixteen',
          src: sixteen,
          activeSrc: sixteen_
        }
      ],
      activeName: '四屏',
      splitScreenNumber: 'four',
      aaalist: [
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
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: false,
          type: 'video'
        }
      ],
      tempCall: [],
      videoSchedulingCallList: [],
      cloundOpenArr: [],
      dtmfTimer: null,
      dragIndex: 0,
      isDragIng: '',
      dragSessionArr: [],
      isAll: '全部',
      dragItem: {},
      dictionaries: {
        'one': 1,
        'four': 4,
        'six': 6,
        'nine': 9,
        'sixteen': 16
      },
      pageCount: 1, // 分页默认第一页
      AllMute: false, // 静音控制
      pollingProps: {
        label(v) {
          // console.log(v, 'xxx')
          return v.NAME || v.GROUP_NAME
        },
        children: 'DEVS',
        isLeaf: 'CALL_NO'
      },
      pollingData: [], // 轮询组数据
      PollingTitle: '', // 弹窗标题
      editPollingData: {}, // 编辑或删除的轮询组信息
      startPollingData: false, // 当前正在通话的轮询组
      PollingTimer: null,
      pollingDataCopy: [], // copy一份轮询群组数据   用于显示在线用户
      isPauseLX: false, // 是否暂停了轮询
      PauseStartTime: 0, // 暂停开始时间
      PauseSumTime: 0, // 暂停累计时间
      activeCallNumber: '',
      POLLING_RECORD_DATA_COPY: {
        EXECUTION_DURATION: '', // 实际执行时长
        POLICENO: sessionStorage.get('TONE_voip').cmd.POLICE_ID,
        token: sessionStorage.get('TONE_voip').cmd.TOKEN,
        VIDEO_POLLING_RECORD_DETAIL_LIST: [], // 轮询成员的状态
        RULE: '', // 轮询规则
        INTERVALS: '', // 轮询间隔
        EXECUTION_ROUND: '', // 实际执行轮次
        START_TIME: '', // 开始时间
        END_TIME: '', // 结束时间
        MEMBER: '', // 轮询成员个数
        RULE_STATE: ''// 轮询规则状态 0 轮询时长  1 轮询次数
      },
      POLLING_RECORD_DATA: {},
      initTimer: '', // 视频轮询开始时间
      pollingCount: 0, // 视频轮询次数
      pollingStateArr: []
    }
  },
  watch: {
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        if ((json.MSG_KEY === 'POLICE_STATUS' || json.MSG_KEY === 'DEV_ONLINE_STATUS') && Array.isArray(_this.pollingData)) {
          const { navActive } = _this

          _this.pollingData.forEach((item, index) => {
            if (!Array.isArray(item?.DEVS)) return
            const findIndex = item?.DEVS?.findIndex(obj => String(obj.CALL_NO) === String(json.POLICE_ID) || String(obj.CALL_NO) === String(json.GPSID))
            if (findIndex !== -1) {
              if (Number(json.STATUS)) {
                _this.$set(_this.pollingData[index]?.DEVS[findIndex], 'yonghuzxbj', 1)
                let zxCount = item.zxCount
                zxCount++
                _this.$set(_this.pollingData[index], 'zxCount', zxCount)
              } else {
                _this.$set(_this.pollingData[index]?.DEVS[findIndex], 'yonghuzxbj', 0)
                let zxCount = item.zxCount
                zxCount--
                _this.$set(_this.pollingData[index], 'zxCount', zxCount)
              }
            }
          })
          if (_this.pollingData && Array.isArray(_this.pollingData)) {
            _this.pollingDataCopy = _this.pollingData.filter(item => item.zxCount > 0)
            _this.$nextTick(_ => {
              if (navActive === 'spdd-lb-ddt') {
            _this?.$refs?.tree1?.filter()
              } else if (navActive === 'spdd-lb-sb') {
            _this?.$refs?.tree2?.filter()
              } if (navActive === 'spdd-lb-lxqz') {
            _this?.$refs?.tree3?.filter()
              }
            })
          }
        }
      },
      immediate: true
    },
    pageCount: {
      // 监听分页变化
      handler() {
        const { callListStates, pageCount, dictionaries, splitScreenNumber } = this
        const arr = callListStates.slice((pageCount - 1) * dictionaries[splitScreenNumber], pageCount * dictionaries[splitScreenNumber])
        arr.forEach(item => {
          if (item?.session && item?.sessionId && item.state === '已接听') {
            this.$nextTick(() => {
              this.setupRemoteMedia(item.session, item.sessionId)
            })
          }
        })
      }
    },
    filterText: {
      handler: function(val) {
        const { navActive } = this
        if (val) {
          return
        } else if (navActive === 'spdd-lb-ddt') {
          this.$refs.tree1.filter(val)
        } else if (navActive === 'spdd-lb-sb') {
          this.$refs.tree2.filter(val)
        } else if (navActive === 'spdd-lb-lxqz') {
          this.$refs.tree3.filter(val)
        }
      }
    },
    isAll: {
      handler(val) {
        // console.log('单选哪个', val)
        const { navActive, filterText } = this
        if (navActive === 'spdd-lb-ddt') {
          this.$refs.tree1.filter(filterText)
        } else if (navActive === 'spdd-lb-sb') {
          this.$refs.tree2.filter(filterText)
        } if (navActive === 'spdd-lb-lxqz') {
          this.$refs.tree3.filter(filterText)
        }
      }
    },
    userTree: {
      handler(val, oldVal) {
        if (val && this.devTree.length > 0 && this.pollingDataCopy.length === 0) {
          // 等获取到人员和设备列表 再去查询常用群组 否则第一次查询出来的状态不对
          this.queryPollingByUnit()
        }
      },
      immediate: true
    },
    devTree: {
      handler(val, oldVal) {
        if (val && this.userTree.length > 0 && this.pollingDataCopy.length === 0) {
          // 等获取到人员和设备列表 再去查询常用群组 否则第一次查询出来的状态不对
          this.queryPollingByUnit()
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'userTree',
      'devTree',
      'settings',
      'createMeetingName',
      'addMeetingMemberList',
      'mqResponseData',
      'isPolling',
      'isVideoMeet'
    ]),
    videoLen() {
      return this.callListStates.filter(obj => obj.sessionId).length
    },
    pageSum() {
      return this.dictionaries[this.splitScreenNumber]
    }
  },
  created() {
    // console.log(parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'))
    document.addEventListener('drop', this.userDrop, false)
    // this.$api.common.videoPollingRecordList({
    //   POLICENO: sessionStorage.get('TONE_voip').cmd.POLICE_ID,
    //   token: sessionStorage.get('TONE_voip').cmd.TOKEN
    // }).then(res => {
    //   console.log(res)
    // }).catch(err => {
    //   console.log(err)
    // })
  },
  mounted() {
    window.addEventListener('beforeunload', () => {
      if (this.startPollingData) {
        // console.log(111, 2323232, 3232, 32, 32, 32, 32, 3, 23, 2, this.startPollingData)
        this.startPolling(this.startPollingData)
      }
    })
    const _this = this
    this.$root.$on('pollingStateChange', (data) => {
      if (data.state === 'confirmed') {
        const findIndex = _this.pollingStateArr.findLastIndex((obj) => String(obj) === String(data.id))
        if (findIndex !== -1)_this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[findIndex].STATE = '成功'
      }
      if (data.state === 'failed') {
        const findIndex = _this.pollingStateArr.findLastIndex((obj) => String(obj) === String(data.id))
        if (findIndex !== -1) {
          const state = _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[findIndex].STATE
          if (state !== '成功') {
            _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[findIndex].STATE = '失败'
          }
          _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[findIndex].END_TIME = data.time
        }
      }
    })
  },
  destroyed() {
    document.removeEventListener('drop', this.userDrop, false)
    this.pollingDataCopy = []
  },
  activated() {
    this.loadResource()
    // this.videoSchedulingCallList.forEach((item) => {
    //   this.setupRemoteMedia(item.session, item.sessionId)
    // })
    this.callListStates.forEach((item) => {
      this.setupRemoteMedia(item.session, item.sessionId)
    })
  },
  methods: {
    handleNodeExpand(data) {
      // 保存当前展开的节点
      let flag = false
      this.defaultExpandIds.some(item => {
        if (item === data.ID) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultExpandIds.push(data.ID)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.defaultExpandIds.some((item, i) => {
        if (item === data.ID) {
          this.defaultExpandIds.splice(i, 1)
        }
      })
    },
    getName(to) { // 查找 音视频id号对应的名称
      return this.userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || ''
    },
    // 获取轮询成员的状态
    getLxState(data) {
      const find = this.callListStates.find(obj => String(obj.to) === String(data.CALL_NO))
      if (data.POLLING_ID && data.POLLING_ID === this.startPollingData.ID && find) {
        return '(' + find?.state + ')' || ''
      } else {
        return ''
      }
    },
    // 轮询 暂停或恢复
    pauseLx(v) {
      // 防止点击到云台控制 还有其他一堆按钮 导致捕获到video的点击事件
      if (!v) return
      this.isPauseLX = !this.isPauseLX
      if (this.isPauseLX) {
        this.PauseStartTime = new Date().getTime()
      } else {
        this.PauseSumTime += (new Date().getTime() - this.PauseStartTime)
      }
    },
    // 开始或结束轮询组
    startPolling(data, e) {
      e && e.stopPropagation()
      e && e.preventDefault()
      const _this = this
      if (!data) return
      if (data && data.ID === this.startPollingData?.ID) {
        // 终止轮询
        _this.callListStates.forEach((item, i) => {
          if (item && item.session && (item.state === '已接听' || item.state === '呼叫中')) {
            _this.endCall(item.sessionId, item.session, true, i)
          } else if (item.state && item.state !== '已接听') {
            _this.callListStates.splice(i, 1, {
              isQuanXuanVideo: true,
              session: {},
              sessionId: false,
              type: 'video'
            })
          }
        })
        this.startPollingData = false
        this.activeCallNumber = ''
        this.$store.commit('sip/SET_isPolling', false)
        clearInterval(this.PollingTimer)
        const END_TIME = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
        const initTimer = new Date(this.POLLING_RECORD_DATA.START_TIME).getTime()
        const resTimer = new Date(END_TIME).getTime() - (initTimer + _this.PauseSumTime)// 轮询持续时长
        this.POLLING_RECORD_DATA.END_TIME = END_TIME
        this.POLLING_RECORD_DATA.EXECUTION_DURATION = formatDuring(resTimer)
        this.POLLING_RECORD_DATA.EXECUTION_ROUND = Math.ceil(this.pollingStateArr.length / data?.DEVS?.length)
        // console.log(this.POLLING_RECORD_DATA)
        _this.PauseSumTime = 0
        this.$api.lunxun.addVideoPollingRecord(this.POLLING_RECORD_DATA)
        // // 结束轮询即新增一条历史记录
        return
      }
      if (this.startPollingData) {
        this.$message.closeAll()
        this.$message.warning('如需开启新的群组轮询，请先手动结束正在进行的轮询')
        return
      }
      if (this.callList.length > 0 || this.isVideoMeet || this.callListStates.filter(item => item.sessionId).length > 0) {
        this.$message.closeAll()
        this.$message.warning('如需开启视频轮询，请先手动结束正在进行的音视频通信')
        return
      }
      this.$message({
        showClose: true,
        message: '正在进行视频轮询',
        duration: 5000,
        type: 'info'
      })
      this.startPollingData = data
      this.pollingStateArr = []
      this.$store.commit('sip/SET_isPolling', true)
      this.pollingCount = 0 // 轮询次数 计数器
      const initTimer = new Date().getTime()
      this.initTimer = cloneDeep(initTimer)
      const spliceSession = function(findIndex) {
        if (findIndex === -1) return
        const state = _this.callListStates[findIndex].state
        if (state === '呼叫中' || state === '已接听') {
          _this.endCall(_this.callListStates[findIndex].sessionId, _this.callListStates[findIndex].session, true, findIndex)
        }
        const to = _this.callListStates[findIndex].to
        const Index = _this.pollingStateArr.findLastIndex((obj) => String(obj) === String(to))
        if (Index !== -1) {
          const state = _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[Index].STATE
          if (state !== '成功') {
            _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[Index].STATE = '失败'
          }
          // 异常通话 一直呼叫中 但无失败回调  前端手动删除的通话 结束时间
          _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST[Index].END_TIME = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
        }
        _this.callListStates.splice(findIndex, 1, {
          isQuanXuanVideo: true,
          session: {},
          sessionId: false,
          type: 'video'
        })
      }
      const POLLING_FN = (count, data) => {
        // 轮询函数   切换视频窗口画面
        if (count > Number(data.POLLING_NUMBER) * data?.DEVS?.length) {
          this.pollingCount--
          _this.startPolling(data)
          // 轮询次数到达 终止轮询
        } else {
          // 到了轮询时长 终止轮询  还要加上暂停的时间才对的上
          const nowTimer = new Date().getTime()
          const resTimer = nowTimer - (initTimer + _this.PauseSumTime)
          // 计算小时差
          const hours = resTimer / (3600 * 1000)
          // console.log(hours, '小时差')
          if (hours >= data.POLLING_TIME_LONG && Number(data.POLLING_TIME_LONG) !== 0) {
            // 如果到了轮询时间 终止轮询
            _this.startPolling(data)
          } else {
            let index // 当前轮询应该拨打的用户 按顺序轮询
            if (count <= data.DEVS.length) {
              index = data.DEVS[count - 1]
            } else {
              if ((count % data.DEVS.length) === 0) {
                index = data.DEVS[ data.DEVS.length - 1]
              } else {
                index = data.DEVS[(count % data.DEVS.length) - 1]
              }
            }
            this.activeCallNumber = index.CALL_NO
            // 列表已有在通话中的不再轮询拨打
            // console.log(index.CALL_NO)
            if (_this.callListStates.find(item => String(item.to) === String(index.CALL_NO) && item.state === '已接听')) {
              // 已接听也要存储 一轮成功的通话
              const dictionaries = {
                '0': '人员',
                '1': '设备',
                '2': '外部联系人'
              }
              const START_TIME = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
              const obj = {
                'MEMBER_NAME': index.NAME,
                'NUMBER': _this.pollingStateArr.filter(obj => String(obj) === String(index.CALL_NO)).length + 1,
                'MEMBER_TYPE': dictionaries[index.TYPE],
                'START_TIME': START_TIME,
                'END_TIME': START_TIME,
                'STATE': '成功'
              }
              if (dictionaries[index.TYPE] === '外部联系人') {
                obj.telPhone = index.CALL_NO
              }
              _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST.push(obj)
              _this.pollingStateArr.push(index.CALL_NO)
              return
            }
            let spliceIndex = _this.dictionaries[this.splitScreenNumber]// 当前分屏数
            // 如果轮询次数大于分屏数 需要删除或挂断当前某个通话
            const filterCall = _this.callListStates.filter(obj => obj.state)
            const findIndex0 = _this.callListStates.findIndex(obj => String(obj.to) === String(index.CALL_NO) && obj.state !== '已接听')// 和当前要拨打的号码一样的异常通话
            const findIndex = _this.callListStates.findIndex(obj => obj.state && obj.state !== '已接听')// 异常通话
            // 当前存在的通话 和轮询次数都必须大于分屏数 下次轮询挂断或删除一个通话
            if (count > spliceIndex && filterCall.length >= spliceIndex) {
              // 要挂断或者删除的通话
              if (findIndex0 < spliceIndex && findIndex0 !== -1) {
                //  和当前要拨打的号码一样的异常通话
                spliceSession(findIndex0)
              } else if (findIndex < spliceIndex && findIndex !== -1) {
                // 先找 状态异常的去删除 或者挂断  无则挂断时间最长的通话
                spliceSession(findIndex)
              } else {
                const resultIndex = (count % spliceIndex)
                // console.log('分屏数:', spliceIndex, '拨打第几次:', count, '结果:', resultIndex)
                if (resultIndex !== 0) {
                  spliceIndex = resultIndex - 1
                } else {
                  spliceIndex = spliceIndex - 1
                }
                spliceSession(spliceIndex)
                // let _num = 0
                // let resIndex = 0
                // _this.callListStates.forEach((_item, _index) => {
                //   const timer = document.getElementById(_item.sessionId)?.currentTime ?? 0
                //   if (_item && timer > _num) {
                //     _num = timer
                //     resIndex = _index
                //   }
                // })
                // // 找到 通话时间最长的
                // const item = _this.callListStates[resIndex]
                // if (item && (item.state === '已接听' || item.state === '呼叫中')) {
                //   _this.endCall(item.sessionId, item.session, true, spliceIndex)
                // }
              }
            } else if (count > data.DEVS.length && filterCall.length >= data.DEVS.length) {
              // 轮询组人数少于 拨打次数  并且已经存在和轮询组人数相同的通话  考虑到轮询组人数小于满足分屏数的情况
              // 优先挂断当前要拨打的号码 并且当前这个号码异常
              if (findIndex0 !== -1) {
                spliceSession(findIndex0)
              } else {
                spliceSession(findIndex)
              }
            } else if (findIndex0 !== -1) {
            // 切换分屏的时候 挂断当前要拨打的异常通话
              spliceSession(findIndex0)
            }
            // if (_this.callListStates.find(item => item.to === index.CALL_NO && item.state && item.state !== '已接听')) {
            //   return
            // }
            // 轮询拨打电话
            // console.log(`呼叫第${count}次`, count, index.CALL_NO)
            _this.makeCall({ callNumber: index.CALL_NO, audioOrVideo: 'video', belong: 'videoScheduling', Polling: true })
            const dictionaries = {
              '0': '人员',
              '1': '设备',
              '2': '外部联系人'
            }
            const START_TIME = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
            const obj = {
              'MEMBER_NAME': index.NAME,
              'NUMBER': _this.pollingStateArr.filter(obj => String(obj) === String(index.CALL_NO)).length + 1,
              'MEMBER_TYPE': dictionaries[index.TYPE],
              'START_TIME': START_TIME,
              'END_TIME': START_TIME,
              'STATE': ''
            }
            if (dictionaries[index.TYPE] === '外部联系人') {
              obj.telPhone = index.CALL_NO
            }
            _this.POLLING_RECORD_DATA.VIDEO_POLLING_RECORD_DETAIL_LIST.push(obj)
            _this.pollingStateArr.push(index.CALL_NO)
          }
        }
      }
      const dictionaries = {
        '10s': 10000,
        '20s': 20000
      }// 轮询间隔对应字典
      // 先执行一次
      this.pollingCount++
      this.POLLING_RECORD_DATA = cloneDeep(this.POLLING_RECORD_DATA_COPY)
      this.POLLING_RECORD_DATA.NAME = data.GROUP_NAME
      this.POLLING_RECORD_DATA.MEMBER = data.DEVS.length
      this.POLLING_RECORD_DATA.INTERVALS = data.POLLING_TIME_INTERVAL
      this.POLLING_RECORD_DATA.START_TIME = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
      if (data.POLLING_NUMBER) {
        this.POLLING_RECORD_DATA.RULE = data.POLLING_NUMBER + '次'
        this.POLLING_RECORD_DATA.RULE_STATE = 0
      } else {
        this.POLLING_RECORD_DATA.RULE = data.POLLING_TIME_LONG + '小时'
        this.POLLING_RECORD_DATA.RULE_STATE = 1
      }
      POLLING_FN(this.pollingCount, data)
      this.PollingTimer = setInterval(() => {
        // 如果暂停轮询  次数不再相加  另有个方法 保存暂停时间戳取暂停和开启的插值，到最后加在
        if (_this.isPauseLX) { // 暂停轮询 不执行定时器
          return
        }
        this.pollingCount++
        try {
          POLLING_FN(this.pollingCount, data)
        } catch (error) {
          console.log(error)
        }
      }, dictionaries[data.POLLING_TIME_INTERVAL ])
    },
    // 获取用户在线状态
    getZxbj(item) {
      let res = 0
      if (item.yonghuzxbj === 1 || item.TYPE === '2') {
        res = '#32b16c'
      } else {
        res = '#999'
      }
      return res
    },
    // 保存轮询组 修改或添加结果
    sureClickPolling(data) {
      const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
      const { editPollingData, createMeetingName, addMeetingMemberList } = this
      this.$message.closeAll()
      if (!createMeetingName) {
        this.$message.warning('请填写群组名称')
        return
      }
      if (this.pollingData.find(item => item.GROUP_NAME === createMeetingName && item.ID !== editPollingData.ID)) {
        this.$message.warning('群组名称重复')
        return
      }
      if (!data.activeValue) {
        this.$message.warning(`请填写${data.activePolling}`)
        return
      }
      if (!data.POLLING_TIME_INTERVAL) {
        this.$message.warning(`请填写轮询间隔`)
        return
      }
      const DEVIDS = addMeetingMemberList.map(item => {
        return {
          'DEV_ID': item.POLICE_ID || item.userId,
          'CALL_NO': item.POLICE_ID || item.userId,
          'NAME': item.userName,
          'TYPE': item.devId === 'phone' ? '2' : item.devId ? '1' : '0'
        }
      })
      if (!DEVIDS || DEVIDS.length === 0) {
        this.$message.warning(`请选择人员`)
        return
      }
      const query = {
        POLICENO: POLICE_ID,
        TOKEN,
        POLLING_TIME_LONG: 5,
        GROUP_NAME: createMeetingName,
        DEVIDS
      }
      query.POLLING_TIME_INTERVAL = data.POLLING_TIME_INTERVAL
      if (data.activePolling === '轮询时长') {
        query.POLLING_TIME_LONG = Number(data.activeValue)
      } else {
        query.POLLING_NUMBER = Number(data.activeValue)
      }
      // console.log(query, data, '组合出来的数据')
      // 进行一些操作 组合数据
      if (this.PollingTitle === '编辑轮询群组') {
        query.POLLING_ID = editPollingData.ID
        this.$api.lunxun.saveOrUpdatePolling(query).then(res => {
          if (res.data.result) {
            this.$message.success('编辑成功')
            this.queryPollingByUnit()
          }
        })
      } else {
        this.$api.lunxun.saveOrUpdatePolling(query).then(res => {
          if (res.data.result) {
            this.$message.success('添加成功')
            this.queryPollingByUnit()
          }
        })
      }
      this.dialogPolling = false
    },
    // 新建轮询组
    createPolling() {
      this.editPollingData = {}
      this.dialogPolling = true
      this.PollingTitle = '新建轮询群组'
      this.$store.commit('audioMeet/SET_createMeetingName', '')
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      // 新建轮询组
    },
    // 编辑轮询组
    edit(node, data, e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.isPolling && data.ID === this.startPollingData.ID) {
        this.$message.warning('请先结束当前视频轮询再进行编辑!')
        return
      }
      // console.log(node, data)
      this.editPollingData = data
      this.dialogPolling = true
      this.PollingTitle = '编辑轮询群组'
      this.$store.commit('audioMeet/SET_createMeetingName', data.GROUP_NAME)
      // console.log(data)

      const arr = data.DEVS.map(item => {
        let res = 0
        const getUserLineStatus = (tree) => {
          for (let index = 0; index < tree.length; index++) {
            const element = tree[index]
            if (element.children && element.children.length > 0) {
              getUserLineStatus(element.children)
            } else {
              if (`${element.yonghuid}` === item.CALL_NO) {
                res = element.yonghuzxbj
              }
            }
          }
        }
        getUserLineStatus(this.userTree)
        const obj = {
          userName: item.NAME,
          POLICE_ID: item.CALL_NO,
          userId: item.CALL_NO,
          devId: item.TYPE === '1' ? item.DEV_ID : item.TYPE === '2' ? 'phone' : '',
          yonghuzxbj: res
        }
        if (item.TYPE === '1') {
          obj.devId = item.CALL_NO
        }
        return obj
      })
      // 组合arr到列表
      this.$store.commit('audioMeet/SET_addMeetingMemberList', arr)
    },
    // 移除轮询组
    remove(node, data, e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.isPolling && data.ID === this.startPollingData.ID) {
        this.$message.warning('请先结束当前视频轮询再进行删除!')
        return
      }
      this.$confirm(`此操作将永久删除${data.GROUP_NAME}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deletePolling(data.ID)
      }).catch(() => {

      })
    },
    // 查询轮询组信息
    async queryPollingByUnit() {
      const { UNIT_ID, TOKEN, POLICE_ID } = this.TONE_voip.cmd
      const res = await this.$api.lunxun.queryPollingByUnit({
        POLICENO: POLICE_ID,
        TOKEN,
        UNIT_ID
      })
      if (res && res.data && res.data.List && Array.isArray(res.data.List)) {
        res.data.List.forEach((item) => {
          let count = 0
          if (!Array.isArray(item.DEVS)) return
          item.DEVS.forEach(obj => {
            obj.parentName = item.GROUP_NAME
            let res = 0
            const getUserLineStatus = (tree, key, status) => {
              for (let index = 0; index < tree.length; index++) {
                const element = tree[index]
                if (element.children && element.children.length > 0) {
                  getUserLineStatus(element.children, key, status)
                } else {
                  if (`${element[key]}` === obj.CALL_NO) {
                    res = element[status]
                  }
                }
              }
            }
            if (obj.TYPE === '0') {
              getUserLineStatus(this.userTree, 'yonghuid', 'yonghuzxbj')
            } else if (obj.TYPE === '1') {
              getUserLineStatus(this.devTree, 'devId', 'status')
            }
            if (Number(res) === 1) {
              count++
              obj.yonghuzxbj = 1
            } else {
              obj.yonghuzxbj = 0
            }
          })
          const dev = item.DEVS.filter(objs => objs.TYPE === '2')
          // 设备默认都是在线状态
          count += dev.length
          item.zxCount = count
        })
      }// 筛选人员在线状态
      this.pollingData = res.data.List
      if (Array.isArray(this.pollingData)) {
        this.pollingDataCopy = this.pollingData.filter(item => item.zxCount > 0)
      }
      const _this = this
      this.$nextTick(_ => {
        const { navActive } = _this
        if (navActive === 'spdd-lb-ddt') {
            _this?.$refs?.tree1?.filter()
        } else if (navActive === 'spdd-lb-sb') {
            _this?.$refs?.tree2?.filter()
        } if (navActive === 'spdd-lb-lxqz') {
            _this?.$refs?.tree3?.filter()
        }
      })
    },
    // 删除轮询组
    deletePolling(POLLING_ID, ID) {
      const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
      this.$api.lunxun.deletePolling({
        POLLING_ID,
        POLICENO: POLICE_ID,
        TOKEN
      }).then(res => {
        if (res.data.result) {
          this.$message.closeAll()
          this.$message.success('删除成功')
          this.queryPollingByUnit()
        }
      })
    },
    // 根据配置加载tab栏
    loadResource() {
      const { dictionaries } = this
      const result = queryId('spdd', this.settings.FEATURE_SETTING)
      const result2 = queryId('spdd-fp-csjz', this.settings.FEATURE_SETTING)
      if (result && result.isOpen && result.children && result.children[0] && result.children[0].children) {
        const arr = result.children[0].children[0]
        if (Array.isArray(arr.children)) {
          this.tabNav = []
          arr.children.forEach(item => {
            if (arr.active === item.text) {
              this.navActive = item.id
            }
            this.tabNav.push({
              id: item.id,
              name: item.text,
              isActive: arr.active === item.text
            })
          })
        }
      }
      const find = this.splitScreenList.find(item => dictionaries[item.num] === result2.value)
      find && this.splitScreenBtn(find)
    },
    // 全部静音
    allMute: throttle(function() {
      const filter = this.callListStates.filter(item => item.sessionId && item.state === '已接听')
      if (filter.length <= 0) {
        this.$message.closeAll()
        this.$message.warning('当前没有可操作的视频')
        return
      }
      this.$message.closeAll()
      this.$message({
        showClose: true,
        message: `${this.AllMute ? '全部解除静音' : '当前视频全部静音'}`,
        duration: 5000,
        type: 'info'
      })
      this.AllMute = !this.AllMute
      this.callListStates.forEach(item => {
        const session = item.session
        const mediaElement = document.getElementById(item.sessionId)
        const findIndex2 = this.callListStates.findIndex(v => v.sessionId === item.sessionId)
        if (item.session && item.sessionId && item.state === '已接听' && !this.AllMute) {
          session.unmute()
          mediaElement.volume = 1
          this.$set(this.callListStates[findIndex2], 'mState', false)
        } else if (item.session && item.sessionId && item.state === '已接听' && this.AllMute) {
          session.mute()
          this.$set(this.callListStates[findIndex2], 'mState', true)
          mediaElement.volume = 0
        }
      })
    }, 500, { 'trailing': false }),
    // 全部挂断
    endAllCall() {
      const filter = this.callListStates.filter(item => item.sessionId)
      if (filter.length <= 0) {
        this.$message.closeAll()
        this.$message.warning('当前没有可操作的视频')
        return
      }
      this.$confirm(`您确定要全部挂断吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 全部挂断
        const filter = this.callListStates.filter(item => item.sessionId)
        if (filter.length <= 0) return
        this.AllMute = false
        this.callListStates.forEach((item, i) => {
          if (item.session && item.sessionId && (item.state === '已接听' || item.state === '呼叫中')) {
            item.state = ''
            this.endCall(item.sessionId, item.session, true, i)
          }
        })
      }).catch(() => {
        //
      })
    },
    handleCurrentChange(val) {
      this.pageCount = val
    },
    // tab切换
    selectTab(e) {
      if (e.target.nodeName === 'LI') {
        this.isAll = e.target.innerText
        if (this.isAll === '全部') {
          this.$refs.btnLine.style.left = 25 + 'px'
        }
        if (this.isAll === '在线资源') {
          this.$refs.btnLine.style.left = 90 + 'px'
        }
      }
    },
    // 拖拽进入右侧区域拨打电话
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
      const fn = (v) => {
        const find = _this.callListStates.find(item => String(item.to) === String(dragItem[v]) && (item.state === '已接听' || item.state === '呼叫中'))
        if (find) {
          _this.$message.warning('该用户已在视频中，请不要重复拨打视频')
        } else {
          let Index = -1
          if (e?.toElement?.id?.indexOf('quanxuanVideo') !== -1) {
            Index = e.toElement.id
          } else if (e?.target?.className === 'kongxian' && e?.target?.parentElement?.id?.indexOf('quanxuanVideo') !== -1) {
            Index = e?.target?.parentElement?.id
          }
          Index = Number(Index.split(',')[1])
          _this.makeCall({ callNumber: dragItem[v], audioOrVideo: 'video', belong: 'videoScheduling' })
          _this.callListStates[Index]['toVideo'] = String(dragItem[v])
          _this.dragItem = {}
          _this.isDragIng = ''
        }
      }
      if (move) {
        if (dragItem.type === 'dev') {
          fn('devId')
        } else {
          fn('yonghuid')
        }
        // 是否拖入了右侧视频区域  拨打电话 右方如果有正在通话的被拖拽用户 提示正在通话中
        // console.log(this.dragItem)
      }
    },
    userDropStart(item, event) {
      this.dragItem = item
    },
    userDropEnd() {
      this.isDragIng = ''
      this.dragItem = {}
    },
    // 用户是否在视频中
    videoIng(data) {
      if ('countYh' in data) {
        return ''
      } else {
        const find = this.callListStates.find(item => String(item.to) === (String(data.yonghuid) || String(item.from) === String(data.yonghuid)) && item.state === '已接听')
        if (String(this.TONE_voip.ddtinfo.ddtid) === String(data.yonghuid)) {
          return ''
        } else if (find) {
          return '(视频中)'
        } else {
          return ''
        }
      }
    },
    // 设备是否在视频中
    videoIngDev(data) {
      if ('countExt' in data) {
        return ''
      } else {
        if (this.callListStates.find(item => String(item.to) === String(data.devId) && item.state === '已接听')) {
          return '(视频中)'
        } else {
          return ''
        }
      }
    },
    onLine(data, name = 'children', len = 'countYh') {
      // 统计在线人数
      // eslint-disable-next-line no-unused-vars
      let devCount = 0// 因为设备不只有总数 还有分类 要计算分类下的单位下的设备总数
      const deepCount = (obj, count = 0) => {
        if (obj[name]?.length > 0) {
          obj[name].forEach(item => {
            // 在线字段 对应人员APP调度台的实时在线 和设备 外部联系人的在线
            if (item?.yonghuzxbj === 1 || item.TYPE === '2' || item.status === 1) {
              count++
            }
            if (!item[name]) { // 单位下的总设备数
              devCount++
            }
            if (item[name]?.length > 0) {
              count += deepCount(item, 0)
            }
          })
        }
        return count
      }
      if (data.isType) {
        return ''
      }
      if (data[name]?.length > 0) {
        const obj = deepCount(data)
        if (len === 'countExt') {
          return `(${obj}/${devCount})`
        } else if (name === 'children') {
          return `(${obj}/${data[len]})`
        } else if (name === 'DEVS') {
          return `(${obj}/${data?.DEVS?.length})`
        } else {
          return `(${obj}/${data[len]})`
        }
      } else {
        return ''
      }
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
      const Index = this.callListStates.findIndex(obj => obj.sessionId === item.sessionId)
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
        } else if (e.target?.parentElement?.className.indexOf('quanxuanItem') !== -1) {
          Index = Number(e.target?.parentElement?.id.split(',')[1])
        } else if (e.target?.parentElement?.parentElement?.className.indexOf('quanxuanItem') !== -1) {
          Index = Number(e.target?.parentElement?.parentElement?.id.split(',')[1])
        }
      } else {
        Index = this.callListStates.findIndex(obj => String(obj?.sessionId) === String(e.target.id))
      }
      if (Index === this.dragIndex) {
        // 拖动到当前视频 无动作
        this.dragSessionArr = []
        this.isDragIng = ''
        return
      }
      if (Index >= 0 && this.dragIndex >= 0) {
        this.isDragIng = ''
        const _this = this
        this.dragSessionArr.push(this.callListStates[Index])
        // 交换位置
        const dragObj = this.callListStates[this.dragIndex]
        const dragObj2 = this.callListStates[Index]
        _this.$set(this.callListStates, _this.dragIndex, dragObj2)
        _this.$set(this.callListStates, Index, dragObj)
      }
    },
    // 拖拽到元素上方
    domDragEnter(e) {
      const Index = this.callListStates.find(obj => String(obj?.sessionId) === String(e.target.id))
      this.isDragIng = ''
      // if (Object.keys(this.dragItem).length > 0) return
      if (Index && this.dragSessionArr.find((obj) => obj.sessionId === Index.sessionId)) {
        this.isDragIng = ''
      } else if (e?.toElement?.id?.indexOf('quanxuanVideo') !== -1) {
        this.isDragIng = e.toElement.id
      } else if (e?.target?.className === 'kongxian' && e?.target?.parentElement?.id?.indexOf('quanxuanVideo') !== -1) {
        this.isDragIng = e?.target?.parentElement?.id
      } else {
        this.isDragIng = ''
      }
    },
    // 拖拽离开该元素
    domDragLeave(e) {
      // console.log('离开')
      // this.isDragIng = ''
    },
    // 拖拽结束
    domDragEnd(e) {
      // console.log('拖拽视频结束', e)
      if (this?.dragSessionArr?.length > 0) {
        const that = this
        setTimeout(_ => {
          that.dragSessionArr.forEach(item => {
            if (item && item.session && item.sessionId) {
              that.setupRemoteMedia(item.session, item.sessionId)
            }
          })
          this.dragSessionArr = []
        }, 10)
      }
      this.isDragIng = ''
    },
    // tree 筛选
    filterNode(value, data) {
      // 筛选调度台 APP
      const isZx = data.yonghuzxbj === 1 || data.status === 1// 在线状态
      const isParent = data.uName && data?.uName?.indexOf(value) !== -1// 携带父节点
      const isUniName = data.unitName && data?.unitName?.indexOf(value) !== -1
      if (!value && this.isAll === '全部') {
        return true
      } else if (!value && this.isAll === '在线资源') {
        return isZx
      }
      if (this.isAll === '全部') {
        return isParent || (isUniName) || (data.UnitName && data?.UnitName?.indexOf(value) !== -1)
      } else {
        return (isParent && isZx) || (isUniName && isZx) || (data.UnitName && data?.UnitName?.indexOf(value) !== -1 && isZx)
      }
    },
    filterNode2(value, data) {
    // 筛选调度台 APP
      const isZx = data.yonghuzxbj === 1 || data.status === 1 || data.TYPE === '2'// 在线状态
      const isUniName = data && data.GROUP_NAME && data.GROUP_NAME.indexOf(value) !== -1
      const isSelfName = data && data.NAME && data.NAME.indexOf(value) !== -1 // 群组成员名称
      const isUniNameChild = data && data.parentName && data.parentName.indexOf(value) !== -1
      if (!value && this.isAll === '全部') {
        return true
      } else if (!value && this.isAll === '在线资源') {
        return isZx
      }
      if (this.isAll === '全部') {
        return isUniName || isUniNameChild || isSelfName
      } else {
        return ((isUniName || isUniNameChild || isSelfName) && isZx)
      }
    },
    // 显示的模块
    isShowPanel(val) {
      this.navActive = val
      this.filterText = ''
      this.searchBtn()
    },
    // 关键词搜索
    searchBtn() {
      if (this.navActive === 'spdd-lb-ddt') {
        this.$refs.tree1.filter(this.filterText)
      }
      if (this.navActive === 'spdd-lb-sb') {
        this.$refs.tree2.filter(this.filterText)
      }
      if (this.navActive === 'spdd-lb-lxqz') {
        this.$refs.tree3.filter(this.filterText)
      }
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
      this.addMeetingMemberListData = []
      this.dialogVisible = true
      this.distributeItem = item
    // this.postionIndex = index
    // this.$store.commit('sip/SET_POSTION_INDEX', index)
    },
    // 分发视频
    distributeVideo() {
      const flag = this.addMeetingMemberListData.find(item => parseInt(item.userId) === parseInt(this.distributeItem.from) || parseInt(item.userId) === parseInt(this.distributeItem.to))
      // console.log(flag, this.addMeetingMemberListData, this.distributeItem)
      if (flag) {
        this.$message.warning('不允许分发给正在通话的用户')
        return
      }
      var exten = this.addMeetingMemberListData.map(v => {
        return v.userId
      }).join(',')
      this.$api.common.vdispatchBtn({
        callUser: this.distributeItem.from,
        variableUser: this.distributeItem.to,
        distributionUser: exten,
        isVideo: '0'
      }).then(res => {
        this.dialogVisible = false
      })
    },
    splitScreenBtn(item) {
      if (this.activeName === item.name) return
      const { dictionaries } = this
      const oldVal = JSON.parse(JSON.stringify(dictionaries[this.splitScreenNumber]))
      this.activeName = item.name
      this.splitScreenNumber = item.num
      const res = dictionaries[item.num]
      this.aaaListPush(res, oldVal)
      this.pageCount = 1
    },
    aaaListPush(num, oldVal) {
      const filter = this.callListStates.filter(obj => obj.sessionId)
      this.callListStates.forEach(obj => {
        if (obj.motor) {
          clearInterval(obj.motor)
        }
      })
      this.$store.commit('sip/SET_callListStates', [])
      const obj = {
        isQuanXuanVideo: true,
        session: {},
        sessionId: '',
        type: 'video'
      }
      for (let i = 0; i < num; i++) {
        this.callListStates.push(JSON.parse(JSON.stringify(obj)))
      }
      const setMotor = function(item) {
        if (item.state === '已接听') {
          item.motor = setInterval(_ => {
            if ('timer' in item) {
              item.timer = parseFloat(document.getElementById(item.sessionId)?.currentTime ?? 0)
            } else {
              clearInterval(item.motor)
            }
          }, 1000)
        }
      }
      if (oldVal > num && this.isPolling) { // 多屏切换少屏 且是视频轮询
        const findIndex = filter.findIndex(item => String(item.to) === String(this.activeCallNumber))
        // 如果是视频轮询  多屏切换少屏  优先取出上一次呼叫的视频 然后倒序取出剩余的视频排列组合  若少屏切多屏  不做任何操作 顺序排列即可
        if (findIndex !== -1) {
          const find = filter.splice(findIndex, 1)
          const newArr = filter.reverse()
          newArr.forEach((obj, index) => {
            if (index >= this.callListStates.length - 1) {
              if (obj?.state === '已接听' || obj?.state === '呼叫中') {
                this.endCall(obj.sessionId, obj.session, true)
              }
            } else {
              setMotor(obj)
              this.callListStates.splice(index, 1, obj)
            }
          })
          const findState = this.callListStates.findIndex(item => !item.sessionId)
          this.callListStates.splice(findState, 1, find[0])
          setMotor(find[0])
        }
      } else {
        filter.forEach((item, index) => {
          // 如果非 视频轮询  或者少屏切换多屏 顺序排列
          if (index >= this.callListStates.length) {
            this.callListStates.push(item)
          } else {
            setMotor(item)
            this.callListStates.splice(index, 1, item)
          }
        })
      }

      // console.log(filter, '切换的视频')
      this.$nextTick(() => {
        this.callListStates.forEach((item) => {
          if (item.session && item.sessionId && item.state === '已接听') {
            this.setupRemoteMedia(item.session, item.sessionId)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.videoScheduling {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  background: url('../../assets/images/login/bg.png') center center no-repeat;
  background-size: 100% 100%;
  padding-top: 0.75rem;
  .videoScheduling-container {
    width: 100%;
    height: 100%;
    padding: 15px;
    .left {
      width: 340px;
      height: 100%;
      .posi-panel{
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 300px;
        padding-top: 1.5px;
        display: flex;
        .posi-right{
          position: relative;
          flex: 1;
          display: flex;
          overflow: hidden;
          flex-direction: column;
           ::v-deep .el-tabs {
              .el-tabs__header {
                margin: 0;
                .el-tabs__nav-wrap::after {
                  height: 1px;
                  background-color: rgba(2, 167, 253, 0.24);
                }
                .el-tabs__item {
                  padding: 0 10px;
                  font-size: 12px;
                  height: 30px;
                  line-height: 30px;
                  color: #ccc;
                  &.is-active {
                    color: #fff;
                  }
                }
                .el-tabs__active-bar {
                  height: 2px;
                  background-color: #FF6A00;
                }
              }
            }
          .tab {
            display: flex;
            position: relative;
            height: 32px;
            // border-top: 1px solid rgba(2, 167, 253, 0.4);
            border-bottom: 1px solid rgba(2, 167, 253, 0.4);
            > li {
              box-sizing: border-box;
              font-family: 'Source Han Sans CN';
              font-weight: 400;
              font-size: 14px;
              text-align: center;
              line-height: 2;
              color: #fff;
              opacity: 0.7;
              // padding: 0 0px 0px;
              margin-left: 26px;
              cursor: pointer;
              &.active {
                opacity: 1;
              }
            }
            .btnLine {
              width: 0.47rem;
              height: 0.03rem;
              position: absolute;
              left: 25px;
              bottom: 0;
              z-index: 2;
              background: #ff6a00;
              transform: perspective(4px) rotateX(5deg);
              transition: all 0.3s;
            }
          }
           .isAll{
            margin: 10px 0 0 5px;
            ::v-deep .el-radio__label {
                font-size: 12px;
                color: rgb(153, 153, 153);
            }
            ::v-deep .el-radio.is-checked {
              .el-radio__inner {
                border-color: #01cfff;
                background: #01cfff;
              }

              .el-radio__label {
                color: #01cfff;
              }
            }
           }
        }
        .tab-cards{
            box-sizing: content-box;
            width: 28px;
            height: calc(100% - 20px);
            margin: 10px 0 10px 8px;
            background: linear-gradient(270deg, #2A7AA2, #055984);
            border: 1px solid #01CFFF;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
           li{
              overflow: hidden;
              width: 100%;
              float: left;
              color: #00d8ff;
              cursor: pointer;
              user-select: none;
              line-height: 3;
              box-sizing: border-box;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              span{
                display: inline-block;
                word-break: break-all;
                width: 14px;
                line-height: 2;
              }
            &.active{
              color: #fff;
              background: url('../../assets/images/equipment/active.png') no-repeat;
              background-size: 100% 100%;
            }
            &:last-child {
              float: right;
              &.active {
                margin-right: -1px;
                padding-right: 1px;
              }
            }
          }
        }
        ::v-deep .filter {
          width: calc(100% - 10px);
          margin: 5px 5px 5px 5px;
          height: 30px;
          // margin-left: 10px;
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
              margin-top: 2px;
              cursor: pointer;
            }
          }
        }
        .tab-con{
          overflow: hidden;
          overflow-y: auto;
          position: relative;
          flex: 1;
          padding-bottom: 10px;
        }
        .tab-con-item{
          position: absolute;
          width: 100%;
          height: 100%;
          transition: all 0.15s linear;
          right: calc(-100% - 20px);
          background-size: cover;
          z-index: 1001;
          overflow: auto;
          .listBtn{
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: space-around;
            color: #01d3f9;
            img{
              width:20px;
              height: 20px;
            }
            a{
              color: #098ED6;
            }
          }
        }
        .tab-con-item.active{right: 0; z-index: 1002;}
        .polling-type-list{
            height: 100%;
            .btnWrap{
              position: absolute;
              left: 50%;
              bottom:10px;
              transform: translateX(-50%);
              cursor: pointer;
                background: url('../../assets/images/equipment/btnBg.png') no-repeat;
                background-size: 100% 100%;
                width: 80px;
                height: 24px;
                line-height: 24px;
                font-size: 12px;
                display: inline-block;
                color: #01cfff;
                text-align: center;
            }
        }
      }
    }
    .right {
      width: calc(100% - 400px);
      height: 90%;
      background: radial-gradient(circle, rgba(0, 39, 60, 0.8), rgba(0, 79, 120, 0.8));
      box-shadow: inset 0px 0px 10px 2px #35879d;
      padding: 15px;
      position: relative;
      .endCall{
            width: 20px;
            height: 20px;
            background: url('../../assets/images/videoScheduling/endCall.png') center center no-repeat; background-size: 100% 100%;
          }
      .splitScreenBtnWrap {
          position: absolute;
          width: 100%;
          height: 10%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: inset 0px 0px 10px 2px #35879d;
          background: radial-gradient(circle, rgba(0, 39, 60, 0.8), rgba(0, 79, 120, 0.8));
          left: 0;
          bottom: -10%;
          .domain{
            display: flex;
            justify-content: flex-end;
            align-items: center;
             .btnWrap{
              transform: translateX(-50%);
              cursor: pointer;
              background-size: 100% 100%;
              width: 80px;
              height: 24px;
              line-height: 24px;
              font-size: 12px;
              display: inline-block;
              color: #01cfff;
              text-align: center;
            }
            p,span{
              cursor: pointer;
            }
            .endCall{
              margin:0 15px;
            }
          }
          &>div{
            flex:1;
            text-align: center;
          }
        .splitScreenBox{
          display: flex;
          .btn{
            cursor: pointer;
            margin-left: 14px;
          }
        }
        ::v-deep  .paging{
          .el-pagination{
            button{
              background-color: transparent !important;
              .el-icon-arrow-right:before{
                color:#0AA3F5;
              }
            }
            .el-pager{
              li{
                background-color: transparent !important;
                color: white;
              }
              .active{
                color: #0AA3F5 !important;
              }
            }
          }
        }
        .splitScreenBtn {
          cursor: pointer;
          // width: 100%;
          // height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background-color: rgba(44, 85, 105, 1);
          margin-bottom: 4px;
          clip-path: polygon(30px 0, calc(100% - 0px) 0, 100% 0px, 100% calc(100% - 0px), calc(100% - 0px) 100%, 30px 100%, 0 calc(100% - 10px), 0 10px);
          .text {
            display: inline-block;
            color: rgba(0, 216, 255, 1);
            font-size: 14px;
            font-weight: 500;
            font-family: PingFang SC;
            width: 20px;
            // margin-top: 17px;
          }
        }
        .active {
          background-color: rgb(20, 152, 172);
          .text {
            color: #fff;
          }
        }
      }
      .quanxuan_con_left {
        width: 100%;
        height: 100%;
        overflow: hidden;
        // .over {
        //   background-color: rgb(101, 108, 101) !important;
        // }
        .videoDrag{
          // border: 1px solid rgb(240, 229, 20);
          box-shadow: inset 0px 0px 10px 2px #35879d;
        }
        .quanxuanItem{
          width: 100%;
          height: 100%;
          color: #F1F1F1;
          background: rgb(2, 18, 51);
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
          user-select: none;
          .qx{
            width: 100%;
            height: 100%;
          }
          .qx_con {
            width: 100%;height: 100%;
          }
          .qx_c{width: 100%;height: 100%;position: relative;
          &>span:not(.info){
            z-index: 2222;
            transform: scale(1.5);
            border-radius: 50%;
            background: url('../../assets/images/videoScheduling/v_btnBg.png') center center no-repeat; background-size: cover;
            text-align: center;
            box-sizing: border-box;
            padding: 2px;
          }
            .v_cloundTop{
                  position: absolute;
                  top: 10px;
                  left: 50%;
                  transform: translateX(-50%) scale(1.5);
                  cursor: pointer;
            }
            .v_cloundBot{
                  position: absolute;
                  bottom: 10px;
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
          .qx_c video{ width: 100%; height: 100%;}
          .qx_c video :hover{
            cursor:move;
          }
          .qx_c:hover .vodeocontrol{bottom: 15px;}
          .qx_c .vodeocontrol{position: absolute; height: 40px; width: 100%; bottom: -40px; transition: all .3s;display: flex;align-items: flex-start;justify-content: space-around;}
          .v-btn{ width:10%;height: 40px; margin-right: 10px; border-radius: 50%; cursor: pointer; line-height: 1 !important;
          }
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
          .record-btn {
            // width: 37px;
            width:9%;
            height: 40px;
            background: url('../../assets/images/videoScheduling/record.png') no-repeat center;
            background-size: contain;
          }
          .mute-btn, .unmute-btn {
            font-size: 14px;
            background: url('../../assets/images/videoScheduling/v_btnBg.png') center center no-repeat; background-size: contain;
            text-align: center;
            // width: 40px;
            height: 40px;
            // margin-top: 3px;
            .full {
              color:#fff;
              margin-top: 11px;
            }
          }
          .fenfa-btn {
            background: url('../../assets/images/videoScheduling/fenfa.png') no-repeat center;
            background-size: contain;
            // width: 39px;
            height: 40px;
            // margin-top: 4px;
          }
          .end-btn{background: url('../../assets/images/videoScheduling/end.png') center center no-repeat; background-size: contain;margin-right: 15px;}
          .info {
              position: absolute;
              height: 30px;
              line-height: 30px;
              color: #fff;
              z-index: 2;
              width: 100%;
              top: 0;
              -webkit-transition: all 0.3s;
              transition: all 0.3s;
              left: 0;
              text-align: center;
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
              justify-content: space-between;
              padding: 0 5px;
          }
          .qx_c:hover .info {
            top: 0;
          }
          .kongxian {
            width: 100%;
            position: absolute;
            top: 50%;
            height: auto;
            transform: translateY(-50%);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            p{
              cursor: pointer;
            }
            .meta{
              user-select: none;
              width: 10%;
              pointer-events: none;
               -webkit-user-drag: none;
              // height: 10%;
            }
            .kongxian_icon {
              width: 30px;
              height: 30px;
            }
            .kongxian_text {
              padding: 3px 0;
              color: #5e708e;
              font-size: 12px;
              pointer-events: none;
              user-select: none;
            }
          }
        }
        .one {
          float: left;
          width: 100%;
          height: 100%;
        }
        .four {
          float: left;
          width: calc((100% - 6px)/2);
          height: calc((100% - 6px)/2);
          &:first-child {
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(2) {
            margin-bottom: 6px;
          }
          &:nth-child(3) {
            margin-right: 6px;
          }
        }
        .six {
          float: left;
          width: calc((100% - 12px)/3);
          height: calc((100% - 12px)/3);
          &:first-child {
            width: calc((100% - 12px)/3*2 + 6px);
            height: calc((100% - 12px)/3*2 + 6px);
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(2) {
            margin-bottom: 6px;
          }
          &:nth-child(3) {
            margin-bottom: 6px;
          }
          &:nth-child(4) {
            margin-right: 6px;
          }
          &:nth-child(5) {
            margin-right: 6px;
          }
        }
        .nine {
          float: left;
          width: calc((100% - 12px)/3);
          height: calc((100% - 12px)/3);
          &:first-child {
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(2) {
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(3) {
            margin-bottom: 6px;
          }
          &:nth-child(4) {
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(5) {
            margin-right: 6px;
            margin-bottom: 6px;
          }
          &:nth-child(6) {
            margin-bottom: 6px;
          }
          &:nth-child(7) {
            margin-right: 6px;
          }
          &:nth-child(8) {
            margin-right: 6px;
          }
        }
        .sixteen {
          float: left;
          width: calc((100% - 12px)/4);
          height: calc((100% - 12px)/4);
          &:first-child {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(2) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(3) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(4) {
            margin-bottom: 3px;
          }
          &:nth-child(5) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(6) {
             margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(7) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(8) {
            margin-bottom: 3px;
          }
          &:nth-child(9) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(10) {
            margin-right: 4px;
            margin-bottom: 3px;
          } &:nth-child(11) {
            margin-right: 4px;
            margin-bottom: 3px;
          }
          &:nth-child(12) {
            margin-bottom: 3px;
          }
          &:nth-child(13) {
            margin-right: 4px;
          }
          &:nth-child(14) {
            margin-right: 4px;
          }
          &:nth-child(15) {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

</style>
