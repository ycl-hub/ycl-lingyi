<template>
  <div class="JWT">
    <p class="distances">
      <el-input v-model.number.trim="activeDistance" class="append" placeholder="距离" @keyup.enter.native="handleDistance({ text: activeDistance })">
        <template slot="append">m</template>
      </el-input>
      <span v-for="(item, i) in distances" :key="i" :class="{activeDistance: activeDistance===item.text }" @click="handleDistance(item)">
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
      >
        <el-table-column
          type="selection"
          width="30"
        />
        <el-table-column
          label="警号"
          prop="POLICE_ID"
          width="80"
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
        <el-table-column label="操作" width="70">
          <template slot-scope="scope">
            <img :src="phone" alt="" @click="makeCall({callNumber:scope.row.POLICE_ID,audioOrVideo:'audio', belong: 'jwt'})">
            <img :src="camera" alt="" @click="makeCall({callNumber:scope.row.POLICE_ID,audioOrVideo:'video', belong: 'jwt'})">
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="btnWrap clearfix">
      <div class="btn fl" @click="handleAlarm()">
        <span class="">视频会商</span>
      </div>
      <div class="btn fr" @click="zhoubianJWTIM()">
        <span class="">信息群发</span>
      </div>
    </div>
    <!-- 视频会商 -->
    <VideoMeet v-if="isShowTongxun" :video-meet-dialog.sync="isShowTongxun" :video-dev="POLICE_LIST" />
    <!-- 信息群发 -->
    <!-- <IMPoliceListTemp v-if="isShowIM" :is-show-i-m.sync="isShowIM" :group-id="GROUP_ID" :group-member="groupMember" /> -->
    <IMPoliceListTempNew v-if="isShowIM" :is-show-i-m.sync="isShowIM" :detail="detail" :group-id="GROUP_ID" />
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import phone from '@/assets/images/equipment/phone.png'
import camera from '@/assets/images/equipment/camera.png'
import sip from '@/components/mixins/sip.js'
import VideoMeet from '../videoMeet'
import IMPoliceListTempNew from '@/components/IMPoliceListTempNew'
import { parseTime } from '@/utils/index'
import { mapGetters } from 'vuex'
export default {
  name: 'JWT',
  components: {
    VideoMeet, IMPoliceListTempNew
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
      search, phone, camera,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
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
      isShowTongxun: false,
      POLICE_LIST: [],
      // IM
      isShowIM: false,
      GROUP_ID: '',
      groupMember: []
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
    },
    ...mapGetters([
      'mqResponseData'
    ])
  },
  provide: function() {
    return {
    }
  },
  watch: {
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const json = JSON.parse(val)
        if (json.MSG_KEY === 'CreatGroup' && !json.MEMBERLIST) {
          this.GROUP_ID = json.GROUP_ID
          this.isShowIM = true
        }
      },
      immediate: false
    }
  },
  created() {
  },
  mounted() {
    this.handleDistance({ text: '500' })
  },
  methods: {
    // 	当table选择项发生变化时会触发该事件
    handleSelectionChange(val) {
      this.checkedNearPolices = val
    },
    handleDistance(item) {
      this.activeDistance = item.text
      this.activeDistance && this.getcirclePathJWT()
    },
    // 获取周围几百米内的坐标
    getcirclePathJWT() {
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
      this.$api.majorAlarm.getNearPolice({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        seconds: 60,
        POINT_LIST: this.circle.getPath(),
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
      if (this.checkedNearPolices.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      }
      console.log(this.checkedNearPolices, 6)
      this.POLICE_LIST = this.checkedNearPolices
      this.isShowTongxun = true
    },
    zhoubianJWTIM() {
      if (this.checkedNearPolices.length === 0) {
        this.$message.closeAll()
        this.$message({
          message: '请选择警力',
          type: 'info'
        })
        return false
      }
      var MEMBER_LIST = this.checkedNearPolices.map(v => {
        return { 'POLICE_ID': v.POLICE_ID }
      })
      MEMBER_LIST.push({ 'POLICE_ID': this.TONE_voip.cmd.POLICE_ID })
      var data = {
        OPERATOR: this.userInfo.userName,
        GROUP_NAME: `临时聊天组${parseTime(new Date(), '{m}{d} {h}:{i}')}`,
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        MEMBER_LIST: MEMBER_LIST
      }
      this.$api.im.CreateGroup(data).then(res => {
        this.checkedNearPolices.map((item) => {
          item.yonghuname = item.POLICE_NAME
          item.yonghuid = item.POLICE_ID
          item.UnitId = item.UNIT_ID
          item.UnitName = item.UNIT_NAME
          item.TYPE = '0'
          item.unRead = 0
          item.MSG_LIST = []
          item.loadNumber = 1
        })
        this.groupMember = this.checkedNearPolices
        console.log(this.groupMember, 89)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.JWT{
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
          img {
            margin-right: 10px;
            transform: translateY(3px);
            cursor: pointer;
          }
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
