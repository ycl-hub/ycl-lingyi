<template>
  <div class="equipmentWrap">
    <div class="equipment">
      <!-- 一级设备 -->
      <ul v-show="equipment.length > 0" class="oneLevel">
        <li v-for="(value, i) of equipment" v-if="isShow('txtc')||i!=0" :key="i" :class="value.text === oneLevelActive ? 'oneLevelActive' : ''" class="oneLevelLi" @click="oneLevelClick(value, i)">
          <div class="icon">
            <svg-icon class="iconImg" :icon-class="value.icon" />
          </div>
          <span class="text" :title="value.text">{{ value.text }}</span>
        </li>
        <!-- 设备 -->
        <div v-show="ckDev" class="ckdev">
          <span class="sanjiao" />
          <div class="wrap bevel">
            <ul class="secUl">
              <li v-for="(item,k) in typeList" :key="k" :class="item.isActive ? 'active' : ''" :data-dyn="item.is_dyna" class="secLi" @click="liClickHandle(item,k)">
                <img class="secImg" :src="iconServer+item.ico_file" alt="">
                <span class="secName">{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- 数据图层 -->
        <div v-show="dataLayer" class="dataLayer">
          <span class="sanjiao" />
          <div class="wrap bevel">
            <ul class="secUl">
              <li v-for="(item,k) in dataLayerList" :key="k" v-has="item.id" :class="item.isActive ? 'active' : ''" class="secLi" @click="dataLayerClick(item)">
                <img class="secImg" :src="item.icon" alt="">
                <span class="secName">{{ item.text }}</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- 快速调度 -->
        <div v-show="diaodu" class="diaodu">
          <span class="sanjiao" />
          <div class="wrap bevel">
            <ul class="secUl">
              <li v-for="(item,k) in diaoduList" :key="k" :class="item.text === diaoduActive ? 'active' : ''" class="secLi" @click="diaoduClick(item,k)">
                <img class="secImg" :src="item.icon" alt="">
                <span class="secName">{{ item.text }}</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- 普通地图、卫星地图 -->
        <div v-show="dituDev" class="ditu">
          <span class="sanjiao" />
          <div class="wrap bevel">
            <ul class="secUl">
              <li class="dituLi">
                <div v-for="item in dituTypeList" :key="item.mapType" :class="{active:sceneType==item.mapType}" @click="sceneTypeChange(item.mapType)">
                    {{item.text}}
                </div>
              </li>
              <li v-for="(item,k) in dituList" :key="k" :class="item.mapType === mapType ? 'active' : ''" class="secLi" @click="dituClick(item,k)">
                <img class="secImg" :src="item.icon" alt="">
                <span class="secName">{{ item.text }}</span>
              </li>
              <li class="secLi" @click="addModel()" :class="{'active': addModelFlag}">
                <img class="secImg model" :src="model" alt="">
                <span class="secName">加载模型</span>
              </li>
            </ul>
          </div>
        </div>
      </ul>
      <!--==点位聚合详情==-->
      <!-- <el-drawer class="tone_sip-t84 tone_sipn_drawer" title="聚合点位详情" :visible.sync="drawer" :modal="false">
        <ul class="devlist">
          <li v-for="item in devList" :key="item.id" @click="getDevInfo(item, singleDev)">{{ item.name || item.UserName }}</li>
        </ul>
      </el-drawer> -->
    </div>
    <!--==点位详情==-->
    <div v-if="dialogTableVisible" ref="detail"  v-move="{parent: '.tone_sip_dialog', childrenHeader: '.tone_sip_dialog_tit'}" class="tone_sip_dialog">
      <span v-show="devInfo.yonghuzxbj&&devInfo.latitude" class="sanjiao" />
      <div class="detailBox bevel">
        <div class="tone_sip_dialog_tit">
          <span class="tit">{{ devInfo.login_pc=='1'?'调度台':devInfo.login_pc=='0'||dev_type.is_app?'人员':'通信资源' }}详情</span>
          <span class="el-icon-close close" @click="closeToneDialog" @touchend="closeToneDialog" />
        </div>
        <div class="tone_sip_con">
          <div class="dev_info_header">
            <img v-viewer="{'navbar': false, 'toolbar': false}" :src="devInfo.yhtx?iconServer+devInfo.yhtx:dev_type?iconServer+dev_type.ico_file:defaultPng" alt="头像">
            <div class="dev_info_header_first">
              <header :style="{color:devInfo.yonghuzxbj?'rgb(50, 177, 108)':'rgb(153, 153, 153)'}">{{ devInfo.name }}</header>
              <div class="body">
                <div>ID号:{{ devInfo.id }}</div>
                <div v-if="devInfo.UnitName">所属单位:{{ devInfo.UnitName }}</div>
              </div>
            </div>
          </div>
          <div ref="devInfo" class="dev_info_footer">
            <div v-if="devInfo.mobile" class="left-text clearfix"><div class="span_remark">手机号:</div><div class="remark_end">{{ devInfo.mobile }}</div></div>
            <div v-if="devInfo.yhssbm" class="left-text clearfix"><div class="span_remark">部门:</div><div class="remark_end">{{ devInfo.yhssbm }}</div></div>
            <div v-if="devInfo.yhzw" class="left-text clearfix"><div class="span_remark">职务:</div><div class="remark_end">{{ devInfo.yhzw }}</div></div>
            <div v-if="devInfo.terminallx" class="left-text clearfix"><div class="span_remark">用户类型:</div><div class="remark_end">{{ devInfo.terminallx }}</div></div>
            <div v-if="devInfo.wkid" class="left-text clearfix"><div class="span_remark">工号:</div><div class="remark_end">{{ devInfo.wkid }}</div></div>
            <div v-if="devInfo.address" class="left-text clearfix"><div class="span_remark">地址:</div><div class="remark_end">{{ devInfo.address }}</div></div>
            <div v-if="devInfo.login_pc!=='1'&&(devInfo.longitude&&devInfo.latitude)" class="left-text clearfix"><div class="span_remark">位置信息:</div><div class="remark_end">{{ devInfo.longitude +','+devInfo.latitude }}</div></div>
            <div v-if="devInfo.Time" class="left-text clearfix"><div class="span_remark">位置上报时间:</div><div class="remark_end">{{ devInfo.Time }}</div></div>
            <div v-if="devInfo.lxsj&&!devInfo.yonghuzxbj" class="left-text clearfix"><div class="span_remark">离线时间:</div><div class="remark_end">{{ devInfo.lxsj }}</div></div>
            <div v-if="dev_type&&!devInfo.terminallx" class="left-text clearfix"><div class="span_remark">设备类型:</div><div class="remark_end">{{ dev_type.name }}</div></div>
          </div>
          <div class="btnWrap">
            <div class="btn" @click="makeCall({callNumber:devInfo.id||devInfo.UserID, audioOrVideo:'audio'})">
              <span>语音呼叫</span>
            </div>
            <div class="btn" @click="makeCall({callNumber:devInfo.id||devInfo.UserID, audioOrVideo:'video',belong:'map'})">
              <span>视频呼叫</span>
            </div>
            <div v-if="devInfo.is_dyna==='true'" class="btn" @click="lishiguiji()">
              <span>历史轨迹</span>
            </div>
            <div v-if="devInfo.mobile" class="btn">
              <span @click="$root.$emit('sendMessage',devInfo, true)">短信调度</span>
            </div>
            <div
              v-if="dev_type.is_app||devInfo.login_pc"
              class="btn"
              @click="$root.$emit('IM', {
                type: 'single',
                yonghuid: devInfo.id
              })"
            >
              <span>即时通信</span>
            </div>
            <div v-if="devInfo.yonghuzxbj" class="btn" @click="qiangcha(devInfo, true)">
              <span>强插</span>
            </div>
            <div v-if="devInfo.yonghuzxbj" class="btn" @click="qiangcha(devInfo, false)">
              <span>强拆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 轨迹查询 -->
    <el-dialog
      v-el-drag-dialog
      title="轨迹查询"
      :visible.sync="guijiDialog"
      width="260px"
      :close-on-click-modal="false"
      custom-class="guiji bevel"
    >
      <div class="block">
        <el-date-picker
          v-model="day"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :clearable="false"
        />
      </div>
      <div class="block">
        <el-time-picker
          v-model="time1"
          placeholder="开始时间"
          value-format="HH:mm:ss"
          :clearable="false"
        />
      </div>
      <div class="block">
        <el-time-picker
          v-model="time2"
          placeholder="结束时间"
          value-format="HH:mm:ss"
          :clearable="false"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-search" @click="searchGuiji">立即查询</el-button>
      </div>
    </el-dialog>
    <!-- 语音会议 -->
    <!-- <AudioMeet ref="meet" :meet-dialog.sync="meetDialog" :create-meeting-name1="createMeetingName" :add-meeting-member-list1="addMeetingMemberList" /> -->
    <!-- 创建语音会议 -->
    <CreateDialog v-if="dialogVisible" :call-type="'audio'" :dialog-type="'add'" :dialog-title="'邀请成员'" :dialog-visible="dialogVisible" @closeVisible="dialogVisible = false" @sureClick="sureClickHandle" />
    <!-- 创建视频会商 -->
    <CreateDialog v-if="dialogVisibleVideo" :call-type="'videoMeet'" :dialog-title="'邀请成员'" :dialog-visible="dialogVisibleVideo" @closeVisible="dialogVisibleVideo = false" @sureClick="sureClickHandleVideo" />
    <!-- 视频会商 -->
    <VideoMeet v-if="videoMeetDialog" ref="videoMeet" :video-meet-dialog.sync="videoMeetDialog" :video-dev="videoDev" />

    <!-- 创建视频群呼 -->
    <CreateDialog v-if="dialogVisibleVideoGroup" :call-type="'video'" :dialog-title="'视频群呼'" :dialog-visible="dialogVisibleVideoGroup" @closeVisible="dialogVisibleVideoGroup = false" @sureClick="sureClickHandleVideoGroup" />
    <!-- 圈选视频呼叫 -->
    <videoGroupCallVue v-if="quanxuanDialog" :video-dev="videoDev" @changeDialog="quanxuanDialog=false" />
    <!-- 警情、预警 -->
    <Yujing
      v-if="showJq"
      ref="yujing"
      :b-map="BMap"
      :is-jing-show="isJingQingSpread"
      :viewer="viewer"
      :is-biao-show="isBiaoHuiSpread"
      :is-spread="!isJingQingSpread"
      :map="map"
      :dialog-table-visible.sync="dialogTableVisible"
      @close="closeJing"
    />
    <!-- 标绘列表 -->
    <PlottingList v-if="showPlotting" ref="plottingList" :is-jing-show="isJingQingSpread" :is-biao-show="isBiaoHuiSpread" :is-spread="!isBiaoHuiSpread" :b-map="BMap" :map="map" :viewer="viewer" @close="closeBiao" />
    <div v-show="(isJingQingSpread&&dataLayerList[0].isActive)||(isBiaoHuiSpread&&dataLayerList[1].isActive)" class="tab-menu">
      <div v-if="isJingQingSpread&&dataLayerList[0].isActive" class="tabTitle" @click="isJingQingSpread=!isJingQingSpread">
        <span>{{ tabTitle }}</span>
        <img :src="rightIn" alt="">
      </div>
      <div v-if="isBiaoHuiSpread&&dataLayerList[1].isActive" class="tabTitle" @click="isBiaoHuiSpread = !isBiaoHuiSpread">
        <span>标绘</span>
        <img :src="rightIn" alt="">
      </div>
    </div>
  </div>
</template>
<script>
import videoImg from '@/assets/images/equipment/video.png'
import { api } from '@/api/env'
import { sessionStorage } from '@/utils/storage'
import { parseTime, queryPath } from '@/utils/index'
import sip from '@/components/mixins/sip.js'
import fullScreen from '@/components/mixins/fullScreen.js'
// import jwt from '@/assets/images/jwt.png'
import jwt30 from '@/assets/images/jwt30.png'
import start from '@/assets/images/start.png'
import end from '@/assets/images/end.png'
import { Message } from 'element-ui'
import yujing from '@/assets/images/equipment/yujing.png'
import plotting from '@/assets/images/equipment/plotting.png'
import putong from '@/assets/images/equipment/putong.png'
import weixing from '@/assets/images/equipment/weixing.png'
import model from '@/assets/images/equipment/model.png'
import { mapGetters } from 'vuex'
import circular from '@/assets/images/equipment/circular.png'
import rect from '@/assets/images/equipment/rect.png'
import hex from '@/assets/images/equipment/hex.png'
import { get, throttle } from 'lodash'
import Yujing from './yujing'
import PlottingList from './plottingList'
import VideoMeet from '@/components/videoMeet'
import MarkerClusterer from 'bmaplib.markerclusterer'
import { queryId, combineIconAndLabel } from '@/utils'
import CreateDialog from '@/components/createDialog'
import rightIn from '@/assets/images/rightIn.png'
import videoGroupCallVue from './videoGroupCall.vue'
import defaultPng from '@/assets/images/equipment/default.png'
import { validatePhoneBol } from '@/utils/validate'
import { cloneDeep } from 'lodash'
import wcl from '@/assets/images/equipment/wcl.png'
export default {
  name: 'Equipment',
  components: {
    Yujing, PlottingList, VideoMeet, CreateDialog, videoGroupCallVue
  },
  mixins: [sip, fullScreen],
  props: {
    bMap: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    map: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    viewer: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    lnglat: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      model,
      tilesetModel: null,
      addModelFlag: false,
      isSpread: true,
      isJingQingSpread: false,
      isBiaoHuiSpread: false,
      rightIn,
      tabTitle: '警情',
      dialogVisibleVideoGroup: false,
      dialogVisibleVideo: false,
      divWidth: 900,
      divHeight: 500,
      divLeft: 300,
      divTop: 150,
      // isFullScreen: false,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      TONE_voip: sessionStorage.get('TONE_voip'),
      equipment: [
        { icon: 'tongxin', id: 'txtc', text: Number(sessionStorage.get('TONE_ConfigUserInfo').GLOBAL_FUNCTION_CONFIG) === 0 ? queryPath('txtc', sessionStorage.get('moduleInfo'))?.NAME : '通信图层' },
        { icon: 'zhoubian', text: '数据图层' },
        { icon: 'zhihui', text: '快速调度' },
        { icon: 'qiehuan', text: '地图切换' },
        { icon: 'tuceng', text: '一键清除' }
      ],
      oneLevelActive: '',
      ckDev: false,
      typeList: [],
      iconServer: api,
      interObj: {}, // 定时器对象,用于管理动态点位定时器
      devInfo: '', // 设备详情
      drawer: false,
      dialogTableVisible: false,
      videoImg: videoImg,
      guijiDialog: false,
      singleDev: {},
      day: parseTime(new Date(), '{y}-{m}-{d}'),
      time1: '00:00:00',
      time2: '23:59:59',
      diaodu: false,
      diaoduList: [
        { icon: circular, text: '圈选' },
        { icon: rect, text: '框选' },
        { icon: hex, text: '多边形' }
      ],
      dataLayer: false,
      dataLayerList: [
        { icon: yujing, text: '警情', isActive: false, id: 'jingqing' },
        { icon: plotting, text: Number(sessionStorage.get('TONE_ConfigUserInfo').GLOBAL_FUNCTION_CONFIG) === 0 ? queryPath('bhlb', sessionStorage.get('moduleInfo'))?.NAME : '标绘', isActive: false, id: 'bhlb' }
      ],
      dituDev: false,
      dituList: [
        { icon: putong, text: '普通地图', mapType: 'BMAP_NORMAL_MAP' },
        { icon: weixing, text: '卫星地图', mapType: 'BMAP_HYBRID_MAP' },
        { icon: weixing, text: '二三维联动', mapType: 'TwoThreeLink' },
      ],
      diaoduActive: '',
      myDrawingManager: null,
      myOverlay: null,
      devNumber: 0,
      audioNumber: 0,
      videoDev: [],
      videoNumber: 0,
      dialogVisible: false,
      dialogTitle: '', // 弹框标题
      dialogType: '',
      quanxuanDialog: false,
      aaalist: [
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        }
      ],
      cloneAList: [
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        },
        {
          isQuanXuanVideo: true,
          session: {},
          sessionId: '',
          type: 'video'
        }
      ],
      tempCall: [],
      showJq: false,
      showPlotting: false,
      videoMeetDialog: false,
      markerClusterer: null,
      DevData: null,
      AppDataTimer: null,
      defaultPng, jwt30, wcl,
      chooseEntities: [],
      dituTypeList:[
        {text:'三维',mapType:"ThreeScene"},
        {text:'二维',mapType:"TwoScene"},
      ]
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    ...mapGetters([
      'sceneType',
      'mapType',
      'settings',
      'devlist',
      'addMeetingMemberList',
      'checkResourcelist',
      'mqResponseData',
      'isPolling',
      'userUnitIdAuth',
      'userListInfo',
      'mapCallListStates'
    ]),
    createMeetingName: {
      get() {
        return this.$store.getters.createMeetingName
      },
      set(val) {
        this.$store.commit('audioMeet/SET_createMeetingName', val)
      }
    },
    dev_type() {
      let res = ''
      if (this.devInfo && this.devInfo.dev_type) {
        res = this.typeList.find(obj => obj.id === this.devInfo.dev_type)// 设备类型
      }
      if (this.devInfo && this.devInfo.login_pc === '0') {
        res = this.typeList.find(obj => obj.is_app)// APP
      }
      return res
    },
    handler() {
      return new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    }
  },
  watch: {
    userUnitIdAuth: {
      handler(val, oldVal) {
        if (val && val.length > 0) {
          // 等获取到单位权限 加载各种资源
          this.loadShow()
        }
      },
      immediate: true
    },
    lnglat: {
      handler: function(val) {
        this.typeList.map(v => {
          if (v.isActive && v.is_dyna === 'false') {
            this.getDevPoint(v, true)
          }
        })
      },
      deep: false
    },
    mqResponseData: {
      handler(val) {
        const res = JSON.parse(val)
        // 往集合中添加警务通 / APP 点位信息
        try {
          if (res.MSG_KEY === 'POLICE_STATUS' || res.MSG_KEY === 'DEV_ONLINE_STATUS') {
            const devInfoId = String(this.devInfo.id)
            // 若弹窗打开dialogTableVisible为true  devInfoId必有值
            if (this.dialogTableVisible && ([res.POLICE_ID, res.GPSID].includes(devInfoId))) {
              this.$set(this.devInfo, 'yonghuzxbj', Number(res.STATUS))
            }
            this.typeList.forEach(item => {
            // typeList为后台接口获取到的设备列表 mq返回的图层上图信息中的type字段应与设备列表中的设备的id对应
              if (item.is_dyna + '' === 'true') {
                if (item.AppData && item.AppData.get(String(res.POLICE_ID))) {
                  const obj = item.AppData.get(String(res.POLICE_ID))
                  obj ? obj.yonghuzxbj = Number(res.STATUS) : ''
                  item.AppData.set(String(res.POLICE_ID), obj)
                  if (item.isActive&& Number(res.STATUS)) this.getAppLocaltion(item, obj)
                }
              }
            })
          }
          if (res && res.MSG_KEY === 'REPORT_LOCATION') {
            // console.log('定位信息=>>', res)
            this.typeList.forEach(item => {
              // typeList为后台接口获取到的设备列表 mq返回的图层上图信息中的type字段应与设备列表中的设备的id对应 is_dyna是否为动态设备
              if (item.id === res.TYPE && item.is_dyna + '' === 'true') {
                const oldVal = item.AppData.get(String(res.yonghuid))// 旧的点位数据
                const isChange = (oldVal && oldVal.Latitude === res.Latitude && oldVal.Longitude === res.Longitude)// 定位坐标不变  不必重新上图渲染
                const isZx = (oldVal && 'yonghuzxbj' in oldVal) ? oldVal.yonghuzxbj : true // 设备在线状态  离线不上图
                if (oldVal) {
                  res.Time = oldVal.Time// 位置上报时间
                }
                item.AppData.set(String(res.yonghuid), res)
                if (!isChange && isZx) { // 在线 且 经纬度发生变化 重新渲染点位
                  if (item.isActive) this.getAppLocaltion(item, res)
                }
              }
            })
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  },
  created() {
    this.loadShow()
  },
  activated() {
  },
  mounted() {
    const viewer = this.viewer
    const _this = this
    if(this.mapType==='BMAP_HYBRID_MAP'){//页面刷新加载卫星地图
      this.addWeixing()
    }
    const handler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    // 实体点击事件监听
    handler.setInputAction(function(movement) {
      const pickedLabel = viewer.scene.pick(movement.position)
      if (Cesium.defined(pickedLabel)) {
        const ids = pickedLabel.id
        // console.log(ids)
        if (Array.isArray(ids)) {
          if (ids[0].layerType === 'txtc') { // 数据图层
            _this.$store.commit('app/SET_devlist', [])
            ids.forEach((mItem) => {
              _this.$store.commit('app/SET_devlist_push', mItem.overlayInfo)
            })
            _this.$root.$emit('isShowPanel')
          }
        } else {
          if (ids.layerType === 'txtc') {
            _this.getDevInfo(ids.overlayInfo, ids.item, true,ids)
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.initGetDevPoint()
    // viewer.camera.moveEnd.addEventListener(function() {
    //   _this.initGetDevPoint()
    // })
    // window.addEventListener('resize', this.eventHandler)
    // 仅供map>subComponents>left组件使用
    this.$root.$on('getDevInfo', (data, item) => {
      this.getDevInfo(data, item, true)
    })
    this.$root.$on('videoCall', () => {
      if (this.isPolling) {
        this.$message.closeAll()
        this.$message.warning('正在进行视频轮询，无法进行其他音视频通信!')
        return // 视频轮询期间不能进行任何通话
      }
      if (this.quanxuanDialog) {
        this.$message.closeAll()
        this.$message.warning('已有视频群呼窗口，请勿重复进行操作!')
        return // 视频轮询期间不能进行任何通话
      }
      this.filterUserDev('videoCall')
      this.dialogVisibleVideoGroup = true
    })
    this.$root.$on('audioMeet', (e) => {
      if (this.isPolling) {
        this.$message.closeAll()
        this.$message.warning('正在进行视频轮询，无法进行其他音视频通信!')
        return // 视频轮询期间不能进行任何通话
      }
      this.audioMeet(e)
    })
    this.$root.$on('videoMeetHandle', (e) => {
      if (this.isPolling) {
        this.$message.closeAll()
        this.$message.warning('正在进行视频轮询，无法进行其他音视频通信!')
        return // 视频轮询期间不能进行任何通话
      }
      this.videoMeetHandle(e)
    })
    // 左侧通信资源过来的信息
    this.$root.$on('getTreeDevInfo', (e) => {
      this.getTreeDevInfo(e)
    })
    this.AppDataTimer = setInterval(_ => {
      this.typeList.forEach((item) => {
        if (item.is_dyna === 'true' && item.AppData && String(item.GPS_STFS) !== '1' && item.dataSource) { // 动态设备并且 无在线状态 按照两分钟清除一次定位
          item.dataSource.entities.removeAll()
          item.dataSource = null
          item.AppData.clear()
        }
      })
      // 每隔两分钟清空一次
    }, 120000)
    //  模拟推送 动态设备
    // setTimeout(() => {
    //   const mq = { 'yonghuid': 'CCDBA7539A2C', 'GPSID': 'CCDBA7539A2C', 'yonghuname': '位置上报', 'ParentIds': ',0,1000,100001,10000102,', 'PRODUCT': 'MYSELF', 'MSG_KEY': 'REPORT_LOCATION', 'Latitude': 39.984098, 'Time': '2023-10-17 10:47:50.0', 'UnitName': '位置上报', 'Longitude': 116.307267, 'TYPE': '105' }
    //   this.$store.commit('mq/SET_MqResponseData', JSON.stringify(mq))
    // }, 5000)

    // 加载模型
    // var position = Cesium.Cartesian3.fromDegrees(
    //   116.46291004579683,
    //   39.92356816125316,
    //   1000
    // );
    // var entity = viewer.entities.add({
    //   name: "glb model",
    //   position: position,
    //   model: {
    //     uri: "/model/hong_kong_city_landside_fbx.glb",
    //     scale: 10000,
    //   },
    // });
    // viewer.trackedEntity = entity;
  },
  beforeDestroy() {
    this.$root.$off('videoMeetHandle')
    this.$root.$off('videoCall')
    this.$root.$off('audioMeet')
    this.$root.$off('getDevInfo')
    this.$root.$off('getTreeDevInfo')
    // window.removeEventListener('resize', this.eventHandler)
    Object.keys(this.interObj).forEach((item) => {
      window.clearInterval(this.interObj[item])
    })
    this.interObj = {}
    clearInterval(this.AppDataTimer)
  },
  deactivated() {
    if (this.showPlotting) {
      // 手动写入会改变引用类型地址
      this.dataLayerClick(this.dataLayerList[1])
    }
  },
  methods: {
    addModel() {
      this.addModelFlag = !this.addModelFlag
      const viewer = this.viewer
      if(this.addModelFlag) {
        var tileset = new Cesium.Cesium3DTileset({
          url: "http://47.96.108.250:9001/models/xuchang/tileset.json",
        });
        viewer.scene.primitives.add(tileset);
        Promise.resolve(tileset.readyPromise)
        .then((tileset) => {
          // 检查 tileset 是否有效
          if (!tileset) {
            console.error("加载 tileset 失败，tileset 为 undefined");
            return;
          } // 检查 tileset.boundingSphere 是否有效
          if (!tileset.boundingSphere) {
            console.error("tileset.boundingSphere 未定义或无效");
            return;
          }
          var longitude = 116.401969 //模型需要改变的经度
          var latitude = 39.91405 //模型需要改变的纬度
          var heightOffset = 0.0; //模型需要改变的高度

          //获取3Dtlies的bounds范围
          var boundingSphere = tileset.boundingSphere;
          //获取3Dtlies的范围中心点的弧度
          var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
          //定义3Dtlies改变之后中心点的弧度
          var offsetvalue = Cesium.Cartographic.fromDegrees(longitude, latitude, heightOffset)

          //模型本身的位置
          var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
          //模型改变的位置
          var offset = Cesium.Cartesian3.fromRadians(offsetvalue.longitude, offsetvalue.latitude, heightOffset);

          //定义模型的改变状态
          var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
          //修改模型的位置
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
          // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius *
          //   1.0));
          viewer.zoomTo(tileset);
        })
        .catch((error) => {
          console.error("加载 tileset 时出错:", error);
        });
        this.tilesetModel = tileset
      } else {
        console.log(this.tilesetModel, 'tileset')
        viewer.scene.primitives.remove(this.tilesetModel);
        this.tilesetModel = null
      }
    },
    sceneTypeChange(mapType){
      this.$store.commit('app/SET_SCENE_TYPE',mapType)
      this.viewer.scene.mode = mapType==='ThreeScene'?Cesium.SceneMode.SCENE3D:Cesium.SceneMode.SCENE2D;
      // if( mapType==='ThreeScene'){
         this.$root.$emit('rollback')
      // }
    },
    getZoomLevel(cameraHeight) {
      // 根据相机高度推断缩放层级，参考百度地图的2D地图缩放等级 GPT
      // 百度地图的缩放等级与相机高度的对应关系
      const zoomLevels = [
        75000000, 30000000, 15000000, 7500000, 3000000, 1500000,
        750000, 375000, 300000, 150000, 75000, 30000, 15000,
        7500, 3000, 1500, 750, 300
      ]

      for (let i = 0; i < zoomLevels.length; i++) {
        if (cameraHeight >= zoomLevels[i]) {
          return i + 1
        }
      }

      return zoomLevels.length + 1
    },
    // 首次渲染加载设备点位
    initGetDevPoint:throttle(function() {
      const viewer = this.viewer
      const _this = this
      const extend = viewer.camera.computeViewRectangle()
      const params = {}

      // 获取视角范围的经纬度
      if (typeof extend === 'undefined') {
        const coordToLonlat = (viewer, x, y) => {
          const { camera, scene } = viewer
          const d2 = new Cesium.Cartesian2(x, y)
          const ellipsoid = scene.globe.ellipsoid
          // 2D转3D世界坐标
          const d3 = camera.pickEllipsoid(d2, ellipsoid)
          // 3D世界坐标转弧度
          const cartographic = scene.globe.ellipsoid.cartesianToCartographic(d3)
          // 弧度转经纬度
          const lon = Cesium.Math.toDegrees(cartographic.longitude)
          const lat = Cesium.Math.toDegrees(cartographic.latitude)
          return { lon, lat }
        }

        const canvas = viewer.scene.canvas
        const upperLeftLonLat = coordToLonlat(viewer, 0, 0)
        const lowerRightLonLat = coordToLonlat(viewer, canvas.clientWidth, canvas.clientHeight)
        params.xmin = upperLeftLonLat.lon
        params.xmax = lowerRightLonLat.lon
        params.ymin = upperLeftLonLat.lat
        params.ymax = lowerRightLonLat.lat
      } else {
        // 三维视图
        params.xmax = Cesium.Math.toDegrees(extend.east)
        params.ymax = Cesium.Math.toDegrees(extend.north)
        params.xmin = Cesium.Math.toDegrees(extend.west)
        params.ymin = Cesium.Math.toDegrees(extend.south)
      }

      // 获取缩放层级
      const zoomLevel = _this.getZoomLevel(viewer.camera.positionCartographic.height)
      // console.log(`${params.xmin},${params.ymin},${params.xmax},${params.ymax}`)
      console.log('Zoom Level:', zoomLevel)
      _this.MAX_LNG = params.xmax
      _this.MAX_LAT = params.ymax
      _this.MIN_LNG = params.xmin
      _this.MIN_LAT = params.ymin
      _this.zoomNum = zoomLevel
      _this.typeList.forEach(v => {
        if (v.isActive && v.is_dyna === 'false') {
          _this.getDevPoint(v, true)
        }
      })
    },1000),
    // 添加实体
    addEntities(dataSource, Cesium, item, url, layerType, typeItem) {
      dataSource.entities.add({
        id: item.GPSID || item.yonghuid || item.id,
        position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
        billboard: {
          image: url,
          width: 30, // 如果不设置宽高 初始化无法正常显示聚合数量
          height: 30,
            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //相对于对象的原点（注意是原点的位置）的水平位置
          disableDepthTestDistance: Number.POSITIVE_INFINITY,//防地形遮挡
        },
        overlayInfo: item,
        dev_type: item.dev_type,
        layerType: layerType,
        item: typeItem
      })
    },
    // 开启聚合
    openPoly(dataSource, Cesium, icon) {
      dataSource.clustering.enabled = true// 开启聚合
      dataSource.clustering.pixelRange = 20// 聚合范围
      dataSource.clustering.minimumClusterSize = 2// 最小聚合数量
      dataSource.clustering.clusterEvent.addEventListener(
        function(clusteredEntities, cluster) {
          // 关闭自带的显示聚合数量的标签
          cluster.label.show = false
          cluster.billboard.id = cluster.label.id// 必须给实体广告牌ID否则聚合点击事件无法捕获聚合实体
          cluster.billboard.show = true
          cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
          // cluster.billboard.heightReference=Cesium.HeightReference.CLAMP_TO_GROUND,//位置相对于地形 防止实体随着相机视角漂移
          cluster.billboard.disableDepthTestDistance= Number.POSITIVE_INFINITY,
          cluster.billboard.image = combineIconAndLabel(icon, clusteredEntities.length, 64, Cesium)// 动态自定义label聚合右上角数量 和图标样式
        }
      )
    },
    getName(to) {
      return this.userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || to
    },
    videoGroupCall(item) {
      this.makeCall({ callNumber: item.id || item.userId, audioOrVideo: 'video', isQuanXuanVideo: false })
    },
    closeBiao(v) {
      this.isBiaoHuiSpread = !this.isBiaoHuiSpread
    },
    closeJing(v) {
      this.isJingQingSpread = !this.isJingQingSpread
    },
    // eventHandler() {
    //   this.isFullScreen = this.checkFull()
    // },
    sureClickHandleVideoGroup() {
      if (this.addMeetingMemberList.length === 0) {
        this.$message.warning('请选择成员!')
        return
      }
      this.dialogVisibleVideoGroup = false
      this.videoCall()
    },
    sureClickHandleVideo() {
      this.filterUserDev(true)// 初始化勾选成员后  在邀请弹窗新添加人确认邀请时再过滤一遍
      this.dialogVisibleVideo = false
      this.$nextTick(_ => {
        this.videoMeetDialog = true
      })
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
    },
    loadShow() {
      const _this = this
      this.$nextTick(_ => {
        const txtc = queryId('txtc', _this.settings.FEATURE_SETTING)
        const txtc2 = queryPath('txtc', sessionStorage.get('moduleInfo'))?.DISPLAY
        if (txtc && txtc.isOpen && txtc.show && txtc2) {
          _this.getDevTypeList()
        }
        const jq = queryId('jingqing', _this.settings.FEATURE_SETTING)
        if (jq && jq.isOpen && jq.isSpread && jq.show) {
          _this.showJq = false // 地图重新加载 警情点位消失问题
          _this.showJq = true
          _this.dataLayerList[0].isActive = true
        // 打开警情面板 修改按钮状态
        }
        _this.$set(_this.dataLayerList[0], 'text', Number(sessionStorage.get('TONE_ConfigUserInfo').GLOBAL_FUNCTION_CONFIG) === 0 ? queryPath('jingqing', sessionStorage.get('moduleInfo'))?.NAME : jq.text || '警情')
        _this.tabTitle = jq.text
        if (!jq.isOpen || !jq.show) {
          _this.showJq = false
        }
        const res2 = queryPath('jingqing', sessionStorage.get('moduleInfo'))
        if (res2 && !res2.DISPLAY) {
          _this.showJq = false
        }
        const bhlb = queryId('bhlb', _this.settings.FEATURE_SETTING)
        if (bhlb && bhlb.isOpen && bhlb.isSpread && bhlb.show) {
          _this.showPlotting = true
          _this.dataLayerList[1].isActive = true
        }
        if (_this.showJq) {
          _this.$nextTick(_ => {
            _this.$refs.yujing.loadJq()
          })
        }
      })
    },
    isShow(id) {
      const res = queryId(id, this.settings.FEATURE_SETTING)
      const res2 = queryPath(id, sessionStorage.get('moduleInfo'))?.DISPLAY
      return res.isOpen && res.show && res2
    },
    oneLevelClick(v, i) {
      // 点击状态
      this.oneLevelActive !== (v.id === 'txtc' ? 'txtc' : v.text) ? this.oneLevelActive = v.id === 'txtc' ? 'txtc' : v.text : this.oneLevelActive = ''
      // 点击不同的一级设备调用不同的接口
      if (this.oneLevelActive === 'txtc') {
        this.ckDev = true
        if (this.typeList.length === 0) {
          // this.getDevTypeList()
          // ycl 修改默认初始化进来即请求数据
        }
      } else {
        this.ckDev = false
      }
      if (this.oneLevelActive === '数据图层') {
        // this.quanxuanDialog = true
      }
      this.dataLayer = this.oneLevelActive === '数据图层'
      this.diaodu = this.oneLevelActive === '快速调度'
      this.dituDev = this.oneLevelActive === '地图切换'
      if (this.oneLevelActive === '一键清除') {
        // 移除存在的appMaker
        // 将已选资源都清空
        // if (this.$refs.yujing) {
        //   this.$refs.yujing.devList = []
        // }
        this.$store.commit('app/SET_devlist', [])
        this.$store.commit('app/SET_checkResourceList', [])

        // const allOverlay = this.map.getOverlays()
        // 移除非地图标会图层
        this.typeList.forEach((item) => {
          if (item.dataSource && item.dataSource.entities) {
            item.dataSource.entities.removeAll()
            item.dataSource = null
          }
          if (item.is_dyna === 'false') {
            item.DevData = null
          }
        })
        //guiji
        if(this.guijiDataSource){
          this.viewer.dataSources.remove(this.guijiDataSource)
        }
        // for (let j = 0; j < allOverlay.length; j++) {
        //   if (!allOverlay[j].name) {
        //     this.map.removeOverlay(allOverlay[j])
        //     this.map.clearOverlays()
        //     // 清除所有图层
        //   }
        // }
        // 地图标绘图层隐藏、复选框不勾选
        this.showPlotting ? this.$refs.plottingList.$refs.tree.setCheckedKeys([]) : ''
        this.showPlotting ? this.$refs.plottingList.check(null, { checkedNodes: [] }) : ''
        // 移除通信图层设备激活状态
        for (let k = 0; k < this.typeList.length; k++) {
          this.$set(this.typeList[k], 'isActive', false)
        }
        // 清除通信图层设备定时器
        for (const key in this.interObj) {
          window.clearInterval(this.interObj[key])
        }
        this.oneLevelActive = ''
      }
    },
    // 获取设备列表
    getDevTypeList() {
      this.$api.common.getDevTypeList().then(res => {
        var data = res.data.records.sort((a, b) => {
          return b.is_app - a.is_app
        })
        data.forEach(item => {
          if (item.is_dyna === 'true') {
            item.AppData = new Map()
          }
        })
        this.typeList = data
        const _this = this
        this.$nextTick(_ => {
          if (_this.settings) {
            const arr = queryId('txtc-csjz', _this.settings.FEATURE_SETTING)
            if (arr && arr.children.length > 0 && Array.isArray(arr.children)) {
              arr.children.forEach((item) => {
                const index = _this.typeList.findIndex((obj) => obj.name === item.NAME)
                if (item.checked && index >= 0) {
                  _this.$set(_this.typeList[index], 'isActive', false)
                  _this.liClickHandle(_this.typeList[index], index)
                  // 初始化通讯图层 是否加载
                } else if (!item.checked && index >= 0) {
                  _this.$set(_this.typeList[index], 'isActive', true)
                  _this.liClickHandle(_this.typeList[index], index)
                }
              })
            }
          }
        })
      })
    },
    // 设备类型点击
    liClickHandle(item, index) {
      this.$set(this.typeList[index], 'isActive', !item.isActive)
      var active = item.isActive
      // var type = item.id
      // var icon = item.ico_file
      if (item.is_dyna === 'false') {
        if (active) {
          this.getDevPoint(item, false)
        } else {
          if (item.dataSource) {
            item.dataSource.entities.removeAll()
            item.dataSource = null
          }
        }
      } else {
        if (active) {
          this.getAppLocaltion(item)
        } else {
          if (item.dataSource) {
            item.dataSource.entities.removeAll()
            item.dataSource = null
          }
        }
      }
    },
    // 获取设备点位
    async getDevPoint(item, flag) {
      // 若未获取到权限单位 则不去请求点位
      if (this.userUnitIdAuth && this.userUnitIdAuth.length === 0) return
      const _this = this
      var type = item.id
      var icon = item.ico_file
      var t = +new Date()
      const auth = this.userUnitIdAuth.map(v => {
        return v.UnitId
      }).join(',')
      // 设备带权限 访问
      const { MAX_LNG, MAX_LAT, MIN_LNG, MIN_LAT } = this
      const params = {
        TYPE: type,
        MAX_LNG,
        MAX_LAT,
        MIN_LNG,
        MIN_LAT,
        width: 10,
        height: 5,
        t: t,
        length: 200,
        Zoom: this.zoomNum - 1 > 1 ? this.zoomNum - 1 : 1,
        SELECT_TYPE: 1,
        UNIT_ID: auth,
        STATUS: 1// 不传查所有状态的设备 传1在线 0不在线
      }
      let res
      if (!item.blobIcon) {
        await _this.imageUrlToBlobUrl(_this.iconServer + icon).then((blobUrl) => {
          item.blobIcon = blobUrl
        })
      }
      if (!item.DevData || flag) {
        // 如果是放大缩小地图会重新请求接口 查找存在范围内的设备
        res = await this.$api.common.getDevPoint(params)
        if (!res.data) {
          return false
        }
        var data = res.data
        item.DevData = data
        _this.pictureBelow(item, item.DevData, type, item.blobIcon)
      } else {
        _this.pictureBelow(item, item.DevData, type, item.blobIcon)
      }
    },
    // 静态设备点位上图
    pictureBelow(item, data, type, icon) {
      const viewer = this.viewer
      if (data && data.length > 0 && data.map) {
        if (item.dataSource) {
          item.dataSource.entities.removeAll()
          item.dataSource = null
        }
        item.dataSource = new Cesium.CustomDataSource(type)
        item.dataSource.devType = 'txtc'
        data.map(v => {
          if (v.list) {
            v.list.forEach(obj => {
              obj.power = item.power
              obj.is_dyna = item.is_dyna
              this.addEntities(item.dataSource, Cesium, obj, icon, 'txtc', obj)
            })
          } else {
            v.power = item.power
            v.is_dyna = item.is_dyna
            this.addEntities(item.dataSource, Cesium, v, icon, 'txtc', v)
          }
        })
        this.openPoly(item.dataSource, Cesium, icon)// 开启聚合
        viewer.dataSources.add(item.dataSource)
      }
    },
    async  imageUrlToBlobUrl(imageUrl) {
      const response = await fetch(imageUrl)
      const clonedResponse = response.clone() // 克隆响应对象
      const blob = await clonedResponse.blob()
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    },
    // app/警务通 设备上图
    async getAppLocaltion(item, mapInfo) {
      const _this = this
      var type = item.id
      var icon = item.ico_file
      const data = item.AppData
      const viewer = this.viewer
      if (data.size === 0) return
      if (!item.blobIcon) {
        await _this.imageUrlToBlobUrl(_this.iconServer + icon).then((blobUrl) => {
          item.blobIcon = blobUrl
        })
      }
      const blobIcon = item.blobIcon
      // 生成点位函数
      const comLayer = function(mapInfo) {
        // 动态设备下线 就不上图
        mapInfo.power = item.power
        mapInfo.is_dyna = item.is_dyna
        mapInfo.name = mapInfo.yonghuname
        mapInfo.id = mapInfo.yonghuid
        mapInfo.longitude = mapInfo.Longitude
        mapInfo.latitude = mapInfo.Latitude
        mapInfo.layerType = type
      }
      // 图层存在后  再往里面追加或者更新点位信息  或者动态设备下线 清除点位信息
      if (item.dataSource && mapInfo) {
        comLayer(mapInfo)
        const findEntities = item.dataSource.entities.getById(mapInfo.yonghuid)
        if (!findEntities) { // 不存在图层 则新增上图   否则更新点位信息即可
          this.addEntities(item.dataSource, Cesium, mapInfo, blobIcon, 'txtc', item)
        } else {
          if (!findEntities) return
          if ('yonghuzxbj' in findEntities.overlayInfo && !findEntities.overlayInfo.yonghuzxbj) {
            // 设备离线的情况下
            item.dataSource.entities.remove(findEntities.yonghuid)
          } else {
            // 经纬度有变化 则更新标记对象的位置
            if (findEntities.overlayInfo.Longitude !== mapInfo.Longitude || findEntities.overlayInfo.Latitude !== mapInfo.Latitude) {
              const newPosition = Cesium.Cartesian3.fromDegrees(mapInfo.Longitude, mapInfo.Latitude)
              findEntities.position = newPosition
              findEntities.overlayInfo.Longitude = mapInfo.Longitude
              findEntities.overlayInfo.Latitude = mapInfo.Latitude
            }
          }
        }
      } else {
        item.dataSource = new Cesium.CustomDataSource(type)
        data.forEach((v) => {
          comLayer(v)
          this.addEntities(item.dataSource, Cesium, v, blobIcon, 'txtc', item)
        })
        this.openPoly(item.dataSource, Cesium, blobIcon)// 开启聚合
        viewer.dataSources.add(item.dataSource)
      }
      // 前端做警务通的聚合代码
    },
    // 地图上点击 获取点击的点位详情
    async getDevInfo(value, item, flag, entity) {
      const data = cloneDeep(value)
      data.is_dyna = value.is_dyna || item?.is_dyna
      data.power = value.power || item?.power
      data.id = value.id || value.UserID || value.yonghuid||value?.data?.id
      data.name = value.name || value.UserName || value.UnitName||value?.data?.name
      // eslint-disable-next-line eqeqeq
      const find = this.userListInfo.find(item => flag ? (item.yonghuid == data.id || item.id == data.id) : item.yonghuid == data.yonghuid)// 区分已选资源和图上点击
      if (find) { // 手机号
        data.mobile = find.mobile
        const obj = {
          '2': '移动用户',
          '8': 'IP话机',
          '9': '28181终端'
        }
        data.terminallx = obj[find.terminallx]// 用户类型
        data.yhssbm = find.yhssbm// 部门
        data.yhzw = find.yhzw// 职务
        data.yhtx = find.yhtx// 头像
        data.wkid = find.wkid// 工号
      }
      if (value.is_dyna === 'true'||value.selectFlag) { // 动态设备 在线状态
        const device = this.typeList.find(item => item.id === value.dev_type || item.id === value.TYPE)
        if (device&&device.dataSource) {
          const overLay = device.dataSource.entities.getById(value.id)
          if (overLay) {
            entity=overLay
            data.yonghuzxbj = 1
          }
        } else {
          data.yonghuzxbj = 0
        }
        data.dev_type = value.dev_type || value.TYPE
      } else if (value.dev_type) {
        data.yonghuzxbj = 1// 静态设备上图 必定是在线状态
      }
      // console.log('点位详情1:', value)
      data.UnitName = value.uName || value.unitName || value.UnitName||value?.data?.UnitName// 所属单位
      if (find?.login_pc && find?.login_pc !== '1') { // 请求接口获取用户 历史上图信息
        const formData = new FormData()
        formData.append('data', `{"id":${data.id} ,"type":${find?.login_pc === '0' ? 'app' : 'extUser'}}`)
        const res = await this.$api.common.loadYongHuLastGps(formData)
        // const res = await this.$api.common.loadYongHuLastGps({ id: '70001003', type: 'app' })
        if (Object.keys(res?.data).length > 0) {
          data.longitude = res.data.Longitude
          data.latitude = res.data.Latitude
          data.Time = res.data.Time
          data.lxsj = res.data.lxsj
        }
      }
      this.devInfo = data
      // 是否为已选资源的单击
      !data.selectFlag ? this.$store.commit('app/SET_devlist', [data]) : ''
      // 先关闭子组件警情的详情弹层
      if (this.showJq) {
        this.$refs.yujing ? this.$refs.yujing.closeToneDialog() : ''
        this.$refs.yujing ? this.$refs.yujing.closePjDialog() : ''
        this.$refs.yujing ? this.$refs.yujing.closeRecordDialog() : ''
      }
      this.dialogTableVisible = true
      let height =0
      this.$nextTick(() => {
       height= this.convertHalfSize(getComputedStyle(this.$refs.detail).height)
        // 避免图层丢失
        if (flag) { // 从右侧已选资源跳转过来
          // 目前地图设置的最大缩放级别是18
         data.yonghuzxbj && entity && this.viewer.zoomTo(entity,{
              heading: 0.018,
              pitch: -0.7,
              range: 5000
            }
          )

        }
        if (this.$refs.devInfo) {
          if (this.$refs.devInfo?.children.length === 0) {
            this.$refs.devInfo.style.display = 'none'
          } else {
            this.$refs.devInfo.style.display = 'block'
          }
        }
        // this.$refs.detail ? this.$refs.detail.style.top = `calc(50% - ${height})` : ''// 保证弹窗剧中
        // this.$refs.detail ? this.$refs.detail.style.left = 'calc(50% + 25px)' : ''
        // console.log(this.viewer.canvas.clientWidth / 2,this.viewer.canvas.clientHeight / 2)  //画布的宽高
        this.$refs.detail ? this.$refs.detail.style.top = `${this.viewer.canvas.clientHeight / 2 - height.replace('px','')}px` : ''// 保证弹窗剧中
        this.$refs.detail ? this.$refs.detail.style.left = `${this.viewer.canvas.clientWidth / 2 + 25}px` : ''
      })
    },
    // 右侧组织架构树点击 获取点击的点位详情
    async getTreeDevInfo(value) {
      const data = cloneDeep(value)
      if (!value.leaf) {
        // 说明点击的是单位 啥操作都不进行
        return
      }
      data.id = value.id || value.UserID || value.ID || value.yonghuid
      data.name = value.name || value.UserName || value.yonghuname || value.UnitName
      data.wkid = value.wkid// 工号
      const obj = {
        '2': '移动用户',
        '8': 'IP话机',
        '9': '28181终端'
      }
      data.terminallx = obj[value.terminallx]// 用户类型
      data.yhssbm = value.yhssbm// 部门
      data.yhzw = value.yhzw// 职务
      data.yhtx = value.yhtx// 头像
      data.wkid = value.wkid// 工号
      let res = data
      const isNull = () => {
        data.longitude = null
        data.latitude = null
      }
      const setPoint = (res) => {
        data.longitude = res.longitude || res.Longitude || res.lng
        data.latitude = res.latitude || res.Latitude || res.lat
        data.is_dyna = res.is_dyna
        data.dev_type = res.TYPE
        data.Time = res.Time// 位置上报时间
      }
      if (data?.login_pc && data?.login_pc !== '1') { // 请求接口获取用户 历史上图信息
        const formData = new FormData()
        formData.append('data', `{id:${data.id} ,type:${data?.login_pc === '0' ? 'app' : 'extUser'}}`)
        const res = await this.$api.common.loadYongHuLastGps(formData)
        console.log(res)
        if (Object.keys(res?.data).length > 0) {
          data.longitude = res.data.Longitude
          data.latitude = res.data.Latitude
          data.Time = res.data.Time
          data.lxsj = res.data.lxsj
        }
      }
      if ('devId' in value) {
        // 点击的是外部设备
        data.longitude = data.lng
        data.latitude = data.lat
        const findDev = this.typeList.find(item => item.id === value.dev_type)
        data.is_dyna = findDev?.is_dyna
        if(findDev.dataSource){
            const overLay = findDev.dataSource.entities.getById(data.id)
            if(overLay)data.entity=overLay
        }
        // eslint-disable-next-line eqeqeq
        if (data.is_dyna == 'true') { // 外部动态设备
          const devMapInfo = findDev.AppData.get(data.id)
          if (devMapInfo) {
            setPoint(devMapInfo)
          }
        }
      } else if (value.login_pc === '0') {
        // 点击的是APP
        data.is_dyna = 'true'
        const device = this.typeList.find(item => item.is_app === 1)
        if (device && device.isActive && device.AppData && device.AppData.get((String(data.yonghuid)))) {
          res = device.AppData.get(String(data.yonghuid))

          if (device.dataSource) {
            const overLay = device.dataSource.entities.getById(res.yonghuid)
            console.log(overLay)
            if (overLay) {
              res.yonghuzxbj = 1
              data.entity=overLay
            }
          } else {
            res.yonghuzxbj = 0
          }
          setPoint(res)
        } else {
          isNull()
        }
      } else {
        isNull()
      }
      // console.log('点位详情2:', value)
      if (data.type === 'dev') {
        data.yonghuzxbj = value.status// 设备 在线状态
      } else if (value.is_dyna === 'true') { // 动态设备 在线状态
        'yonghuzxbj' in res ? data.yonghuzxbj = res.yonghuzxbj : data.yonghuzxbj = true
      } else if (value.dev_type) {
        data.yonghuzxbj = value.status
      }
      data.UnitName = value.uName || value.unitName || value.UnitName // 所属单位
      data.mobile = value.mobile ? value.mobile : validatePhoneBol(value.id) ? value.id : false// 手机号

      this.devInfo = data
      this.$forceUpdate()
      // 先关闭子组件警情的详情弹层
      if (this.showJq) {
        this.$refs.yujing ? this.$refs.yujing.closeToneDialog() : ''
        this.$refs.yujing ? this.$refs.yujing.closePjDialog() : ''
        this.$refs.yujing ? this.$refs.yujing.closeRecordDialog() : ''
      }
      this.dialogTableVisible = true
      this.$nextTick(() => {
        if (data.longitude && data.latitude && data.yonghuzxbj&&data.entity) {
        // 目前地图设置的最大缩放级别是18
          this.viewer.zoomTo(data.entity,{
              heading: 0.018,
              pitch: -0.7,
              range: 5000
            }
          )
          // this.viewer.camera.flyTo({
          //   destination: Cesium.Cartesian3.fromDegrees(data.longitude || data.Longitude, data.latitude || data.Longitude, 28500), // 目标位置的经纬度和高度
          //   duration: 1,
          //   easingFunction: Cesium.EasingFunction.linear,
          //   // orientation: {
          //   //   // 指向
          //   //   heading: 0.018,
          //   //   // 视角
          //   //   pitch: -0.7,
          //   //   roll: 6.28
          //   // }
          // })// 更精准的将镜头移到点位
        }
        if (this.$refs.devInfo) {
          if (this.$refs.devInfo?.children.length === 0) {
            this.$refs.devInfo.style.display = 'none'
          } else {
            this.$refs.devInfo.style.display = 'block'
          }
        }
        const height = this.convertHalfSize(getComputedStyle(this.$refs.detail).height)
        // this.$refs.detail ? this.$refs.detail.style.top = `calc(50% - ${height})` : ''// 保证弹窗剧中
        // this.$refs.detail ? this.$refs.detail.style.left = 'calc(50% + 25px)' : ''
          // console.log(this.viewer.canvas.clientWidth / 2,this.viewer.canvas.clientHeight / 2)  //画布的宽高
        this.$refs.detail ? this.$refs.detail.style.top = `${this.viewer.canvas.clientHeight / 2 - height.replace('px','')}px` : ''// 保证弹窗剧中
        this.$refs.detail ? this.$refs.detail.style.left = `${this.viewer.canvas.clientWidth / 2 + 25}px` : ''
      })
    },
    convertHalfSize(pxValue) {
      // 去除输入值的单位（假设输入值总是带有 'px' 单位）
      const numericValue = parseFloat(pxValue)
      // 将值减半并保留一位小数
      const halfValue = (numericValue / 2).toFixed(1)
      // 添加 'px' 单位并返回结果
      return halfValue.toString() + 'px'
    },
    // 关闭点位详情弹窗
    closeToneDialog() {
      this.dialogTableVisible = false
    },
    // 历史轨迹
    lishiguiji() {
      this.guijiDialog = true
    },
    // 强插
    qiangcha(devInfo, isQiangCha) {
      console.log(devInfo)
      const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
      // 强插
      this.$api.common.reqForceCall({
        token: TOKEN,
        POLICENO: POLICE_ID,
        callerUser: POLICE_ID,
        dialedUser: devInfo.id
      }).then(res => {
        console.log(res.data.result)
        if (isQiangCha) {
          if (res && res.data && res.data.result) {
            this.makeCall({ callNumber: devInfo.id || devInfo.UserID, audioOrVideo: 'audio' })
          }
        } else {
          this.$message.success(`强制拆线成功！`)
        }
      })
    },
    // 查询轨迹
    searchGuiji: throttle(function() {
      this.$api.common.loadGpsHistory({
        UserId: this.devInfo.id || this.devInfo.UserID,
        StartTime: `${this.day} ${this.time1}`,
        EndTime: `${this.day} ${this.time2}`
      }).then(res => {
        const data = res.data
        this.guijiDialog = false
        if(this.guijiDataSource){
          this.viewer.dataSources.remove(this.guijiDataSource);
        }
        if (data.length < 1) {
          Message({
            showClose: true,
            message: '该移动设备在此时间段无轨迹',
            duration: 3000
          })
          return false
        }
      this.guijiDataSource =new Cesium.CzmlDataSource('guiji');
      this.viewer.dataSources.add(this.guijiDataSource);
      let arr =[]
      data.forEach(i=>{
        arr.push(i.Longitude)
        arr.push(i.Latitude)
      })
      var positions = Cesium.Cartesian3.fromDegreesArray(arr);
       this.guijiDataSource.entities.add({
        polyline: {
          positions: positions,
          width: 5,
          material: Cesium.Color.fromCssColorString("#7b75fa"),
        },
      });
      var startPinBuilder = new Cesium.PinBuilder();
      var endPinBuilder = new Cesium.PinBuilder();
       this.guijiDataSource.entities.add({
        name: "起点",
        position: positions[0],
        billboard: {
          image: startPinBuilder
            .fromText("起", Cesium.Color.RED, 48)
            .toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });
      this.guijiDataSource.entities.add({
        name: "终点",
        position: positions[positions.length - 1],
        billboard: {
          image: endPinBuilder.fromText("终", Cesium.Color.RED, 48).toDataURL(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
      });

      this.viewer.zoomTo(this.guijiDataSource);
      })
    }, 500, { 'trailing': false }),
    // 数据图层
    dataLayerClick(item, k) {
      this.$set(item, 'isActive', !item.isActive)
      if (item.isActive && item.id === 'bhlb') {
        this.showPlotting = true
        this.isBiaoHuiSpread = false
        this.$nextTick(() => {
          this.$refs.plottingList.selectAll()
        })
      }
      if (!item.isActive && item.id === 'bhlb') {
        // 火警及地图标绘弹层消失
        this.showPlotting = false
        // 移除存在的appMaker
        // const allOverlay = this.map.getOverlays()
        // // 移除非地图标会图层
        // for (let j = 0; j < allOverlay.length; j++) {
        //   if (allOverlay[j].name) {
        //     allOverlay[j].hide()
        //   }
        // }
        // 关闭标绘列表，清楚地图上的标绘
      }
      if (item.isActive && item.id === 'jingqing') {
        this.showJq = true
        this.isJingQingSpread = false
      }
      if (!item.isActive && item.id === 'jingqing') {
        this.showJq = false
      }
    },
    removeInputAction() {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    },
    diaoduClick(item, k) {
      if (item.text === '圈选') {
        this.diaoduActive = '圈选'
        this.removeInputAction()
        this.drawCircle()
      }
      if (item.text === '框选') {
        this.diaoduActive = '框选'
        this.removeInputAction()
        this.polyRect()
      }
      if (item.text === '多边形') {
        this.diaoduActive = '多边形'
        this.removeInputAction()
        this.polygon()
      }
    },
    // 圈选
    drawCircle() {
      var center;
      var circle;
      var radius;
      var drawing = false;
      this.viewer._container.style.cursor = "crosshair";
      this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
      this.handler.setInputAction((click) => {
        var cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid); //鼠标按下记录中心点
        if (cartesian) {
          center = cartesian;
          drawing = true;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      //鼠标移动绘制圆形区域
      this.handler.setInputAction( (movement) => {
        if (!drawing) {
          return;
        }
        var cartesian = this.viewer.camera.pickEllipsoid(
          movement.endPosition,
          this.viewer.scene.globe.ellipsoid
        );
        if (cartesian) {
          if (!Cesium.defined(circle)) {
            circle = this.viewer.entities.add({
              id: 'cir',
              position: center,
              ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function () {
                  return radius;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(function () {
                  return radius;
                }, false),
                material: Cesium.Color.fromBytes(0, 85, 128, 100),
                outline: true,
                outlineColor: Cesium.Color.fromBytes(0, 85, 128, 300),
                height: 0
              }
            })
          }
          radius = Cesium.Cartesian3.distance(center, cartesian);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //鼠标抬起绘制结束
      this.handler.setInputAction(()=> {
        drawing = false;
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.viewer._container.style.cursor = "default";
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
        let entities = []
        this.typeList.forEach((item)=>{
          if(item.dataSource) {
            entities.push(item.dataSource.entities.values)
          }
        })
        entities.flat().forEach((item) => {
          var str = Cesium.Cartesian3.distance(center, Cesium.Cartesian3.fromDegrees(item._overlayInfo.longitude, item._overlayInfo.latitude))
          if (str <= radius) {
            this.chooseEntities.push(item._overlayInfo)
          }
        })
        this.$store.commit('app/SET_devlist', this.chooseEntities)
        this.closeDiaodu()
        this.$root.$emit('isShowPanel')
        this.viewer._container.style.cursor = 'grab'
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    },
    //矩形
    polyRect() {
      this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
      this.viewer._container.style.cursor = "crosshair";
      var startPoint = null;
      var rectangle = null;
      this.handler.setInputAction((movement) => {
        startPoint = this.viewer.camera.pickEllipsoid(
          movement.position,
          this.viewer.scene.globe.ellipsoid
        )
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.handler.setInputAction((movement)=> {
        if (Cesium.defined(startPoint)) {
          var endPoint = this.viewer.camera.pickEllipsoid(
            movement.endPosition,
            this.viewer.scene.globe.ellipsoid
          );
          if (Cesium.defined(endPoint)) {
            if (Cesium.defined(rectangle)) {
              this.viewer.entities.remove(rectangle);
            }
            rectangle = this.viewer.entities.add({
              id: 'rec',
              rectangle: {
                coordinates: new Cesium.CallbackProperty(function () {
                  return Cesium.Rectangle.fromCartesianArray([
                    startPoint,
                    endPoint,
                  ]);
                }, false),
                material: Cesium.Color.fromBytes(0, 85, 128, 100),
                outline: true,
                outlineColor: Cesium.Color.fromBytes(0, 85, 128, 300),
                height: 0
              }
            })
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      this.handler.setInputAction((movement)=> {
        this.viewer._container.style.cursor = "default";
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);

        let entities = []
        this.typeList.forEach((item)=>{
          if(item.dataSource) {
            entities.push(item.dataSource.entities.values)
          }
        })
        entities.flat().forEach((item) => {
          var position = item.position._value;
          var cartographic = Cesium.Cartographic.fromCartesian(position);
          if (Cesium.Rectangle.contains(rectangle.rectangle.coordinates.getValue(), cartographic)) {
            this.chooseEntities.push(item.overlayInfo)
          }
        })
        this.$store.commit('app/SET_devlist', this.chooseEntities)
        this.closeDiaodu()
        this.$root.$emit('isShowPanel')
        this.viewer._container.style.cursor = 'grab'
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    },
    //多边形
    polygon() {
      var polygon_point_arr = []
      var temporary_polygon_entity = null
      this.positionArray = []
      this.handler.setInputAction((event) => {
        // 屏幕坐标转为空间坐标
        const cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.viewer.scene.globe.ellipsoid)
        // 判断是否定义（是否可以获取到空间坐标）
        if (Cesium.defined(cartesian)) {
          // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
          if (temporary_polygon_entity) {
          // 只要元素点大于一，每次就删除一个点，因为实时动态的点是添加上去的
            if (polygon_point_arr.length > 1) {
            // 删除数组最后一个元素（鼠标移动添加进去的点）
              polygon_point_arr.pop()
            }
            // 将新的点添加进动态多边形点的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
            polygon_point_arr.push(cartesian)
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      this.handler.setInputAction((click) => {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        // 点是否在多边形内的方法
        function isPointInPolygon(point, polygonPoint) {
          let inside = false;
          let pointX = point.x, pointY = point.y;
          for (let i = 0, j = polygonPoint.length - 1; i < polygonPoint.length; j = i++) {
            let xi = polygonPoint[i].x, yi = polygonPoint[i].y;
            let xj = polygonPoint[j].x, yj = polygonPoint[j].y;
            let intersect = ((yi > pointY) !== (yj > pointY)) && (pointX < (xj - xi) * (pointY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        }
        let entities = []
        this.typeList.forEach((item)=>{
          if(item.dataSource) {
            entities.push(item.dataSource.entities.values)
          }
        })
        entities.flat().forEach((item) => {
          const po = Cesium.Cartesian3.fromDegrees(item._overlayInfo.longitude, item._overlayInfo.latitude)
          if(isPointInPolygon(po, polygon_point_arr)) {
            this.chooseEntities.push(item._overlayInfo)
          }
        })
        this.$store.commit('app/SET_devlist', this.chooseEntities)
        temporary_polygon_entity = null
        polygon_point_arr = []
        this.closeDiaodu()
        this.$root.$emit('isShowPanel')
        this.viewer._container.style.cursor = 'grab'
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
      this.handler.setInputAction((click) => {
        // 世界坐标点
        const result = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
        polygon_point_arr.push(result)
        const that = this
        if (temporary_polygon_entity == null) {
          // 绘制动态多边形
          temporary_polygon_entity = that.viewer.entities.add({
            id: 'pol',
            polygon: {
              hierarchy: new Cesium.CallbackProperty(() => {
                return new Cesium.PolygonHierarchy(polygon_point_arr)
              }, false),
              outline: true,
              outlineColor: Cesium.Color.fromBytes(0, 85, 128, 300),
              outlineWidth: 3,
              material: Cesium.Color.fromBytes(0, 85, 128, 100),
              height: 0
            }
          })
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    closeDiaodu() {
      // this.myDrawingManager.close()
      // this.map.removeOverlay(this.myOverlay)
      // this.myOverlay = null
      // this.diaoduActive = ''
      this.diaoduActive = ''
      this.chooseEntities = []
      if (this.diaoduActive = '圈选' && this.viewer.entities.getById('cir')) {
        this.viewer.entities.remove(this.viewer.entities.getById('cir'))
      }
      if (this.diaoduActive = '框选' && this.viewer.entities.getById('rec')) {
        this.viewer.entities.remove(this.viewer.entities.getById('rec'))
      }
      if (this.diaoduActive = '多边形' && this.viewer.entities.getById('pol')) {
        this.viewer.entities.remove(this.viewer.entities.getById('pol'))
      }
    },
    addWeixing(){
      const viewer =this.viewer
       if(this.weixinImgIndex){
          let weixinglayer = viewer.imageryLayers.get(this.weixinImgIndex)
          weixinglayer.show=true
          let ciaLayer = viewer.imageryLayers.get(this.ciaLayer)
          ciaLayer.show=true
          return
        }
        var TDU_Key = "3afb6b7a48527acec06a2db00d06e241"//天地图申请的密钥// 3afb6b7a48527acec06a2db00d06e241
          //在线天地图影像服务地址(墨卡托投影)
        var TDT_IMG_W = "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
            "&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
            "&style=default&format=tiles&tk=" + TDU_Key;
        var TDT_CIA_W = "http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
            "&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
            "&style=default.jpg&tk=" + TDU_Key
        let layerIndex =viewer.imageryLayers._layers.length
        let weixinImg = new Cesium.WebMapTileServiceImageryProvider({
            id:"weixing",
            url: TDT_IMG_W,//url地址
            layer: "img_w",	//WMTS请求的层名称
            style: "default",//WMTS请求的样式名称
            format: "tiles",//MIME类型，用于从服务器检索图像
            tileMatrixSetID: "GoogleMapsCompatible",//	用于WMTS请求的TileMatrixSet的标识符
            subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],//天地图8个服务器
            minimumLevel: 0,//最小层级
            maximumLevel: 18,//最大层级
        })
        this.weixinImgIndex=layerIndex

        viewer.imageryLayers.addImageryProvider(weixinImg,layerIndex)//添加到cesium图层上
        let weixincia = new Cesium.WebMapTileServiceImageryProvider({   //调用影响中文注记服务
            url: TDT_CIA_W,
            id:"zhuji",
            layer: "cia_w",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "GoogleMapsCompatible",
            subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],//天地图8个服务器
            minimumLevel: 0,
            maximumLevel: 18,
        })
        this.ciaLayer=layerIndex+1
        viewer.imageryLayers.addImageryProvider(weixincia,layerIndex+1)//添加到cesium图层上
    },
    // 普通地图、卫星地图
    dituClick(item, k) {
      const viewer = this.viewer
      this.$store.commit('app/SET_MAP_TYPE', item.mapType)
      if(item.text==='卫星地图'){
          this.addWeixing()
      }else if(item.text!=='卫星地图'&&this.weixinImgIndex){
          let weixinglayer = viewer.imageryLayers.get(this.weixinImgIndex)
          weixinglayer.show=false
          let ciaLayer = viewer.imageryLayers.get(this.ciaLayer)
          ciaLayer.show=false
      }
      if(item.text==='二三维联动'){
         this.sceneTypeChange('ThreeScene')
      }
    },
    // 圈选视频呼叫
    videoCall() {
      this.filterUserDev()
      const showVideoDev = this.videoDev
      var that = this
      showVideoDev.forEach((item, index) => {
        // 群呼加100ms延迟
        (function(it, i) {
          setTimeout(() => {
            that.makeCall({ callNumber: it.id || it.userId, audioOrVideo: 'video', isQuanXuanVideo: true, belong: 'isVideoGroupCall' })
          }, 120 * i)
        })(item, index)
        // this.makeCall({ callNumber: item.id || item.userId, audioOrVideo: 'video', isQuanXuanVideo: true })
      })
      // 圈选视频弹层
      this.$nextTick(_ => {
        this.quanxuanDialog = true
      })
    },
    // 圈选语音会议
    audioMeet(flag) {
      this.filterUserDev(flag)
      this.dialogTitle = '创建会议'
      this.dialogVisible = true
      this.dialogType = 'add'
      this.createMeetingName = `语音会议${parseTime(new Date(), '{y}{m}{d}-{h}:{i}:{s}')}`
      this.createMeetingName = flag ? `${flag}${parseTime(new Date(), '{m}{d}-{h}:{i}:{s}')}` : `语音会议${parseTime(new Date(), '{y}{m}{d}-{h}:{i}:{s}')}`
      // 将调度的弹层放入宏任务中
    },
    // 圈选视频会议随锐
    videoMeetHandle(v) {
      this.filterUserDev('videoMeet')
      this.dialogVisibleVideo = true
      // 将调度的弹层放入宏任务中
    },
    // 过滤人员设备
    filterUserDev(v) {
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.videoDev = []
      const userName = String(this.userInfo.userName)
      //  将 调度台本身过滤掉
      this.checkResourcelist.forEach((item) => {
        if (String(item.yonghuid) === userName || String(item.id) === userName) return
        // 如果是视频会商不进行筛选
        if ((item.power && item.power.search('1') !== -1) || (item.power && item.power.search('2') !== -1 && v === 'videoCall') || v === 'videoMeet') {
          var obj = {
            userId: item.id,
            userName: item.name,
            yonghuzxbj: 'yonghuzxbj' in item ? item.yonghuzxbj : '1'
          }
          if (item.type === '2') {
            obj.devId = 'phone'
          }
          this.$store.commit('audioMeet/SET_addMeetingMemberList_PUSH', obj)
        }
        if ('is_dyna' in item) {
          item.yonghuzxbj = 1
        }
        if (item.power && item.power.search('2') !== -1 || v === 'videoMeet') {
          // 标绘列表中的人员添加userId
          item.userId = item.id
          this.videoDev.push(item)
        }
      })
    },
    // 视频窗口弹窗调整大小
    resize(newRect) {
      this.divWidth = newRect.width
      this.divHeight = newRect.height
      this.divTop = newRect.top
      this.divLeft = newRect.left
    },
    // 弹框发起会议点击事件
    async sureClickHandle() {
      // 圈选会议完成后默认拉起会议，拉起会议需要传参id及拉起接口需要会议成员参数，所以需要将meet组件链式回调接口改写成async、await形式，这样才能知道创建会议、获取会议列表及获取会议成员的接口都完成了，拉去会议接口所需参数都有了才能正确拉起成功
      const _this = this
      _this.dialogVisible = false
      setTimeout(async _ => {
        await _this.$root.$emit('createMeeting', true)
      }, 0)
      // 将弹层放入宏任务中
      // setTimeout(() => {
      //   this.dialogVisible = false
      // }, 0)
    }
  }
}
</script>
<style lang="scss" scoped>
.equipmentWrap {
  user-select: none;
  width: 100%;
  height: 100%;
   .tab-menu {
    position: fixed;
    z-index: 1000;
    top: 0px;
    left: -1px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    cursor: pointer;
    box-sizing: content-box;
    width: 28px;
    background: -webkit-gradient(linear, left bottom, left top, from(#2A7AA2), to(#055984));
    background: linear-gradient(0deg, #2A7AA2, #055984);
    border: 1px solid #01CFFF;
    color:#01CFFF;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
   .tabTitle{
    border: 1px solid #01CFFF;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex:1;
      span{
      display: inline-block;
      word-break: break-all;
      width: 14px;
      line-height: 2;
    }
   }
    img{
      position: absolute;
      right: -10px;
      cursor: pointer;
    }
  }
  .equipment{
    position: sticky;
    z-index: 1000;
    top: calc(100% - 60px);
    width: 100%;
    height: 60px;
    background: url('../../../assets/images/footer.png') no-repeat;
    background-size: 100% 60px;
    .oneLevel {
      position: relative;
      z-index: 1000;
      width: 5.34rem;
      height: 60px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      padding-top: 6px;
      .oneLevelLi {
        display: flex;
        flex-direction: column;
        width: 50px;
        text-align: center;
        cursor: pointer;
        .icon {
          width: 31px;
          height: 31px;
          margin: 0 auto;
          margin-bottom: 2px;
          background: url('../../../assets/images/equipment/bg.png') no-repeat;
          background-size: 100% 100%;
          .iconImg {
            width: 100%;
            height: 100%;
          }
        }
        &:nth-child(4) {
          .icon {
            .iconImg {
              width: 22px;
              height: 22px;
              margin-top: 5px;
            }
          }
        }
        .text {
          overflow: hidden;
          white-space: nowrap;
          font-size: 12px;
          font-family: PingFang SC;
          color: #2EDDF9;
          font-weight: 600;
        }
        &.oneLevelActive, &:hover {
          .icon {
            background: url('../../../assets/images/equipment/bga.png') no-repeat;
            background-size: 100% 100%;
            .iconImg {
              color: #fff !important;
            }
          }
          .text {
            font-weight: 600;
            background: linear-gradient(180deg, #FFFFFF 20%, #F1F278 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
      }
      .ckdev, .ditu, .diaodu, .dataLayer{
        position: absolute;
        z-index: 1000;
        bottom: 70px;
        width: 150px;
        height: 184px;
        color:#FFF;
        left: -51px;
        .sanjiao {
          position: absolute;
          height: 0;
          width: 0;
          top: 100%;
          left: 68px;
          border: solid transparent;
          border-width: 8px;
          border-top-color: #327a8e;
        }
        .wrap {
          width: 100%;
          height: 100%;
          padding: 10px 8px 10px 12px;
          .secUl {
            width: 100%;
            height: 100%;
            overflow: auto;
            .secLi {
              width: 100%;
              height: 30px;
              line-height: 30px;
              cursor: pointer;
              margin: 2px 0px;
              .secImg {
                float: left;
                margin-top: 4px;
                width:22px;
                height:22px;
                border-radius:50%;
              }
              .secName {
                float: left;
                width: calc(100% - 25px);
                height:30px;
                line-height:30px;
                font-size: 12px;
                font-family: PingFang SC;
                color: #fff;
                padding-left: 6px;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
              }
              &.active, &:hover{
                .secName {
                  color: #00ffff;
                }
              }
            }
          }
        }
      }
      .dataLayer {
        left: calc(1.46rem - 75px);
        height: 90px;
        .wrap {
          .secUl {
            .secLi {
              .secImg {
                border-radius: 0;
                width: 19px;
                height: 19px;
              }
            }
          }
        }
      }
      .diaodu {
        left: calc(2.67rem - 75px);
        height: 120px;
        .wrap {
          .secUl {
            .secLi {
              .secImg {
                border-radius: 0;
              }
            }
          }
        }
      }
      .ditu {
        left: calc(3.63rem - 75px + 0.25rem);
        height: 170px;
        .dituLi{
            text-align: center;
            color: #01cfff;
            line-height: 1.7;
            cursor: pointer;
            user-select: none;
            display: flex;
            font-size: 12px;
            & div{
              flex: 1;
            }
            .active{
              color: #fff;
              background: url('../../../assets/images/equipment/active.png') no-repeat;
              background-size: 100% 100%;
            }
        }
        .model {
          width: 20px !important;
          height: 20px !important;
          border-radius: 0 !important;
        }
      }
    }
  }
  .tone_sip-t84{
    top: 140px;
    bottom: 140px;
    right: 20px;
    min-height: 300px;
  }

  .tone_sip_dialog{
    user-select: text;
    width: 300px;
    color: #fff;
    position: absolute;
    // top: 0;
    // bottom: 0;
    // left: 0;
    .sanjiao {
      position: absolute;
      content: "";
      height: 0;
      width: 0;
      top:calc(50% - 8px);
      left: -16px;
      border: solid transparent;
      border-width: 8px;
      border-right-color: #327a8e;
    }
    .detailBox {
      width: 100%;
      height: 100%;
    }
    .tone_sip_dialog_tit{
      box-sizing: content-box;
      padding-bottom: 5px;
      height: 30px; line-height: 30px;
      border-bottom: 1px solid #497a7a;
      font-size: 14px;
      font-family: PingFang SC;
      cursor: move;
      padding: 10px 10px 0;
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
    .tone_sip_con{ width: 100%;padding: 0 10px 10px;
      .btnWrap {
        width: 100%;
        border-top: 1px solid #497a7a;
        display: flex;
        flex-wrap:wrap ;
        padding-top: 5px;
        .btn{
          cursor: pointer;
          background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
          background-size: 100% 100%;
          width: 80px;
          height: 24px;
          line-height: 24px;
          font-size: 12px;
          display: inline-block;
          color: #01cfff;
          text-align: center;
          margin: 5px 20px 5px 0;
          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }
      .dev_info_header{
        display: flex;
        font-size: 12px;
        padding: 8px 3px 3px 0;
        // border-bottom: 0.5px solid #497a7a;
        line-height: 1.5;
        word-break: break-all;
        img{
            width: 60px;
            height: 60px;
            -o-object-fit: contain;
            object-fit: contain;
            /* height: 28%; */
            margin-right: 23px;
            cursor: pointer;
        }
        .dev_info_header_first{
          width: calc(100% - 50px);
          flex: 1;
          header{
            font-size: 14px;
          }
          footer{
            display: flex;
            justify-content: space-between;
          }
          .body{
            display: flex;
            margin: 5px 0;
            flex-direction: column;
          }
        }
      }
      .dev_info_footer{
        overflow-y: auto;
        box-sizing: border-box;
        border-top: 0.5px solid #497a7a;
        padding: 5px 0;
          .left-text {
            word-break: break-all;
            line-height: 2;
            font-family: "PingFang SC";
            font-size: 12px;
            display: flex;
            overflow: hidden;
            .span_remark{
             color: #becad2;
             width: 28%;
             float: left;
            }
            .remark_end{
              float: right;
              flex: 1;
              padding-left: 5px;
            }
            /* 两侧等高 */
          }
      }
    }
    .tone_sip_con_c{
      padding-top: 5px;
      height: 125px;
      overflow: hidden;
      overflow-y: scroll;
      .name {
        font-family: PingFang SC;
        font-size: 12px;
        line-height: 30px;
        display: flex;
        .l {
          color: #becad2;
          float: left;
        }
        .r {
          color: #fff;
          float: right;
          flex:1;
        }
      }
    }
    .videoCon {
      border-top: 1px solid #497a7a;
      padding-top: 10px;
      .btn{
        cursor: pointer;
        background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
        background-size: 100% 100%;
        width: 80px;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        margin-right: 10px;
        &:last-child {
          margin-right: 0;
        }
        .left {
          margin: 5px 3px 0 7px;
        }
        .right {
          float: left;
        }
        .iconImg {
          width: 14px;
          height: 13px;
        }
      }
    }
    video{
      width: 100%;
      height: 100%;
      background-color: #000;
    }
  }
  ::v-deep .guiji {
    .el-dialog__header {
      padding: 15px 10px 10px;
      border-bottom: 1px solid #497a7a;
      .el-dialog__title,.el-dialog__close {
        font-size: 14px;
        font-family: PingFang SC;
        color: rgba(250, 253, 255, 1);
      }
      .el-dialog__headerbtn {
        top: 15px;
        right: 10px;
      }
    }
    .el-dialog__body {
      padding: 10px 10px 0 !important;
      .block {
        margin-bottom: 10px;
        .el-date-editor {
          width: 100%;
        }
      }
      .el-input__inner {
        width: 100%;
        height: 30px;
        line-height: 30px;
        background-color: rgba(0, 85, 128, 0.6);
        border: 1px solid #01cfff;
        color: rgba(250, 253, 255, 1);
        font-size: 12px;
        &::-webkit-input-placeholder {
          // color:#0fabd4;
          font-size: 12px;
        }
        &:-moz-placeholder {
          // color:#0fabd4;
          font-size: 12px;
        }
        &::-moz-placeholder {
          // color:#0fabd4;
          font-size: 12px;
        }
        &:-ms-input-placeholder {
          // color:#0fabd4;
          font-size: 12px;
        }
      }
      .el-input__icon {
        line-height: 30px;
      }
    }
    .el-dialog__footer {
      border-top: 1px solid #497a7a;
      padding: 10px 10px 15px;
      .el-button {
        background-color: rgba(0, 85, 128, 0.6);
        padding: 7px 20px;
        width: 100%;
        color:#01cfff;
        border: 1px solid #01cfff;
        font-size: 12px;
      }
    }
  }
  ::v-deep .diaodu {
    .el-dialog__header {
      padding: 15px 10px 10px;
      border-bottom: 1px solid #497a7a;
      .el-dialog__title,.el-dialog__close {
        font-size: 14px;
        font-family: PingFang SC;
        color: rgba(250, 253, 255, 1);
      }
      .el-dialog__headerbtn {
        top: 15px;
        right: 10px;
      }
    }
    .el-dialog__body {
      padding: 20px 10px !important;
      .info {
        color: #01cfff;
        font-size: 12px;
        p {
          margin-bottom: 10px;
          &:last-child {
            margin-bottom: 0;
          }
        }
        .number {
          color: #01cfff;
        }
      }
    }
    .el-dialog__footer {
      border-top: 1px solid #497a7a;
      padding: 10px 10px 15px;
      .block {
        margin-bottom: 10px;
        &:last-child {
          margin-bottom: 0px;
        }
        .btn{
          cursor: pointer;
          background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
          background-size: 100% 100%;
          width: 80px;
          height: 24px;
          line-height: 24px;
          font-size: 12px;
          display: inline-block;
          color: #01cfff;
          text-align: center;
          margin-right: 10px;
          &:last-child {
            margin-right: 0;
          }
          .left {
            margin: 5px 3px 0 7px;
          }
          .right {
            float: left;
          }
          .iconImg {
            width: 14px;
            height: 13px;
          }
        }
      }
    }
  }
}
</style>
