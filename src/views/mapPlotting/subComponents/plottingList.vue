<template>
  <div class="plottingList">
    <div
      v-move="{ parent: '.plottingListWrap', childrenHeader: '.title' }"
      class="plottingListWrap bevel"
    >
      <h3 class="title">{{ queryPath('bhlb',sessionStorage.get('moduleInfo')).NAME }}</h3>
      <div class="btnWrap">
        <button class="plus" @click="addPlotting">
          <span class="el-icon-circle-plus-outline" />
          <span>添加</span>
        </button>
      </div>
      <div class="list">
        <el-input
          v-model.trim="filterText"
          class="filter"
          type="text"
          placeholder="关键字搜索"
        >
          <img
            slot="suffix"
            :src="search"
            alt="标题"
            class="img"
            @click="filterNode"
          >
        </el-input>
        <div class="edit-box"><el-checkbox v-model="isSelectAll" :indeterminate="isIndeterminate" @change="selectAll">标绘名称</el-checkbox> <span>操作</span></div>
        <VueEasyTree
          ref="tree"
          class="t01_tree"
          :data="data"
          :props="plottingProps"
          show-checkbox
          node-key="plottingId"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          height="100%"
          :icon-class="'el-icon-arrow-right'"
          @check="check"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span class="labelName ellipsis" :title="node.label">{{ node.label }}</span>
            <span class="listBtn">
              <span
                v-if="!node.parent.parent"
                class="el-icon-circle-plus-outline plus"
                title="添加"
                @click="() => append(node, data)"
              />
              <span
                class="el-icon-edit-outline plus"
                title="编辑"
                @click="() => edit(node, data)"
              />
              <img
                :src="guanlian"
                alt=""
                title="关联"
                @click="() => renyuanHandle(node, data)"
              >
              <img :src="del" alt="" @click="() => remove(node, data)">
            </span>
          </span>
        </VueEasyTree>
      </div>
    </div>
    <div
      v-show="showPlotting"
      v-move="{ parent: '.plotting', childrenHeader: '.title' }"
      class="plotting bevel"
    >
      <h3 class="title">
        {{ plottingId ? "编辑标绘" : "添加标绘" }}
      </h3>
      <el-form
        ref="ruleForm"
        :model="ruleForm"
        :rules="rules"
        label-width="84px"
        class="ruleForm"
        size="mini"
        label-position="top"
        @submit.native.prevent
      >
        <el-form-item label="" prop="plottingName" class="plottingName">
          <el-input
            v-model="ruleForm.plottingName"
            clearable
            placeholder="请输入标绘名称"
          />
        </el-form-item>
        <ul class="tab-cards">
          <li
            v-for="(item, i) in tabNav"
            :key="i"
            :class="navActive == item.name ? 'active' : ''"
            @click="isShowTab(item.name)"
          >
            {{ item.name }}
          </li>
        </ul>
        <div class="tab-con">
          <div v-show="navActive === '绘制'">
            <div class="huizhiObject clearfix">
              <div
                v-for="(item, index) in huizhiObject"
                :key="index"
                class="item"
                @click="potting(item)"
                :title="item.title"
              >
                <img :src="item.imgUrl" alt="">
                <p class="itemText">{{ item.text }}</p>
              </div>
            </div>
            <p class="dividingP">边框</p>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item
                  label="填充色："
                  prop="huizhiFillColor"
                  class="pickerColor"
                >
                  <el-select
                    v-model="ruleForm.huizhiFillColor"
                    placeholder="请输入"
                  />
                  <el-color-picker
                    v-model="ruleForm.huizhiFillColor"
                    show-alpha
                    @active-change="huizhiFillColorChange"
                  />
                </el-form-item>
              </el-col>
              <el-col v-if="tucengName && tucengName.search('折线') !== -1" :span="12">
                <el-form-item
                  label="线粗细："
                  prop="huizhiStrokeWeight"
                  :style="cssVarsHuiZhi"
                >
                  <el-slider
                    v-model="ruleForm.huizhiStrokeWeight"
                    :max="10"
                    :min="1"
                    class="huizhiSlider"
                    @input="huizhiStrokeWeightChange"
                  />
                </el-form-item>
              </el-col>
              <el-col v-show="!tucengName || tucengName.search('折线') === -1" :span="12">
                <el-form-item
                  label="边框色："
                  prop="huizhiStrokeColor"
                  class="pickerColor"
                >
                  <el-select
                    v-model="ruleForm.huizhiStrokeColor"
                    placeholder="请输入"
                  />
                  <el-color-picker
                    v-model="ruleForm.huizhiStrokeColor"
                    show-alpha
                    @active-change="huizhiStrokeColorChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item
                  label="高度："
                  prop="height"
                  class="biaozhuFontSize"
                >
                  <el-input
                    v-model="ruleForm.height"
                    placeholder="请输入高度"
                    @input="heightChange"
                  />
                  <span class="unit">m</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-show="navActive === '标注'">
            <!-- <p class="dividingP">标注对象</p> -->
            <div class="biaozhuObject clearfix">
              <div
                v-for="(item, index) in biaozhuObject"
                :key="index"
                class="item"
                @click="biaozhuClick(item)"
              >
                <img :src="item.imgUrl" alt="">
                <p class="itemText">{{ item.text }}</p>
              </div>
            </div>
            <p class="dividingP">边框</p>
            <div class="biaozhuStrokeWrap">
              <el-row :gutter="10">
                <el-col v-show="!tucengName || (tucengName && tucengName.search('背景文字') !== -1)" :span="12">
                  <el-form-item
                    label="背景色："
                    prop="biaozhuFillColor"
                    class="pickerColor"
                  >
                    <el-select
                      v-model="ruleForm.biaozhuFillColor"
                      placeholder="请输入"
                    />
                    <el-color-picker
                      v-model="ruleForm.biaozhuFillColor"
                      show-alpha
                      @active-change="biaozhuFillColorChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="高度："
                    prop="height"
                    class="biaozhuFontSize"
                  >
                    <el-input
                      v-model="ruleForm.height"
                      placeholder="请输入高度"
                      @input="heightChange"
                    />
                    <span class="unit">m</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <p class="dividingP">字体</p>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item
                  label="颜色："
                  prop="biaozhuFontColor"
                  class="pickerColor"
                >
                  <el-select
                    v-model="ruleForm.biaozhuFontColor"
                    placeholder="请输入"
                  />
                  <el-color-picker
                    v-model="ruleForm.biaozhuFontColor"
                    show-alpha
                    @active-change="biaozhuFontColorChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="大小："
                  prop="biaozhuFontSize"
                  class="biaozhuFontSize"
                >
                  <el-input
                    v-model="ruleForm.biaozhuFontSize"
                    placeholder="请输入字体大小"
                    @input="biaozhuFontSizeChange"
                  />
                  <span class="unit">px</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="样式：" prop="biaozhuFontFamily">
                  <el-select
                    v-model="ruleForm.biaozhuFontFamily"
                    :popper-append-to-body="false"
                    placeholder="请输入"
                    @change="biaozhuFontFamilyChange"
                  >
                    <el-option
                      v-for="item in biaozhuFontFamilyOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item
              label="文字内容："
              prop="biaozhuTextarea"
              class="biaozhuTextarea"
            >
              <el-input
                v-model="ruleForm.biaozhuTextarea"
                type="textarea"
                placeholder="请输入文字内容"
                maxlength="50"
                @input="biaozhuTextareaChange"
              />
            </el-form-item>
          </div>
          <div v-show="navActive === '图标'">
            <div class="tubiaoObject clearfix">
              <div
                v-for="(item, index) in tubiaoObject"
                :key="index"
                class="item"
                @click="tubiaoClick(item)"
              >
                <img :src="api + item.icoUrl" alt="">
                <p class="itemText">{{ item.name }}</p>
              </div>
            </div>
            <div class="addBtnWrap">
              <el-upload
                ref="upImg"
                :action="upImg()"
                name="Upfile"
                :data="dataFile"
                :headers="headers"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
              >
                <button class="addBtn">
                  <span class="el-icon-circle-plus-outline" />
                  <span>新增</span>
                </button>
                <div slot="tip" class="el-upload__tip">
                  只能上传JPG/JPEG/PNG/GIF图片，且不超过8M
                </div>
              </el-upload>
            </div>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="大小：" prop="tubiaoSize">
                  <el-slider
                    v-model="ruleForm.tubiaoSize"
                    :max="100"
                    :min="10"
                    class="tubiaoSlider"
                    @change="tubiaoSizeChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="名称：" prop="tubiaoName">
                  <el-input
                    v-model="ruleForm.tubiaoName"
                    placeholder="这里是名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item
                  label="高度："
                  prop="height"
                  class="biaozhuFontSize"
                >
                  <el-input
                    v-model="ruleForm.height"
                    placeholder="请输入高度"
                    @input="heightChange"
                  />
                  <span class="unit">m</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-form-item label="绘制/标注/图表列表：" class="list">
            <ul class="plottingList">
              <li
                v-for="(item, i) in overlays"
                :key="i"
                class="plottingListLi clearfix"
                :class="tucengName === item.name ? 'active' : ''"
                @click="tucengActive(item)"
              >
                <span class="name">{{ item.name }}</span>
                <span
                  class="el-icon-close close"
                  @click.stop="removeTuCeng(item)"
                />
              </li>
            </ul>
          </el-form-item>
        </div>
      </el-form>
      <div class="btnWrap">
        <button class="plus" @click="sure('ruleForm')">确定</button>
        <button class="selectAll" @click="cancle('ruleForm')">取消</button>
      </div>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      v-el-drag-dialog
      :title="'标绘名称-关联资源'"
      :visible.sync="dialogVisible"
      width="700px"
      custom-class="organizeDialog bevel"
      :show-close="false"
    >
      <div class="organizeDialog_content">
        <Organize :add-meeting-member-list="addList" :dialog-type="'标绘名称-关联资源'" :tab-nav="lefFtabNav" :meeting-member-list="[]" />
      </div>
      <div slot="footer" class="dialog-footer btnWrap">
        <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
        <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
      </div>

    </el-dialog>
  </div>
</template>
<script>
import editImg from '@/assets/images/biaohui/edit.png'
import renyuan from '@/assets/images/biaohui/renyuan.png'
import shebei from '@/assets/images/biaohui/shebei.png'
import guanlian from '@/assets/images/biaohui/guanlian.png'
import { queryId, queryPath } from '@/utils'
import del from '@/assets/images/biaohui/del.png'
import { parseTime, isEqual } from '@/utils/index'
import { mapGetters } from 'vuex'
import search from '@/assets/images/equipment/search.png'
import {
  rend
} from '@/utils/plotting'
import { api } from '@/api/env'
import { sessionStorage } from '@/utils/storage'
import { cloneDeep } from 'lodash'
import Organize from '@/components/organize'
import jqPos from '@/assets/images/equipment/jqPos.png'
export default {
  name: 'PlottingList',
  components: {
    Organize
  },
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
    }
  },
  data() {
    return {
      jqPos,
      isIndeterminate: false,
      isSelectAll: false,
      filterText: '',
      queryPath,
      guanlian,
      editImg,
      renyuan,
      shebei,
      del,
      search,
      api, sessionStorage,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      data: [],
      plottingProps: {
        label: 'plottingName',
        children: 'children',
        id: 'plottingId'
      },
      parentId: '-1',
      plottingId: null,
      ruleForm: {
        plottingName: '',
        huizhiFillColor: 'rgba(0, 183, 238, 0.5)',
        huizhiStrokeColor: 'rgba(238, 101, 0, 1)',
        huizhiStrokeWeight: 4,
        height: 10000,
        biaozhuFillColor: 'rgba(0, 183, 238, 0.5)',
        biaozhuFontColor: 'rgba(238, 101, 0, 1)',
        biaozhuFontSize: 12,
        biaozhuFontFamily: 'SimSun',
        biaozhuTextarea: '文字内容。。。',
        tubiaoSize: 20,
        tubiaoName: ''
      },
      rules: {
        plottingName: [
          { required: true, message: '请输入标绘名称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        tubiaoName: [
          { min: 1, max: 4, message: '长度在 1 到 4 个字符', trigger: 'blur' }
        ]
      },
      navActive: '绘制',
      tabNav: [
        {
          name: '绘制',
          isActive: true
        },
        {
          name: '标注',
          isActive: false
        },
        {
          name: '图标',
          isActive: false
        }
      ],
      huizhiObject: [
        { imgUrl: require('@/assets/images/biaohui/bh_dian.png'), text: '点' },
        {
          imgUrl: require('@/assets/images/biaohui/bh_zhexian.png'),
          text: '折线',
          title: '鼠标左键在地图按下然后拖拽，左键抬起结束'
        },
        {
          imgUrl: require('@/assets/images/biaohui/bh_duobian.png'),
          text: '多边形',
          title: '鼠标左键在地图点击，右键结束'
        },
        {
          imgUrl: require('@/assets/images/biaohui/bh_juxing.png'),
          text: '矩形',
          title: '鼠标左键在地图按下拖拽，左键抬起结束'
        },
        { imgUrl: require('@/assets/images/biaohui/bh_yuan.png'),
          text: '圆',
          title: '鼠标左键在地图点击拖拽，左键抬起结束' },
        {
          imgUrl: require('@/assets/images/biaohui/bh_tuoyuan.png'),
          text: '椭圆形',
          title: '鼠标左键在地图点击拖拽，左键抬起结束'
        }
      ],
      biaozhuObject: [
        {
          imgUrl: require('@/assets/images/biaohui/bh_ybwz.png'),
          text: '一般文字'
        },
        {
          imgUrl: require('@/assets/images/biaohui/bh_jxwz.png'),
          text: '背景文字'
        }
      ],
      tubiaoObject: [],
      biaozhuFontFamilyOptions: [
        {
          value: 'SimSun',
          label: '宋体'
        },
        {
          value: 'PingFang SC',
          label: '苹方'
        }
      ],
      overlays: [],
      tucengName: '',
      tuceng: null,
      biaozhuText: '一般文字',
      dataFile: {
        ddtId: '',
        name: ''
      },
      selectTuBiao: null,
      newOverlays: [],
      showPlotting: false,
      tempSelectArr: [],
      editOldData: null,
      dialogTitle: '', // 弹框标题
      dialogVisible: false,
      addList: [], // 添加成员
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      guanlianData: null,
      lefFtabNav: [
        {
          name: '人员',
          isActive: true
        }, {
          name: '设备',
          isActive: false
        }
      ]
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    cssVars() {
      return {
        '--huizhiStrokeColor': this.ruleForm.huizhiStrokeColor
      }
    },
    cssVarsHuiZhi() {
      return {
        '--huizhiStrokeColor': this.ruleForm.huizhiFillColor,
        'marginTop': '8px'
      }
    },
    ...mapGetters([
      'settings'
    ]),
    handler() {
      return new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    },
    headers() {
      return {
        TOKEN:sessionStorage.get('TONE_voip').cmd.TOKEN,
        policeNo: sessionStorage.get('TONE_voip').cmd.POLICE_ID
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    tempSelectArr: {
      handler() {
        let total = 0
        if (this.data.length === 0) {
          this.checked = false
          return false
        } else {
          this.data.forEach((item) => {
            if (item.children) {
              total += item.children.length
            }
          })
          total += this.data.length
          if (this.tempSelectArr.length === total) {
            this.checked = true
          } else {
            this.checked = false
          }
          if (this.tempSelectArr.length === total && this.tempSelectArr.length > 0) {
            this.isIndeterminate = false
            this.isSelectAll = true
          } else if (this.tempSelectArr.length < total && this.tempSelectArr.length > 0) {
            this.isIndeterminate = true
            this.isSelectAll = false
          } else if (this.tempSelectArr.length === 0) {
            this.isSelectAll = false
            this.isIndeterminate = false
          }
        }
      }
    }
  },
  mounted() {
    const _this = this
    const viewer = this.viewer
    const handler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    // 实体点击事件监听
    handler.setInputAction((movement) => {
      const pickedLabel = viewer.scene.pick(movement.position)
      if (Cesium.defined(pickedLabel)) {
        const ids = pickedLabel.id
        if (ids.tab === '绘制') {
          this.tucengActive(ids)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  },
  created() {
    this.getImages()
  },
  activated() {},
  deactivated() {},
  methods: {
    // 定位当前标绘
    surePlotting(newData, overlays, result = false) {
      return new Promise((resolve, reject) => {
        const _this = this
        // 获取后台返回的标绘id 进行替换
        Array.isArray(newData) && newData.forEach(async(item) => {
          const obj = await _this.$api.plotting.getJSON(item.plottingJson)
          if (JSON.stringify(obj.data) === overlays) {
            resolve(item)
          }
          if (item.children && item.children.length > 0) {
            resolve(_this.surePlotting(item.children, overlays, result))
          }
        })
      })
    },
    // 获取所有树节点
    getAllNodes(node = [], arr = []) {
      for (const item of node) {
        arr.push(item)
        const parentArr = []
        if (item.children) parentArr.push(...item.children)
        if (parentArr && parentArr.length) this.getAllNodes(parentArr, arr)
      }
      return arr
    },
    filterNode(value, data) {
      if (!value) return true
      return data.plottingName.indexOf(value) !== -1
    },
    // 标注拖拽（由于地图中的标注需要设置lable的属性，所以放置到marker上比较复杂，这里就是单独的对lable进行拖拽）
    lableMove(downE) {
      this.map.disableDragging()
      const disLng = downE.point.lng - downE.target.point.lng
      const disLat = downE.point.lat - downE.target.point.lat
      const moveHandle = (moveE) => {
        const pointLng = moveE.point.lng - disLng
        const pointLat = moveE.point.lat - disLat
        var point = new this.BMap.Point(pointLng, pointLat)
        this.tuceng.setPosition(point)
      }
      const upHandle = () => {
        this.map.enableDragging()
        this.map.removeEventListener('mousemove', moveHandle)
        this.map.removeEventListener('mouseup', upHandle)
      }
      this.map.addEventListener('mousemove', moveHandle)
      this.map.addEventListener('mouseup', upHandle)
    },
    // 多边形拖拽（折线、多边形、矩形、椭圆）
    polygonMove(downE) {
      this.map.disableDragging()
      const pointArr = this.tuceng.getPath()
      const moveHandle = (moveE) => {
        const disLng = moveE.point.lng - downE.point.lng
        const disLat = moveE.point.lat - downE.point.lat
        const creatNewPointArr = []
        pointArr.forEach((v) => {
          // creatNewPointArr.push({ lng: v.lng + disLng, lat: v.lat + disLat })
          // 折线必须new point，所以这里统一使用
          creatNewPointArr.push(
            new this.BMap.Point(v.lng + disLng, v.lat + disLat)
          )
        })
        this.tuceng.setPath(creatNewPointArr)
      }
      const upHandle = () => {
        this.map.enableDragging()
        this.map.removeEventListener('mousemove', moveHandle)
        this.map.removeEventListener('mouseup', upHandle)
      }
      this.map.addEventListener('mousemove', moveHandle)
      this.map.addEventListener('mouseup', upHandle)
    },
    // 圆拖拽事件
    circleMove(downE) {
      this.map.disableDragging()
      const center = this.tuceng.getCenter()
      const moveHandle = (moveE) => {
        const disLng = moveE.point.lng - downE.point.lng
        const disLat = moveE.point.lat - downE.point.lat
        var newCenter = new this.BMap.Point(
          center.lng + disLng,
          center.lat + disLat
        )
        this.tuceng.setCenter(newCenter)
      }
      const upHandle = () => {
        this.map.enableDragging()
        this.map.removeEventListener('mousemove', moveHandle)
        this.map.removeEventListener('mouseup', upHandle)
      }
      this.map.addEventListener('mousemove', moveHandle)
      this.map.addEventListener('mouseup', upHandle)
    },
    renyuanHandle(node, data) {
      this.addList = []
      this.dialogTitle = `${data.plottingName} - 关联人员`
      this.dialogVisible = true
      this.guanlianData = data
      if (data.plottingYonghu && data.plottingYonghu.length > 0) {
        data.plottingYonghu.forEach((item) => {
          if (item) {
            this.addList.push({
              userId: item.id,
              userName: item.yonghuname,
              yonghuzxbj: item.yonghuzxbj
            })
          }
        })
      }
      if (data.plottingDev && data.plottingDev.length > 0) {
        data.plottingDev.forEach((item) => {
          if (item) {
            this.addList.push({
              devId: item.id,
              UnitName: item.name,
              type: item.dev_type
            })
          }
        })
      }
      this.$forceUpdate()
    },
    shebeiHandle(node, data) {
      this.addList = []
      this.dialogTitle = `${data.plottingName} - 关联设备`
      this.dialogVisible = true
      this.guanlianData = data
      // this.addList = data.plottingDev
      if (data.plottingDev && data.plottingDev.length > 0) {
        data.plottingDev.forEach((item) => {
          this.addList.push({
            devId: item.id,
            UnitName: item.name,
            type: item.dev_type
          })
        })
      }
      if (data.plottingYonghu && data.plottingYonghu.length > 0) {
        data.plottingYonghu.forEach((item) => {
          this.addList.push({
            userId: item.id,
            userName: item.yonghuname,
            yonghuzxbj: item.yonghuzxbj
          })
        })
      }
    },
    // 弹框确定按钮点击事件
    async sureClickHandle(node, data) {
      if (this.addList.length > 0) {
        // 保存人员和设备
        var plottingYonghu = this.addList.reduce((pre, ind) => {
          return pre += (ind.userId ? ind.userId + ',' : '')
        }, '')
        plottingYonghu = plottingYonghu.substr(0, plottingYonghu.length - 1)
        var plottingDev = this.addList.reduce((pre, ind) => {
          return pre += (ind.devId ? ind.devId + ',' : '')
        }, '')
        plottingDev = plottingDev.substr(0, plottingDev.length - 1)
        this.guanlianData.plottingYonghu = []
        this.guanlianData.plottingDev = []
        this.addList.forEach(item => {
          if (item.hasOwnProperty('userName')) {
            this.guanlianData.plottingYonghu.push({
              id: item.userId,
              yonghuname: item.userName,
              yonghuzxbj: item.yonghuzxbj
            })
          } else {
            this.guanlianData.plottingDev.push({
              id: item.devId,
              name: item.UnitName,
              dev_type: item.type
            })
          }
        })
        const query = {
          parentId: this.guanlianData.parentId,
          plottingId: this.guanlianData.plottingId,
          plottingName: this.guanlianData.plottingName,
          ddtId: this.guanlianData.ddtId,
          plottingYonghu: plottingYonghu || null,
          plottingDev: plottingDev || null,
          plottingJson: this.guanlianData.plottingJson
        }
        const res = await this.$api.plotting
          .addEditPlottinginfo(query)

        if (res) {
          this.$message.success('关联成功')
        } else {
          this.$message.error('关联失败')
        }
      }
      this.dialogVisible = false
      this.addList = []
      this.guanlianData = null
    },
    dialogcancle() {
      this.dialogVisible = false
      this.addList = []
      this.guanlianData = null
    },
    // 获取标绘列表
    async getPlottingById() {
      const _this = this
      this.$api.plotting
        .getPlottingById({
          ddtId: sessionStorage.get('TONE_sipUserInfo').userName
        })
        .then((res) => {
          _this.data = eval(res.data.msg)
          // 保存成功后 重新获取标绘列表的数据 保持数据更新
          setTimeout(async() => {
            // // 移除存在实体
            this.viewer.entities.removeAll()
            _this.tempSelectArr = []
            // 给每条数据加上图层数据
            const bhlb = queryId('bhlb', _this.settings.FEATURE_SETTING)
            const a = (arr) => {
              Array.isArray(arr) && arr.forEach(async(item, i) => {
                item.overlays = []
                const res = await _this.$api.plotting
                  .getJSON(item.plottingJson)
                try {
                  if (Array.isArray(res.data))item.overlays = _this.rend(_this.viewer, res.data)
                  if (!bhlb.isSpread && item.overlays && item.overlays.length > 0) {
                    item.overlays.forEach(o => {
                      o.show = false
                    })
                  } else {
                    item.overlays.forEach(o => {
                      o.show = true
                    })
                  }
                  item.plottingJsonData = res.data
                  if (item.children && item.children.length > 0) {
                    await a(item.children)
                  }
                } catch (err) {
                  console.log(err)
                }
              })
            }
            await a(_this.data)
            // setTimeout(_ => {
            //   _this.$refs.tree.setCheckedKeys([
            //     'd4bda800-b4b3-497c-afa7-258d84f19785',
            //     '14797c56-4293-4814-9c5d-6fb8449920f9'
            //   ])
            //   _this.check(null, { checkedNodes: _this.$refs.tree.getCheckedNodes() })
            // }, 1000)
            setTimeout(_ => { //
              if (bhlb.isSpread) { // 默认是否展开
                setTimeout(_ => {
                  const ids = _this.data.map((item) => item.plottingId)
                  _this.$refs.tree.setCheckedKeys(ids)
                  _this.check(null, { checkedNodes: _this.$refs.tree.getCheckedNodes() })
                  _this.isSelectAll = true
                }, 500)
              } else if (!bhlb.isSpread) {
                _this.$refs.tree.setCheckedKeys([])
                _this.check(null, { checkedNodes: [] })
                _this.isSelectAll = false
              }
            }, 10)
          }, 500)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 获取图标列表
    getImages() {
      this.$api.plotting
        .getPlottingImgs({
          ddtId: sessionStorage.get('TONE_sipUserInfo').userName
        })
        .then((res) => {
          this.tubiaoObject = eval(res.data.msg)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 节点被选中时触发
    check(node, data) {
      // 思路： 每次进来》上次进来的长度，show。<上次的长度，找到少的那个hide（）
      // 选中
      if (!this.data) {
        return
      }
      if (data.checkedNodes.length > this.tempSelectArr.length) {
        data.checkedNodes.forEach((item) => {
          if (item.overlays && item.overlays.length > 0) {
            item.overlays.forEach((o) => {
              o.show = true
            })
          }
        })
        this.tempSelectArr = data.checkedNodes
      }
      if (data.checkedNodes.length < this.tempSelectArr.length) {
        const result = this.tempSelectArr.filter(item => !data.checkedNodes.some(ele => ele.plottingId === item.plottingId))
        const isOnlyChild = data.checkedNodes.some(item => item.parentId === node.parentId)
        if (node && node.parentId !== '-1' && result.length >= 1 && isOnlyChild) {
          // 说明选中的还有其他子集标绘 父级不隐藏
          node.overlays.forEach((o) => {
            o.show = false
          })
          this.tempSelectArr = data.checkedNodes
          return
        } else if (node && node.parentId !== '-1' && result.length >= 1 && !isOnlyChild) {
          const filterParent = this.data.filter(item => item.plottingId === node.parentId)
          filterParent && Array.isArray(filterParent) && filterParent.forEach(o => {
            o && o.overlays && o.overlays.forEach(l => {
              l.show = false
            })
          })
        }
        result.forEach((item) => {
          if (item.overlays && item.overlays.length > 0) {
            item.overlays.forEach((o) => {
              o.show = false
            })
          }
        })
        this.tempSelectArr = data.checkedNodes
      }
    },
    rend,
    // 添加按钮
    addPlotting() {
      if (this.showPlotting && this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的编辑标绘')
        return false
      }
      if (this.showPlotting && !this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的添加标绘')
        return false
      }
      this.parentId = '-1'
      this.plottingId = null
      this.showPlotting = true
    },
    // 全选全不选
    selectAll() {
      if (!this.data) return
      const ids = this.data.map((item) => item.plottingId)
      if (!this.$refs.tree) {
        return
      }
      const checkArr = this.$refs.tree.getCheckedNodes()
      if (checkArr.length > 0) {
        this.$refs.tree.setCheckedKeys([])
        this.check(null, { checkedNodes: [] })
        this.isSelectAll = false
      } else if (this.data && this.data.length !== 0) {
        this.$refs.tree.setCheckedKeys(ids)
        this.check(null, { checkedNodes: this.$refs.tree.getCheckedNodes() })
        this.isSelectAll = true
      }
    },
    upImg() {
      return `${api}/manager/plotting/plottinginfo!uploadIco.action`
    },
    beforeAvatarUpload(file) {
      const userInfo = sessionStorage.get('TONE_sipUserInfo')
      this.dataFile.ddtId = userInfo.userName
      this.dataFile.name = this.ruleForm.tubiaoName
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isJPEG = testmsg === 'jpeg'
      const isJPG = testmsg === 'jpg'
      const isPNG = testmsg === 'png'
      const isGIF = testmsg === 'gif'
      const isLt8M = file.size / 1024 / 1024 < 8
      if (!this.ruleForm.tubiaoName) {
        this.$message.warning('请先填写图标名称')
        return false
      }
      if (!isJPG && !isPNG && !isGIF && !isJPEG) {
        this.$message.warning('上传图片只能是 JPG、JPEG、PNG、GIF 格式!')
        return false
      }
      if (!isLt8M) {
        this.$message.warning('上传图片大小不能超过 8MB!')
        return false
      }
      return (isJPG || isPNG || isGIF || isJPEG) && isLt8M
    },
    handleAvatarSuccess(res, file) {
      this.navActive = '图标'
      this.getImages()
      this.ruleForm.tubiaoName = ''
    },
    // 添加二级按钮
    append(node, data) {
      if (this.showPlotting && this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的编辑标绘')
        return false
      }
      if (this.showPlotting && !this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的添加标绘')
        return false
      }
      this.parentId = data.plottingId
      this.plottingId = null
      this.showPlotting = true
    },
    edit(node, data) {
      if (this.showPlotting && this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的编辑标绘')
        return false
      }
      if (this.showPlotting && !this.plottingId) {
        this.$message.warning('请先完成或取消当前进行的添加标绘')
        return false
      }
      this.editOldData = cloneDeep(data)
      const arr = this.$refs.tree.getCheckedKeys()
      if (arr.includes(data.plottingId)) {
        // this.check(node, { checkedNodes: this.$refs.tree.getCheckedNodes() })
      } else {
        arr.push(data.plottingId)
        this.$refs.tree.setCheckedKeys(arr)
        this.check(node, { checkedNodes: this.$refs.tree.getCheckedNodes() })
      }
      this.ruleForm.plottingName = data.plottingName
      this.parentId = data.parentId
      this.plottingId = data.plottingId
      this.overlays = data.overlays
      this.showPlotting = true
      if(this.overlays.length) {
        this.tucengActive(this.overlays[0])
      }
      this.moveEntity()
    },
    remove(node, data) {
      this.$confirm(
        `此操作将永久删除（${data.plottingName}）, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$api.plotting
            .toDeleteMany({
              plottingId: data.plottingId
            })
            .then((res) => {
              // // ycl 在前端删除数据 不进行调用接口刷新整体el-tree树的数据 否则树节点展开状态会整体重置
              // data.overlays.forEach(o => {
              //   o.show = false
              //   this.viewer.entities.remove(o)
              // })
              this.$message.success('删除成功')
              this.getPlottingById()
              this.parentId = '-1'
              this.plottingId = null
              this.overlays = []
              this.showPlotting = false
              this.editOldData = null
            })
            .catch((err) => {
              this.$message.error('删除失败')
              console.log(err)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    sure(formName) {
      const _this = this
      if (this.overlays.length === 0) {
        this.$message.warning('请添加完绘制物再保存!')
        return
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const newOverlays = []
          this.overlays.forEach((item) => {
            if (item.tab === '绘制' && item.name.search('点') !== -1) {
              newOverlays.push({
                name: item.name,
                tab: item.tab,
                time: item.time,
                pot: item.pot,
                id: item.id,
                img: item.img
              })
            }
            if (item.tab === '绘制' && item.name.search('折线') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                matColor: item.matColor,
                h: item.h,
                pointArr: item.pointArr,
                w: item.w
              })
            }
            if (item.tab === '绘制' && item.name.search('多边形') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                matColor: item.matColor,
                outColor: item.outColor,
                h: item.h,
                pointArr: item.pointArr
              })
            }
            if (item.tab === '绘制' && item.name.search('椭圆形') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                pot: item.pot,
                max: item.max,
                min: item.min,
                matColor: item.matColor,
                outColor: item.outColor,
                h: item.h
              })
            }
            if (item.tab === '绘制' && item.name.search('矩形') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                matColor: item.matColor,
                outColor: item.outColor,
                h: item.h,
                sPoint: item.sPoint,
                ePoint: item.ePoint
              })
            }
            // 避免椭圆进入此判断，添加空格区分
            if (item.tab === '绘制' && item.name.search('圆 ') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                pot: item.pot,
                rad: item.rad,
                matColor: item.matColor,
                outColor: item.outColor,
                h: item.h
              })
            }
            if ((item.tab === '标注' && item.name.search('一般文字') !== -1) || item.name.search('背景文字') !== -1) {
              newOverlays.push({
                id: item.id,
                name: item.name,
                tab: item.tab,
                time: item.time,
                pot: item.pot,
                text: item.text,
                ft: item.ft,
                fc: item.fc,
                bg: item.bg,
                showBg: item.showBg
              })
            }
            if (item.tab === '图标') {
              // 正在地图上添加图标时，将getIcon方法获取到的本地的api截取到，能达到在任何服务器上都能获取到正确的地址（只需要在渲染的时候前面加api就行），如果不截取
              // 只能是在本地显示本地的标绘，在线上显示线上添加的标绘，因为本地上传的图标地址会带api，线上的显示不对
              let img = item.img
              if (img.search('/api') !== -1) {
                img = img.substring(4, img.length)
              }
              newOverlays.push({
                name: item.name,
                tab: item.tab,
                time: item.time,
                pot: item.pot,
                id: item.id,
                img: item.img,
                sz: item.sz
              })
            }
          })
          const flag = this.plottingId
            ? isEqual(this.editOldData.plottingJsonData, newOverlays)
            : false
          const query = this.plottingId
            ? {
              parentId: this.parentId,
              plottingId: this.plottingId || null,
              plottingName: this.ruleForm.plottingName,
              ddtId: sessionStorage.get('TONE_sipUserInfo').userName,
              fileJson: flag ? null : JSON.stringify(newOverlays),
              plottingJson: flag ? this.editOldData.plottingJson : null
            }
            : {
              parentId: this.parentId,
              plottingId: this.plottingId || null,
              plottingName: this.ruleForm.plottingName,
              ddtId: sessionStorage.get('TONE_sipUserInfo').userName,
              fileJson: JSON.stringify(newOverlays)
            }
          _this.$api.plotting
            .addEditPlottinginfo(query)
            .then(async(res) => {
              _this.plottingId
                ? _this.$message.success('编辑成功')
                : _this.$message.success('添加成功')
              _this.$refs[formName].resetFields()
              _this.parentId = '-1'
              _this.plottingId = null
              _this.overlays = []
              _this.showPlotting = false
              _this.editOldData = null
              _this.getPlottingById()
              this.removeInputAction()
            })
            .catch((err) => {
              _this.$message.error('添加失败')
              console.log(err)
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    cancle(formName) {
      this.$refs[formName].resetFields()
      // 取消添加
      if (!this.plottingId) {
        if (this.overlays && this.overlays.length > 0) {
          this.overlays.forEach((item) => {
            this.viewer.entities.remove(item)
          })
        }
        this.overlays = []
      }
      // 取消编辑
      if (this.plottingId) {
        if (this.overlays && this.overlays.length > 0) {
          this.overlays.forEach((item) => {
            this.viewer.entities.remove(item)
          })
        }
        this.overlays = []
        this.getPlottingById()
        // this.editOldData.overlays = this.rend(
        //   this.viewer, this.editOldData.plottingJsonData
        // )
        // this.editOldData.overlays.forEach((o) => {
        //   o.show = true
        // })

        // this.overlays = this.rend(
        //   this.viewer, this.editOldData.plottingJsonData
        // )
        // this.overlays.forEach((o) => {
        //   o.show = true
        // })
      }
      this.parentId = '-1'
      this.plottingId = null
      this.showPlotting = false
      this.editOldData = null
      this.tucengName = ''
      this.tuceng = null
      this.removeInputAction()
    },
    isShowTab(val) {
      this.navActive = val
      this.tucengName = ''
      this.tuceng = null
    },
    // 绘制
    potting(item) {
      item.text === '点' ? this.draw('marker', '点') : ''
      item.text === '折线' ? this.draw('polyline', '折线') : ''
      item.text === '多边形' ? this.draw('polygon', '多边形') : ''
      item.text === '矩形' ? this.draw('rectangle', '矩形') : ''
      item.text === '圆' ? this.draw('circle', '圆') : ''
      item.text === '椭圆形' ? this.draw('oval', '椭圆形') : ''
    },
    draw(m, n) {
      const viewer = this.viewer
      // 实体点击事件监听
      if(n === '点') {
        this.handler.setInputAction((movement) => {
          var cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var h = this.ruleForm.height
          const entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lng, lat, h),
            id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
            billboard: {
              image: jqPos,
              width: 30, // 如果不设置宽高 初始化无法正常显示聚合数量
              height: 30
            }
          });
          entity.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
          entity.time = new Date().getTime()
          entity.tab = '绘制'
          entity.pot = {lng,lat,h}
          entity.img = jqPos
          console.log(entity, 789)
          this.overlays.push(entity)
          this.tucengName = entity.name
          this.tuceng = entity
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.setInputAction(()=> {
          viewer.scene.screenSpaceCameraController.enableInputs = true; //开启鼠标拖动地图的默认行为
          this.removeInputAction()
          this.moveEntity()
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
      }
      if(n === '折线') {
        let drawingPolyline = false;
        let polylinePositions = [];
        var polylineE = null;
        this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
        this.handler.setInputAction((movement) => {
            const ray = viewer.camera.getPickRay(movement.position);
            const position = viewer.scene.globe.pick(ray, viewer.scene);
            const cartographic = Cesium.Cartographic.fromCartesian(position);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            var h = this.ruleForm.height
            var positionWithHeight = Cesium.Cartesian3.fromDegrees(lng, lat, h)
            if (Cesium.defined(position)) {
                drawingPolyline = true;
                polylinePositions = [positionWithHeight];
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.handler.setInputAction((movement) => {
          if (drawingPolyline) {
            const ray = viewer.camera.getPickRay(movement.endPosition);
            const position = viewer.scene.globe.pick(ray, viewer.scene);
            // 添加高度，转化
            const cartographic = Cesium.Cartographic.fromCartesian(position);
            const lng = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            var h = this.ruleForm.height
            var positionWithHeight = Cesium.Cartesian3.fromDegrees(lng, lat, h)
            if (Cesium.defined(position)) {
                polylinePositions.push(positionWithHeight);
            }
            if(polylineE === null) {
              polylineE = viewer.entities.add({
                id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
                polyline: {
                  positions: new Cesium.CallbackProperty(() => {
                      return polylinePositions
                  }, false),
                  width: this.ruleForm.huizhiStrokeWeight,
                  material: Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor)
                },
              });
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler.setInputAction((movement) => {
          this.viewer.scene.screenSpaceCameraController.enableInputs = true;
          polylineE.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
          polylineE.time = new Date().getTime()
          polylineE.tab = '绘制'
          polylineE.matColor = this.ruleForm.huizhiFillColor
          polylineE.h = this.ruleForm.height
          polylineE.pointArr = polylinePositions
          polylineE.w = this.ruleForm.huizhiStrokeWeight
          this.overlays.push(polylineE)
          this.tucengName = polylineE.name
          this.tuceng = polylineE
          drawingPolyline = false;
          this.removeInputAction()
          this.moveEntity()
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }
      if(n === '圆') {
        let center;
        let circle;
        let radius;
        let drawing = false;
        this.viewer._container.style.cursor = "crosshair";
        this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
        this.handler.setInputAction((click) => {
          let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid); //鼠标按下记录中心点
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
          let cartesian = this.viewer.camera.pickEllipsoid(
            movement.endPosition,
            this.viewer.scene.globe.ellipsoid
          );
          if (cartesian) {
            if (!Cesium.defined(circle)) {
              circle = this.viewer.entities.add({
                id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
                position: center,
                ellipse: {
                  semiMinorAxis: new Cesium.CallbackProperty(function () {
                    return radius;
                  }, false),
                  semiMajorAxis: new Cesium.CallbackProperty(function () {
                    return radius;
                  }, false),
                  material: Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor),
                  height: this.ruleForm.height
                }
              })
            }
            circle.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
            circle.time = new Date().getTime()
            circle.tab = '绘制'
            radius = Cesium.Cartesian3.distance(center, cartesian);
            circle.rad = radius
            circle.matColor = this.ruleForm.huizhiFillColor
            circle.outColor = this.ruleForm.huizhiStrokeColor
            circle.h = this.ruleForm.height
            var cartographic = Cesium.Cartographic.fromCartesian(center);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            circle.pot = {lng,lat}
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标抬起绘制结束
        this.handler.setInputAction(()=> {
          this.overlays.push(circle)
          this.tucengName = circle.name
          this.tuceng = circle
          drawing = false;
          this.removeInputAction()
          this.moveEntity()
          this.viewer._container.style.cursor = "default";
          this.viewer.scene.screenSpaceCameraController.enableInputs = true;
          this.viewer._container.style.cursor = 'grab'
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }
      if(n === '矩形') {
        this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
        this.viewer._container.style.cursor = "crosshair";
        let startPoint = null;
        let rectangle = null;
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
                id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
                rectangle: {
                  coordinates: new Cesium.CallbackProperty(function () {
                    return Cesium.Rectangle.fromCartesianArray([
                      startPoint,
                      endPoint,
                    ]);
                  }, false),
                  material: Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor),
                  height: this.ruleForm.height
                }
              })
              rectangle.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
              rectangle.time = new Date().getTime()
              rectangle.tab = '绘制'
              rectangle.matColor = this.ruleForm.huizhiFillColor
              rectangle.outColor = this.ruleForm.huizhiStrokeColor
              rectangle.h = this.ruleForm.height
              rectangle.sPoint = startPoint
              rectangle.ePoint = endPoint
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler.setInputAction((movement)=> {
          this.overlays.push(rectangle)
          this.tucengName = rectangle.name
          this.tuceng = rectangle
          this.viewer._container.style.cursor = "default";
          this.viewer.scene.screenSpaceCameraController.enableInputs = true;
          this.viewer._container.style.cursor = 'grab'
          this.removeInputAction()
          this.moveEntity()
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }
      if(n === '多边形') {
        let polygon_point_arr = []
        let polygon_entity = null
        this.handler.setInputAction((event) => {
          // 屏幕坐标转为空间坐标
          const cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.viewer.scene.globe.ellipsoid)
          // 判断是否定义（是否可以获取到空间坐标）
          if (Cesium.defined(cartesian)) {
            // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
            if (polygon_entity) {
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
          polygon_entity.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
          polygon_entity.time = new Date().getTime()
          polygon_entity.tab = '绘制'
          polygon_entity.matColor = this.ruleForm.huizhiFillColor
          polygon_entity.outColor = this.ruleForm.huizhiStrokeColor
          polygon_entity.h = this.ruleForm.height
          polygon_entity.pointArr = polygon_point_arr
          this.overlays.push(polygon_entity)
          this.tucengName = polygon_entity.name
          this.tuceng = polygon_entity
          this.removeInputAction()
          this.moveEntity()
          this.viewer._container.style.cursor = 'grab'
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        this.handler.setInputAction((click) => {
          // 世界坐标点
          const result = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
          polygon_point_arr.push(result)
          if (polygon_entity == null) {
            // 绘制动态多边形
            polygon_entity = this.viewer.entities.add({
              id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
              polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                  return new Cesium.PolygonHierarchy(polygon_point_arr)
                }, false),
                material: Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor),
                height: this.ruleForm.height
              }
            })
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      }
      if(n === '椭圆形') {
        let center;
        let oval;
        let radius;
        let drawing = false;
        this.viewer._container.style.cursor = "crosshair";
        this.viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
        this.handler.setInputAction((click) => {
          let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid); //鼠标按下记录中心点
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
          let cartesian = this.viewer.camera.pickEllipsoid(
            movement.endPosition,
            this.viewer.scene.globe.ellipsoid
          );
          if (cartesian) {
            if (!Cesium.defined(oval)) {
              oval = this.viewer.entities.add({
                id: `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
                position: center,
                ellipse: {
                  semiMinorAxis: new Cesium.CallbackProperty(function () {
                    // 左右移动
                    if (Math.abs(cartesian.x - center.x) > Math.abs(cartesian.y - center.y)) {
                      return radius * 2
                    } else {
                      return radius
                    }
                  }, false),
                  semiMajorAxis: new Cesium.CallbackProperty(function () {
                    // 上下移动
                    if (Math.abs(cartesian.x - center.x) < Math.abs(cartesian.y - center.y)) {
                      return radius * 2
                    } else {
                      return radius;
                    }
                  }, false),
                  material: Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor),
                  height: this.ruleForm.height
                }
              })
            }
            radius = Cesium.Cartesian3.distance(center, cartesian);
            oval.name = `${n} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
            oval.time = new Date().getTime()
            oval.tab = '绘制'
            oval.matColor = this.ruleForm.huizhiFillColor
            oval.outColor = this.ruleForm.huizhiStrokeColor
            oval.h = this.ruleForm.height
            var cartographic = Cesium.Cartographic.fromCartesian(center);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            oval.pot = {lng,lat}
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标抬起绘制结束
        this.handler.setInputAction(()=> {
          oval.max = oval.ellipse.semiMajorAxis.getValue()
          oval.min = oval.ellipse.semiMinorAxis.getValue()
          this.overlays.push(oval)
          this.tucengName = oval.name
          this.tuceng = oval
          drawing = false;
          this.removeInputAction()
          this.moveEntity()
          this.viewer._container.style.cursor = "default";
          this.viewer.scene.screenSpaceCameraController.enableInputs = true;
          this.viewer._container.style.cursor = 'grab'
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }
    },
    moveEntity() {
      const viewer = this.viewer
      this.handler.setInputAction((click)=> {
        // 获取鼠标按下去的经纬度
        // 笛卡尔坐标
        const cartesianDown = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        // 弧度
        const cartographicDown = Cesium.Cartographic.fromCartesian(cartesianDown);
        // 经纬度
        const lngDown = Cesium.Math.toDegrees(cartographicDown.longitude);
        const latDown = Cesium.Math.toDegrees(cartographicDown.latitude);
        // 选中某一实体图层
        const pickedLabel = viewer.scene.pick(click.position)
        if (Cesium.defined(pickedLabel)) {
          const ids = pickedLabel.id
          this.tucengActive(ids)
        }
        var pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id._id === this.tuceng.id) {
          viewer.scene.screenSpaceCameraController.enableInputs = false; //禁止鼠标拖动地图的默认行为
          // 初始化的经纬度
          if(this.tuceng.name.search('点') !== -1 || this.tuceng.name.search('圆') !== -1 || this.tuceng.name.search('椭圆形') !== -1 || this.tuceng.name.search('文字') !== -1 || this.tuceng.tab === '图标') {
            var initLng = cloneDeep(this.tuceng.pot.lng)
            var initLat = cloneDeep(this.tuceng.pot.lat)
          }
          if(this.tuceng.name.search('矩形') !== -1) {
            var initSPoint = cloneDeep(this.tuceng.sPoint)
            var initEPoint = cloneDeep(this.tuceng.ePoint)
          }
          if(this.tuceng.name.search('多边形') !== -1 || this.tuceng.name.search('折线') !== -1) {
            var initPointArr = cloneDeep(this.tuceng.pointArr)
          }
          // 添加移动事件
          this.handler.setInputAction((movement) => {
            var ray = viewer.camera.getPickRay(movement.endPosition);
            // 移动的坐标
            var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (cartesian) {
              // 移动的弧度
              var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              // 移动的经纬度
              var lng = Cesium.Math.toDegrees(cartographic.longitude);
              var lat = Cesium.Math.toDegrees(cartographic.latitude);
              var h = this.ruleForm.height;
              // 移动的距离（经纬度）
              let disLng = lng - lngDown
              let disLat = lat - latDown
              // 只有在添加或者编辑的时候才能拖拽
              if(this.overlays && this.overlays.length>0) {
                var containsObject = this.overlays.some((obj)=> {
                    return obj.id === this.tuceng.id;
                });
                // 拖拽之后新的经纬度为初始位置加上移动的位置
                if(containsObject && (this.tuceng.name.search('点') !== -1 || this.tuceng.name.search('文字') !== -1 || this.tuceng.tab === '图标')) {
                  let newLng = initLng + disLng
                  let newLat = initLat + disLat
                  this.tuceng.position = Cesium.Cartesian3.fromDegrees(newLng, newLat, h)
                  this.tuceng.pot.lng = newLng
                  this.tuceng.pot.lat = newLat
                  this.tuceng.pot.h = h
                }
                if(containsObject && (this.tuceng.name.search('圆') !== -1 || this.tuceng.name.search('椭圆形') !== -1)) {
                  let newLng = initLng + disLng
                  let newLat = initLat + disLat
                  this.tuceng.position = Cesium.Cartesian3.fromDegrees(newLng, newLat)
                  this.tuceng.ellipse.height = this.ruleForm.height
                  this.tuceng.pot.lng = newLng
                  this.tuceng.pot.lat = newLat
                  this.tuceng.h = h
                }
                if(containsObject && this.tuceng.name.search('矩形') !== -1) {
                  let newSPoint = {
                    x: initSPoint.x + (cartesian.x - cartesianDown.x),
                    y: initSPoint.y + (cartesian.y - cartesianDown.y),
                    z: initSPoint.z + (cartesian.z - cartesianDown.z)
                  }
                  let newEPoint = {
                    x: initEPoint.x + (cartesian.x - cartesianDown.x),
                    y: initEPoint.y + (cartesian.y - cartesianDown.y),
                    z: initEPoint.z + (cartesian.z - cartesianDown.z)
                  }
                  this.tuceng.rectangle.coordinates = new Cesium.CallbackProperty(function () {
                    return Cesium.Rectangle.fromCartesianArray([
                      newSPoint,
                      newEPoint,
                    ])
                  })
                  this.tuceng.rectangle.height = this.ruleForm.height
                  this.tuceng.sPoint = newSPoint
                  this.tuceng.ePoint = newEPoint
                  this.tuceng.h = h
                }
                if(containsObject && this.tuceng.name.search('多边形') !== -1) {
                  let newPointArr = []
                  initPointArr.forEach((item)=>{
                    newPointArr.push({
                      x: item.x + (cartesian.x - cartesianDown.x),
                      y: item.y + (cartesian.y - cartesianDown.y),
                      z: item.z + (cartesian.z - cartesianDown.z)
                    })
                  })
                  this.tuceng.polygon.hierarchy = new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(newPointArr)
                  }, false)
                  this.tuceng.polygon.height = this.ruleForm.height
                  this.tuceng.pointArr = newPointArr
                  this.tuceng.h = h
                }
                if(containsObject && this.tuceng.name.search('折线') !== -1) {
                  let newPointArr = []
                  initPointArr.forEach((item)=>{
                    newPointArr.push({
                      x: item.x + (cartesian.x - cartesianDown.x),
                      y: item.y + (cartesian.y - cartesianDown.y),
                      z: item.z + (cartesian.z - cartesianDown.z)
                    })
                  })
                  this.tuceng.polyline.positions = new Cesium.CallbackProperty(() => {
                      return newPointArr
                  }, false),
                  this.tuceng.pointArr = newPointArr
                }
              }
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.handler.setInputAction(()=> {
        viewer.scene.screenSpaceCameraController.enableInputs = true; //开启鼠标拖动地图的默认行为
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }, Cesium.ScreenSpaceEventType.LEFT_UP)
    },
    removeInputAction() {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    tucengActive(item) {
      // 只有在添加或者编辑的时候图层才能被选中
      if(this.overlays && this.overlays.length>0) {
        var containsObject = this.overlays.some((obj)=> {
            return obj.id === item.id;
        });
        if(containsObject) {
          this.tucengName = item.name
          this.tuceng = item
          this.navActive = item.tab
          // 标注相关回显
          if (this.tucengName.search('文字') !== -1) {
            this.ruleForm.biaozhuFillColor = item.bg
            this.ruleForm.height = item.pot.h
            this.ruleForm.biaozhuFontColor = item.fc
            this.ruleForm.biaozhuTextarea = item.text
            console.log(item, 789)
            var parts = item.ft.split(" ");
            this.ruleForm.biaozhuFontSize = parseInt(parts[0])
            this.ruleForm.biaozhuFontFamily = parts[1]
          }
          if (this.tuceng.tab === '图标') {
            this.ruleForm.tubiaoSize = item.sz
            return false
          }
          // 绘制相关回显
          if (this.tuceng.tab === '绘制') {
            if (this.tucengName && this.tucengName.search('点') !== -1) {
              this.ruleForm.height = item.pot.h
            }
            if (this.tucengName && this.tucengName.search('折线') !== -1) {
              this.ruleForm.height = item.h
              this.ruleForm.huizhiFillColor = item.polyline.material.color.getValue().toCssColorString()
              this.ruleForm.huizhiStrokeWeight = item.w
            }
            if (this.tucengName && (this.tucengName.search('圆') !== -1 || this.tucengName.search('椭圆形') !== -1)) {
              this.ruleForm.huizhiStrokeColor = item.ellipse.outlineColor.getValue().toCssColorString()
              this.ruleForm.huizhiFillColor = item.ellipse.material.color.getValue().toCssColorString()
              this.ruleForm.height = item.ellipse.height.getValue()
              return false
            }
            if (this.tucengName && this.tucengName.search('矩形') !== -1) {
              this.ruleForm.huizhiStrokeColor = item.rectangle.outlineColor.getValue().toCssColorString()
              this.ruleForm.huizhiFillColor = item.rectangle.material.color.getValue().toCssColorString()
              this.ruleForm.height = item.rectangle.height.getValue()
              return false
            }
            if (this.tucengName && this.tucengName.search('多边形') !== -1) {
              this.ruleForm.huizhiStrokeColor = item.polygon.outlineColor.getValue().toCssColorString()
              this.ruleForm.huizhiFillColor = item.polygon.material.color.getValue().toCssColorString()
              this.ruleForm.height = item.polygon.height.getValue()
              return false
            }
          }
        }
      }
    },
    removeTuCeng(item) {
      const index = this.overlays.findIndex((d) => d.time === item.time)
      this.viewer.entities.remove(this.viewer.entities.getById(item.id))
      this.overlays.splice(index, 1)
      if (this.tucengName === item.name) {
        this.tucengName = ''
        this.tuceng = null
      }
    },
    // 绘制填充色改变事件
    huizhiFillColorChange(val) {
      this.ruleForm.huizhiFillColor = val
      if (this.tucengName && this.tucengName.search('折线') !== -1) {
        this.tucengName? this.tuceng.polyline.material = Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor) : ''
      }
      if (this.tucengName && (this.tucengName.search('圆') !== -1 || this.tucengName.search('椭圆形') !== -1)) {
        this.tucengName? this.tuceng.ellipse.material = Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor) : ''
        this.tuceng.matColor = this.ruleForm.huizhiFillColor
      }
      if (this.tucengName && this.tucengName.search('矩形') !== -1) {
        this.tucengName? this.tuceng.rectangle.material = Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor) : ''
        this.tuceng.matColor = this.ruleForm.huizhiFillColor
      }
      if (this.tucengName && this.tucengName.search('多边形') !== -1) {
        this.tucengName? this.tuceng.polygon.material = Cesium.Color.fromCssColorString(this.ruleForm.huizhiFillColor) : ''
        this.tuceng.matColor = this.ruleForm.huizhiFillColor
      }
    },
    // 绘制线粗细改变事件
    huizhiStrokeWeightChange(val) {
      this.ruleForm.huizhiStrokeWeight = val
      this.tucengName && this.tucengName.search('折线') !== -1
        ? this.tuceng.polyline.width = this.ruleForm.huizhiStrokeWeight : 4
      this.tuceng.w = this.ruleForm.huizhiStrokeWeight
    },
    // 绘制边框色改变事件
    huizhiStrokeColorChange(val) {
      this.ruleForm.huizhiStrokeColor = val
      if (this.tucengName && (this.tucengName.search('圆') !== -1 || this.tucengName.search('椭圆形') !== -1)) {
        this.tucengName? this.tuceng.ellipse.outlineColor = Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor) : ''
        this.tuceng.outColor = this.ruleForm.huizhiStrokeColor
      }
      if (this.tucengName && this.tucengName.search('矩形') !== -1) {
        this.tucengName? this.tuceng.rectangle.outlineColor = Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor) : ''
        this.tuceng.outColor = this.ruleForm.huizhiStrokeColor
      }
      if (this.tucengName && this.tucengName.search('多边形') !== -1) {
        this.tucengName? this.tuceng.polygon.outlineColor = Cesium.Color.fromCssColorString(this.ruleForm.huizhiStrokeColor) : ''
        this.tuceng.outColor = this.ruleForm.huizhiStrokeColor
      }
    },
    heightChange(val) {
      this.ruleForm.height = val
      if(this.tucengName.search('点') !== -1 || this.tucengName.search('文字') !== -1 || this.tuceng.tab === '图标') {
        if(this.tucengName) {
          var lng = this.tuceng.pot.lng;
          var lat = this.tuceng.pot.lat;
          var h = this.ruleForm.height;
          this.tuceng.position = Cesium.Cartesian3.fromDegrees(lng, lat, h)
          this.tuceng.pot = {lng,lat,h}
        }
      }
      if(this.tucengName.search('折线') !== -1) {
        if(this.tucengName) {
          let newPoint = []
          this.tuceng.pointArr.forEach((item)=>{
            const cartographic = Cesium.Cartographic.fromCartesian(item);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var h = Number(this.ruleForm.height);
            console.log(lng, lat, h)
            var positionH = Cesium.Cartesian3.fromDegrees(lng, lat, h)
            newPoint.push(positionH)
          })
          this.tuceng.polyline.positions = newPoint
          this.tuceng.pointArr = newPoint
          this.tuceng.h = Number(this.ruleForm.height)
        }
      }
      if(this.tucengName.search('圆') !== -1 || this.tucengName.search('椭圆形') !== -1) {
        this.tucengName? this.tuceng.ellipse.height = this.ruleForm.height : 10000
        this.tuceng.h = this.ruleForm.height
      }
      if(this.tucengName.search('矩形') !== -1) {
        this.tucengName? this.tuceng.rectangle.height = this.ruleForm.height : 10000
        this.tuceng.h = this.ruleForm.height
      }
      if(this.tucengName.search('多边形') !== -1) {
        this.tucengName? this.tuceng.polygon.height = this.ruleForm.height : 10000
        this.tuceng.h = this.ruleForm.height
      }
    },
    // 标注字体颜色改变事件
    biaozhuFontColorChange(val) {
      this.ruleForm.biaozhuFontColor = val
      this.tucengName? this.tuceng.label.fillColor = Cesium.Color.fromCssColorString(this.ruleForm.biaozhuFontColor) : ''
      this.tuceng.fc = this.ruleForm.biaozhuFontColor
    },
    // 标注字体大小改变事件
    biaozhuFontSizeChange(val) {
      this.ruleForm.biaozhuFontSize = val
      this.tucengName? this.tuceng.label.font = `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}` : ''
      this.tuceng.ft = `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}`
    },
    // 标注字体样式改变事件
    biaozhuFontFamilyChange(val) {
      this.ruleForm.biaozhuFontFamily = val
      this.tucengName? this.tuceng.label.font = `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}` : ''
      this.tuceng.ft = `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}`
    },
    // 标注字体文字内容改变事件
    biaozhuTextareaChange(val) {
      this.ruleForm.biaozhuTextarea = val
      this.tucengName? this.tuceng.label.text = this.ruleForm.biaozhuTextarea : ''
      this.tuceng.text = this.ruleForm.biaozhuTextarea
    },
    // 标注背景色
    biaozhuFillColorChange(val) {
      this.ruleForm.biaozhuFillColor = val
      this.tucengName? this.tuceng.label.backgroundColor = Cesium.Color.fromCssColorString(this.ruleForm.biaozhuFillColor) : ''
      this.tuceng.bg = this.ruleForm.biaozhuFillColor
    },
    tubiaoSizeChange(val) {
      this.ruleForm.tubiaoSize = val
      if(this.tucengName) {
        this.tuceng.billboard.width = this.ruleForm.tubiaoSize
        this.tuceng.billboard.height = this.ruleForm.tubiaoSize
      }
      this.tuceng.sz = this.ruleForm.tubiaoSize
    },
    // 标注对象点击
    biaozhuClick(item) {
      if (this.navActive === '标注') {
        this.biaozhuText = item.text
        const viewer = this.viewer
        // 实体点击事件监听
        this.handler.setInputAction((movement) => {
          var cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var h = this.ruleForm.height
          const entity = viewer.entities.add(
            new Cesium.Entity({
              position: Cesium.Cartesian3.fromDegrees(lng, lat, h),
              id: `${this.biaozhuText} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
              label: {
                text: `${this.ruleForm.biaozhuTextarea}`,
                font: `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}`,
                fillColor: Cesium.Color.fromCssColorString(this.ruleForm.biaozhuFontColor),
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                backgroundColor: Cesium.Color.fromCssColorString(this.ruleForm.biaozhuFillColor),
                showBackground: item.text === '背景文字' ? true : false
              },
            })
          );
          entity.name = `${this.biaozhuText} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
          entity.time = new Date().getTime()
          entity.tab = '标注'
          entity.pot = {lng,lat,h}
          entity.text = `${this.ruleForm.biaozhuTextarea}`
          entity.ft = `${this.ruleForm.biaozhuFontSize}px ${this.ruleForm.biaozhuFontFamily}`
          entity.fc = this.ruleForm.biaozhuFontColor
          entity.bg = this.ruleForm.biaozhuFillColor
          entity.showBg = item.text === '背景文字' ? true : false

          console.log(entity, 789)
          this.overlays.push(entity)
          this.tucengName = entity.name
          this.tuceng = entity
          this.biaozhuText = ''
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.setInputAction(()=> {
          this.removeInputAction()
          this.moveEntity()
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
      }
    },
    // 图标对象点击
    tubiaoClick(item) {
      this.selectTuBiao = item
      console.log(item, '图标')
      const viewer = this.viewer
      this.handler.setInputAction((movement) => {
        var cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var h = this.ruleForm.height
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat, h),
          id: `${this.selectTuBiao.name} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`,
          billboard: {
            image: api + this.selectTuBiao.icoUrl,
            width: this.ruleForm.tubiaoSize, // 如果不设置宽高 初始化无法正常显示聚合数量
            height: this.ruleForm.tubiaoSize
          }
        });
        entity.name = `${this.selectTuBiao.name} ${parseTime(new Date(),'{y}{m}{d} {h}:{i}:{s}')}`
        entity.time = new Date().getTime()
        entity.tab = '图标'
        entity.pot = {lng,lat,h}
        entity.img = api + this.selectTuBiao.icoUrl
        entity.sz = this.ruleForm.tubiaoSize
        console.log(entity, 789)
        this.overlays.push(entity)
        this.tucengName = entity.name
        this.tuceng = entity
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.handler.setInputAction(()=> {
        viewer.scene.screenSpaceCameraController.enableInputs = true; //开启鼠标拖动地图的默认行为
        this.removeInputAction()
        this.moveEntity()
      }, Cesium.ScreenSpaceEventType.LEFT_UP)
    }
  }
}
</script>
<style lang="scss" scoped>
.plottingList {
  user-select: none;
  .plottingListWrap {
    position: fixed;
    width: 360px;
    min-width: 260px;
    left: 0px;
    margin-left: 20px;
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    .title {
      padding: 15px 10px;
      font-size: 14px;
      color: #fff;
      font-weight: 500;
    }
    .btnWrap {
      padding: 0px 10px;
      width: 100%;
      position: absolute;
      bottom: 16px;
      text-align: center;
      .plus,
      .selectAll {
        width:100%;
        height: 28px;
        background: linear-gradient(0deg, #2a7aa2, #055984);
        border: 1px solid #01cfff;
        border-radius: 4px;
        color: #00d8ff;
        cursor: pointer;
        span {
          &:first-child {
            margin-right: 2px;
            font-size: 16px;
          }
          &:last-child {
            display: inline-block;
            transform: translateY(-1px);
          }
        }
      }
      .selectAll {
        margin-left: 5px;
      }
    }
    .list {
      width: 100%;
      padding: 0px 10px;
      height: calc(100% - 100px);
      margin-top: 5px;
      overflow: auto;
      .edit-box{
        width: 100%;
        display: flex;
        justify-content: space-between;
        color: #00d8ff;
        box-sizing: border-box;
        padding: 8px 12px;
        ::v-deep .el-checkbox__inner{
          background-color: transparent;
          border: 1px solid #01d3f9;
        }
        ::v-deep .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
          content: '';
          position: absolute;
          display: block;
          background-color: #01d3f9;
          height: 2px;
          -webkit-transform: scale(.5);
          transform: scale(.5);
          left: 0;
          right: 0;
          top: 5px;
        }
         ::v-deep .el-checkbox__inner::after{
           box-sizing: content-box;
          content: "";
          border: 1px solid #01d3f9;
          border-left: 0;
          border-top: 0;
          height: 7px;
          left: 4px;
          position: absolute;
          top: 1px;
         }
        ::v-deep .el-checkbox__label {
              color: #01d3f9;
              display: inline-block;
              padding-left: 10px;
              line-height: 19px;
              font-size: 12px;
          }
      }
      ::v-deep .filter {
        width: 100%;
        .el-input__inner {
          height: 30px;
          border: 1px solid #197491;
          background-color: #265872;
          color: #fff;
          font-size: 12px;
          &::-webkit-input-placeholder {
            color: #0fabd4;
            font-size: 12px;
          }
          &:-moz-placeholder {
            color: #0fabd4;
            font-size: 12px;
          }
          &::-moz-placeholder {
            color: #0fabd4;
            font-size: 12px;
          }
          &:-ms-input-placeholder {
            color: #0fabd4;
            font-size: 12px;
          }
        }
        .el-input__suffix {
          right: 0;
          top:2px;
          .img {
            cursor: pointer;
          }
        }
      }
      ::v-deep .t01_tree {
        .el-tree-node__content {
          height: 35px;
        }
        .el-tree-node.is-current > .el-tree-node__content {
          background: rgba(0, 183, 238, 0.1) !important;
        }
        .el-tree-node__content:hover {
          background: rgba(0, 183, 238, 0.1) !important;
        }
        .el-tree-node:focus > .el-tree-node__content {
          background: rgba(0, 183, 238, 0.1) !important;
        }
        // .is-leaf {
        //   padding-left: 6px !important;
        // }
        // .is-leaf.el-icon-caret-right:before {
        //   content: "\e6df" !important;
        //   font-size: 14px !important;
        //   visibility: hidden !important;
        // }
        .el-checkbox {
          .el-checkbox__inner {
            border: 1px solid #01d3f9;
            background-color: transparent;
            &::after {
              border: 1px solid #01d3f9;
              border-left: 0;
              border-top: 0;
            }
          }
          .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
            background-color: #01d3f9;
          }
        }
        .custom-tree-node {
          width: calc(100% - 50px);
          .labelName {
            width: calc(100% - 130px);
            color: #01d3f9;
          }
          .listBtn {
            color: #01d3f9;
            span {
              display: inline-block;
              margin-right: 10px;
              font-size: 16px;
              transform: translateY(-2px);
            }
            img {
              width: 16px;
              height: 16px;
              margin-right: 10px;
              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
        // .el-tree-node__expand-icon.expanded {
        //   -webkit-transform: rotate(0deg);
        //   transform: rotate(0deg);
        // }
        // .el-icon-caret-right:before {
        //   content: "\e78a";
        //   font-size: 16px;
        //   color: #01d3f9;
        // }
        // .el-tree-node__expand-icon.expanded.el-icon-caret-right:before{
        //   content: "\e784";
        //   font-size: 16px;
        //   color: #01d3f9;
        // }
      }
    }
  }
  .plotting {
   position: fixed;
    width: 360px;
    min-width: 260px;
    right: 20px;
    margin-left: 20px;
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    .title {
      font-size: 14px;
      color: #fff;
      font-weight: 500;
      padding: 15px 10px;
      border-bottom: 1px solid #01cfff;
    }
    ::v-deep .ruleForm {
      // overflow-y: auto;
      // overflow-x: hidden;
      height:calc(100% - 100px);
      padding: 15px 10px;
      .el-form-item {
        margin-bottom: 10px;
        &.plottingName {
          margin-bottom: 15px;
        }
      }
      .el-form-item__label {
        font-size: 12px;
        color: #fff;
        font-weight: 500 !important;
        padding: 0;
      }
      .el-input__inner {
        width: 100%;
        height: 26px;
        line-height: 26px;
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
      .tab-cards {
        box-sizing: content-box;
        width: calc(100% - 2px);
        height: 28px;
        margin: 10px auto;
        margin-bottom: 1px;
        background: linear-gradient(0deg, #2a7aa2, #055984);
        border: 1px solid #01cfff;
        border-radius: 4px;
        li {
          width: 33.3%;
          float: left;
          height: 28px;
          text-align: center;
          color: #00d8ff;
          line-height: 28px;
          cursor: pointer;
          user-select: none;
          &.active {
            color: #fff;
            height: 30px;
            line-height: 30px;
            margin-top: -1px;
            margin-left: -1px;
            padding-left: 1px;
            background: url("../../../assets/images/equipment/active.png")
              no-repeat;
            background-size: 100% 100%;
          }
          &:last-child {
            float: right;
            &.active {
              margin-right: -1px;
              // padding-right: 1px;
            }
          }
        }
      }
      .tab-con {
        overflow-y: auto;
        overflow-x: hidden;
        height:calc(100% - 70px);
        .tab-con-item {
          position: absolute;
          width: 100%;
          height: 100%;
          transition: all 0.2s linear;
          left: -100%;
          background-size: cover;
          z-index: 1001;
        }
        .tab-con-item.active {
          left: 0;
          z-index: 1002;
        }
        .el-input__inner {
          height: 20px;
          line-height: 20px;
        }
        .el-input__suffix {
          right: 0;
        }
        .dividingP {
          height: 30px;
          line-height: 30px;
          padding-left: 10px;
          color: #fff;
          background: rgba(17, 41, 48, 0.5);
        }
        .huizhiObject,
        .biaozhuObject,
        .tubiaoObject {
          margin-bottom: 10px;
          max-height: 210px;
          overflow: auto;
          .item {
            float: left;
            width: 60px;
            height: 60px;
            margin-right: calc((100% - 240px) / 3);
            text-align: center;
            margin-top: 10px;
            padding-top: 10px;
            cursor: pointer;
            border: 1px solid transparent;
            img {
              width: 20px;
              height: 20px;
            }
            .itemText {
              padding-top: 5px;
              color: #bad5da;
            }
            &:nth-child(4n) {
              margin-right: 0;
            }
            &:hover,&.active {
              border: 1px solid #01cfff;
              background: rgba(0, 85, 128, 0.5);
            }

          }
        }
        .huizhiObject {
          .item {
            margin-right: calc((100% - 180px) / 2);
            &:nth-child(3n) {
              margin-right: 0;
            }
            &:nth-child(4) {
              margin-right: calc((100% - 180px) / 2);
            }
            &:nth-child(1) {
              padding-top: 15px;
              img {
                width: 10px;
                height: 10px;
              }
              .itemText {
                padding-top: 10px;
              }
            }
            &:nth-child(2) {
              padding-top: 15px;
              img {
                height: 10px;
              }
              .itemText {
                padding-top: 10px;
              }
            }
            &:nth-child(6) {
              padding-top: 10px;
              img {
                height: 15px;
              }
              .itemText {
                padding-top: 10px;
              }
            }
          }
        }
        .biaozhuObject {
          .item {
            &:nth-child(1) {
              padding-top: 10px;
              img {
                width: 20px;
                height: 17px;
              }
              .itemText {
                padding-top: 7px;
              }
            }
            &:nth-child(2) {
              padding-top: 10px;
              img {
                width: 18px;
                height: 20px;
              }
              .itemText {
                padding-top: 5px;
              }
            }
          }
        }
        .el-color-picker {
          .el-color-picker__trigger {
            width: 16px;
            height: 16px;
            padding: 0;
            border: none;
            .el-color-picker__color {
              border: none;
            }
          }
        }
        .pickerColor {
          margin-top: 8px;
          .el-form-item__content {
            position: relative;
            .el-select {
              width: 100%;
            }
            .el-color-picker {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              .el-color-picker__trigger {
                position: absolute;
                right: 2px;
                top: 5px;
              }
            }
          }
        }
        .biaozhuFontSize {
          margin-top: 8px;
          .el-form-item__content {
            position: relative;
            .unit {
              position: absolute;
              top: -1px;
              right: 8px;
              color: #fff;
            }
          }
        }
        .el-row {
          .el-form-item {
            margin-bottom: 0;
          }
          .el-slider__button.hover,
          .el-slider__button:hover {
            transform: scale(1);
          }
          .huizhiSlider {
            padding: 0 8px;
            .el-slider__runway {
              margin: 10px 0;
            }
            .el-slider__bar {
              background-color: var(--huizhiStrokeColor);
            }
            .el-slider__button {
              border: 2px solid var(--huizhiStrokeColor);
            }
          }
          .tubiaoSlider {
            padding: 0 8px;
            .el-slider__runway {
              margin: 10px 0;
            }
            .el-slider__bar {
              background-color: #01cfff;
            }
            .el-slider__button {
              border: 2px solid #01cfff;
            }
          }
        }
        .biaozhuStrokeWrap {
          margin-bottom: 10px;
        }
        .biaozhuTextarea {
          margin-bottom: 0;
          .el-textarea__inner {
            background-color: rgba(0, 85, 128, 0.6);
            border: 1px solid #01cfff;
            color: rgba(250, 253, 255, 1);
            font-size: 12px;
            padding: 5px 7px;
            line-height: 1.5;
          }
        }
        .addBtnWrap {
          width: 100%;
          min-height: 28px;
          margin-top: 15px;
          margin-bottom: 10px;
          .el-upload {
            width: 100%;
          }
          .el-upload__tip {
            color: #bad5da;
          }
          .addBtn {
            width: 100%;
            height: 28px;
            background: linear-gradient(0deg, #2a7aa2, #055984);
            border: 1px solid #01cfff;
            border-radius: 4px;
            color: #00d8ff;
            cursor: pointer;
            span {
              &:first-child {
                margin-right: 4px;
                font-size: 16px;
              }
              &:last-child {
                display: inline-block;
                transform: translateY(-2px);
              }
            }
          }
        }
        .list {
          margin-bottom: 0;
          .plottingList {
            .plottingListLi {
              width: 100%;
              height: 22px;
              line-height: 22px;
              color: rgb(1, 211, 249);
              // color: #fff;
              padding: 0 7px;
              cursor: pointer;
              font-size: 12px;
              border-left: 2px solid transparent;
              &:hover {
                border-left: 2px solid rgb(1, 211, 249);
                background: rgba(0, 183, 238, 0.2) !important;
              }
              &.active {
                border-left: 2px solid rgb(1, 211, 249);
                background: rgba(0, 183, 238, 0.2) !important;
              }
              .name {
                float: left;
              }
              .close {
                float: right;
                margin-top: 4px;
              }
            }
          }
        }
        .demo {
          min-width: 60px;
          border: 1px solid #000;
          background-color: #999;
          padding: 5px;
          position: absolute;
          .arrowWrap {
            position: absolute;
            width: 14px;
            height: 14px;
            bottom: -10px;
            left: 2px;
            padding-left: 4px;
            overflow: hidden;
            .arrow {
              // position: absolute;
              width: 10px;
              height: 10px;
              border: 1px solid #000;
              border-right: none;
              border-bottom: none;
              // bottom: -6px;
              transform: rotate(-80deg) skew(50deg);
              background-color: #999;
            }
          }
        }
      }
    }
    .btnWrap {
      width: 100%;
      height: 38px;
      border-top: 1px solid #01cfff;
      padding: 0 10px;
      .plus,
      .selectAll {
        margin-top: 10px;
        width: calc((100% - 5px) / 2);
        height: 28px;
        background: linear-gradient(0deg, #2a7aa2, #055984);
        border: 1px solid #01cfff;
        border-radius: 4px;
        color: #00d8ff;
        cursor: pointer;
        .el-icon-circle-plus-outline {
          font-size: 14px;
        }
      }
      .selectAll {
        margin-left: 5px;
      }
    }
  }
  // .el-select-dropdown {

  // }
}
</style>
