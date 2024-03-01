<template>
  <div id="setting-main" class="setting">
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <!-- 导航 -->
    <div class="head">
      <ul class="tab-cards">
        <li
          v-for="(item, i) in tabNav"
          :key="i"
          :class="navActive == item.id ? 'active' : ''"
          @click="isShowPanel(item.id)"
        >
          {{ item.name }}
        </li>
      </ul>
      <Footer
        :style="{
          height: '80px',
          position: 'absolute',
          top:'50px',
          right:'100px'
        }"
        :disable="isDisabled"
        @update="updateConfig"
        @reset="resetConfig"
      />
    </div>
    <!-- 主体 -->
    <div v-loading="loading" class="body" :class="{'stop-apply':isDisabled}">
      <div v-show="navActive == 'xmpz'&&queryId('xmpz',settings.FEATURE_SETTING).isOpen" :class="{'stop-ally':settings.GLOBAL_PROJECT_CONFIG==='1'}">
        <div class="box-child">
          <div class="left">系统名称：</div>
          <el-input
            v-model.trim="settings.TITLE"
            style="width: 310px; border-radius: 0 !important"
            class="filter"
            type="text"
            :maxlength="20"
            @keyup.native="settings.TITLE=settings.TITLE.replace(/\s+/g, '')"
          />
        </div>
        <div class="box-child">
          <div class="logo">系统LOGO：</div>
          <el-upload
            ref="uploadMutiple"
            :action="api+'/rstoneCmd/Service/UpLoad'"
            name="file"
            :show-file-list="false"
            :on-change="handleChange"
            :before-upload="beforeAvatarUploadImg"
            :auto-upload="true"
            :on-success="imgSuccess"
          >
            <img
              :src="api+settings.LOGO_URL"
              alt="logo"
              @mouseenter="showImg = true"
            >
            <div
              v-show="showImg"
              class="button"
              @mouseenter="showImg = true"
              @mouseleave="showImg = false"
            >
              <li
                slot="trigger"
                type="primary"
                size="small"
                @click="submitUpload"
              >
                点击上传
              </li>

              <li
                slot="none"
                type="primary"
                size="small"
                style="margin-left: 0"
                @click.self.prevent="handlePictureCardPreview"
              >
                查看大图
              </li>
            </div>
            <i
              v-show="showImg"
              title="删除"
              class="el-icon-close close"
              @click.self.prevent="deleteImg"
            />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="api+dialogImageUrl" alt="">
          </el-dialog>
          <div class="right demand">
            <p>LOGO上传要求</p>
            <p>1. 格式为JPG、JPEG、PNG、ICO</p>
            <p>2. 大小不能超过8MB</p>
          </div>
        </div>

      </div>
      <div v-show="navActive == 'gnpz'&&queryId('gnpz',settings.FEATURE_SETTING).isOpen" class="config">
        <div
          v-for="(item, i) in settings.FEATURE_SETTING"
          v-if="item&&item.show&&queryPath(item.id,moduleInfo).DISPLAY"
          :key="i"
          class="first-tier"
          :class="{'stop-ally':settings.GLOBAL_FUNCTION_CONFIG==='1'}"
        >
          <!-- 一级标题 -->
          <div v-if="item&&item.show" class="first-box">
            <InputEdit
              :value="settings.GLOBAL_FUNCTION_CONFIG==0?queryPath(item.id,moduleInfo).NAME:item.text"
              :key-name="item.id"
              :should="false"
              @change="changeText"
            />
            <el-checkbox
              v-if="'isOpen' in item&&item.id!=='pzgl'"
              v-model="item.isOpen"
            >开启</el-checkbox>
          </div>
          <!-- 二级标题 -->
          <div
            v-for="(obj, index) in item.children"
            v-if="(item.children &&item&&item.isOpen&&item.id!=='pzgl'&&(queryPath(obj.id,moduleInfo).DISPLAY)||item.id==='spdd')"
            :key="index"
            class="second-box"
          >
            <!-- 二级标题 -->
            <div v-if="obj&&obj.show">
              <div>
                <InputEdit
                  v-if="obj.isEdit"
                  :should="false"
                  :value="settings.GLOBAL_FUNCTION_CONFIG==0?queryPath(obj.id,moduleInfo).NAME:obj.text"
                  :key-name="obj.id"
                  @change="changeText"
                />
                <div v-else style="margin-right: 0.55rem; min-width: 66px">
                  {{ obj.text }}
                </div>
              </div>
              <el-checkbox
                v-if="'isOpen' in obj"
                v-model="obj.isOpen"
              >开启</el-checkbox>
              <el-checkbox
                v-if="'isSpread' in obj"
                v-model="obj.isSpread"
              >默认展开</el-checkbox>
            </div>
            <!-- 三级标题 -->
            <div
              v-for="(items, ind) in obj.children"
              v-if="((obj.children &&obj&&obj.isOpen)||(!('isOpen' in obj)))&&obj&&obj.show"
              :key="ind"
              class="three-box"
            >
              <div>{{ items.id==="txtc-csjz"?'初始上图':items.text }}</div>
              <div v-if="items.isInput">
                <div v-if="items.placeholder">经度：</div>
                <el-input
                  v-if="items.isLon"
                  v-model.trim="items.longitude"
                  placeholder="请输入经度"
                  style="margin-right: 10px"
                  @keyup.native="items.longitude=items.longitude.replace(/\s+/g, '')"
                />
                <div v-if="items.placeholder">纬度：</div>
                <el-input
                  v-if="items.isLon"
                  v-model.trim="items.latitude"
                  placeholder="请输入纬度"
                  @keyup.native="items.latitude=items.latitude.replace(/\s+/g, '')"
                />
                <el-input-number v-if="items.isInput && !items.isLon" v-model="items.value" :min="5" :max="18" style="width:60px" controls-position="right" @keyup.native="items.value=items.value.replace(/\s+/g, '')" />
                <!-- 设置的百度地图缩放大小5 ~ 18之间   -->
              </div>
              <!-- 视频调度分屏 -->
              <el-select v-if="items.isSelect" v-model="items.value" placeholder="请选择">
                <el-option
                  v-for="(items, inds) in spddSettingArr"
                  :key="inds"
                  :label="items.value"
                  :value="items.value"
                />
              </el-select>
              <div
                v-for="(listObj, lid) in items.children"
                v-if="'children' in items"
                :key="lid"
              >
                <el-radio
                  v-if="items.isRadio&&listObj.id!='zdjq'"
                  v-model="items.active"
                  :label="listObj.text"
                />
                <el-checkbox v-else-if="listObj.id!='zdjq'" v-model="listObj.checked" />
                <InputEdit
                  v-if="listObj.id!='zdjq'"
                  :value="listObj.text"
                  :should="'isEdit' in listObj"
                  :key-name="listObj.id"
                  @change="changeText"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="navActive == 'ysppz'">
        <div
          v-for="(item, i) in settings.EQUIP_CONFIG"
          :key="i"
          class="videoConfig"
        >
          <div>{{ item.text }}：</div>
          <div v-for="(obj, ind) in item.children" :key="ind">
            {{ obj.text }}：
            <el-select v-model="obj.value" placeholder="请选择">
              <el-option
                v-for="(items, inds) in obj.children"
                :key="inds"
                :label="items.text"
                :value="items.text"
              />
            </el-select>
          </div>
        </div>
        <!-- <Footer
          :style="{
            position: 'relative',
          }"
          @update="updateConfig"
          @reset="resetConfig"
        /> -->
      </div>
      <div v-show="navActive == 'lzpz'&&queryId('lzpz',settings.FEATURE_SETTING).isOpen" :class="{'stop-ally':Recording.GLOBAL_CONFIG===1}">
        <el-checkbox-group v-model="checkedRecord" class="custom-record">
          <div v-for="city in RecordArr" :key="city" class="record-box">
            <div>
              {{ city +':' }}
            </div>
            <el-checkbox :label="city">自动录制</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <div v-show="navActive == 'lthjpz'&&queryId('lthjpz',settings.FEATURE_SETTING).isOpen" :class="{'stop-ally':settings.GLOBAL_FUNCTION_CONFIG==='1'}" class="phone-hj">
        <div>
          <el-checkbox v-model="isOpenTel" @change="openPhone" />
          <span>启用联动话机功能</span>
          <div>
            该功能开启期间，所有语音呼叫的通话均被转到设置的联动话机上，
          </div>
          <div>或由联动话机发起相关操作。</div>
        </div>
        <div v-if="isOpenTel">
          <span>联动类型：</span>
          <el-select
            v-model="activePhoneType"
            placeholder="请选择"
          >
            <el-option
              v-for="(items, inds) in selectOption"
              :key="inds"
              :label="items"
              :value="items"
            />
          </el-select>  <div v-if="settings.PHONE_SETTING&&settings.PHONE_SETTING.isOpen">
            <div class="InputHead">
              <span>联动号码组：</span>
              <span>请至少配置一个联动话机</span>
            </div>
            <div
              v-for="(item, i) in phoneGroup"
              :key="i"
              class="flexInput"
            >
              <div>{{ '号码'+(Number(i)+1) }}:</div>
              <el-input v-model.trim="item.value" :min="0" type="number" placeholder="请输入号码" />
              <i
                v-if="i == 0"
                class="el-icon-plus"
                title="新增"
                @click="addPhone"
              />
              <i
                v-if="i != 0"
                class="el-icon-delete"
                title="删除"
                @click="deletePhone(i)"
              />
            </div>
          </div>
        </div>

      </div>
      <div v-show="navActive == 'xtbb'&&queryId('xtbb',settings.FEATURE_SETTING).isOpen">
        <div class="version">当前版本：{{ version }}</div>
      </div>
    </div>

  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import InputEdit from '@/views/setting/inputEdit'
import axios from 'axios'
import { queryId, changeIco } from '@/utils'
import Footer from './Footer'
import { api } from '@/api/env'
import { get } from 'lodash'
import { mapGetters } from 'vuex'
export default {
  name: 'Setting',
  components: { InputEdit, Footer },
  data() {
    return {
      pzgl: sessionStorage.get('pzgl'),
      moduleInfo: sessionStorage.get('moduleInfo'),
      api,
      valueTimer: null,
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      isActive: false,
      dialogImageUrl: '',
      dialogVisible: false,
      queryId,
      tabNav: [
        {
          // eslint-disable-next-line quotes
          name: "项目配置",
          isActive: false,
          id: 'xmpz'
        },
        {
          name: '功能配置',
          isActive: false,
          id: 'gnpz'
        },
        // {
        //   name: '音视频配置',
        //   isActive: false
        // },
        // {
        //   name: '录制配置',
        //   isActive: false,
        //   id: 'lzpz'
        // },
        {
          name: '联动话机配置',
          isActive: false,
          id: 'lthjpz'
        },
        {
          name: '系统版本',
          isActive: false,
          id: 'xtbb'
        }
      ],
      navActive: '项目配置',
      settings: {
        TITLE: '融合通信指挥调度平台',
        PHONE_SETTING: {
          phoneType: {
            text: '联动类型',
            children: [
              { checked: true, text: '振铃组' },
              { checked: false, text: '轮询组' }
            ],
            value: '振铃组'
          },
          isOpen: true,
          phoneGroup: [
            { text: '号码1', value: '' },
            { text: '号码2', value: '' },
            { text: '号码3', value: '' },
            { text: '号码4', value: '' }
          ]
        },
        LOGO_URL: '/T01.ico',
        FEATURE_SETTING: [
          {
            isOpen: true,
            children: [
              {
                isOpen: true,
                isSpread: true,
                children: [
                  {
                    isEdit: false,
                    active: '常规警情',
                    id: 'csjz',
                    text: '初始加载',
                    children: [
                      {
                        isEdit: true,
                        checked: true,
                        id: 'cgjq',
                        text: '常规警情'
                      },
                      {
                        isEdit: true,
                        checked: false,
                        id: 'zdjq',
                        text: '重大警情'
                      },
                      {
                        isEdit: true,
                        checked: false,
                        id: 'yujing',
                        text: '预警'
                      }
                    ],
                    isRadio: true
                  }
                ],
                isEdit: true,
                id: 'jingqing',
                text: '警情'
              },
              {
                isOpen: true,
                isSpread: true,
                children: [
                  {
                    isEdit: false,
                    active: '人员',
                    id: 'resource-csjz',
                    text: '初始加载',
                    children: [
                      {
                        isEdit: true,
                        checked: true,
                        id: 'person',
                        text: '人员'
                      },
                      {
                        isEdit: true,
                        checked: false,
                        id: 'txzy',
                        text: '通信资源'
                      },
                      {
                        isEdit: true,
                        checked: false,
                        id: 'jqdj',
                        text: '集群对讲'
                      }
                    ],
                    isRadio: true
                  }
                ],
                isEdit: true,
                id: 'resource',
                text: '资源'
              },
              {
                isOpen: true,
                children: [
                  {
                    isEdit: false,
                    id: 'txtc-csjz',
                    text: '初始加载',
                    children: [
                      { checked: true, text: '警务通' },
                      { checked: true, text: 'DB' },
                      { checked: true, text: 'PDT' },
                      { checked: true, text: '值班电话' },
                      { checked: true, text: '监控' }
                    ],
                    isRadio: false
                  }
                ],
                isEdit: false,
                id: 'txtc',
                text: '通信图层'
              },
              {
                children: [
                  {
                    isInput: true,
                    latitude: '39.987061',
                    id: 'centetPoint',
                    text: '初始中心点',
                    placeholder: '经纬度',
                    isLon: true,
                    longitude: '116.610663'
                  },
                  {
                    active: '在线地图',
                    id: 'csdt',
                    text: '初始地图',
                    children: [
                      { checked: true, text: '在线地图' },
                      { checked: false, text: '离线地图' }
                    ],
                    isRadio: true
                  },
                  {
                    isInput: true,
                    id: 'mapScale',
                    text: '地图缩放倍数',
                    value: 4
                  }
                ],
                isEdit: false,
                id: 'map',
                text: '地图'
              }
            ],
            isEdit: true,
            show: true,
            id: 'zhdd',
            text: '指挥调度'
          },
          {
            isOpen: true,
            isEdit: true,
            show: true,
            id: 'spdd',
            text: '视频调度'
          },
          {
            isOpen: true,
            children: [
              {
                isOpen: true,
                isSpread: false,
                isEdit: true,
                id: 'bhlb',
                text: '标绘列表'
              }
            ],
            isEdit: true,
            show: true,
            id: 'dtbh',
            text: '地图标绘'
          },
          {
            isOpen: true,
            isEdit: true,
            show: true,
            id: 'lsjl',
            text: '历史记录'
          },
          { isEdit: false, show: true, id: 'pzgl', text: '配置管理' }
        ],
        EQUIP_CONFIG: [
          {
            children: [
              {
                text: '扬声器',
                children: [
                  { checked: true, text: '扬声器1' },
                  { checked: false, text: '扬声器2' }
                ],
                value: '扬声器1'
              },
              {
                text: '麦克风',
                children: [
                  { checked: true, text: '麦克风1' },
                  { checked: false, text: '麦克风2' }
                ],
                value: '麦克风2'
              }
            ],
            text: '声音通道选择'
          },
          {
            children: [
              {
                text: '摄像头',
                children: [
                  { checked: true, text: '摄像头1' },
                  { checked: false, text: '摄像头2' }
                ],
                value: '摄像头1'
              },
              {
                text: '摄像头分辨率',
                children: [
                  { checked: true, text: '1920x1080' },
                  { checked: false, text: '3080x1440' }
                ],
                value: '3080x1440'
              }
            ],
            text: '本地摄像头'
          },
          {
            children: [
              {
                text: '视频帧率',
                children: [
                  { checked: true, text: '15fps' },
                  { checked: false, text: '30fps' }
                ],
                value: '15fps'
              },
              {
                text: '视频速率',
                children: [
                  { checked: true, text: '128kbps' },
                  { checked: false, text: '256kbps' }
                ],
                value: '128kbps'
              }
            ],
            text: '本地视频'
          }
        ],
        POLICE_ID: '70000003',
        VERSION: 'v14.8.15.1'
      },
      spddSettingArr: [
        {
          value: 1
        }, {
          value: 4
        }, {
          value: 6
        }, {
          value: 9
        }, {
          value: 16
        }
      ],
      requestURL: process.env.NODE_ENV === 'development' ? 'http://82.157.100.82:29014' : 'https://49.232.204.238:443',
      showImg: false,
      loading: false,
      telArr: [],
      phoneGroup: [],
      selectOption: [
        '振铃组', '轮询组'
      ],
      activePhoneType: '振铃组',
      isOpenTel: false,
      VERSION: 'v14.8.15.1',
      Recording: {},
      checkedRecord: [],
      RecordArr: ['视频呼叫', '语音呼叫', '视频会商', '语音会议']
    }
  },
  computed: {
    ...mapGetters([
      'version'
    ]),
    isDisabled: {
      get() {
        let flag = false
        const { settings, Recording, navActive } = this
        if (parseFloat(settings?.GLOBAL_FUNCTION_CONFIG) === 1 && (navActive === 'gnpz' || navActive === 'lthjpz' || navActive === 'xtbb')) {
          flag = true
        }
        if (parseFloat(settings?.GLOBAL_PROJECT_CONFIG) === 1 && navActive === 'xmpz') {
          flag = true
        }
        if (Recording?.GLOBAL_CONFIG === 1 && navActive === 'lzpz') {
          flag = true
        }
        // console.log(flag, '禁用状态')
        return flag
      }
    }
  },
  async created() {
    if (sessionStorage.get('TONE_ConfigUserInfo')) {
      this.settings = JSON.parse(JSON.stringify(sessionStorage.get('TONE_ConfigUserInfo')))
      this.dialogImageUrl = this.settings.LOGO_URL
    } else {
      // 功能和项目配置
      this.getConfig()
    }
    // 联动话机配置
    this.getTelSetting()
    // 录制配置
    this.getRecordingConfig()
    this.tabNav.forEach((item, i) => {
      if (!this.queryPath(item.id, this.pzgl).DISPLAY) {
        this.tabNav.splice(i, 1)
      }
    })
    this.$set(this.tabNav[0], 'isActive', true)
    this.isShowPanel(this.tabNav[0].id)
  },
  methods: {
    queryPath(key, obj, result = false) {
      if (obj.length > 0 && Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item['PATH'] === key) {
            result = item
          }
          if (item.children && Array.isArray(item.children)) {
            result = this.queryPath(key, item.children, result)
          }
        })
      }
      if (!result && key === 'map') {
        // 权限分配 不需要显示的模块
        result = {
          DISPLAY: 1
        }
      }
      return result
    },
    async getTelSetting(v) {
      const res = await this.$api.common.GetTelPhoneSettingUrl(`?DdtId=${this.userInfo.userName}`)
      if (res && res.data) {
        // console.log(res.data)
        // eslint-disable-next-line no-eval
        const obj = eval(JSON.parse(JSON.stringify(res.data.msg)))
        this.telArr = get(obj, 0, {
          id: this.userInfo.userName, telPhone: ' , , , ', ddtId: this.userInfo.userName, type: 1, openState: 0
        })
        if (v || this.telArr.telPhone.length === 0) {
          this.phoneGroup = ['', '', '', '']
        } else {
          this.phoneGroup = this.telArr.telPhone.split(',')
        }
        if (this.phoneGroup.length < 4) {
          for (let i = 0; i <= (5 - this.phoneGroup.length); i++) {
            this.phoneGroup.push('')
          }
        }
        if (this.telArr.openState === '0') {
          this.isOpenTel = false
        } else {
          this.isOpenTel = true
        }
        if (this.telArr.type === '1') {
          this.activePhoneType = '轮询组'
        } else {
          this.activePhoneType = '振铃组'
        }
        const arr = []
        this.phoneGroup.forEach(item => {
          arr.push({ value: item })
        })
        this.phoneGroup = arr
      }
    },
    updateTel() {
      let str = this.phoneGroup.reduce((pre, ind) => {
        // eslint-disable-next-line no-return-assign
        return pre += (ind.value.length > 0 ? ind.value + ',' : '')
      }, '')
      str = str.substr(0, str.length - 1)
      const activeTel = this.activePhoneType === '振铃组' ? 0 : 1
      const isOpen = this.isOpenTel ? 1 : 0
      this.$api.common.SaveTelPhoneSetting({
        id: this.userInfo.userName, telPhone: str, ddtId: this.userInfo.userName, type: activeTel, openState: isOpen
      }).then(res => {
        if (res) {
          this.$message.success('保存成功')
        }
      }).catch(() => {
        this.$message.warning('网络异常请稍后重试')
      })
    },
    async resetTel() {
      const activeTel = this.activePhoneType === '振铃组' ? 0 : 1
      const isOpen = this.isOpenTel ? 1 : 0
      const res = await this.$api.common.SaveTelPhoneSetting({ id: this.userInfo.userName, telPhone: '', ddtId: this.userInfo.userName, type: activeTel, openState: isOpen })
      if (res) {
        this.getTelSetting(true)
        this.$message.success('重置成功')
      } else {
        this.loading = false
        this.$message.warning('网络异常请稍后重试')
      }
    },
    openPhone() {
      if (this.isOpenTel) {
        this.$message.warning(
          '该功能开启期间，所有语音呼叫的通话均被转到设置的联动话机上，或由联动话机发起相关操作。'
        )
      }
    },
    deletePhone(i) {
      this.phoneGroup.splice(i, 1)
    },
    addPhone() {
      this.phoneGroup.push({
        value: ''
      })
    },
    changeText(obj) {
      // console.log(obj.value.length, obj.value)
      if (obj.value.length === 0) {
        this.$message.warning('不能为空')
        return
      }
      queryId(obj.key, this.settings.FEATURE_SETTING).text = obj.value
    },
    deepChange(key, value, obj) {
      // 递归修改标题文本
      if (obj.length > 0 && Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item['id'] === key) {
            item.text = value
            return
          }
          if (item.children && Array.isArray(item.children)) {
            this.deepChange(key, value, item.children)
          }
        })
      }
    },
    deleteImg(event) {
      // 删除图片 换成默认图片
      event.preventDefault()
      event.stopPropagation()
      this.settings.LOGO_URL = '/T01.ico'
      this.dialogImageUrl = '/T01.ico'
      this.showImg = false
      // 默认的logo
    },
    submitUpload() {
      this.$refs.uploadMutiple.submit()
    },
    // 文件信息更改的回调
    handleChange(file, fileList) {
      const formData = new FormData()
      this.fileList = fileList
      this.fileList.forEach((item) => {
        formData.append('files', item.raw)
      })
    },
    // 图片上传成功的回调
    imgSuccess(response, file, fileList) {
      // console.log('上传图片的信息', response, file, fileList)
      // this.settings.LOGO_URL = this.requestURL + response.obj[0].newFile
      this.$set(this.settings, 'LOGO_URL', response.obj[0].newFile)
      //     // 上传图片成功后 将后台返回的地址 保存在本地对象中
      // this.dialogImageUrl = URL.createObjectURL(file.raw)
      this.dialogImageUrl = response.obj[0].newFile
      this.$message.success('上传成功')
    },
    // 发送图片
    beforeAvatarUploadImg(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isJPEG = testmsg === 'jpeg'
      const isJPG = testmsg === 'jpg'
      const isPNG = testmsg === 'png'
      const isICON = testmsg === 'ico'
      const isLt8M = file.size / 1024 / 1024 < 8
      if (!isJPG && !isPNG && !isJPEG && !isICON) {
        this.$message.warning(
          '上传图片只能是 JPG、JPEG、PNG、ICO 格式!'
        )
        return false
      }
      if (!isLt8M) {
        this.$message.warning('上传图片大小不能超过 8MB!')
        return false
      }
      return (isJPG || isPNG || isJPEG || isICON) && isLt8M
    },
    async addConfig() {
      // 添加配置 暂未用上
      await axios
        .post('/api/rstoneCmd/Service/addConfig', this.settings)
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 保存配置
    async updateConfig() {
      const { POLICE_ID, TOKEN } = this.TONE_voip.cmd
      if (this.navActive === 'lthjpz') {
        this.loading = true
        await this.updateTel()
        this.loading = false
      } else if (this.navActive === 'lzpz') {
        const { checkedRecord } = this
        const isSelect = (v) => {
          if (checkedRecord.indexOf(v) !== -1) {
            return 1
          } else {
            return 0
          }
        }
        const res = await this.$api.common.updateRecordingConfig({
          'police_id': POLICE_ID,
          'VIDEO_CALL': isSelect('视频呼叫'),
          'VOICE_CALL': isSelect('语音呼叫'),
          'VIDEO_CONFERENCING': isSelect('视频会商'),
          'VOICE_CONFERENCE': isSelect('语音会议'),
          'project': 0
        })
        if (res) {
          this.$message.success('保存成功')
        }
      } else {
        if (this.settings.TITLE.length === 0) {
          this.$message.warning('系统名称不可为空！')
          return
        }
        const {
          EQUIP_CONFIG,
          FEATURE_SETTING,
          LOGO_URL,
          PHONE_SETTING,
          TITLE,
          VERSION = 'v14.8.15.1'
          // 每次更新版本 这个配置版本也更改
        } = this.settings
        this.loading = true
        this.$api.common.updateConfig({
          token: TOKEN,
          POLICENO: POLICE_ID,
          title: TITLE,
          logoUrl: LOGO_URL,
          featureSetting: FEATURE_SETTING,
          equipConfig: EQUIP_CONFIG,
          version: VERSION,
          phoneSetting: PHONE_SETTING,
          project: 0
        })
          .then((res) => {
            if (res.data.result === 1) {
              this.$message.success('保存成功')
              const settingCopy = JSON.parse(JSON.stringify(this.settings))
              sessionStorage.set('TONE_ConfigUserInfo', settingCopy)
              this.$store.commit('settings/SET_SETTINGS', settingCopy)
              const state = queryId('csdt', settingCopy.FEATURE_SETTING).active === '在线地图' ? 'onLine' : 'offLine'
              this.$store.commit('settings/SET_MAPSTATE', state)
              const jwd = queryId('centetPoint', this.settings.FEATURE_SETTING)
              this.$store.commit('settings/SET_CENTER', { 'lng': Number(jwd.longitude), 'lat': Number(jwd.latitude) })
              this.$store.commit('settings/SET_ZOOM', Number(queryId('mapScale', this.settings.FEATURE_SETTING).value))
              changeIco(api + LOGO_URL)
            } else {
              this.$message.warning('网络异常保存失败，请稍后重试')
            }
          })
          .catch((err) => {
            console.log(err)
            this.$message.warning('网络异常保存失败，请稍后重试')
          })
          .finally(_ => {
            this.loading = false
          })
      }
      // 保存配置
    },
    async getConfig() {
      // 获取配置信息
      const that = this
      that.loading = true
      try {
        const res = await this.$api.common.getConfig(`?POLICENO=${this.TONE_voip.cmd.POLICE_ID}&token=${this.TONE_voip.cmd.TOKEN}&project=${0}`)
        that.loading = false
        if (res.data.data && res.data.data.length > 0) {
        // 若已有配置
          const settings = res.data.data[0]
          for (const k in settings) {
          // eslint-disable-next-line quotes
            settings[k] = JSON.stringify(settings[k])
            if (settings[k].indexOf('[') === -1) {
              that.$set(that.settings, [k], settings[k].replace(/['" ]/g, ''))
            } else {
              if (Array.isArray(JSON.parse(settings[k]))) {
                that.$set(that.settings, [k], JSON.parse(settings[k]))
              } else {
                that.$set(
                  that.settings,
                  [k],
                  JSON.parse(JSON.parse(settings[k]))
                )
              }
            }
          }
          that.settings.FEATURE_SETTING[0].children[2].children[0].children = that.commitObj(
            that.settings.EXT_USER_TYPE_INFO_LIST,
            that.settings.FEATURE_SETTING[0].children[2].children[0].children
          )
          that.dialogImageUrl = this.settings.LOGO_URL
          this.$store.commit('settings/SET_SETTINGS', JSON.parse(JSON.stringify(this.settings)))
          sessionStorage.set('TONE_ConfigUserInfo', JSON.parse(JSON.stringify(this.settings)))
          that.$forceUpdate()
        } else {
          that.$message.error('网络异常!请稍后重试')
        }
      } catch (error) {
        that.$message.error('网络异常!请稍后重试')
        that.loading = false
      }
    },
    // 将后台返回的通信图层组合到一起
    commitObj(obj1, obj2) {
      obj1.forEach((item, i) => {
        item.text = item.NAME
        if (obj2[i]) {
          item.checked = obj2[i].checked
        }
      })
      return obj1.sort((a, b) => {
        return b.IS_APP - a.IS_APP
      })
    },
    async resetConfig() {
      if (this.navActive === 'lthjpz') {
        this.loading = true
        await this.resetTel()
        this.loading = false
        return
      }
      if (this.navActive === 'lzpz') {
        this.loading = true
        await this.resetRecord()
        this.loading = false
        return
      }
      // 重置配置
      this.$confirm('您确定要重置当前配置？', '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async() => {
        this.loading = true
        const res = await this.$api.common.resetConfig(`?POLICENO=${this.TONE_voip.cmd.POLICE_ID}&token=${this.TONE_voip.cmd.TOKEN}&project=${0}`)
        if (res.data.result === 1) {
          await this.getConfig()
          this.$message.success('重置成功')
        } else {
          this.$message.error('网络异常，请稍后重试')
        }
      })
    },
    handlePictureCardPreview(event) {
      event.preventDefault()
      event.stopPropagation()
      this.dialogVisible = true
    },
    isShowPanel(val) {
      this.navActive = val
    },
    // 获取录制信息
    async getRecordingConfig() {
      const res = await this.$api.common.getRecordingConfig({
        'police_id': this.TONE_voip.cmd.POLICE_ID,
        'project': 0
      })
      if (res?.data?.data[0]) {
        const obj = res?.data?.data[0]
        this.Recording = obj
        // console.log(obj, '录制配置')
        this.checkedRecord = []
        if (obj.VOICE_CALL) {
          this.checkedRecord.push('语音呼叫')
        }
        if (obj.VOICE_CONFERENCE) {
          this.checkedRecord.push('语音会议')
        }
        if (obj.VIDEO_CALL) {
          this.checkedRecord.push('视频呼叫')
        }
        if (obj.VIDEO_CONFERENCING) {
          this.checkedRecord.push('视频会商')
        }
      }
    },
    async resetRecord() {
      const res = await this.$api.common.resetRecordingConfig({
        'police_id': this.TONE_voip.cmd.POLICE_ID,
        'project': 0
      })
      if (res) {
        this.getRecordingConfig()
        this.$message.success('重置成功')
      } else {
        this.loading = false
        this.$message.warning('网络异常请稍后重试')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.setting {
  position: absolute;
  width: 100%;
  top: 0px;
  background: url("../../assets/images/login/bg.png") center center no-repeat;
  background-size: 100% 100%;
  padding-top: 0.75rem;
  height: 100%;
  min-height: 714px;
  .head {
    position: relative;
    .tab-cards {
      box-sizing: content-box;
      display: flex;
      height: 28px;
      margin: 0px auto 15px;
      background: linear-gradient(0deg, #2a7aa2, #055984);
      border: 1px solid #01cfff;
      border-radius: 4px;
      position: absolute;
      left: 100px;
      top: 50px;
      li {
        width: 100px;
        float: left;
        height: 28px;
        text-align: center;
        color: #00d8ff;
        line-height: 28px;
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        &.active {
          color: #fff;
          height: 30px;
          line-height: 30px;
          margin-top: -1px;
          margin-left: -1px;
          padding-left: 1px;
          background: url("../../assets/images/equipment/active.png") no-repeat;
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
  }
  .hide {
    display: none;
  }
  .body {
    margin: 0 100px;
    position: relative;
    top: 95px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    color: #00d8ff;
    height: 85%;
    border: 1px solid #01cfff;
    background-color: rgba(0, 85, 128, 0.9);
    user-select: none;
      ::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #00d8ff !important;
      }
      ::v-deep .el-checkbox__inner {
        border: 1px solid #01d3f9;
        background-color: transparent;
      }
      ::v-deep .el-checkbox__inner::after {
        border: 1px solid #01d3f9;
        border-left: 0;
        border-top: 0;
      }
    .custom-record{
      display: flex;
      flex-direction: column;
      padding: 30px 0 0 50px;
      line-height: 3;
      .record-box{
        width: 200px;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
      }
    }
    .stop-ally{
      pointer-events: none;
    }
    .phone-hj {
      box-sizing: border-box;
      .el-input,
      .el-select {
        width: 200px;
      }
      & > :first-child {
        padding-left: 115px;
        .el-checkbox:last-of-type {
          margin-right: 15px;
        }
      }
      & > div {
        box-sizing: border-box;
        padding: 10px 10px 10px 80px;
        line-height: 20px;
        border-bottom: 1px solid #01cfff;
      }
      & > :nth-child(4) {
        display: flex;
        flex-direction: column;
        & > div {
          display: flex;
          justify-content: space-between;
          width: 40%;
        }
      }

      & > :last-child {
        height: 220px;
        overflow: hidden;
        overflow-y: auto;
      }
      ::v-deep .el-input__inner {
      padding: 0 5px !important;
    }
    }
    .config {
      height: 100%;
      overflow: hidden;
      overflow-y: auto;
    }
    .InputHead {
      width: 40%;
      display: flex;
      justify-content: space-between;
    }
    .flexInput {
      display: flex;
      align-items: center;
      margin: 15px 0;
      margin-left: 20px;
      justify-content: start;
      width: 30%;
      & > div {
        margin: 0 10px;
        white-space: nowrap;
      }
      i {
        cursor: pointer;
      }
    }
    ::v-deep .el-input__icon {
      line-height: 20px;
      height: auto;
    }
    .videoConfig {
      border-bottom: 1px solid #01cfff;
      box-sizing: border-box;
      padding: 0.25rem 0 0.25rem 0;
      & :not(:first-child) {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 6px 0;
        margin-left: 75px;
        width: 30%;
      }
      & > :first-child {
        margin-left: 40px;
      }
      ::v-deep .el-select {
        width: 300px;
      }
    }
    .version {
      height: 100px;
      border-bottom: 1px solid #01cfff;
      padding: 0.5rem 0 0 1rem;
      box-sizing: border-box;
    }
    .first-tier {
      display: flex;
      align-items: start;
      box-sizing: border-box;
      padding: 0.05rem 0;
      padding-left: 0.75rem;
      flex-direction: column;
      font-size: 14px;
      border-bottom: 1px solid #00d8ff;
      .first-box {
        display: flex;
        margin: 6px 0;
        color: #01d3f9;
        ::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
          color: #00d8ff !important;
        }
        & > :first-child {
          margin-right: 24px;
        }
        ::v-deep .el-checkbox__inner {
          border: 1px solid #01d3f9;
          background-color: transparent;
        }
           ::v-deep .el-checkbox__inner::after {
          border: 1px solid #01d3f9;
          border-left: 0;
          border-top: 0;
        }
      }
      .second-box {
        margin: 6px 0;
        margin-left: 0.3rem;
        display: flex;
        flex-direction: column;
        ::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
          color: #00d8ff !important;
        }
        ::v-deep .el-checkbox__inner {
          border: 1px solid #01d3f9;
          background-color: transparent;
        }
        ::v-deep .el-checkbox__inner::after {
          border: 1px solid #01d3f9;
          border-left: 0;
          border-top: 0;
        }
        & > :first-child {
          display: flex;
          margin-bottom: 6px;
          & > :first-child {
            margin-right: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }
        }
        .three-box {
          position: relative;
          display: flex;
          box-sizing: border-box;
          padding-left: 0.2rem;
          // margin: 6px 0;
          line-height: 2;
          display: flex;
          flex-wrap: wrap;
          height: auto;
          .el-input-number{
            line-height: 1 !important;
          }
         ::v-deep  .el-input-number__decrease{
            width: auto !important;
            line-height: 1 !important;
            height: 9.5px;
            line-height: 1 !important;
          }
          ::v-deep  .el-input-number__increase{
            width: auto !important;
            line-height: 1 !important;
            height: 9.5px;
            line-height: 1 !important;
            top: 0 !important;
          }
            ::v-deep  .el-input-number__increase [class*=el-icon],.el-input-number__decrease [class*=el-icon]{
            transform: scale(1) translateY(-2.5px);
          }
          i{
            cursor: pointer;
          }
          ::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
            color: #00d8ff !important;
          }
          ::v-deep .el-radio > .el-radio__label {
            display: none;
          }
          ::v-deep .el-radio__inner {
            background-color: transparent;
            border: 1px solid #01d3f9;
          }
          ::v-deep .el-radio {
            display: block;
            position: relative;
            top: 1px;
            margin-right: 10px;
          }
          .el-checkbox {
            margin-right: 10px;
          }
          & > :first-child {
            align-items: center;
            min-width: 85px;
          }
          div {
            display: flex;
            align-items: center;
            // margin: 6px 0;
            white-space: nowrap;
          }
        }
      }
      .first-box,
      .three-box {
        & > div {
          margin-left: 10px !important;
        }
      }
    }
    ::v-deep .el-input__inner {
      padding: 0 5px;
      height: 20px;
      background-color: rgba($color: #000000, $alpha: 0);
      color: #00d8ff;
      font-size: 13px;
      box-sizing: border-box;
      outline: none;
      border: 1px solid #01cfff;
    }

    .box-child {
      display: flex;
      padding-left: 5px;
      box-sizing: border-box;
      justify-content: flex-start;
      align-items: center;
      border-bottom: 1px solid #01cfff;
      .demand{
          height: 120px;
          box-sizing: border-box;
          padding-left: 30px;
          line-height: 20px;
      }
      .filter {
        ::v-deep input {
          border-radius: 0;
        }
      }
      ::v-deep .el-upload {
        position: relative;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 10px 0;
        border-radius: 5px;
        img {
          border-radius: 5px;
        }
        .button {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 5px;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.6);
        }
        .close {
          position: absolute;
          top: 2px;
          right: 2px;
        }
        .imgBlow {
          position: absolute;
          top: 0;
          left: 0;
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
      }
      li {
        list-style: none;
        margin: 4px 0;
        cursor: pointer;
      }
      ::v-deep img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      ::v-deep li > div {
        height: 100%;
      }
      .left {
        margin: 50px 0;
        margin-left: 0.5rem;
        width: 100px;
      }
      .logo{
        width: 100px;
        margin-left: 0.5rem;
        margin-top: -120px;
      }
    }
  }
  .stop-apply{
    cursor: not-allowed;
  }
}
</style>
