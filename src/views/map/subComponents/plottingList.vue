<template>
  <div class="plottingList">
    <!-- 地图标绘列表 -->
    <div v-show="isSpread" v-move="{parent: '.boxplottingListWrap', childrenHeader: '.title'}" class="boxplottingListWrap" :class="{marginLeft:!isSpread,leftpos:isJingShow&&!isBiaoShow}">
      <div v-show="isSpread" class="arrow">
        <img :src="rightOut" @click="$emit('close')">
      </div>
      <div :class="{marginLeft:!isSpread}" class="plottingListWrap bevel">
        <h3 class="title">
          标绘列表
        </h3>
        <div class="list">
          <el-input
            v-model.trim="filterText"
            class="filter"
            type="text"
            placeholder="关键字搜索"
            @keyup.enter.native="searchBtn"
          >
            <img
              slot="suffix"
              :src="search"
              alt="标题"
              class="img"
              @click="searchBtn"
            >
          </el-input>
          <div class="edit-box"><el-checkbox v-model="isSelectAll" :indeterminate="isIndeterminate" @change="selectAll">标绘名称</el-checkbox> <span>操作</span></div>
          <div class="tree-box">
            <VueEasyTree
              ref="tree"
              class="t01_tree"
              :data="data"
              :props="plottingProps"
              show-checkbox
              node-key="plottingId"
              :default-expand-all="false"
              height="100%"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :icon-class="'el-icon-arrow-right'"
              @check="check"
            >
              <span slot-scope="{ node, data }" class="custom-tree-node">
                <span :style="{ color: '#01d3f9'}" :title="node.label">{{ node.label }}</span>
              </span>
            </VueEasyTree>
          </div>
        </div>
        <div class="btnWrapFoot">
          <div class="btn" @click="jumpPlot">
            <span>标绘管理</span>
          </div>
        </div>
      </div>
    </div>
    <!--==标绘详情==-->
    <div v-if="isShowPlotDetail" ref="plotDetail" v-move="{parent: '.plot_dialog', childrenHeader: '.plot_dialog_tit'}" class="plot_dialog">
      <span class="sanjiao" />
      <div class="box bevel">
        <div class="plot_dialog_tit">
          <span class="tit">标绘详情</span>
          <span class="el-icon-close close fr" @click="closePlotDialog" />
        </div>
        <div class="plot_con">
          <div class="plot_con_c">
            <el-input v-model.trim="filterTextPlot" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtnPlot">
              <img slot="suffix" :src="search" alt="" class="img" @click="searchBtnPlot">
            </el-input>
            <VueEasyTree
              ref="tree3"
              class="t01_checkBox_tree"
              :data="devlist"
              :props="devlistUnitProps"
              height="100%"
              show-checkbox
              node-key="id"
              :filter-node-method="filterNodeResource"
              :icon-class="'el-icon-arrow-right'"
            >
              <span slot-scope="{ data }" class="custom-tree-node">
                <span :style="{ color: '#32b16c'}" :title="data.yonghuname|| data.name" @click="getDevInfo(data)">{{ data.yonghuname|| data.name }}</span>
                <span v-if="!data.children" class="right">
                  <img :src="phone" alt="" class="tree-btn" @click="makeCall({callNumber:data.id,audioOrVideo:'audio'})">
                  <img :src="camera" alt="" class="tree-btn" @click="makeCall({callNumber:data.id,audioOrVideo:'video'})">
                </span>
              </span>
            </VueEasyTree>
          </div>
          <div class="btnWrap clearfix">
            <div class="btn fl" @click="videoCall()">
              <span class="">视频群呼</span>
            </div>
            <div class="btn fl" @click="audioMeet()">
              <span class="">语音会议</span>
            </div>
            <div class="btn fr" @click="videoMeetHandle()">
              <span class="">视频会商</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { rend } from '@/utils/plotting'
import { get, cloneDeep } from 'lodash'
import phone from '@/assets/images/equipment/phone.png'
import camera from '@/assets/images/equipment/camera.png'
import { sessionStorage } from '@/utils/storage'
import sip from '@/components/mixins/sip.js'
import search from '@/assets/images/equipment/search.png'
import { mapGetters } from 'vuex'
// import { queryId } from '@/utils'
import rightOut from '@/assets/images/rightOut.png'
export default {
  name: 'PlottingList',
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
    isSpread: {
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
      rightOut,
      cloneData: [],
      search,
      isIndeterminate: false,
      filterText: '',
      isSelectAll: false,
      phone, camera,
      // 地图标绘相关
      data: [],
      plottingProps: {
        label: 'plottingName',
        children: 'children',
        id: 'plottingId'
      },
      tempSelectArr: [],
      isShowPlotDetail: false,
      plotNavActive: '人员列表',
      plotTabNav: [
        {
          name: '人员列表',
          isActive: true
        }, {
          name: '设备列表',
          isActive: false
        }
      ],
      plottingYonghu: [],
      plottingDev: [],
      filterTextPlot: '',
      devlistUnitProps: {
        label: 'name',
        children: 'children',
        id: 'id'
      },
      devlist: []
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    ...mapGetters([
      'settings'
    ])
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    filterTextPlot: {
      handler: function(val) {
        this.$refs.tree3.filter(val)
      }
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
  created() {
    this.getPlottingById()
  },
  mounted() {
    const viewer = this.viewer
    const handler = new Cesium.ScreenSpaceEventHandler(
      viewer.scene.canvas
    )
    // 实体点击事件监听
    handler.setInputAction((movement) => {
      const pickedLabel = viewer.scene.pick(movement.position)
      if (Cesium.defined(pickedLabel)) {
        const ids = pickedLabel.id
        console.log(ids, 'ids')
        this.showPlotDetail(ids)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  },
  beforeDestroy() {
    // this.clearJq()
    // console.log(this.data, 789)
    // 关闭标绘移除标绘实体
    this.data.forEach((item)=>{
      item.overlays.forEach((o) => {
        this.viewer.entities.remove(o)
      })
    })

  },
  activated() {
    // this.getPlottingById()
  },
  deactivated() {
    // this.closePlotDialog()
    // this.selectAll()
  },
  methods: {
    filterNodeResource(value, data) {
      if (!value) return true
      if (data.yonghuname) {
        return data.yonghuname.indexOf(value) !== -1
      } else {
        return data.name.indexOf(value) !== -1
      }
    },
    searchBtnPlot() {
      this.$refs.tree3.filter(this.filterTextPlot)
    },
    SET_checkResourceList() {
      const tree3Date = []
      this.$refs.tree3.getCheckedNodes().forEach((item) => {
        if (!item.children) {
          tree3Date.push(item)
        }
      })
      this.$store.commit('app/SET_checkResourceList', tree3Date)
    },
    videoCall() {
      this.SET_checkResourceList()
      this.$root.$emit('videoCall')
    },
    audioMeet() {
      this.SET_checkResourceList()
      this.$root.$emit('audioMeet')
    },
    videoMeetHandle() {
      this.SET_checkResourceList()
      this.$root.$emit('videoMeetHandle', true)
    },
    // 上方为新加的标会人员设备的详情操作
    searchBtn() {
      this.$refs.tree.filter(this.filterText)
    },
    jumpPlot() {
      this.$router.push({ path: '/mapPlotting' })
    },
    filterNode(value, data) {
      if (!value) return true
      return data && data.plottingName && data.plottingName.indexOf(value) !== -1
    },
    // 地图标绘相关的事件
    // 全选全不选
    selectAll() {
      if (!this.data) { return }
      const ids = this.data.map(item => item.plottingId)
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
    // 节点被选中时触发
    check(node, data) {
      var that = this
      if (data.checkedNodes.length > this.tempSelectArr.length) {
        data.checkedNodes.forEach((item) => {
          if (item.overlays && item.overlays.length > 0) {
            item.overlays.forEach((o) => {
              o.show = true
              o.plottingId = item.plottingId
              o.plottingYonghu = item.plottingYonghu
              o.plottingDev = item.plottingDev
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
    showPlotDetail(plot, e, _this) {
      console.log(plot, 888)
      const Dev = get(plot, 'plottingDev', [])
      const Yonghu = get(plot, 'plottingYonghu', [])
      this.devlist = []
      const renyuan = []
      const ziyuan = []
      // 清空已选资源
      Yonghu.forEach(item => {
        if (!item) {
          return
        }
        if (!item.name) {
          item.name = item.yonghuname
        }
        item.power = '1,2'
        if (!renyuan.find(obj => item.name === obj.name)) { renyuan.push(item) }
      })
      if (renyuan.length > 0) {
        this.devlist.push({
          name: '人员',
          id: 'renyuan',
          children: renyuan
        })
      }
      Dev.forEach(item => {
        if (!item) {
          return
        }
        if (!item.name) {
          item.name = item.id
        }
        item.power = '1,2'
        if (!ziyuan.find(obj => item.name === obj.name)) { ziyuan.push(item) }
      })
      if (ziyuan.length > 0) {
        this.devlist.push({
          name: '设备',
          id: 'shebei',
          children: ziyuan
        })
      }
      console.log(this.devlist, 77989899)
      // this.dialogTableVisible && this.$emit('update:dialogTableVisible', false)
      // this.isShowJq = true
      // this.detail = item
      // this.dingwei(item)
      // this.closePjDialog()
      // this.closeRecordDialog()
      // this.ercidwFlag = false
      if (plot.plottingId) {
        this.plottingYonghu = get(plot, 'plottingYonghu', [])
        this.plottingDev = get(plot, 'plottingDev', [])
        this.isShowPlotDetail = true
        // this.viewer.zoomTo(plot,{
        //     heading: 0.018,
        //     pitch: -0.7,
        //     range: 5000
        //   }
        // )
        this.$nextTick(() => {
          if (this.$refs.plotDetail && this.$refs.plotDetail.style) {
            this.$refs.plotDetail.style.top = 'calc(50% - 200px)'
            this.$refs.plotDetail.style.left = 'calc(50% + 22px)'
          }
        })
      }
    },
    // 关闭
    closePlotDialog() {
      this.isShowPlotDetail = false
    },
    isShowPlotTabNav(val) {
      this.plotNavActive = val
    },
    // 获取标绘列表
    getPlottingById() {
      const _this = this
      this.$api.plotting.getPlottingById({
        ddtId: sessionStorage.get('TONE_sipUserInfo').userName
      }).then(async(res) => {
        this.data = eval(res.data.msg)
        this.cloneData = cloneDeep(this.data)
        // setTimeout(() => {
        this.tempSelectArr = []
        // 给每条数据加上图层数据
        const a = (arr) => {
          arr.forEach((item) => {
            item.overlays = []
            this.$api.plotting.getJSON(item.plottingJson).then(async(res) => {
              item.overlays = this.rend(this.viewer, res.data)
              item.overlays.forEach(o => {
                o.show = true
                // 偶尔有标点回显不出来 残留黑色阴影
              })
              item.plottingJsonData = res.data
              if (item.children && item.children.length > 0) {
                a(item.children)
              }
            }).catch((err) => {
              console.log(err)
            })
          })
        }
        if (this.data) a(this.data)
        setTimeout(() => {
          // 防止el-tree 数据图层还未上图完毕就执行全选方法，导致子集标绘图层点击事件监听不到
          setTimeout(() => {
            _this.selectAll()
          }, 0)
        }, 500)
      }).catch((err) => {
        console.log(err)
      })
    },
    // 回显图层
    rend
  }
}
</script>
<style lang="scss" scoped>
.plottingList {
  .leftpos{
    margin-left: 45px !important;
  }
  .marginLeft{
    margin-left: 425px !important;
    // 防止标绘隐藏时遮住预警收缩按钮
  }
  .plottingListWrap{
    height: 100%;
    width: 100%;
    padding: 0 0 15px;
    box-sizing: border-box;
  }
  .boxplottingListWrap{
     .arrow {
      position: absolute;
      height: 90px;
      top: calc(50% - 45px);
      right: -9px;
      cursor: pointer;
      object-fit: fill;
    }
    position: fixed;
    width: 330px;
    min-height: 300px;
    left: 0px;
    margin-left: 400px;
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    .btnWrapFoot{
      box-sizing: border-box;
      padding: 10px;
      position: relative;
      bottom: 20px;
      .btn{
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        background: -webkit-gradient(linear, left bottom, left top, from(#2A7AA2), to(#055984));
        background: linear-gradient(0deg, #2A7AA2, #055984);
        border: 1px solid #01CFFF;
        border-radius: 2px;
        color: #00d8ff;
        cursor: pointer;
        width: 100%;
    }
    }

    .title {
      padding: 15px 10px;
      font-size: 14px;
      color: #fff;
      font-weight: 500;
    }
    .btnWrap {
      width: 100%;
      height: 28px;
      padding: 0px 10px;
      .selectAll {
        width: calc((100% - 5px)/2);
        height: 28px;
        background: linear-gradient(0deg, #2A7AA2, #055984);
        border: 1px solid #01CFFF;
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
    }
    .list {
      width: 100%;
      height: calc(100% - 72px);
      margin-top: 15px;
      padding: 0px 10px;
      // overflow: auto;
      padding-bottom: 30px;
      .tree-box{
        height: calc(100% - 40px);
        overflow-y: auto;
      }
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
        .el-tree-node.is-current>.el-tree-node__content {
          background: rgba(0, 183, 238, .1) !important;
        }
        .el-tree-node__content:hover {
          background: rgba(0, 183, 238, .1) !important;
        }
        .el-tree-node:focus>.el-tree-node__content{
          background: rgba(0, 183, 238, .1) !important;
        }
        // .is-leaf{padding-left: 6px !important;}
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
          .listBtn {
            color: #01d3f9;
            span{
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
      }
    }
  }
  .plot_dialog{
    width: 280px;
    height: 400px;
    color: #fff;
    position: fixed;
    // top: calc(50% - 200px);
    // left: calc(50% + 312px);
    .sanjiao {
      position: absolute;
      content: "";
      height: 0;
      width: 0;
      top: calc(50% - 8px);
      left: -16px;
      border: solid transparent;
      border-width: 8px;
      border-right-color: #327a8e;
    }
    .box {
      width: 100%;
      height: 100%;
    }
    .plot_dialog_tit{
      box-sizing: content-box;
      padding: 10px 10px 5px;
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
    .tab-cards{
      box-sizing: content-box;
      width: 160px;
      height: 26px;
      background: linear-gradient(0deg, #2A7AA2, #055984);
      border: 1px solid #01CFFF;
      border-radius: 4px;
      li{
        width: 80px;
        float: left;
        height: 26px;
        text-align: center;
        color: #01cfff;
        line-height: 26px;
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        &.active{
          color: #fff;
          height: 28px;
          line-height: 28px;
          margin-top: -1px;
          margin-left: -1px;
          padding-left: 1px;
          background: url('../../../assets/images/equipment/active.png') no-repeat;
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
    .plot_con{ width: 100%; height: calc(100% - 46px);padding: 0 10px 10px;}
    .plot_con_c{
      height: calc(100% - 40px);
      overflow: auto;
      padding: 5px;
      ::v-deep .filter {
        width: 100%;
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
          right: 0px;
          .img {
            margin-top: 2px;
            cursor: pointer;
          }
        }
      }
      ::v-deep .el-checkbox-group {
        .checkboxItem {
          padding: 5px 0;
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
            .el-checkbox__label {
              color: #01d3f9;
            }
          }
        }
      }
      .plot_con_ul {
        .plot_con_li {
          height: 30px;
          line-height: 30px;
          .left {
            float: left;
          }
          .right {
            float: right;
          }
        }
      }
      .plot_empty {
        padding: 10px;
        text-align: center;
      }
    }
    .btnWrap {
      border-top: 1px solid #497a7a;
      // padding: 0 20px;
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
        &:first-child {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
