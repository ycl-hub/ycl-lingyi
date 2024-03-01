<template>
  <div v-move="{parent: '.boxyujingWrap', childrenHeader: '.filter'}" class="yujing">
    <div v-show="isSpread" class="boxyujingWrap" :class="{leftpos:!isJingShow&&isBiaoShow}">
      <div class="arrow">
        <img :src="rightOut" @click="$emit('close')">
      </div>
      <div class="yujingWrap bevel">
        <div class="leftWrap">
          <div class="tabContainer">
            <ul class="tab-cards">
              <li v-for="(item,i) in tabNav" v-if="item.id !== 'zdjq'" :key="i" :class="navActive==item.id?'active':''" @click="isShowPanel(item)">
                <span>{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="rightWrap">
          <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
            <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
          </el-input>
          <div class="btnWrap">
            <div class="btn" :class="btnActive=='按时间排序'?'active':''" @click="sortBtn('time')">
              <span class="">按时间排序</span>
            </div>
            <div class="btn" :class="btnActive=='按状态排序'?'active':''" @click="sortBtn('state')">
              <span class="">按状态排序</span>
            </div>
          </div>
          <div class="tipWrap">
            <div v-for="(item, index) in tipList" :key="index" class="tip" :class="item.isActive?'active':''" @click="tipBtn(item)">
              <img :src="item.imgUrl" alt="" class="left">
              <span class="right" :style="{color: item.color}">{{ item.text }}</span>
            </div>
          </div>
          <div class="tab-con" :style="{bottom:navActive === 'cgjq' || navActive === 'zdjq' ? '50px' : '15px'}">
            <div v-if="navActive !== 'selectAlarm'" :class="['tab-con-item',navActive?'active':'']">
              <ul>
                <li v-for="(item) in alarmListFilter" :key="item.ALARM_ID" class="item clearfix" @click="showDetail(item, false)">
                  <img class="left" :src="statusFilter(item.ALARM_STATUS)" alt="">
                  <div class="right">
                    <p class="top ellipsis">
                      <span class="type">【{{ categoryFilter(item) }}】</span>
                      <span class="event">{{ item.ALARM_DESC }}</span>
                    </p>
                    <div class="bottom">
                      <p class="addr ellipsis">{{ item.ALARM_ADDRESS }}</p>
                      <p class="time">{{ item.REPORT_TIME }}</p>
                    </div>
                  <!-- <img class="dingwei" :src="require('@/assets/images/equipment/dingwei.png')" alt="" @click="dingwei(item)"> -->
                  </div>
                </li>
              </ul>
              <div v-if="alarmListFilter.length===0" class="empty">暂无数据</div>
            </div>
            <div v-if="navActive === 'selectAlarm'" :class="['tab-con-item',navActive?'active':'']">
              <ul>
                <li v-for="(item) in devList" :key="item.ALARM_ID" class="item clearfix" @click="showDetail(item, false)">
                  <img class="left" :src="statusFilter(item.ALARM_STATUS)" alt="">
                  <div class="right">
                    <p class="top ellipsis">
                      <span class="type">【{{ categoryFilter(item) }}】</span>
                      <span class="event">{{ item.ALARM_DESC }}</span>
                    </p>
                    <div class="bottom">
                      <p class="addr ellipsis">{{ item.ALARM_ADDRESS }}</p>
                      <p class="time">{{ item.REPORT_TIME }}</p>
                    </div>
                  <!-- <img class="dingwei" :src="require('@/assets/images/equipment/dingwei.png')" alt="" @click="dingwei(item)"> -->
                  </div>
                </li>
              </ul>
              <div v-if="devList.length===0" class="empty">暂无数据</div>
            </div>
          </div>
          <!-- 新建警情按钮 -->
          <div v-if="navActive === 'cgjq' || navActive === 'zdjq'" class="btnWrapSingle">
            <div class="btn" @click="addJq()">
              <span class="el-icon-plus" />
              <span class="">新建警情</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 新建警情 -->
      <div v-if="creatJq" ref="creatJq" v-move="{parent: '.creatJq_dialog', childrenHeader: '.creatJq_dialog_tit'}" class="creatJq_dialog bevel">
        <div class="creatJq_dialog_tit">
          <span class="tit">新建警情</span>
          <span class="el-icon-close close" @click="closeCreatJq" />
        </div>
        <div class="creatJq_con">
          <div class="creatJq_con_c">
            <el-form ref="ruleForm" label-position="left" :model="listQuery" :rules="rules" label-width="80px" class="listQuery" size="mini" @submit.native.prevent>
              <el-form-item label="报警人：" prop="ReporterName" class="plottingName">
                <el-input v-model.trim="listQuery.ReporterName" class="filter" type="text" placeholder="请输入报警人" />
              </el-form-item>
              <el-form-item label="报警电话：" prop="ReportTel" class="plottingName">
                <el-input v-model.trim="listQuery.ReportTel" class="filter" placeholder="请输入报警电话" />
              </el-form-item>
              <el-form-item label="警情位置：" prop="address">
                <el-input v-model.trim="listQuery.address" class="filter" type="text" placeholder="请输入警情位置">
                  <el-button slot="append" icon="el-icon-s-promotion" @click="jqPosition" />
                </el-input>
              </el-form-item>
              <!-- 隐藏 -->
              <el-form-item v-show="false" label="警情等级：" prop="ALARMGRADE" class="jqGrade is-required">
                <el-radio v-model="listQuery.ALARMGRADE" label="0">常规警情</el-radio>
                <el-radio v-model="listQuery.ALARMGRADE" label="1">重大警情</el-radio>
              </el-form-item>
              <el-form-item label="警情坐标：" prop="Lng" class="jqPosition">
                <p>经度：{{ listQuery.Lng }}</p>
                <p>纬度：{{ listQuery.Lat }}</p>
              </el-form-item>
              <el-form-item label="报警内容：" prop="Desc" class="plottingName">
                <el-input
                  v-model.trim="listQuery.Desc"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入报警内容"
                  maxlength="500"
                />
              </el-form-item>
              <el-form-item label="警情类型：" prop="Division">
                <el-select v-model="listQuery.Division" placeholder="请选择警情大类" @change="DivisionChange">
                  <el-option
                    v-for="item in DivisionList"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item.ID"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="" prop="Group">
                <el-select v-model="listQuery.Group" placeholder="请选择警情中类" @change="GroupChange">
                  <el-option
                    v-for="item in GroupList"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item.ID"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="" prop="Class">
                <el-select v-model="listQuery.Class" placeholder="请选择警情小类" @change="ClassChange">
                  <el-option
                    v-for="item in ClassList"
                    :key="item.ID"
                    :label="item.NAME"
                    :value="item.ID"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div class="btnWrap clearfix">
            <div class="btn fl" @click="creatJqSure()">
              <span class="">创建</span>
            </div>
            <div class="btn fr" @click="closeCreatJq()">
              <span class="">取消</span>
            </div>
          </div>
        </div>
      </div>
      <!--==警情信息==-->
      <div v-if="isShowJq" ref="jqDetail" v-move="{parent: '.tone_sip_dialog', childrenHeader: '.tone_sip_dialog_tit'}" class="tone_sip_dialog">
        <span v-show="isEmpt" class="sanjiao" />
        <div class="jqBox bevel">
          <div class="tone_sip_dialog_tit">
            <!-- <span v-if="detail.DEVICE_REPORT" class="tit">警情信息({{ '预警' }})</span>
          <span v-else class="tit">警情信息({{ detail.ALARMGRADE !== '1' ? '常规警情' : '重大警情' }})</span> -->
            <span class="tit">警情信息({{ detail.title }})</span>
            <span class="el-icon-close close" @click="closeToneDialog" />
          </div>
          <div class="tone_sip_con">
            <div class="tone_sip_con_c">
              <div class="name clearfix">
                <span class="left">警情状态：</span>
                <img class="left" :src="statusFilter(detail.ALARM_STATUS)" alt="">
                <span class="left text" :style="{color: statusFilterColor(detail.ALARM_STATUS).color}">{{ statusFilterColor(detail.ALARM_STATUS).text }}</span>
              </div>
              <div class="name clearfix type">
                <span class="left">警情类型：</span>
                <span class="right">{{ categoryFilterAll(detail) }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">报警人：</span>
                <span class="right">{{ detail.REPORTER_NAME }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">报警电话：</span>
                <span class="right">
                  {{ detail.REPORTER_TEL }}
                  <img :src="phone" style="vertical-align: middle;cursor: pointer;" alt="" @click="makeCall({callNumber:detail.REPORTER_TEL,audioOrVideo:'audio'})">
                </span>
              </div>
              <div class="name clearfix">
                <span class="left">报警时间：</span>
                <span class="right">{{ detail.REPORT_TIME }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">警情编号：</span>
                <span class="right">{{ detail.ALARM_ID }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">警情地址：</span>
                <span class="right">{{ detail.ALARM_ADDRESS }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">警情描述：</span>
                <span class="right">{{ detail.ALARM_DESC }}</span>
              </div>
              <div class="name clearfix">
                <span class="left">已派人员：</span>
                <span class="right person">
                  {{ POLICE_LIST_COPY.length }}
                  <div class="btn" @click="ddBtn(detail)">
                    <span class="">调度</span>
                  </div>
                </span>
              </div>
              <div v-if="detailImgs.length>0" class="name clearfix pic">
                <span class="left">抓拍图：</span>
                <span v-viewer="{'navbar': false}" class="right">
                  <img v-for="(item, i) in detailImgs" :key="i" style="width: 50px;height:50px;marginRight: 12px;cursor: pointer;" :src="iconServer + item.URL" alt="">
                </span>
              </div>
              <div v-if="detailAudios.length>0" class="name clearfix alarmAudio">
                <span class="left">报警语音：</span>
                <div v-for="(item, i) in detailAudios" :key="i" class="left audioCon" @click="audioPreview(item.URL)">
                  <div class="audioIcon_right" :class="{'wifi-symbol': iconServer + item.URL === previewAudioUrl}">
                    <div class="wifi-circle first" />
                    <div class="wifi-circle second" />
                    <div class="wifi-circle third" />
                  </div>
                  <span class="audioTime"> {{ item.AUDIO_TIME }}" </span>
                </div>
              </div>
              <div v-if="detailVideos.length>0" class="name clearfix alarmVideo">
                <span class="left">报警视频：</span>
                <div v-for="(item, i) in detailVideos" :key="i" class="left chatVideo" @click="videoPreview(item.URL)">
                  <video width="50" height="50" :src="iconServer + item.URL" style="objectFit: fill;" />
                  <img class="videoPaly" :src="play" alt="">
                </div>
              </div>
            </div>
            <div class="btnWrap">
              <!-- 常规和重大不一样 -->
              <div class="btn" @click="pajing(detail)">
                <span class="">警力派遣</span>
              </div>
              <div class="btn" @click="ercidw(detail)">
                <span class="">二次定位</span>
              </div>
              <!-- 常规升级 -->
              <!-- 隐藏 -->
              <div v-if="false && detail.ALARMGRADE!=='1'" class="btn" @click="alarmUpgrade(detail)">
                <span class="">警情升级</span>
              </div>
              <!-- 常规和重大不一样 -->
              <!-- 隐藏 -->
              <div v-if="false" class="btn" @click="alarmFinish(detail)">
                <span class="">更改状态</span>
              </div>
              <div class="btn" @click="zhoubian(detail)">
                <span v-if="detail.ALARMGRADE!=='1'" class="">周边视频</span>
                <span v-if="detail.ALARMGRADE==='1'" class="">周边资源</span>
              </div>
              <div class="btn" @click="record(detail)">
                <span class="">处置记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--==调度详情==-->
      <div v-if="isShowDd" ref="ddDetail" v-move="{parent: '.dd_dialog', childrenHeader: '.dd_dialog_tit'}" class="dd_dialog">
        <div class="jqBox bevel">
          <div class="dd_dialog_tit">
            <span class="tit">已派遣人员</span>
            <span class="el-icon-close close" @click="closeDdDialog" />
          </div>
          <div class="dd_con">

            <div class="dd_con_c">
              <el-input v-model.trim="filterTextList" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="filterPlice">
                <img slot="suffix" :src="search" alt="" class="img" title="检索" @click="filterPlice"></el-input>
              <div class="el-tab-pane-con spacingTable">
                <el-table
                  ref="multipleTable"
                  :data="POLICE_LIST"
                  tooltip-effect="dark"
                  style="width: 100%"
                  height="100%"
                  @selection-change="handleSelectionChange"
                >
                  <el-table-column
                    type="selection"
                    width="30"
                  />
                  <el-table-column
                    label="警号"
                    prop="POLICE_ID"
                    width="70"
                  >
                    <template slot-scope="scope">{{ scope.row.POLICE_ID }}</template>
                  </el-table-column>
                  <el-table-column
                    prop="POLICE_NAME"
                    label="姓名"
                    width="60"
                  />
                  <el-table-column
                    prop="UNIT_NAME"
                    label="归属单位"
                    show-overflow-tooltip
                    width="80"
                  />
                  <el-table-column
                    label="距离（m）"
                    prop="DISTANCE"
                    width="70"
                  >
                    <template slot-scope="scope">{{ Number(get(scope.row, 'DISTANCE', 0).toFixed(0)) || '--' }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="70">
                    <template slot-scope="scope">
                      <img :src="phone" alt="" title="语音" @click="makeCall({callNumber:scope.row.POLICE_ID,audioOrVideo:'audio'})">
                      <img :src="camera" alt="" title="视频" @click="makeCall({callNumber:scope.row.POLICE_ID,audioOrVideo:'video'})">
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="btnWrap">
              <!-- 即时消息 -->
              <div class="btn" @click="imtx">
                <span class="">即时消息</span>
              </div>
              <div class="btn" @click="audioMeet">
                <span class="">语音会议</span>
              </div>
              <!-- 视频会商 -->
              <div class="btn" @click="videoMeetHandle()">
                <span class="">视频会商</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 即时消息 -->
      <IMPoliceListTemp v-if="isShowIM" :is-show-i-m.sync="isShowIM" :detail="detail" :group-id="GROUP_ID" />
      <!-- 视频会商 -->
      <VideoMeet v-if="isShowTongxun" :video-meet-dialog.sync="isShowTongxun" :video-dev="POLICE_LIST" />
      <!--==警力派遣==-->
      <CGpaijing v-if="isShowPj && detail.ALARMGRADE!=='1'" :b-map="BMap" :map="map" :is-show-pj.sync="isShowPj" :detail="detail" />
      <ZDpaijing v-if="isShowPj && detail.ALARMGRADE==='1'" :b-map="BMap" :map="map" :is-show-pj.sync="isShowPj" :detail="detail" />
      <!--==周边资源==-->
      <CGzhoubian v-if="isShowZhoubian && detail.ALARMGRADE!=='1'" :b-map="BMap" :map="map" :is-show-zhoubian.sync="isShowZhoubian" :detail="detail" />
      <ZDzhoubian v-if="isShowZhoubian && detail.ALARMGRADE==='1'" :b-map="BMap" :map="map" :is-show-zhoubian.sync="isShowZhoubian" :detail="detail" />
      <!--==处置记录==-->
      <div v-if="isShowRecord && detail.ALARMGRADE!=='1'" ref="recordDetail" v-move="{parent: '.record_dialog', childrenHeader: '.record_dialog_tit'}" class="record_dialog bevel">
        <div class="record_dialog_tit">
          <span class="tit">处置记录</span>
          <span class="el-icon-close close" @click="closeRecordDialog" />
        </div>
        <div class="record_con">
          <div class="record_con_c">
            <el-timeline v-if="activities.length>0" :reverse="true">
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :timestamp="activity.OPER_TIME"
                placement="top"
              >
                <div class="clearfix">
                  <span class="left">状态：</span>
                  <span class="left text" :style="{color: statusFilterColor(activity.STATUS).color}">{{ statusFilterColor(activity.STATUS).text }}</span>
                </div>
                <div v-if="activity.STATUS === 4" class="clearfix">
                  <span class="left">更改状态人员：{{ activity.OPER_NAME }}</span>
                </div>
                <div v-if="activity.STATUS === 1">
                  {{ activity.OPER_NAME }}：指派给 {{ activity.POLICE_NAME }}
                </div>
                <div v-if="activity.STATUS !== 4 && activity.OPER_NAME">
                  处置警员：{{ activity.OPER_NAME }}
                </div>
                <div v-if="activity.BACK_MSG">
                  描述信息：{{ activity.BACK_MSG }}
                </div>
                <!-- 处置语音 -->
                <div v-if="filterActive(activity.attachment, 2)" class="name clearfix alarmAudio">
                  <div class="left">处置语音：</div>
                  <div class="left aud">
                    <div v-for="(attach, i) in filterActive(activity.attachment, 2)" :key="i" class="audioCon" @click="audioPreview(attach.URL)">
                      <div class="audioIcon_right" :class="{'wifi-symbol': iconServer + attach.URL === previewAudioUrl}">
                        <div class="wifi-circle first" />
                        <div class="wifi-circle second" />
                        <div class="wifi-circle third" />
                      </div>
                    <!-- <span class="audioTime"> {{ attach.AUDIO_TIME }}" </span> -->
                    </div>
                  </div>
                </div>
                <!-- 处置图片 -->
                <div v-if="filterActive(activity.attachment, 1)" class="name clearfix pic">
                  <span class="left">处置图片：</span>
                  <span v-viewer="{'navbar': false}" class="left" style="marginTop: 5px;">
                    <img v-for="(attach, i) in filterActive(activity.attachment, 1)" :key="i" style="width: 50px;height:50px;marginRight: 10px;cursor: pointer;" :src="iconServer + attach.URL" alt="">
                  </span>
                </div>
                <!-- 处置视频 -->
                <div v-if="filterActive(activity.attachment, 3)" class="name clearfix alarmVideo">
                  <span class="left">处置视频：</span>
                  <div v-for="(item, i) in filterActive(activity.attachment, 3)" :key="i" class="left chatVideo" @click="videoPreview(item.URL)">
                    <video width="50" height="50" :src="iconServer + item.URL" style="objectFit: fill;" />
                    <img class="videoPaly" :src="play" alt="">
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-if="activities.length===0" class="untreated">
              该警情暂无处置记录
            </div>
          </div>
        </div>
      </div>
      <div v-if="isShowRecord && detail.ALARMGRADE==='1'" ref="recordDetail" v-move="{parent: '.record_dialog', childrenHeader: '.record_dialog_tit'}" class="record_dialog bevel">
        <div class="record_dialog_tit">
          <span class="tit">处置记录</span>
          <span class="el-icon-close close" @click="closeRecordDialog" />
        </div>
        <div class="record_con">
          <div class="record_con_c">
            <el-timeline v-if="activities.length>0" :reverse="true">
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :timestamp="activity.CMD_TIME"
                placement="top"
              >
                <div>
                  {{ activity.POLICE_NAME }}：指派给
                  <span v-for="(a, i) in activity.POLICE_LIST" :key="i">
                    {{ a.POLICE_NAME }}
                  </span>
                </div>
                <!-- <div v-if="activity.STATUS !== 1">
                警员：{{ activity.POLICE_NAME }}
              </div> -->
                <div>
                  描述信息：{{ activity.TASK_DESC }}
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-if="activities.length===0" class="untreated">
              该警情暂无处置记录
            </div>
          </div>
        </div>
      </div>
      <!-- 预览视频 -->
      <el-dialog
        v-el-drag-dialog
        :visible.sync="preview"
        append-to-body
        :close-on-click-modal="true"
        custom-class="preview"
        @close="closePreview"
      >
        <div :class="'preview_content'">
          <video id="preview_video" :src="previewVideoUrl" controls="controls" />
        </div>
      </el-dialog>
      <!-- 添加即时消息成员弹窗 -->
      <CreateDialog v-if="dialogVisible" :dialog-title="'邀请警员'" :dialog-visible="dialogVisible" @closeVisible="dialogVisible = false" @sureClick="sureClickHandle" />
    </div>
  </div>
</template>
<script>
import phone from '@/assets/images/equipment/phone.png'
import camera from '@/assets/images/equipment/camera.png'
import { api } from '@/api/env'
import { sessionStorage } from '@/utils/storage'
import { get, cloneDeep, throttle, debounce } from 'lodash'
import search from '@/assets/images/equipment/search.png'
import videoImg from '@/assets/images/equipment/video.png'
import wcl from '@/assets/images/equipment/wcl.png'
import jqPos from '@/assets/images/equipment/jqPos.png'
import wclJH30 from '@/assets/images/equipment/wclJH30.png'
import yxd from '@/assets/images/equipment/yxd.png'
import ycd from '@/assets/images/equipment/ycd.png'
import ydd from '@/assets/images/equipment/ydd.png'
import ywc from '@/assets/images/equipment/ywc.png'
import { parseTime } from '@/utils/index'
import play from '@/assets/images/im/play.png'
// import Stomp from 'stompjs'
import MarkerClusterer from 'bmaplib.markerclusterer'
import { mapGetters } from 'vuex'
import CreateDialog from '@/components/createDialog'
import '@/styles/viewer.css'
import Viewer from 'v-viewer'
import Vue from 'vue'
Vue.use(Viewer)
import sip from '@/components/mixins/sip.js'
import { validateReporterName, validateNumber811 } from '@/utils/validate'
import CGpaijing from './CGpaijing'
import ZDpaijing from './ZDpaijing'
import CGzhoubian from './CGzhoubian'
import ZDzhoubian from './ZDzhoubian'
import { queryId, combineIconAndLabel } from '@/utils'
import IMPoliceListTemp from '@/components/IMPoliceListTempNew'
import VideoMeet from './videoMeet'
import rightOut from '@/assets/images/rightOut.png'
export default {
  name: 'Yujing',
  components: {
    CGpaijing, ZDpaijing, CGzhoubian, ZDzhoubian, IMPoliceListTemp, VideoMeet, CreateDialog
  },
  mixins: [sip],
  props: {
    isJingShow: {
      type: Boolean,
      default: true
    },
    isBiaoShow: {
      type: Boolean,
      default: true
    },
    bMap: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    isSpread: {
      type: Boolean,
      default: true
    },
    map: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    dialogTableVisible: {
      required: true,
      type: Boolean,
      default: false
    },
    viewer: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    cesium: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      isEmpt: false,
      rightOut,
      dialogVisible: false,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      TONE_voip: sessionStorage.get('TONE_voip'),
      search, videoImg,
      wcl, yxd, ycd, ydd, ywc, play, phone, camera, get, jqPos,
      iconServer: api,
      navActive: 'cgjq',
      tabNav: [
        {
          id: 'cgjq',
          name: '常规警情',
          isActive: true
        },
        {
          id: 'zdjq',
          name: '重大警情',
          isActive: false
        },
        {
          id: 'yujing',
          name: '预警',
          isActive: false
        },
        {
          id: 'selectAlarm',
          name: '已选警情',
          isActive: false
        }
      ],
      filterText: '',
      alarmTipList: [
        { imgUrl: wcl, text: '未处理', color: '#FF3434', status: 0, isActive: false, flagAlarm: 0 },
        // { imgUrl: yxd, text: '已下达', color: '#F39800', status: 1, isActive: false },
        // { imgUrl: ycd, text: '已出动', color: '#FF76FF', status: 2, isActive: false },
        // { imgUrl: ydd, text: '已到达', color: '#0087ff', status: 3, isActive: false },
        // 123状态合并，23状态也叫处理中，在前端处理
        { imgUrl: yxd, text: '处理中', color: '#F39800', status: 1, isActive: false, flagAlarm: 0 },
        // { imgUrl: yxd, text: '处理中', color: '#F39800', status: 2, isActive: false },
        // { imgUrl: yxd, text: '处理中', color: '#F39800', status: 3, isActive: false },
        { imgUrl: ywc, text: '已完成', color: '#22AC38', status: 4, isActive: false, flagAlarm: 0 }
      ],
      ImportantAlarmTipList: [
        { imgUrl: wcl, text: '未完成', color: '#FF3434', status: 0, isActive: false, flagAlarm: 1 },
        // { imgUrl: wcl, text: '未完成', color: '#FF3434', status: 1, isActive: false },
        // { imgUrl: yxd, text: '未完成', color: '#FF3434', status: 2, isActive: false },
        // { imgUrl: yxd, text: '未完成', color: '#FF3434', status: 3, isActive: false },
        { imgUrl: ywc, text: '已完成', color: '#22AC38', status: 4, isActive: false, flagAlarm: 1 }
      ],
      tipList: [],
      btnActive: '按时间排序',
      isShowJq: false,
      alarmList: [],
      alarmListFilter: [],
      categoryList: [],
      // client: null,
      // isConnected: false,
      sortState: false,
      sortStatus: -1,
      detail: null,
      detailImgs: [],
      detailAudios: [],
      detailVideos: [],
      myAudio: null,
      previewAudioUrl: '',
      isPlayAudio: false,
      preview: false,
      previewVideoUrl: '',
      myVideo: null,
      ercidwFlag: false,
      markerClusterer: null,
      isShowPj: false,
      isShowRecord: false,
      activities: [],
      // 新建警情
      creatJq: false,
      listQuery: {
        ReporterName: '',
        UNIT_ID: '',
        ReportTel: '',
        address: '',
        Lng: '',
        Lat: '',
        Desc: '',
        Division: '',
        Group: '',
        Class: '',
        ALARMGRADE: '0'
      },
      rules: {
        ReporterName: [
          { required: true, message: '请输入报警人', trigger: 'blur' },
          { validator: validateReporterName, trigger: 'blur', required: true },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        ReportTel: [
          { required: true, message: '请输入报警电话', trigger: 'blur' },
          { validator: validateNumber811, trigger: 'blur', required: true }
        ],
        address: [
          { required: true, message: '请输入警情位置', trigger: 'change' }
        ],
        Desc: [
          { required: true, message: '请输入报警内容', trigger: 'blur' }
        ],
        Division: [
          { required: true, message: '请选择警情大类', trigger: 'change' }
        ]
      },
      DivisionList: [],
      GroupList: [],
      ClassList: [],
      jqPositionFlag: false,
      devList: [],
      devListClone: [],
      // 升级重大警情flag
      alarmUpgradeFlag: false,
      // 周边
      isShowZhoubian: false,
      POLICE_LIST: [],
      POLICE_LIST_COPY: [],
      filterTextList: '',
      isShowDd: false,
      checkedPOLICE_LIST: [],
      // IM
      isShowIM: false,
      GROUP_ID: '',
      groupMember: [],
      isShowTongxun: false,
      yuJingEntities: null
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    ...mapGetters([
      'mqResponseData',
      'settings',
      ' ',
      'checkResourcelist',
      'userUnitIdAuth'
    ])
  },
  watch: {
    alarmListFilter: {
      handler: function(val) {
        // console.log('监听渲染')
        // 先清除警情图层再去绘制
        const Cesium = this.cesium
        const viewer = this.viewer
        const scene = viewer.scene;
        const billboardsCollectionCombine = new Cesium.BillboardCollection();
        const primitives = viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
        const primitivecluster = new Cesium.primitiveCluster();
        billboardsCollectionCombine._id = `jingqing`;
        this.clearJq()
        var that = this
        this.alarmListFilter.forEach((item) => {
         let billboard= billboardsCollectionCombine.add({
            id: item.ALARM_ID,
            position: Cesium.Cartesian3.fromDegrees(item.ALARM_LNG, item.ALARM_LAT),
            image: that.statusFilter(item.ALARM_STATUS),
            width: 30, // 如果不设置宽高 初始化无法正常显示聚合数量
            height: 30,
            item: item,
            dev_type: 'jq'
          })
          billboard.item=item
          billboard.dev_type='jq'
        })
        this.yuJingEntities = primitives// 存放警情实体资源
        primitivecluster._billboardCollection = billboardsCollectionCombine;
        primitivecluster._initialize(scene);//初始化
        // 将标签数据添加到图元中
        primitives.add(primitivecluster);
        primitivecluster.enabled = true;
        primitivecluster.pixelRange = 50;
        primitivecluster.minimumClusterSize = 2;
        primitivecluster.clusterEvent.addEventListener(
          function(clusteredEntities, cluster) {
            // 关闭自带的显示聚合数量的标签
            cluster.label.show = false
            cluster.billboard.id = cluster.label.id// 必须给实体广告牌ID否则聚合点击事件无法捕获聚合实体
            cluster.billboard.show = true
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
            cluster.billboard.image = combineIconAndLabel(wcl, clusteredEntities.length, 64, Cesium)// 动态自定义label聚合右上角数量 和图标样式
            cluster.billboard._ids = clusteredEntities; // 点击聚合点位的时候可以拿到
          }
        )
      },
      deep: true
    },
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const json = JSON.parse(val)
        // 二次定位的推送
        if (json.MSG_KEY === 'ALARM_SECOND_LOCATION' && json.ALARM_ID) {
          if (this.navActive === 'selectAlarm') {
            this.devList.forEach((item) => {
              if (item.ALARM_ID === json.ALARM_ID) {
                json.LNG ? item.ALARM_LNG = json.LNG : ''
                json.LAT ? item.ALARM_LAT = json.LAT : ''
              }
            })
          } else {
            this.alarmList.forEach((item) => {
              if (item.ALARM_ID === json.ALARM_ID) {
                json.LNG ? item.ALARM_LNG = json.LNG : ''
                json.LAT ? item.ALARM_LAT = json.LAT : ''
              }
            })
          }
          this.searchBtn()
        }
        // 服务端给PC和警务通推送警情消息（状态信息等）
        if (json.MSG_KEY === 'ALARM' && json.ALARM_ID) {
          // 使用mq推送新警情，之前cs端不考虑刷新情况，获取的是登录时间的警情列表，新报警情通过mq推送，
          // bs端已经修改为肯据发送时间获取最新警情，所以，这里不需要mq推送去处理，当然也可以用，建议使用直接再调用一次新警情接口即可
          if ((json.SOURCE === 'App' || json.SOURCE === '1') && this.navActive === 'cgjq') {
            this.getJq(0, '0', json.REPORT_TIME)
          }
          if ((json.SOURCE === 'App' || json.SOURCE === '1') && this.navActive === 'zdjq') {
            this.getJq(0, '1', json.REPORT_TIME)
          }
          if (!(json.SOURCE === 'App' || json.SOURCE === '1') && this.navActive === 'yujing') {
            this.getJq(1, '0', json.REPORT_TIME)
          }
        }
        // 警力派遣后的推送
        if ((json.MSG_KEY === 'HANDLE' || json.MSG_KEY === 'BACK_MSG') && json.ALARM_ID) {
          if (this.navActive === 'selectAlarm') {
            this.devList.forEach((item) => {
              if (item.ALARM_ID === json.ALARM_ID) {
                json.ALARM_STATUS ? item.ALARM_STATUS = Number(json.ALARM_STATUS) : ''
                this.detail ? this.detail.ALARM_STATUS = Number(json.ALARM_STATUS) : ''
              }
            })
          } else {
            this.alarmList.forEach((item) => {
              if (item.ALARM_ID === json.ALARM_ID) {
                json.ALARM_STATUS ? item.ALARM_STATUS = Number(json.ALARM_STATUS) : ''
                this.detail ? this.detail.ALARM_STATUS = Number(json.ALARM_STATUS) : ''
              }
            })
          }
          this.searchBtn()
          // 更新处置记录
          if (json.ALARM_ID) {
            const TONE_voip = sessionStorage.get('TONE_voip')
            // 获取警情详情
            this.$api.common.GetAlarmDetail({
              TOKEN: TONE_voip.cmd.TOKEN,
              PoliceNo: TONE_voip.cmd.POLICE_ID,
              Alarm_ID: json.ALARM_ID
            }).then(res => {
              if (!res.data.obj.handleAlarmDetail) {
                this.activities = []
              } else {
                this.activities = res.data.obj.handleAlarmDetail
              }
            }).catch((error) => {
              console.log(error)
            })
          }
          this.detail ? this.tongxun(this.detail) : ''
        }
        // 重大警情派警后触发
        if (json.MSG_KEY === 'CmdPolice') {
          this.detail ? this.tongxun(this.detail) : ''
        }
        // 临时聊天组显示
        if (json.MSG_KEY === 'CreatGroup' && !json.MEMBERLIST && json.TEMP === '1') {
          this.GROUP_ID = json.GROUP_ID
          this.isShowIM = true
        }
      },
      immediate: true
    },
    navActive: {
      handler: function(val) {
        // console.log('native=>', val, 1)
        if (val === 'cgjq') {
          this.tipList = this.alarmTipList
          this.getJq(0, '0')
          this.listQuery.ALARMGRADE = '0'
        }
        if (val === 'zdjq') {
          this.tipList = this.ImportantAlarmTipList
          this.getJq(0, '1')
          this.listQuery.ALARMGRADE = '1'
        }
        if (val === 'yujing') {
          this.tipList = this.alarmTipList
          this.getJq(1, '0')
        }
        if (val === 'selectAlarm') {
          if (this.devList && this.devList.length > 0 && this.devList[0].ALARMGRADE === '1') {
            this.tipList = this.ImportantAlarmTipList
          } else {
            this.tipList = this.alarmTipList
          }
          this.devListClone = cloneDeep(this.devList)
        }
      },
      immediate: false,
      deep: true
    },
    filterText: {
      handler: function(val) {
        if (!val && this.navActive === 'cgjq') {
          this.alarmListFilter = this.alarmList
        }
        if (!val && this.navActive === 'zdjq') {
          this.alarmListFilter = this.alarmList
        }
        if (!val && this.navActive === 'yujing') {
          this.alarmListFilter = this.alarmList
        }
        if (!val && this.navActive === 'selectAlarm') {
          this.devList = this.devListClone
        }
      }
    },
    'settings.FEATURE_SETTING': {
      immediate: true,
      handler(val) {
        let arr = queryId('jingqing', val)
        arr = arr.children[0].children
        this.tabNav = []
        arr.forEach((item) => {
          this.tabNav.push({
            id: item.id,
            name: item.text,
            isActive: false
          })
        })
        this.tabNav.push({
          id: 'selectAlarm',
          name: '已选警情',
          isActive: false
        })
      },
      deep: true
    },
    'filterTextList': {
      handler(val) {
        if (!val) {
          this.POLICE_LIST = this.POLICE_LIST_COPY
        }
      }
    }
    // userUnitIdAuth: {
    //   handler(val, oldVal) {
    //     if (val && val.length > 0) {
    //       console.log('userUnitIdAuth', 2)
    //       const { navActive } = this
    //       // 等获取到单位权限 再请求警情列表
    //       if (navActive === 'cgjq') {
    //         this.tipList = this.alarmTipList
    //         this.getJq(0, '0')
    //         this.listQuery.ALARMGRADE = '0'
    //       }
    //       if (navActive === 'zdjq') {
    //         this.tipList = this.ImportantAlarmTipList
    //         this.getJq(0, '1')
    //         this.listQuery.ALARMGRADE = '1'
    //       }
    //       if (navActive === 'yujing') {
    //         this.tipList = this.alarmTipList
    //         this.getJq(1, '0')
    //       }
    //     }
    //   },
    //   immediate: true
    // }
  },
  created() {
    this.tipList = this.alarmTipList
    this.getCategory()
  },
  inject: ['mapClick'],
  mounted() {
    this.loadJq()
    const viewer = this.viewer
    const Cesium = this.cesium
    const handler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    var entity
    // 实体点击事件监听
    handler.setInputAction((movement) => {
      const pickedLabel = viewer.scene.pick(movement.position)
      var cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
      var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
      if (Cesium.defined(pickedLabel)) {
        const primitive = pickedLabel.primitive
        // console.log(ids)
        if(primitive&&primitive.dev_type === 'jq'){
          this.showDetail(primitive, true)
        }else if(primitive&&Array.isArray(primitive._ids)){
          if (primitive._ids[0].dev_type === 'jq') {
            this.devList = []
            this.devListClone = []
            primitive._ids.forEach((item) => {
              this.devList.push(item.item)
            })
            this.devListClone = cloneDeep(this.devList)
            this.navActive = 'selectAlarm'
          }
        }
      }
      // 新建警情地图标注位置
      if (this.jqPositionFlag) {
        this.clearjqPosition()
        this.listQuery.Lng = longitudeString
        this.listQuery.Lat = latitudeString
        console.log(longitudeString, latitudeString);
        entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString),
            id: 'jqPosition',
            billboard: {
              image: jqPos,
              width: 30, // 如果不设置宽高 初始化无法正常显示聚合数量
              height: 30
            }
        });
        this.jqPositionFlag = false
      }
      if (this.ercidwFlag) {
        this.clearJq()
        const TONE_voip = sessionStorage.get('TONE_voip')
        this.$api.common.SecondLocate({
          TOKEN: TONE_voip.cmd.TOKEN,
          PoliceNo: TONE_voip.cmd.POLICE_ID,
          Alarm_ID: this.detail.ALARM_ID,
          LON: longitudeString,
          lat: latitudeString
        }).then(res => {
          this.$message({
            message: res.data.msg,
            type: 'success'
          })
        }).catch((error) => {
          console.log(error)
        })
        this.ercidwFlag = false
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // 新建警情地图标注位置移动
    handler.setInputAction((click)=> {
        var pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)&&pickedObject.id && pickedObject.id._id === 'jqPosition') {
          viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
            handler.setInputAction((movement) => {
                var ray = viewer.camera.getPickRay(movement.endPosition);
                var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);

                    entity.position = Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString)
                    this.listQuery.Lng =  longitudeString
                    this.listQuery.Lat = latitudeString
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(()=> {
      viewer.scene.screenSpaceCameraController.enableInputs = true; //禁止鼠标拖动地图的默认行为
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  },
  beforeDestroy() {
    this.clearJq()
  },
  activated() {
  },
  deactivated() {
  },
  methods: {
    // 过滤人员设备
    filterUserDev(v) {
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.checkResourcelist.forEach(item => {
        if (item.power.search('1') !== -1) {
          var obj = {
            userId: item.id,
            userName: item.name,
            yonghuzxbj: item.yonghuzxbj || '1'
          }
          this.$store.commit('audioMeet/SET_addMeetingMemberList_PUSH', obj)
        }
      })
    },
    SET_checkResourceList() {
      this.checkedPOLICE_LIST.forEach(obj => {
        obj.id = obj.POLICE_ID
        obj.name = obj.POLICE_NAME || obj.userName
        obj.power = '1,2'
      })
      const arr = cloneDeep(this.checkedPOLICE_LIST)
      this.$store.commit('app/SET_checkResourceList', arr)
    },
    imtx() {
      if (this.checkedPOLICE_LIST.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      }
      this.SET_checkResourceList()
      this.filterUserDev()
      setTimeout(_ => {
        this.dialogVisible = true
      }, 0)
    },
    sureClickHandle() {
      if (this.checkedPOLICE_LIST.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      }
      this.zhoubianJWTIM(this.detail)
      this.dialogVisible = false
    },
    audioMeet() {
      if (this.checkedPOLICE_LIST.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      } else {
        this.SET_checkResourceList()
        this.$root.$emit('audioMeet', this.detail.ALARM_ID)
      }
    },
    filterPlice() {
      const obj = this.POLICE_LIST_COPY.filter(item => item.POLICE_NAME.indexOf(this.filterTextList) !== -1 || item.POLICE_ID.indexOf(this.filterTextList) !== -1)
      if (!this.filterTextList) {
        this.POLICE_LIST = this.POLICE_LIST_COPY
      } else {
        this.POLICE_LIST = obj
      }
    },
    loadJq() {
      this.$nextTick(_ => {
        const arr = queryId('jingqing', this.settings.FEATURE_SETTING)
        this.navActive = ''// 先置空 否则后面的赋值如果和初始化的navactive相同 则不会触发监听
        if (arr && arr.children && arr.children[0] && arr.children[0].children) {
          arr.children[0].children.forEach(item => {
            if (item.text === arr.children[0].active) {
              this.isShowPanel(item)
            }
          })
        }
      })
    },
    tongxun(detail) {
      if (detail.ALARMGRADE === '1') {
        // 获取通讯人员
        this.$api.majorAlarm.ImportantAlarmPolice({
          TOKEN: this.TONE_voip.cmd.TOKEN,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          Alarm_ID: `${detail.ALARM_ID}`
        }).then(res => {
          // this.POLICE_LIST = res.data.POLICE_LIST
          this.POLICE_LIST = get(res.data, 'POLICE_LIST', [])
          var hash = {}
          this.POLICE_LIST = this.POLICE_LIST.reduce(function(item, next) {
            hash[next.POLICE_ID] ? '' : hash[next.POLICE_ID] = true && item.push(next)
            return item
          }, [])
          // 调度人员数量不随搜索改变
          this.POLICE_LIST_COPY = cloneDeep(this.POLICE_LIST)
        }).catch((error) => {
          console.log(error)
        })
      } else {
        // 获取通讯人员
        this.$api.majorAlarm.getAlarmPolice({
          token: this.TONE_voip.cmd.TOKEN,
          POLICENO: this.TONE_voip.cmd.POLICE_ID,
          ALARM_ID: `${detail.ALARM_ID}`
        }).then(res => {
          this.POLICE_LIST = res.data.POLICE_LIST
          var hash = {}
          this.POLICE_LIST = this.POLICE_LIST.reduce(function(item, next) {
            hash[next.POLICE_ID] ? '' : hash[next.POLICE_ID] = true && item.push(next)
            return item
          }, [])
          // 调度人员数量不随搜索改变
          this.POLICE_LIST_COPY = cloneDeep(this.POLICE_LIST)
        }).catch((error) => {
          console.log(error)
        })
      }
    },
    // 	当table选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      this.checkedPOLICE_LIST = val
    },
    // 显示的模块
    isShowPanel(val) {
      this.navActive = val.id
      // 切换都复制空，否则切换回来会在原来搜索到保存的数据跳到加载数据
      this.filterText = ''
      this.btnActive = '按时间排序'
      this.sortState = false
      this.sortStatus = -1
      this.tipList.forEach((item) => {
        this.$set(item, 'isActive', false)
      })
    },
    // 关键词搜索
    searchBtn() {
      if (this.navActive === 'selectAlarm') {
        this.devList = this.sort({ state: this.sortState, status: this.sortStatus, filterList: this.devListClone })
      } else {
        this.alarmListFilter = this.sort({ state: this.sortState, status: this.sortStatus, filterList: this.alarmList })
      }
    },
    sortBtn(val) {
      this.btnActive = val === 'time' ? '按时间排序' : '按状态排序'
      this.sortState = val === 'state'
      this.searchBtn()
    },
    tipBtn(item) {
      // if (item.status === 1) {
      //   // 123状态合并，23状态也叫处理中，在前端处理
      //   this.tipList.filter((item) => (item.status === 1 || item.status === 2 || item.status === 3)).forEach((i) => {
      //     this.tipBtnHandle(i)
      //   })
      //   return false
      // }
      this.tipBtnHandle(item)
    },
    tipBtnHandle(item) {
      this.$set(item, 'isActive', !item.isActive)
      this.sortStatus = item.status
      this.searchBtn()
    },
    // 前端排序函数
    sort({ state = false, status = -1, filterList = this.alarmList }) {
      let arr = filterList.filter((item) => {
        return item?.ALARM_DESC?.search(this.filterText) !== -1
      })
      if (state) {
        arr.sort(function(a, b) {
          return a.ALARM_STATUS - b.ALARM_STATUS
        })
      }
      if (status > -1) {
        const tipStatus = []
        this.tipList.forEach((item) => {
          if (item.isActive) {
            // 看是重大还是常规警情的状态点击,针对后端状态合并后的警情处理
            if (item.flagAlarm && item.status !== 4) {
              tipStatus.push(0)
              tipStatus.push(1)
              tipStatus.push(2)
              tipStatus.push(3)
              return false
            }
            if (!item.flagAlarm && item.status === 1) {
              tipStatus.push(1)
              tipStatus.push(2)
              tipStatus.push(3)
              return false
            }
            tipStatus.push(item.status)
          }
        })
        if (tipStatus.length === 0) return arr
        arr = arr.filter((item) => {
          return tipStatus.includes(item.ALARM_STATUS)
        })
      }
      return arr
    },
    // 获取警情列表
    getJq(DEVICE_REPORT, alarmgrade, REPORT_TIME) {
      const TONE_voip = sessionStorage.get('TONE_voip')
      if (this.userUnitIdAuth && this.userUnitIdAuth.length === 0) return
      const auth = this.userUnitIdAuth.map(v => {
        return v.UnitId
      }).join(',')
      this.$api.common.getHisAlarm({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        how_long: 50,
        DEVICE_REPORT: DEVICE_REPORT,
        alarmgrade: alarmgrade,
        LOGIN_TIME: REPORT_TIME || parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        UNITIDS: auth
      }).then(res => {
        if (res.data) {
          if (alarmgrade !== '0') {
            // 重大警情
            if (res.data && res.data.ALARMLIST) {
              const arr = res.data.ALARMLIST.filter((item) => {
                return item.ALARMGRADE === '1'
              })
              this.alarmList = cloneDeep(arr)
              this.alarmListFilter = cloneDeep(arr)
            }
          } else {
            // 常规警情及预警
            if (res.data && res.data.ALARMLIST) {
              const arr = res.data.ALARMLIST.filter((item) => {
                return item.ALARMGRADE !== '1'
              })
              this.alarmList = cloneDeep(arr)
              this.alarmListFilter = cloneDeep(arr)
            }
          }
        }
      })
    },
    // 过滤警情状态
    statusFilter(val) {
      // return { '0': wcl, '1': yxd, '2': ycd, '3': ydd, '4': ywc }[`${val}`] || wcl
      // 123状态合并，23状态也叫处理中，在前端处理
      if (this.navActive === 'cgjq' || this.navActive === 'yujing') {
        return { '0': wcl, '1': yxd, '2': yxd, '3': yxd, '4': ywc }[`${val}`] || wcl
      }
      if (this.navActive === 'zdjq') {
        return { '0': wcl, '1': wcl, '2': wcl, '3': wcl, '4': ywc }[`${val}`] || wcl
      }
      if (this.navActive === 'selectAlarm') {
        if (this.devList && this.devList.length > 0 && this.devList[0].ALARMGRADE === '1') {
          return { '0': wcl, '1': wcl, '2': wcl, '3': wcl, '4': ywc }[`${val}`] || wcl
        } else {
          return { '0': wcl, '1': yxd, '2': yxd, '3': yxd, '4': ywc }[`${val}`] || wcl
        }
      }
    },
    // 过滤警情状态颜色
    statusFilterColor(val) {
      const a = [
        { imgUrl: wcl, text: '未处理', color: '#FF3434', status: 0, isActive: false },
        { imgUrl: yxd, text: '处理中', color: '#F39800', status: 1, isActive: false },
        { imgUrl: yxd, text: '处理中', color: '#F39800', status: 2, isActive: false },
        { imgUrl: yxd, text: '处理中', color: '#F39800', status: 3, isActive: false },
        { imgUrl: ywc, text: '已完成', color: '#22AC38', status: 4, isActive: false }
      ]
      const b = [
        { imgUrl: wcl, text: '未完成', color: '#FF3434', status: 0, isActive: false },
        { imgUrl: wcl, text: '未完成', color: '#FF3434', status: 1, isActive: false },
        { imgUrl: yxd, text: '未完成', color: '#FF3434', status: 2, isActive: false },
        { imgUrl: yxd, text: '未完成', color: '#FF3434', status: 3, isActive: false },
        { imgUrl: ywc, text: '已完成', color: '#22AC38', status: 4, isActive: false }
      ]
      if (this.navActive === 'cgjq' || this.navActive === 'yujing') {
        return (a.filter((item) => item.status === val))[0]
      }
      if (this.navActive === 'zdjq') {
        return (b.filter((item) => item.status === val))[0]
      }
      if (this.navActive === 'selectAlarm') {
        if (this.devList && this.devList.length > 0 && this.devList[0].ALARMGRADE === '1') {
          return (b.filter((item) => item.status === val))[0]
        } else {
          return (a.filter((item) => item.status === val))[0]
        }
      }
      // return (this.tipList.filter((item) => item.status === val))[0]
    },
    // 获取警情分类
    getCategory() {
      const TONE_voip = sessionStorage.get('TONE_voip')
      this.$api.common.getCategory({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        TYPE: '警情分类'
      }).then(res => {
        this.categoryList = res.data.categoryList
        this.DivisionList = this.categoryList.filter((item) => item.PARENT_ID === '-1')
      })
    },
    // 过滤警情分类
    categoryFilter(val) {
      if (get(val, 'ALARM_CLASS', '') && val.ALARM_CLASS !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_CLASS)
        if (arr.length > 0) {
          return arr[0].NAME
        } else {
          return '暂无警情分类'
        }
      }
      if (get(val, 'ALARM_GROUP', '') && val.ALARM_GROUP !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_GROUP)
        if (arr.length > 0) {
          return arr[0].NAME
        } else {
          return '暂无警情分类'
        }
      }
      if (get(val, 'ALARM_DIVISION', '') && val.ALARM_DIVISION !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_DIVISION)
        if (arr.length > 0) {
          return arr[0].NAME
        } else {
          return '暂无警情分类'
        }
      }
      return '暂无警情分类'
    },
    // 过滤警情分类/大中小
    categoryFilterAll(val) {
      let str = ''
      if (get(val, 'ALARM_DIVISION', '') && val.ALARM_DIVISION !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_DIVISION)
        if (arr.length > 0) {
          str += arr[0].NAME + '/'
        }
      }
      if (get(val, 'ALARM_GROUP', '') && val.ALARM_GROUP !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_GROUP)
        if (arr.length > 0) {
          str += arr[0].NAME + '/'
        }
      }
      if (get(val, 'ALARM_CLASS', '') && val.ALARM_CLASS !== '没有获取到类型') {
        const arr = this.categoryList.filter((item) => item.ID === val.ALARM_CLASS)
        if (arr.length > 0) {
          str += arr[0].NAME
        }
      }
      if (str) {
        // return str.slice(0, str.length - 1)
        return str
      } else {
        return '暂无警情分类'
      }
    },
    dingwei(item) {
      if (item.item.ALARM_LNG !== 0 && item.item.ALARM_LAT !== 0) {
        this.isEmpt = true // 小箭头显隐
        // this.viewer.trackedEntity = item
        this.viewer.camera.flyTo({
          destination: this.cesium.Cartesian3.fromDegrees(item.item.ALARM_LNG, item.item.ALARM_LAT, 28500), // 目标位置的经纬度和高度
          duration: 1,
          easingFunction: this.cesium.EasingFunction.linear,
          // orientation: {
          //   // 指向
          //   heading: 0.018,
          //   // 视角
          //   pitch: -0.7,
          //   roll: 6.28
          // }
        })
      } else {
        this.isEmpt = false
      }
      this.$nextTick(() => {
        this.isShowJq ? this.$refs.jqDetail.style.top = 'calc(50% - 200px)' : ''
        this.isShowJq ? this.$refs.jqDetail.style.left = 'calc(50% - 304px)' : ''
      })
    },
    filterAlarmTitle(detail) {
      let title = ''
      if (detail.DEVICE_REPORT) {
        this.tabNav.forEach((item) => {
          if (item.id === 'yujing') {
            title = item.name
          }
        })
      } else {
        if (detail.ALARMGRADE !== '1') {
          this.tabNav.forEach((item) => {
            if (item.id === 'cgjq') {
              title = item.name
            }
          })
        } else {
          this.tabNav.forEach((item) => {
            if (item.id === 'zdjq') {
              title = item.name
            }
          })
        }
      }
      return title
    },
    // 显示单个详情，bool标识是列表中点击的还是地图上点击的，地图点击为true
    showDetail(item, bool) {
      const mapInfo = item
      if (bool) {
        item = mapInfo.item
      } else {
        mapInfo.item = item
      }
      item.title = this.filterAlarmTitle(item)
      if (this.navActive !== 'selectAlarm') {
        this.devList = [item]
        this.devListClone = cloneDeep(this.devList)
      }
      // 地图点击显示详情，需要将已选资源列表更新
      if (this.navActive === 'selectAlarm' && bool) {
        this.devList = [item]
        this.devListClone = cloneDeep(this.devList)
      }
      this.dialogTableVisible && this.$emit('update:dialogTableVisible', false)
      this.isShowJq = true
      this.detail = item
      this.detailImgs = []
      this.detailAudios = []
      this.detailVideos = []
      this.myAudio = null
      this.isPlayAudio = false
      if (this.detail.ATTACHMENT && this.detail.ATTACHMENT.length > 0) {
        this.detail.ATTACHMENT.forEach((item) => {
          if (item.MSGTYPE === 1) {
            this.detailImgs.push(item)
          }
          if (item.MSGTYPE === 2) {
            // 获取语音时长并添加
            const temp = new Audio()
            temp.src = api + item.URL
            temp.addEventListener('loadedmetadata', () => {
              item.AUDIO_TIME = temp.duration.toFixed(0)
              this.detailAudios.push(item)
            })
          }
          if (item.MSGTYPE === 3) {
            this.detailVideos.push(item)
          }
        })
      }
      this.tongxun(this.detail)
      this.dingwei(mapInfo)
      this.closePjDialog()
      this.closeRecordDialog()
      this.ercidwFlag = false
    },
    filterActive(attachment, msgType) {
      if (attachment && attachment.length > 0) {
        // return attachment.filter((item) => {
        //   return item.MSGTYPE === msgType
        // })
        const arr = []
        attachment.forEach((item) => {
          if (item.MSGTYPE === msgType) {
            arr.push(item)
            // if (msgType === 2) {
            //   // 获取语音时长并添加
            //   const temp = new Audio()
            //   temp.src = api + item.URL
            //   temp.addEventListener('loadedmetadata', () => {
            //     item.AUDIO_TIME = temp.duration.toFixed(0)
            //     arr.push(item)
            //   })
            // } else {
            //   arr.push(item)
            // }
          }
        })
        return arr.length > 0 ? arr : ''
      } else {
        return ''
      }
    },
    // 关闭点位详情弹窗
    closeToneDialog() {
      this.isShowJq = false
      this.detail = null
      this.detailImgs = []
      this.detailAudios = []
      this.detailVideos = []
      this.isPlayAudio = false
      this.myAudio = null
    },
    closeDdDialog() {
      this.isShowDd = false
      this.filterTextList = ''
    },
    audioPreview(url) {
      // if (!this.myAudio) {
      //   this.myAudio = new Audio()
      //   this.myAudio.src = api + url
      //   this.myAudio.play()
      //   this.isPlayAudio = true
      //   this.myAudio.addEventListener('ended', this.endedFunc)
      // } else {
      //   if (this.myAudio.paused) { // 暂停状态
      //     this.myAudio.play()
      //     this.isPlayAudio = true
      //   } else { // 播放状态
      //     this.myAudio.pause()
      //     this.isPlayAudio = false
      //   }
      // }
      if (!this.previewAudioUrl) { // 不在在音频
        this.previewAudioUrl = api + url
        this.myAudio = new Audio()
        this.myAudio.src = api + url
        this.myAudio.play()
        this.isPlayAudio = true
        this.myAudio.addEventListener('ended', this.endedFunc)
      } else if (this.previewAudioUrl && this.previewAudioUrl === api + url) { // 存在但是还是自己(点击了正在播放或者暂停的语音)
        if (this.myAudio.paused) { // 暂停状态
          this.myAudio.play()
        } else { // 播放状态
          this.myAudio.pause()
          // 如果想要暂停完成后再次重新播放，添加一下代码，如果暂停完成后想接着播放，将下面一行代码删除即可，这样即不会出现暂停状态的情况
          this.previewAudioUrl = ''
        }
      } else if (this.previewAudioUrl && this.previewAudioUrl !== api + url) { // 存在但是是别的语音(点击了正在播放以外的语音)
        // 先暂停上一条语音并且移除监听事件ended，并手动清空此对象
        this.myAudio.pause()
        this.myAudio.removeEventListener('ended', this.endedFunc)
        this.myAudio = null
        // 播放点击的语音
        this.previewAudioUrl = api + url
        this.myAudio = new Audio()
        this.myAudio.src = api + url
        this.myAudio.play()
        this.isPlayAudio = true
        this.myAudio.addEventListener('ended', this.endedFunc)
      }
    },
    endedFunc() {
      this.myAudio = null
      this.isPlayAudio = false
      this.previewAudioUrl = ''
    },
    videoPreview(url) {
      this.previewVideoUrl = api + url
      this.preview = true
      this.$nextTick(() => {
        this.myVideo = document.getElementById('preview_video')
        this.myVideo.play()
      })
    },
    closePreview() {
      this.$nextTick(() => {
        this.myVideo.pause()
      })
    },
    // 二次定位
    ercidw(detail) {
      // console.log(detail)
      this.closePjDialog()
      this.closeRecordDialog()
      // 二次定位不做限制
      this.isShowJq = false
      this.ercidwFlag = true
      this.$message.closeAll()
      this.$message({
        message: '请点击地图以标注二次定位的位置',
        type: 'info'
      })
      // if (detail.ALARM_STATUS === 4) {
      //   this.$message.closeAll()
      //   this.$message({
      //     message: '该警情状态已完成，不可二次定位',
      //     type: 'warning'
      //   })
      // } else {
      //   this.isShowJq = false
      //   this.ercidwFlag = true
      //   this.$message.closeAll()
      //   this.$message({
      //     message: '请点击地图以标注二次定位的位置',
      //     type: 'info'
      //   })
      // }
    },
    // 警情升级
    alarmUpgrade: debounce(function(detail) {
      if (detail.ALARM_STATUS === 4) {
        this.$message.closeAll()
        this.$message({
          message: '该警情状态已完成，不用升级警情',
          type: 'warning'
        })
        return false
      }
      const TONE_voip = sessionStorage.get('TONE_voip')
      // 获取警情详情
      if (this.alarmUpgradeFlag) return false
      this.alarmUpgradeFlag = true
      this.$api.common.ImportantAlarm({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        Alarm_ID: detail.ALARM_ID,
        IS_CREATE_GROUP: '0'
      }).then(res => {
        this.alarmUpgradeFlag = false
        if (res.data.result === 1) {
          this.$message.closeAll()
          this.$message({
            message: '已升级为重大警情，跳转到重大警情！',
            type: 'success'
          })
          this.isShowJq = false
          this.navActive = 'zdjq'
        } else {
          this.$message.closeAll()
          this.$message({
            message: res.data.Msg,
            type: 'warning'
          })
        }
      }).catch((error) => {
        console.log(error)
      })
    }, 500),
    // 更改状态
    alarmFinish: throttle(function(detail) {
      if (detail.ALARMGRADE === '1') {
        this.ImportantAlarmFinish(detail)
      } else {
        this.AlarmFinish(detail)
      }
    }, 500, { 'trailing': false }),
    // 常规警情完成
    AlarmFinish(detail) {
      if (detail.ALARM_STATUS === 0) {
        this.$message.closeAll()
        this.$message({
          message: '该警情未派警，不能更改状态',
          type: 'warning'
        })
        return false
      }
      if (detail.ALARM_STATUS === 4) {
        this.$message.closeAll()
        this.$message({
          message: '该警情状态已完成，不用更改状态',
          type: 'warning'
        })
        return false
      }
      // 获取警情详情
      const TONE_voip = sessionStorage.get('TONE_voip')
      this.$api.common.GetAlarmDetail({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        Alarm_ID: detail.ALARM_ID
      }).then(res => {
        const temp = res.data.obj.handleAlarmDetail
        this.$api.common.HandleAlarm({
          TOKEN: TONE_voip.cmd.TOKEN,
          PoliceNo: TONE_voip.cmd.POLICE_ID,
          Alarm_ID: this.detail.ALARM_ID,
          LON: this.detail.ALARM_LNG,
          lat: this.detail.ALARM_LAT,
          HANDLE_STATUS: 4,
          POLICE_ID: temp[temp.length - 1].POLICE_ID,
          BACK_MSG: '完成'
        }).then(res => {
          this.$message.closeAll()
          this.$message({
            message: '该警情已更改为完成状态',
            type: 'success'
          })
        }).catch((error) => {
          console.log(error)
        })
      }).catch((error) => {
        console.log(error)
      })
    },
    // 重大警情完成
    ImportantAlarmFinish(detail) {
      if (detail.ALARM_STATUS === 4) return
      this.$confirm('将此警情更改为完成状态, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.majorAlarm.ImportantAlarmFinish({
          TOKEN: this.TONE_voip.cmd.TOKEN,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          Alarm_ID: detail.ALARM_ID,
          Feedback: '完成'
        }).then(res => {
          if (res.data.result === 1) {
            this.getJq('警情')
            this.detail.ALARM_STATUS = 4
            this.$message.closeAll()
            this.$message({
              message: '该警情已更改为完成状态',
              type: 'success'
            })
          }
        }).catch((error) => {
          console.log(error)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    // 地图点击事件
    mapClickHandle(mapClickObject) {
      if (this.ercidwFlag) {
        const TONE_voip = sessionStorage.get('TONE_voip')
        const allOverlay = this.map.getOverlays()
        if (allOverlay && allOverlay.length > 0) {
          for (let j = 0; j < allOverlay.length; j++) {
            if (allOverlay[j].flag === 'jq') {
              this.map.removeOverlay(allOverlay[j])
            }
          }
        }
        this.$api.common.SecondLocate({
          TOKEN: TONE_voip.cmd.TOKEN,
          PoliceNo: TONE_voip.cmd.POLICE_ID,
          Alarm_ID: this.detail.ALARM_ID,
          LON: mapClickObject.point.lng,
          lat: mapClickObject.point.lat
        }).then(res => {
          this.$message({
            message: res.data.msg,
            type: 'success'
          })
        }).catch((error) => {
          console.log(error)
        })
        this.ercidwFlag = false
      }
      // 新建警情地图拾取位置
      if (this.jqPositionFlag) {
        this.clearjqPosition()
        const point = new this.BMap.Point(mapClickObject.point.lng, mapClickObject.point.lat)
        const marker = new this.BMap.Marker(point, {
          enableDragging: true
        })
        marker.addEventListener('dragend', (e) => {
          this.listQuery.Lng = e.point.lng
          this.listQuery.Lat = e.point.lat
          var gc = new this.BMap.Geocoder()
          gc.getLocation(e.point, (rs) => {
            this.listQuery.address = rs.address
          })
        })
        marker.flag = 'jqPosition'
        this.map.addOverlay(marker)
        this.listQuery.Lng = mapClickObject.point.lng
        this.listQuery.Lat = mapClickObject.point.lat
        var gc = new this.BMap.Geocoder()
        gc.getLocation(point, (rs) => {
          this.listQuery.address = rs.address
        })
        this.jqPositionFlag = false
      }
    },
    clearJq() {
      if (this.yuJingEntities) {
       this.viewer.scene.primitives.remove(this.yuJingEntities)
       this.yuJingEntities=null
      }
    },
    // 派警按钮
    pajing(detail) {
      if (detail.ALARM_STATUS === 4) {
        this.$message.closeAll()
        this.$message({
          message: '该警情状态已完成，不可派警',
          type: 'warning'
        })
        return false
      }
      this.isShowPj = true
      this.closeRecordDialog()
    },
    // 调度按钮
    ddBtn(detail) {
      if (this.POLICE_LIST.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '没有派遣人员，无需调度',
          type: 'warning'
        })
        return false
      }
      if (!this.isShowDd) {
        this.checkedPOLICE_LIST = []
      }
      this.isShowDd = true
    },
    zhoubian(detail) {
      this.isShowZhoubian = true
    },
    // 处置记录
    record(detail) {
      if (detail.ALARMGRADE === '1') {
        this.ZDrecord(detail)
      } else {
        this.CGrecord(detail)
      }
    },
    // 常规处置记录
    CGrecord(detail) {
      const TONE_voip = sessionStorage.get('TONE_voip')
      // 获取警情详情
      this.$api.common.GetAlarmDetail({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        Alarm_ID: detail.ALARM_ID
      }).then(res => {
        if (!res.data.obj.handleAlarmDetail) {
          this.activities = []
        } else {
          this.activities = res.data.obj.handleAlarmDetail
        }
        this.isShowRecord = true
        this.closePjDialog()
      }).catch((error) => {
        console.log(error)
      })
    },
    // 重大处置记录
    ZDrecord(detail) {
      if (this.isShowRecord) return false
      const TONE_voip = sessionStorage.get('TONE_voip')
      this.$api.majorAlarm.GetCmdPoliceHis({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        Alarm_ID: detail.ALARM_ID
      }).then(res => {
        this.activities = res.data.CmdPoliceList
        this.isShowRecord = true
        this.isShowPj = false
      }).catch((error) => {
        console.log(error)
      })
    },
    // 关闭派警弹窗
    closePjDialog() {
      this.isShowPj = false
    },
    // 关闭处置记录弹层
    closeRecordDialog() {
      this.isShowRecord = false
    },
    // 创建警情相关事件
    addJq() {
      const TONE_voip = sessionStorage.get('TONE_voip')
      this.listQuery.ReporterName = TONE_voip.cmd.POLICE_NAME
      this.listQuery.UNIT_ID = TONE_voip.cmd.UNIT_NAME
      this.creatJq = true
    },
    creatJqSure() {
      this.clearjqPosition()
      const TONE_voip = sessionStorage.get('TONE_voip')
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          const temp = {
            Token: TONE_voip.cmd.TOKEN,
            PoliceNo: TONE_voip.cmd.POLICE_ID,
            Source: 'App',
            ReporterName: this.listQuery.ReporterName,
            ReportTel: this.listQuery.ReportTel,
            address: this.listQuery.address,
            Lng: this.listQuery.Lng || 0,
            Lat: this.listQuery.Lat || 0,
            Desc: this.listQuery.Desc,
            Division: this.listQuery.Division,
            Group: this.listQuery.Group,
            Class: this.listQuery.Class,
            ALARM_STATUS: 0,
            ALARMGRADE: this.listQuery.ALARMGRADE,
            IS_CREATE_GROUP: this.listQuery.ALARMGRADE === '1' ? '0' : ''
          }
          this.$api.common.ReportAlarm(temp).then(res => {
            if (res.data.result) {
              this.$message({
                message: '新建警情成功！',
                type: 'success'
              })
              this.listQuery.ALARMGRADE === '0' ? this.navActive === 'cgjq' : this.navActive === 'zdjq'
              this.closeCreatJq()
              this.creatJq = false
            } else {
              if (res.data.msg === '无效的警情地址!') {
                this.$message({
                  message: '请输入警情位置',
                  type: 'error'
                })
              } else {
                this.$message.error(res.data.msg || '添加失败！')
              }
            }
          }).catch((err) => {
            this.$message.error('添加失败！')
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    closeCreatJq() {
      this.$refs['ruleForm'].resetFields()
      this.listQuery.Lat = ''
      this.creatJq = false
      this.clearjqPosition()
      this.GroupList = []
      this.ClassList = []
    },
    clearjqPosition() {
      this.viewer.entities.removeById('jqPosition')
    },
    DivisionChange(val) {
      this.GroupList = this.categoryList.filter((item) => item.PARENT_ID === val)
      this.listQuery.Group = ''
      this.listQuery.Class = ''
    },
    GroupChange(val) {
      this.ClassList = this.categoryList.filter((item) => item.PARENT_ID === val)
      this.listQuery.Class = ''
    },
    ClassChange(val) {
      // this.ClassList = this.categoryList.filter((item) => item.PARENT_ID === val)
    },
    jqPosition() {
      this.jqPositionFlag = true
      this.$message.closeAll()
      this.$message({
        message: '请点击地图以标注警情的位置',
        type: 'info'
      })
    },
    zhoubianJWTIM(detail) {
      var MEMBER_LIST = this.checkedPOLICE_LIST.map(v => {
        return { 'POLICE_ID': v.POLICE_ID }
      })
      const filterOBJ = (arr, filterField) => {
        // 对左侧调度人员 和弹窗选择人员去重
        const newArr = arr.reduce((pre, cur) => pre.some(item => Number(item[filterField]) === Number(cur[filterField]))
          ? pre : [...pre, cur], [])
        return newArr
      }
      MEMBER_LIST = filterOBJ(MEMBER_LIST, 'POLICE_ID')
      MEMBER_LIST.push({ 'POLICE_ID': this.TONE_voip.cmd.POLICE_ID })
      var data = {
        OPERATOR: this.userInfo.userName,
        GROUP_NAME: `${detail.ALARM_ID}-${parseTime(new Date(), '{m}{d}{h}:{i}')}`,
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        MEMBER_LIST: MEMBER_LIST,
        TEMP: '1',
        ALARM_ID: detail.ALARM_ID
      }
      this.$api.im.CreateGroup(data).then(res => {
        this.groupMember = []
        this.checkedPOLICE_LIST.forEach((item) => {
          this.groupMember.push({
            yonghuname: item.POLICE_NAME,
            yonghuid: item.POLICE_ID,
            UnitId: item.UNIT_ID,
            UnitName: item.UNIT_NAME,
            TYPE: '0',
            unRead: 0,
            MSG_LIST: [],
            loadNumber: 1
          })
        })
      })
    },
    videoMeetHandle() {
      if (this.checkedPOLICE_LIST.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      } else {
        // this.POLICE_LIST = this.checkedPOLICE_LIST
        // this.isShowTongxun = true
        this.SET_checkResourceList()
        this.$root.$emit('videoMeetHandle', true)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.yujing {
   .boxyujingWrap {
    position: fixed;
    width: 360px;
    min-width: 260px;
    left: 0px;
    margin-left: 20px;
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    .arrow {
      position: absolute;
      height: 90px;
      top: calc(50% - 45px);
      right: -9px;
      cursor: pointer;
      object-fit: fill;
    }
  }
   .leftpos{
    margin-left: 45px !important;
  }
  .yujingWrap{
    height: 100%;
    width: 100%;
    // position: fixed;
    // width: 360px;
    // min-width: 260px;
    // left: 0px;
    // margin-left: 20px;
    // top: 0px;
    // margin-top: 0.85rem;
    // height: calc(100% - 1.7rem);
    // min-height: 400px;
    .leftWrap {
      width: 30px;
      height: 100%;
      position: absolute;
      left: 5px;
      top: 15px;
      .tabContainer {
        width: 30px;
        position: absolute;
        left: 0px;
        height: calc(100% - 26px);
        .tab-cards{
          box-sizing: content-box;
          width: 28px;
          height: 100%;
          background: linear-gradient(0deg, #2A7AA2, #055984);
          border: 1px solid #01CFFF;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          li{
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            width: 28px;
            float: left;
            height: 25%;
            color: #00d8ff;
            cursor: pointer;
            user-select: none;
            box-sizing: border-box;
            flex:1;
            //自适应均分
            span {
              display: inline-block;
              width: 14px;
              word-break: break-all;
              line-height: 2;
            }
            &.active{
              color: #fff;
              height: 25%;
              background: url('../../../assets/images/equipment/active.png') no-repeat;
              background-size: 100% 100%;
            }
          }
        }
      }
    }
    .rightWrap {
      float: right;
      width: 100%;
      height: 100%;
    }
    ::v-deep .filter {
      width: 100%;
      padding: 15px 10px 15px 40px;
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
        right: 10px;
        .img {
          margin-top: 17px;
          cursor: pointer;
        }
      }
    }
    .btnWrap {
      width: 310px;
      margin-left: 40px;
      .btn{
        background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
        background-size: 100% 100%;
        width: 150px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        margin-right: 10px;
        cursor: pointer;
        &:last-child {
          margin-right: 0;
        }
        &.active, &:hover {
          background: url('../../../assets/images/equipment/btnBgActive.png') no-repeat;
          background-size: 100% 100%;
          color: #fff;
        }
      }
    }
    .tipWrap {
      width: 310px;
      height: 34px;
      border: 1px solid rgba(52, 193, 218, 0.6);
      margin-top: 15px;
      margin-left: 40px;
      padding: 0 5px;
      display: flex;
      justify-content: space-between;
      .tip {
        float: left;
        width: 70px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        margin-top: 4px;
        padding: 0 4px;
        cursor: pointer;
        border: 1px solid transparent;
        // background: linear-gradient(0deg, #2A7AA2, #055984);
        img {
          width: 18px;
          height: 18px;
          margin-top: 3px;
        }
        span {
          color: #BAD5DA;
          font-size: 12px;
        }
        &.active, &:hover {
          border: 1px solid #2d6977;
          background: rgba(0, 85, 128, 0.8);
          border-radius: 2px;
        }
      }
    }
    .tab-con{
      position: absolute;
      top: 145px;
      left: 40px;
      right: 10px;
      bottom: 50px;
      overflow: auto;
      ::v-deep .t01_tree {
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
      .tab-con-item{
        position: absolute;
        width: 100%;
        height: 100%;
        transition: all .2s linear;
        left: -100%;
        background-size: cover;
        z-index: 1001;
        .item {
          padding: 8px 0 8px 10px;
          border-bottom: 1px solid #0F5A9D;
          cursor: pointer;
          height: 68px;
          .left {
            width: 18px;
            height: 18px;
            margin-right: 5px;
            margin-top: -3px;
          }
          .right {
            width: calc(100% - 23px);
            font-size: 12px;
            color: #fff;
            position: relative;
            .top {
              font-size: 12px;
              color: #fff;
              line-height: 1.2;
              .type {
                color: #34C1DA;
                margin-left: -7px;
              }
              .event {
                color: #fff;
              }
            }
            .bottom {
              font-size: 12px;
              color: #94a9ad;
              margin-top: 6px;
              .addr {
                line-height: 1.2;
              }
              .time {
                margin-top: 6px;
              }
            }
            .dingwei {
              position: absolute;
              bottom: -2px;
              right: 5px;
              width: 18px;
              cursor: pointer;
            }
          }
          &:last-child {
            border-bottom: none;
          }
        }
        .empty {
          color: #eae5e5;
          text-align: center;
          margin-top: 20px;
        }
      }
      .tab-con-item.active{left: 0; z-index: 1002;}
    }
    .btnWrapSingle {
      width: 310px;
      margin-left: 40px;
      position: absolute;
      right: 10px;
      bottom: 10px;
      .btn{
        width: 100%;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        background: linear-gradient(0deg, #2A7AA2, #055984);
        border: 1px solid #01CFFF;
        border-radius: 2px;
        color: #00d8ff;
        cursor: pointer;
        width: 100%;
        // &:hover {
        //   background: url('../../../assets/images/equipment/btnBgActive.png') no-repeat;
        //   background-size: 100% 100%;
        //   color: #fff;
        // }
      }
    }
  }
  // 警情详情
  .tone_sip_dialog{
    width: 280px;
    height: 400px;
    color: #fff;
    position: fixed;
    .sanjiao {
      position: absolute;
      content: "";
      height: 0;
      width: 0;
      top: calc(50% - 8px);
      right: -15px;
      border: solid transparent;
      border-width: 8px;
      border-left-color: #327a8e;
    }
    .jqBox {
      width: 100%;
      height: 100%;
      .tone_sip_dialog_tit{
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
      .tone_sip_con{ width: 100%; height: calc(100% - 41px);padding: 0 10px 10px;}
      .tone_sip_con_c{
        height: calc(100% - 70px);
        overflow: auto;
        .name {
          font-family: PingFang SC;
          font-size: 12px;
          margin-top: 5px;
          .left {
            color: #becad2;
            width: 64px;
            margin-top: 4px;
          }
          .right {
            color: #fff;
            width: calc(100% - 64px);
            line-height: 20px;
            &.person {
              color: #34C1DA;
              .btn{
                cursor: pointer;
                background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
                background-size: 100% 100%;
                width: 70px;
                height: 20px;
                line-height: 20px;
                font-size: 12px;
                display: inline-block;
                color: #01cfff;
                text-align: center;
              }
            }
          }
          &:first-child {
            img {
              width: 16px;
              margin-top: 2px;
            }
            .text {
              color: #fff;
              line-height: 20px;
              margin-top: 0;
              margin-left: 4px;
            }
          }
          &:nth-child(3),&.pic  {
            .left {
              letter-spacing: 4px;
            }
          }
          &.alarmAudio {
            .audioCon {
              width: 100px;
              cursor: pointer;
              display: inline-block;
              font-size: 12px;
              font-family: MicrosoftYaHei;
              color: #FAFDFF;
              background: rgba(114, 178, 208, 0.5);
              padding: 4px 8px;
              margin-top: 0px;
              position: relative;
              #preview_audio {
                display: none;
              }
              .audioleft {
                display: none;
              }
              .audioIcon_right {
                width: 18px;
                height: 18px;
                float: left;
                box-sizing: border-box;
                overflow: hidden;
                transform: rotate(135deg) translate(-2px, -2px);
                .wifi-circle {
                  border: 1px solid #FAFDFF;
                  border-radius: 50%;
                  position: absolute;
                }
                .first {
                  width: 3px;
                  height: 3px;
                  background:#FAFDFF;
                  top: 15px;
                  left: 15px;
                }
                .second {
                  width: 10px;
                  height: 10px;
                  top: 11px;
                  left: 11px;
                }
                .third {
                  width: 16px;
                  height: 16px;
                  top: 7px;
                  left: 7px;
                }
              }
              .wifi-symbol {
                .second {
                  animation: fadeInOut 1s infinite 0.2s;
                }
                .third {
                  animation: fadeInOut 1s infinite 0.4s;
                }
                @keyframes fadeInOut {
                  0% {
                    opacity: 0; /*初始状态 透明度为0*/
                  }
                  100% {
                    opacity: 1; /*结尾状态 透明度为1*/
                  }
                }
              }
              .audioTime {
                margin-top: 2px;
                float: left;
              }
              &:nth-of-type(2) {
                margin-top: 5px;
                margin-left: 64px;
              }
            }
          }
          &.alarmVideo {
            .chatVideo {
              cursor: pointer;
              float: left;
              width: 50px;
              padding: 4px 0px;
              margin-top: 0px;
              position: relative;
              .videoPaly {
                position: absolute;
                width: 30px;
                height: 30px;
                left: 50%;
                margin-left: -15px;
                top: 50%;
                margin-top: -15px;
              }
              .video_size {
                position: absolute;
                color: #fff;
                left: 5px;
                bottom: 10px;
                font-size: 12px;
              }
            }
          }
        }
        .type {
          .right {
            color: #34C1DA;
          }
        }
      }
      .btnWrap {
        border-top: 1px solid #497a7a;
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
          margin-top: 10px;
          margin-right: 10px;
          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }
    }
  }
  // 调度详情
  .dd_dialog{
    width: 400px;
    height: 400px;
    color: #fff;
    position: fixed;
    top: calc(50% - 200px);
    left: calc(50% + 22px);
    .jqBox {
      width: 100%;
      height: 100%;
      .dd_dialog_tit{
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
      .dd_con{ width: 100%; height: calc(100% - 41px);padding: 10px 10px 10px;}
      .dd_con_c{
        height: calc(100% - 40px);
        overflow: auto;
        ::v-deep .el-input__inner{
          height: 30px;
          border: 1px solid #197491;
          background-color: #265872;
          color: #fff;
          font-size: 12px;
          margin-bottom:5px;
        }
        ::v-deep .el-input__suffix{
          cursor: pointer;
          top: 3px;
          right:0;
        }
        .el-tab-pane-con {
          height: calc(100% - 35px);
        }
      }
      .btnWrap {
        border-top: 1px solid #497a7a;
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
          margin-top: 10px;
          margin-right: 70px;
          &:nth-child(3n) {
            margin-right: 0;
          }
        }
      }
    }
  }
  .record_dialog{
    width: 280px;
    height: 400px;
    color: #fff;
    position: fixed;
    top: calc(50% - 200px);
    left: calc(50% + 22px);
    // margin-top: 140px;
    // margin-right: 690px;
    .record_dialog_tit{
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
    .record_con{ width: 100%; height: calc(100% - 41px);padding: 0px 10px 10px;}
    .record_con_c{
      height: calc(100% - 5px);
      padding: 5px;
      overflow: auto;
      ::v-deep .el-timeline {
        .el-timeline-item {
          .el-timeline-item__tail {
            border-left: 2px solid #01d3f9;
          }
          .el-timeline-item__node {
            background-color:#01d3f9;
          }
          .el-timeline-item__wrapper {
            .el-timeline-item__timestamp {
              color: #34C1DA;
            }
            .el-timeline-item__content {
              color: #fff;
              line-height: 20px;
              font-size: 12px;
            }
          }
        }
      }
      .untreated {
        text-align: center;
        padding-top: 50px;
      }
      .alarmAudio {
        .aud {
          width: calc(100% - 60px);
        }
        .audioCon {
          width: 100px;
          cursor: pointer;
          display: inline-block;
          font-size: 12px;
          font-family: MicrosoftYaHei;
          color: #FAFDFF;
          background: rgba(114, 178, 208, 0.5);
          padding: 4px 8px;
          margin-top: 0px;
          position: relative;
          #preview_audio {
            display: none;
          }
          .audioleft {
            display: none;
          }
          .audioIcon_right {
            width: 18px;
            height: 18px;
            float: left;
            box-sizing: border-box;
            overflow: hidden;
            transform: rotate(135deg) translate(-2px, -2px);
            .wifi-circle {
              border: 1px solid #FAFDFF;
              border-radius: 50%;
              position: absolute;
            }
            .first {
              width: 3px;
              height: 3px;
              background:#FAFDFF;
              top: 15px;
              left: 15px;
            }
            .second {
              width: 10px;
              height: 10px;
              top: 11px;
              left: 11px;
            }
            .third {
              width: 16px;
              height: 16px;
              top: 7px;
              left: 7px;
            }
          }
          .wifi-symbol {
            .second {
              animation: fadeInOut 1s infinite 0.2s;
            }
            .third {
              animation: fadeInOut 1s infinite 0.4s;
            }
            @keyframes fadeInOut {
              0% {
                opacity: 0; /*初始状态 透明度为0*/
              }
              100% {
                opacity: 1; /*结尾状态 透明度为1*/
              }
            }
          }
          .audioTime {
            margin-top: 2px;
            float: left;
          }
        }
      }
      .alarmVideo {
        .chatVideo {
          cursor: pointer;
          float: left;
          width: 50px;
          padding: 4px 0px;
          margin-top: 0px;
          position: relative;
          margin-right: 10px;
          .videoPaly {
            position: absolute;
            width: 30px;
            height: 30px;
            left: 50%;
            margin-left: -15px;
            top: 50%;
            margin-top: -15px;
          }
          .video_size {
            position: absolute;
            color: #fff;
            left: 5px;
            bottom: 10px;
            font-size: 12px;
          }
        }
      }
    }
  }
  // 新建警情
  .creatJq_dialog{
    width: 290px;
    height: 560px;
    color: #fff;
    position: absolute;
    top: 0;
    left: 390px;
    .creatJq_dialog_tit{
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
    .creatJq_con{ width: 100%; height: calc(100% - 41px);padding: 0 10px 10px;}
    .creatJq_con_c{
      height: calc(100% - 35px);
      overflow: hidden;
      ::v-deep .listQuery {
        .el-form-item {
          margin-bottom: 16px;
          .el-form-item__label {
            color:#00d8ff;
            font-size: 12px;
            font-weight: 500 !important;
            padding-right: 0px;
          }
          &:first-child {
            margin-top: 10px;
            .el-form-item__label {
              letter-spacing: 3px;
            }
          }
          .el-form-item__content {
            // width: 170px;
            p {
              font-size: 12px;
              width: 100%;
            }
          }
          &.jqGrade {
            .el-radio__label {
              font-size: 12px;
              color: #fff;
            }
            .el-radio.is-checked {
              .el-radio__inner {
                border-color: #01cfff;
                background: #01cfff;
              }
              .el-radio__label {
                color: #01cfff;
              }
            }
          }
          &.jqPosition {
            .el-form-item__label {
              padding-left: 11px;
            }
          }
        }
        .filter {
          width: 100%;
          .el-input__inner {
            border: 1px solid #01cfff;
            background-color: rgba(0, 85, 128, 0.6);
            color: #fff;
            font-size: 12px;
            padding: 0 7px;
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
          .el-input__prefix {
            .el-input__icon {
              line-height: 30px;
              // color:#0fabd4;
            }
          }
          .el-input-group__append {
            color:#0fabd4;
            font-size: 16px;
            background-color: rgba(0, 85, 128, 0.6);
            border: 1px solid #01cfff;
            border-left: none;
            padding: 0 20px;
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            .el-button--mini {
              padding: 7px 10px;
            }
          }
        }
        .el-select {
          width: 100%;
          .el-input__inner {
            width: 100%;
            // height: 30px;
            // line-height: 30px;
            background-color: rgba(0, 85, 128, 0.6);
            border: 1px solid #01cfff;
            color: rgba(250, 253, 255, 1);
            font-size: 12px;
            padding: 0 7px;
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
          .el-select-dropdown {
            left: 0px !important;
          }
        }
        .el-textarea__inner {
          background-color: rgba(0, 85, 128, 0.6);
          border: 1px solid #01cfff;
          color: rgba(250, 253, 255, 1);
          font-size: 12px;
          padding: 5px 7px;
          line-height: 1.5;
        }
      }
    }
    .btnWrap {
      border-top: 1px solid #497a7a;
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
        margin-top: 10px;
      }
    }
  }
  .tone_sip-t84{
    top: 140px;
    bottom: 140px;
    right: 20px;
    min-height: 300px;
  }
}
</style>
