<template>
  <el-dialog
    v-el-drag-dialog
    :title="dialogTitle"
    :visible.sync="isShow"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    custom-class="organizeDialog bevel createDialogPolling"
  >
    <el-tabs v-model="isAll">
      <el-tab-pane label="轮询组信息" name="轮询组信息" />
      <el-tab-pane label="设置轮询" name="设置轮询" />
    </el-tabs>
    <!-- <ul class="tab" @click="selectTab($event)">
      <li :class="isAll==='轮询组信息'? 'active' : ''">轮询组信息</li>
      <li :class="isAll === '设置轮询' ? 'active' : ''">设置轮询</li>
      <div ref="btnLine" class="btnLine" />
    </ul> -->
    <div v-if="isAll==='轮询组信息'" class="organizeDialog_content_add">
      <div class="body-item" style="padding-top: 10px;margin-bottom: 10px;">
        <span>群组名称：</span> <div class="flex1"><el-input v-model="createMeetingName" size="small" placeholder="请输入名称" style="width:100%;" /></div>
      </div>
      <div v-show="warnText" class="msg_text">
        {{ warnText }}
      </div>
      <Organize :call-type="callType" :dialog-title="dialogTitle" :tab-nav="tabNav" :add-meeting-member-list="addMeetingMemberList" :dialog-type="dialogType" />
    </div>
    <div v-else class="setting-body">
      <div class="body-item">
        <span>轮询间隔：</span>
        <el-select v-model="POLLING_TIME_INTERVAL" placeholder="请选择" class="flex1">
          <el-option
            v-for="(items, inds) in shipinArr"
            :key="inds"
            :label="items.value"
            :value="items.value"
          />
        </el-select>
      </div>
      <div class="body-item">用户可根据需要选择轮询结束的规则</div>
      <div class="body-item">
        <el-radio v-model="activePolling" label="轮询时长">轮询时长</el-radio>
        <el-radio v-model="activePolling" label="轮询次数">轮询次数</el-radio>
      </div>
      <div class="body-item">
        <span>{{ activePolling }}：</span>
        <div v-show="activePolling==='轮询时长'" class="flex2">
          <el-input v-model="POLLING_TIME_LONG" placeholder="请输入" @input.native="changeValue" />
          <span>小时</span>
        </div>
        <div v-show="activePolling==='轮询次数'" class="flex2">
          <el-input v-model="POLLING_NUMBER" placeholder="请输入" @input.native="changeValue" />
          <span>次数</span>
        </div>
      </div>
      <div />
    </div>
    <div slot="footer" class="dialog-footer btnWrap">
      <div class="btn" @click="closeVisible"><span>取 消</span></div>
      <div class="btn" @click="sureClick"><span>{{ dialogTitle === '编辑轮询群组'?'保 存':'创 建' }}</span></div>
    </div>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import Organize from '@/components/organize'
export default {
  components: { Organize },
  props: {
    dialogType: {
      type: String || Array || Object,
      default: 'create'
    },
    dialogTitle: {
      type: String || Array || Object,
      default: '邀请成员'
    },
    dialogVisible: {
      default: false,
      type: Boolean
    },
    callType: {
      type: String,
      default: ''
    },
    pollingData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isShow: false,
      tabNav: [
        {
          name: '人员',
          isActive: true
        }, {
          name: '设备',
          isActive: false
        }, {
          name: '外部联系人',
          isActive: false
        }
      ],
      isAll: '轮询组信息',
      shipinArr: [{
        value: '10s',
        label: '10s'
      }, {
        value: '20s',
        label: '20s'
      }],
      shipinActive: [{
        value: '',
        label: '10s'
      }, {
        value: '20s',
        label: '20s'
      }],
      POLLING_TIME_LONG: '', // 轮询时长
      POLLING_TIME_INTERVAL: '', // 轮询间隔
      POLLING_NUMBER: '', // 轮询次数
      activePolling: '轮询时长'

    }
  },
  watch: {
    dialogVisible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.isShow = true
        } else {
          this.isShow = false
        }
      }
    },
    isShow: {
      handler(val) {
        if (!val) {
          this.$emit('closeVisible')
        }
      }
    },
    activePolling: {
      handler(val, newVal) {
        if (val !== newVal) {
          this.activeValue = ''
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'devlist',
      'addMeetingMemberList',
      'checkResourcelist'
    ]),
    createMeetingName: {
      get() {
        return this.$store.getters.createMeetingName
      },
      set(val) {
        this.$store.commit('audioMeet/SET_createMeetingName', val)
      }
    },
    warnText: {
      get() {
        let msg = ''
        if (this.callType === 'audio') {
          msg = '音频'
        } else if (this.callType === 'video') {
          msg = '视频'
        } else if (this.callType === 'videoMeet') {
          return ''
        } else if (this.dialogTitle === '邀请警员') {
          return ''
        } else if (this.dialogTitle === '编辑轮询群组' || this.dialogTitle === '新建轮询群组') {
          return ''
        }
        return `已自动过滤了不支持${msg}的用户`
      }
    }
  },
  created() {
    if (this.dialogTitle === '邀请警员') {
      this.tabNav = [
        {
          name: '人员',
          isActive: true
        }
      ]
    }
  },
  mounted() {
    this.$message.closeAll()
    if (Object.keys(this.pollingData).length > 0) {
      if (this.pollingData.POLLING_NUMBER) {
        this.activePolling = '轮询次数'
        this.POLLING_NUMBER = Number(this.pollingData.POLLING_NUMBER)
      } else {
        this.activePolling = '轮询时长'
        this.POLLING_TIME_LONG = Number(this.pollingData.POLLING_TIME_LONG)
      }
      this.POLLING_TIME_INTERVAL = this.pollingData.POLLING_TIME_INTERVAL
    }
  },
  methods: {
    changeValue(e) {
      const str = '0123456789.'
      const arr = e.target.value.split('')
      let result = ''
      arr.forEach(item => {
        if (str.indexOf(item) !== -1) {
          result += item
        }
      })
      e.target.value = result
      if (this.activePolling === '轮询次数') {
        this.activePolling = '轮询次数'
        this.POLLING_NUMBER = result
      } else {
        this.POLLING_TIME_LONG = result
      }
    },
    // tab切换
    selectTab(e) {
      if (e.target.nodeName === 'LI') {
        this.isAll = e.target.innerText
        if (this.isAll === '轮询组信息') {
          this.$refs.btnLine.style.left = 35 + 'px'
        }
        if (this.isAll === '设置轮询') {
          this.$refs.btnLine.style.left = 128 + 'px'
        }
      }
    },
    sureClick() {
      // eslint-disable-next-line prefer-const
      let { POLLING_TIME_LONG, POLLING_TIME_INTERVAL, POLLING_NUMBER, activePolling, activeValue } = this
      if (this.activePolling === '轮询次数') {
        activeValue = POLLING_NUMBER
      } else {
        activeValue = POLLING_TIME_LONG
        if (Number(activeValue) * 3600 < parseInt(POLLING_TIME_INTERVAL)) {
          this.$message.warning('轮询时长不能小于轮询间隔!')
          return
        }
      }
      this.$emit('sureClick', { POLLING_TIME_LONG, POLLING_TIME_INTERVAL, POLLING_NUMBER, activePolling, activeValue
      })
    },
    closeVisible() {
      this.$emit('closeVisible')
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .organizeDialog  {
  height: 540px !important;
  ::v-deep .el-dialog__body{
    padding-top:15px !important;
  }
  .setting-body{
    padding: 20px;
    box-sizing: border-box;
  }
   .el-tabs {
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
  .body-item{
    display: flex;
    align-items: center;
    justify-content: flex-start !important;
    color: #01cfff;
    margin-bottom: 20px;
    font-size: 12px;
    .is-checked {
      .el-radio__label{
        color: #01cfff;
      }
    }
    .flex1{
      flex:1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span{
        white-space: nowrap;
      }
      .el-input{
        .el-input__icon{
          line-height: 2;
          color: #01cfff;
        }
        .el-input__inner{
         height: 30px;
          background: transparent;
          border: 1px solid #01cfff;
          font-size: 12px;
          color: #01cfff;
        }
      }
    }
    .flex2{
      flex:1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
      padding-right: 5px;
      background: transparent;
      border: 1px solid #01cfff;
      color: #01cfff;
      .el-input__inner{
        height: 100%;
        color: #01cfff;
        border: none;
        font-size: 12px;
        background-color: transparent;
      }
      span{
        white-space: nowrap;
      }
    }
  }
}
  .tab {
    display: flex;
    position: relative;
    height: 32px;
    // border-top: 1px solid rgba(2, 167, 253, 0.4);
    border-bottom: 1px solid #01cfff;
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
      left: 45px;
      bottom: 0;
      z-index: 2;
      background: #ff6a00;
      transform: perspective(4px) rotateX(5deg);
      transition: all 0.3s;
    }
  }
</style>
