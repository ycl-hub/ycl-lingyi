<template>
  <div v-move="{parent: '.pj_dialog', childrenHeader: '.pj_dialog_tit'}" class="pj_dialog bevel">
    <div class="pj_dialog_tit">
      <span class="tit">警力派遣</span>
      <span class="el-icon-close close" @click="closePjDialog" />
    </div>
    <div class="pj_con">
      <div class="pj_h">
        <p class="title">指令说明</p>
        <el-input
          v-model="pjText"
          type="textarea"
          placeholder="请输入或选择快捷用语"
          maxlength="300"
          :rows="3"
          show-word-limit
        />
        <p class="quickWords">
          <span v-for="(item, i) in quickWords" :key="i" :class="{activeWord: activeWord===item.text }" @click="handleWord(item)">{{ item.text }}</span>
        </p>
        <p class="title title2">推送警员</p>
      </div>
      <div class="pj_con_c">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="推荐警力" name="first">
            <p class="distances">
              <el-input v-model.number.trim="activeDistance" class="append" placeholder="距离" @blur.native="handleDistance({ text: activeDistance })" @keyup.enter.native="handleDistance({ text: activeDistance })">
                <template slot="append">m</template>
              </el-input>
              <span v-for="(item, i) in distances" :key="i" :class="{activeDistance: activeDistance==item.text }" @click="handleDistance(item)">
                {{ item.text }}m
              </span>
            </p>
            <div class="el-tab-pane-con spacingTable">
              <el-table
                ref="multipleTable"
                :data="nearPoliceList"
                tooltip-effect="dark"
                style="width: 100%"
                height="100%"
                @selection-change="handleSelectionChange"
                @select="select"
                @select-all="selectAll"
              >
                <el-table-column
                  type="selection"
                  width="30"
                />
                <el-table-column
                  label="警号"
                  prop="POLICE_ID"
                  width="100"
                >
                  <template slot-scope="scope">{{ scope.row.POLICE_ID }}</template>
                </el-table-column>
                <el-table-column
                  prop="POLICE_NAME"
                  label="姓名"
                  width="80"
                />
                <el-table-column
                  prop="UNIT_NAME"
                  label="归属单位"
                  show-overflow-tooltip
                />
                <el-table-column
                  label="距离（m）"
                  prop="DISTANCE"
                  width="100"
                >
                  <template slot-scope="scope">{{ (scope.row.DISTANCE).toFixed(0) }}</template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="指定搜索" name="second">
            <el-input v-model.trim="filterPjText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
              <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
            </el-input>
            <div class="el-tab-pane-con">
              <!-- <el-checkbox-group v-show="filterPjText" v-model="checkedPolices">
                <div v-for="item in policeLists" :key="item.POLICE_ID" class="checkboxItem">
                  <el-checkbox :label="item" @change="handleChecked($event,item)">{{ item.POLICE_NAME }} - ({{ item.UNIT_NAME }})</el-checkbox>
                </div>
              </el-checkbox-group> -->
              <VueEasyTree
                ref="tree1"
                class="t01_checkBox_tree"
                :data="userTree"
                :default-expanded-keys="[String(TONE_voip.cmd.UNIT_ID)]"
                node-key="UnitId"
                :props="unitProps"
                show-checkbox
                :filter-node-method="filterNode"
                :icon-class="'el-icon-arrow-right'"
                @check-change="checkChange"
                height="calc(100%)"
              >
                <span slot-scope="{ data }" class="custom-tree-node">
                  <span :style="{ color: data.type=='people'? (data.yonghuzxbj == '1' ? '#67C23A':'#999'):'#01d3f9',flex:1,width:'146px'}" :title="data.UnitName||data.POLICE_NAME">
                    {{ data.UnitName|| data.POLICE_NAME }}
                  </span>
                </span>
              </VueEasyTree>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="btnWrap clearfix">
      <div class="btn fl" @click="handleAlarm()">
        <span class="">确定</span>
      </div>
      <div class="btn fr" @click="closePjDialog()">
        <span class="">取消</span>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import { GUID } from '@/utils/guid.js'
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'
import {getCircleBoundary} from '@/utils'
export default {
  name: 'CGpaijing',
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
    isShowPj: {
      required: true,
      type: Boolean,
      default: false
    },
    detail: {
      required: false,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      search,
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      pjText: '',
      quickWords: [
        {
          text: '请注意携带防爆措施'
        },
        {
          text: '请尽快处理'
        },
        {
          text: '收到请回复'
        }
      ],
      activeWord: '',
      // checkedPolices: [],
      // isShowPj: false,
      // 警力
      policeList: [],
      filterPjText: '',
      activeTab: 'first',
      guid: new GUID(),
      distances: [
        {
          text: '2000'
        },
        {
          text: '1000'
        },
        {
          text: '500'
        }
      ],
      activeDistance: '500',
      circle: null,
      // 附近警力
      nearPoliceList: [],
      checkedNearPolices: [],
      // 组织机构
      unitListTree: [],
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      treeCheckedKeys: [],
      treeCheckedNodes: [],
      // 暂时table全选数据，用于全不选时清除tree选中状态
      tempAlltable: [],
      // 派过的警员
      HandleList: []
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    // policeLists: function() {
    //   return this.policeList.filter((item) => {
    //     return item.POLICE_NAME.search(this.filterPjText) !== -1
    //   })
    // },
    ...mapGetters([
      'userTree'
    ])
  },
  provide: function() {
    return {
    }
  },
  watch: {
    isShowPj: {
      handler: function(val) {
        !val ? this.closePjDialog() : ''
      },
      deep: false
    },
    // 指定搜索后选中搜索项
    filterPjText: {
      handler: function(val) {
        if (!val) {
          this.$refs.tree1.filter(val)
        }
      },
      deep: false
    },
    activeTab: {
      handler: function(val) {
        const checkedNodes = this.$refs.tree1.getCheckedNodes()
        const arr = []
        checkedNodes.forEach((v) => {
          if (v.leaf) {
            arr.push({
              POLICE_NAME: v.UnitName,
              UNIT_ID: v.BelongUp,
              POLICE_ID: v.yonghuid + '',
              yonghuyxj: v.yonghuyxj,
              yonghuzxbj: v.yonghuzxbj,
              leaf: true,
              type: 'people',
              LAT: null,
              LNG: null
            })
          }
        })
        let Polices = [...this.checkedNearPolices, ...arr]
        var hash = {}
        Polices = Polices.reduce(function(item, next) {
          hash[next.POLICE_ID] ? '' : hash[next.POLICE_ID] = true && item.push(next)
          return item
        }, [])
        var UnitIds = Polices.map((item) => {
          return item.POLICE_ID
        })
        if (val === 'first') {
          this.$refs.multipleTable.clearSelection()
          this.nearPoliceList.forEach((item) => {
            if (UnitIds.includes(item.POLICE_ID)) {
              this.$refs.multipleTable.toggleRowSelection(item)
            }
          })
        } else {
          this.$refs.tree1.setCheckedKeys(UnitIds)
        }
      },
      deep: false,
      immediate: false
    }
  },
  created() {
    // 获取警力
    this.getJingLi()
    // 获取常规警情排过的警员
    this.getHandleList()
  },
  mounted() {
    this.handleDistance({ text: '500' })
  },
  methods: {
    searchBtn() {
      this.$refs.tree1.filter(this.filterPjText)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.UnitName.indexOf(value) !== -1
    },
    // 	当table选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      this.checkedNearPolices = val
      // 单选
      // if (val.length > 1) {
      //   this.$refs.multipleTable.clearSelection()
      //   this.$refs.tree1.setChecked(val.shift().POLICE_ID, false)
      //   this.$refs.multipleTable.toggleRowSelection(val.pop())
      // }
    },
    // 用户手动选择table项事件
    select(selection, row) {
      // 包含为新增，不包含为删减
      let flag = false
      selection.forEach((item) => {
        if (item.POLICE_ID === row.POLICE_ID) {
          // 新增
          this.$refs.tree1.setChecked(row.POLICE_ID, true)
          flag = true
        }
      })
      // 删减
      if (!flag) {
        this.$refs.tree1.setChecked(row.POLICE_ID, false)
      }
    },
    // 用户手动全部选择table项事件
    selectAll(selection) {
      if (selection.length > 0) {
        // 全选
        this.tempAlltable = cloneDeep(selection)
      } else {
        // 全不选
        this.tempAlltable.forEach(item => {
          this.$refs.tree1.setChecked(item.POLICE_ID, false)
        })
      }
    },
    handleWord(item) {
      this.pjText = item.text
      this.activeWord = item.text
    },
    handleDistance(item) {
      this.activeDistance = item.text
      this.activeDistance && this.getcirclePath()
    },
    // 获取周围几百米内的坐标
    getcirclePath() {
      var center = Cesium.Cartesian3.fromDegrees(this.detail.ALARM_LNG,this.detail.ALARM_LAT);
      var radius = this.activeDistance;
      var granularity = 9.0; // 设置间隔角度，可根据需求调整
      var circleBoundary = getCircleBoundary(center, radius, granularity);
      this.$api.majorAlarm.getNearPolice({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        seconds: 60,
        POINT_LIST: circleBoundary,
        ALARM_LNG: this.detail.ALARM_LNG,
        ALARM_LAT: this.detail.ALARM_LAT
      }).then(res => {
        this.nearPoliceList = res.data.RESULT_LIST
      }).catch((error) => {
        console.log(error)
      })
    },
    // 派警弹层确定按钮
    handleAlarm() {
      // console.log(this.checkedNearPolices, 6)
      // console.log(this.treeCheckedNodes, 7)
      const checkedNodes = this.$refs.tree1.getCheckedNodes()
      const arr = []
      let flag = true
      checkedNodes.forEach((v) => {
        if (v.leaf) {
          if (v.login_pc === '1') {
            flag = false
            return
          }
          arr.push({
            POLICE_NAME: v.UnitName,
            UNIT_ID: v.BelongUp,
            POLICE_ID: v.yonghuid + '',
            yonghuyxj: v.yonghuyxj,
            yonghuzxbj: v.yonghuzxbj,
            leaf: true,
            type: 'people',
            LAT: null,
            LNG: null
          })
        }
      })
      if (!flag) {
        this.$message.warning('请不要选择调度台派遣')
        return
      }
      let Polices = [...this.checkedNearPolices, ...arr]
      var hash = {}
      Polices = Polices.reduce(function(item, next) {
        hash[next.POLICE_ID] ? '' : hash[next.POLICE_ID] = true && item.push(next)
        return item
      }, [])
      // 判断是否选择了警员
      if (Polices.length === 0) {
        this.$message({
          message: '请选择需要派遣的警力',
          type: 'info'
        })
        return false
      }
      // 判断是否选择了多个警员
      // if (Polices.length > 1) {
      //   this.$message({
      //     message: '常规警情派警一次只能派给一个人，请重新选择',
      //     type: 'warning'
      //   })
      //   return false
      // }
      // 常规警情判断是否派遣过这个人
      // let flag = false
      // for (let index = 0; index < this.HandleList.length; index++) {
      //   const element = this.HandleList[index]
      //   if (element.POLICE_ID === Polices[0].POLICE_ID) {
      //     flag = true
      //     break
      //   }
      // }
      // if (flag) {
      //   this.$message({
      //     message: '该人员已被派遣，请选择其他人员再次操作',
      //     type: 'warning'
      //   })
      //   return false
      // }
      const TONE_voip = sessionStorage.get('TONE_voip')
      const POLICE_IDS = Polices.map(v => {
        return v.POLICE_ID
      }).join(',')
      this.$api.common.HandleAlarm({
        TOKEN: TONE_voip.cmd.TOKEN,
        PoliceNo: TONE_voip.cmd.POLICE_ID,
        Alarm_ID: this.detail.ALARM_ID,
        LON: this.detail.ALARM_LNG,
        lat: this.detail.ALARM_LAT,
        HANDLE_STATUS: 1,
        // POLICE_ID: Polices[0].POLICE_ID,
        POLICE_IDS: POLICE_IDS,
        BACK_MSG: this.pjText
      }).then(res => {
        this.$message({
          message: res.data.msg,
          type: 'success'
        })
        this.closePjDialog()
      }).catch((error) => {
        console.log(error)
      })
    },
    // 关闭派警弹窗
    closePjDialog() {
      // this.isShowPj = false
      this.isShowPj && this.$emit('update:isShowPj', false)
      // this.checkedPolices = []
      this.pjText = ''
    },
    // 获取警力人员
    getJingLi() {
      this.$api.common.police({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        zip: 1
      }).then(res => {
        this.policeList = res.data.policeList.filter((item) => {
          return item.LOGIN_PC === 0
        })
      }).catch((error) => {
        console.log(error)
      })
    },
    // 获取派过警的警员
    getHandleList() {
      this.$api.common.GetAlarmDetail({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Alarm_ID: this.detail.ALARM_ID
      }).then(res => {
        if (!res.data.obj.handleAlarmDetail) {
          this.HandleList = []
        } else {
          this.HandleList = res.data.obj.handleAlarmDetail
        }
      }).catch((error) => {
        console.log(error)
      })
    },
    // 树节点选中状态发生改变时触发
    checkChange(node, bself, bchil) {
      console.log(node, 789)
      // 自身取消
      if (!bself) {
        this.nearPoliceList.forEach((item) => {
          if (item.POLICE_ID === node.yonghuid + '') {
            this.$refs.multipleTable.toggleRowSelection(item, false)
          }
        })
      } else {
        // 自身选中
        // this.nearPoliceList.forEach((item) => {
        //   if (item.POLICE_ID === node.POLICE_ID) {
        //     this.$refs.multipleTable.toggleRowSelection(item, true)
        //   }
        // })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.pj_dialog{
  width: 480px;
  height: 600px;
  color: #fff;
  position: fixed;
  top: calc(50% - 300px);
  left: calc(50% + 22px);
  .pj_dialog_tit{
    box-sizing: content-box;
    padding: 5px 10px;
    height: 30px; line-height: 30px;
    // border-bottom: 1px solid #497a7a;
    border-bottom: 2px solid rgba(2, 167, 253, 0.4);
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
    height: calc(100% - 86px);
    padding: 0 10px 10px;
    .pj_h {
      .title {
        padding-top: 10px;
        &.title2 {
          margin-top: 10px;
        }
      }
      ::v-deep .el-textarea {
        textarea{
          resize: none;
        }
        .el-textarea__inner {
          background-color: rgba(5, 78, 117, 0.4);
          border: 1px solid rgba(10, 163, 245, 0.32);
          color: rgba(250, 253, 255, 1);
          font-size: 12px;
          padding: 5px 7px 15px;
          line-height: 1.5;
          margin-top: 10px;
        }
        .el-input__count {
          background-color: rgba(5, 78, 117, 0.4);
          color: rgba(250, 253, 255, 1);
        }
      }
      .quickWords {
        margin-top: 4px;
        span {
          display: inline-block;
          height: 20px;
          line-height: 20px;
          padding: 0 8px;
          color: #ccc;
          background: rgba(5, 78, 117, 0.4);
          margin-right: 4px;
          cursor: pointer;
          &.activeWord {
            color: #fff;
            background: rgba(10, 163, 245, 0.4);
          }
        }
      }
    }
    .pj_con_c{
      height: calc(100% - 174px);
      margin-top: 10px;
      background: rgba(5, 78, 117, 0.4);
      padding: 10px;
      ::v-deep .filter {
        width: 100%;
        height: 30px;
        .el-input__inner {
          height: 30px;
          border: 1px solid #197491;
          background: rgba(5, 78, 117, 0.4);
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
      ::v-deep .el-tabs {
        height: 100%;
        .el-tabs__header {
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
        .el-tabs__content {
          height: calc(100% - 45px);
          .el-tab-pane {
            height: 100%;
            .distances {
              display: flex;
              flex-direction: row-reverse;
              span {
                display: inline-block;
                height: 24px;
                line-height: 24px;
                padding: 0 5px;
                color: #ccc;
                background: rgba(5, 78, 117, 0.4);
                margin-right: 4px;
                cursor: pointer;
                &.activeDistance {
                  color: #fff;
                  background: rgba(10, 163, 245, 0.4);
                }
              }
              .append {
                width: 70px;
                .el-input__inner {
                  padding: 0 5px;
                  height: 24px !important;
                  border-top-right-radius: 0 !important;
                  border-bottom-right-radius: 0 !important;
                  border: 1px solid rgba(10, 163, 245, 0.4);
                  background-color: rgba(0, 85, 128, 0.6);
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
                .el-input-group__append {
                  color:#0fabd4;
                  font-size: 12px;
                  background-color: rgba(0, 85, 128, 0.6);
                  border: 1px solid rgba(10, 163, 245, 0.4);
                  border-left: none;
                  padding: 0 4px;
                  border-top-left-radius: 0 !important;
                  border-bottom-left-radius: 0 !important;
                }
              }
            }
            .el-tab-pane-con {
              height: calc(100% - 35px);
              overflow: auto;
              margin-top: 5px;
            }
          }
        }
      }
    }
  }
  .btnWrap {
    padding: 0 5px;
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
    }
  }
  // table表格
  // table表格body带有间隙
  .spacingTable {
    ::v-deep .el-table {
      background: transparent;
      &::before {
        height: 0px;
      }
      .el-table__header-wrapper {
        .el-table__header {
          tr {
            background: rgba(5, 78, 117, 0.64);
          }
          th {
            background: transparent;
            padding: 3px 0;
            .cell {
              color: #01d3f9;
              font-weight: 500;
              font-size: 12px;
              // .el-checkbox {
              //   display: none;
              // }
            }
          }
        }
      }
      .el-table__body {
        border-collapse: separate;
        border-spacing: 0 5px;
        .danger {
          background: rgba(253,226,226,0.60) !important;
        }
        .warn {
          background: rgba(250,236,216,0.60) !important;
        }
        .success {
          background: rgba(216,239,229,0.60) !important;
        }
      }
      .cell {
        padding-left: 5px;
        padding-right: 5px;
        color: #fff;
        font-size: 12px;
        font-weight: 500;
      }
      td {
        padding: 3px 0;
      }
      td, .el-table th.is-leaf {
        border: none;
      }
      .el-table__header th.is-leaf {
        border-bottom: none;
      }
      .el-table__body tr {
        background: rgba(5, 78, 117, 0.64);
        &:hover {
          &>td {
            background-color: rgba(5, 78, 117, 0.64) !important;
          }
        }
      }
      // 多选款
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
    // .is-leaf{
    //   padding-left: 10px !important;
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
    .is-leaf + .el-checkbox .el-checkbox__inner {
      display:inline-block;
    }
    .el-checkbox__input> .el-checkbox__inner {
      display:none;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
      padding-right: 0px;
    }
  }
}
</style>
