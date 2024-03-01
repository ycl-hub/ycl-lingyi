<template>
  <div class="JIANKONG">
    <p class="distances">
      <el-input v-model.number.trim="activeDistance" class="append" placeholder="距离" @keyup.enter.native="handleDistance({ text: activeDistance })">
        <template slot="append">m</template>
      </el-input>
      <span v-for="(item, i) in distances" :key="i" :class="{activeDistance: activeDistance===item.text }" @click="handleDistance(item)">
        {{ item.text }}m
      </span>
    </p>
    <div class="el-tab-pane-con spacingTable">
      <keep-alive>
        <el-table
          ref="multipleTable"
          :data="nearPoliceList"
          tooltip-effect="dark"
          style="width: 100%"
          height="100%"
          :max="1"
          @selection-change="handleSelectionChange"
          @select="select"
        >
          <el-table-column
            type="selection"
            width="30"
          />
          <!-- <el-table-column
            label="设备号码"
            prop="DEV_ID"
            width="100"
          >
            <template slot-scope="scope">{{ scope.row.DEV_ID }}</template>
          </el-table-column> -->
          <el-table-column
            prop="NAME"
            label="名称"
            width="80"
          />
          <el-table-column
            prop="UNIT_NAME"
            label="归属单位"
            show-overflow-tooltip
          />
          <el-table-column
            prop="ADDR"
            label="地址"
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
      </keep-alive>
    </div>
    <div class="btnWrap clearfix">
      <div class="btn fr" @click="videoGroupCall()">
        <span class="">视频群呼</span>
      </div>
    </div>
    <!-- 视频群呼 -->
    <VideoGroupCall v-if="videoGroupCallDialog" :video-group-call-dialog.sync="videoGroupCallDialog" :video-dev="checkedNearPolices" @changeDialog="videoGroupCallDialog=false" />
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import VideoGroupCall from '../videoGroupCall'
import sip from '@/components/mixins/sip.js'
export default {
  name: 'JIANKONG',
  components: {
    VideoGroupCall
  },
  mixins: [sip],
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
      checkedPolices: [],
      // isShowPj: false,
      // 警力
      policeList: [],
      filterPjText: '',
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
      videoGroupCallDialog: false
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    policeLists: function() {
      return this.policeList.filter((item) => {
        return item.POLICE_NAME.search(this.filterPjText) !== -1
      })
    }
  },
  provide: function() {
    return {
    }
  },
  watch: {
  },
  created() {
  },
  mounted() {
    this.handleDistance({ text: '500' })
  },
  methods: {
    // 	当table选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      if (val && val.length > 0) {
        val.forEach(item => {
          item.id = item.DEV_ID
          item.name = item.NAME
          item.yonghuzxbj = 1
        })
      }
      this.checkedNearPolices = val
    },
    handleDistance(item) {
      this.activeDistance = item.text
      this.activeDistance && this.getcirclePath()
    },
    // 获取周围几百米内的坐标
    getcirclePath() {
      if (this.circle) {
        this.map.removeOverlay(this.circle)
        this.circle = null
      }
      const point = new this.BMap.Point(this.detail.ALARM_LNG, this.detail.ALARM_LAT)
      this.circle = new this.BMap.Circle(point, this.activeDistance, {
        strokeColor: 'rgba(238, 101, 0, 1)',
        fillColor: 'rgba(255, 255, 255, 0.1)',
        strokeWeight: 1,
        strokeStyle: 'solid'
      })
      this.circle.hide()
      this.map.addOverlay(this.circle)
      this.$api.majorAlarm.getVideo({
      // this.$api.majorAlarm.getNearPolice({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        // seconds: 60,
        POINT_LIST: this.circle.getPath(),
        ALARM_LNG: this.detail.ALARM_LNG,
        ALARM_LAT: this.detail.ALARM_LAT,
        RES_TYPE: '监控'
      }).then(res => {
        this.nearPoliceList = res.data.RESULT_LIST
        // const showVideoDev = this.nearPoliceList.length > 4 ? this.nearPoliceList.slice(0, 4) : this.nearPoliceList
        // this.$nextTick(() => {
        //   showVideoDev.forEach((item) => {
        //     this.$refs.multipleTable.toggleRowSelection(item, true)
        //     this.makeCall({ callNumber: item.DEV_ID, audioOrVideo: 'video', isQuanXuanVideo: true, belong: 'jiankong' })
        //   })
        //   this.videoGroupCallDialog = true
        // })
      }).catch((error) => {
        console.log(error)
      })
    },
    // 用户手动选择table项事件
    select(selection, row) {
      if (selection.length > 4) {
        this.$message({
          message: '仅可选中4路视频，请先挂断再进行选择',
          type: 'warning'
        })
        this.$refs.multipleTable.toggleRowSelection(row, false)
      }
      // // 包含为新增，不包含为删减
      // let flag = false
      // selection.forEach((item) => {
      //   if (item.DEV_ID === row.DEV_ID) {
      //     // 新增
      //     console.log(row, 888)
      //     flag = true
      //     this.makeCall({ callNumber: row.DEV_ID, audioOrVideo: 'video', isQuanXuanVideo: true, belong: 'jiankong' })
      //   }
      // })
      // // 删减
      // if (!flag) {
      //   console.log(row, 999)
      //   console.log(this.callList, 4566)
      //   const quanxuancallList = this.callList.filter((item) => {
      //     return item.isQuanXuanVideo && item.belong === 'jiankong'
      //   })
      //   quanxuancallList.forEach((item, i) => {
      //     if (item.to === row.DEV_ID) {
      //       this.endCall(item.sessionId, item.session, true, i)
      //     }
      //   })
      // }
    },
    // 视频群呼
    videoGroupCall() {
      if (this.videoGroupCallDialog) return false
      if (this.checkedNearPolices.length === 0) {
        this.$message({
          message: '请先选择呼叫的监控',
          type: 'warning'
        })
        return false
      }
      this.videoGroupCallDialog = true
    }
  }
}
</script>
<style lang="scss" scoped>
.JIANKONG{
  width: 100%;
  height: 100%;
  .distances {
    display: flex;
    flex-direction: row-reverse;
    padding: 0 10px;
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
    ::v-deep .append {
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
    height: calc(100% - 70px);
    overflow: auto;
    padding-left: 5px;
    margin-top: 5px;
    padding: 0 10px;
    // table表格
    // table表格body带有间隙
    &.spacingTable {
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
                .el-checkbox {
                  display: none;
                }
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
  }
  .btnWrap {
    padding: 0 10px;
    border-top: 1px solid #497a7a;
    .btn{
      cursor: pointer;
      background: url('../../../../assets/images/equipment/btnBg.png') no-repeat;
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
</style>
