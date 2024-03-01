<template>
  <div class="record">
    <div class="record_container">
      <ul class="tab-cards fl">
        <li v-for="(item,i) in tabNav" :key="i" :class="navActive==item.id?'active':''" @click="isShowPanel(item.id)">{{ item.name }}</li>
      </ul>
      <!-- <keep-alive> -->
      <component :is="navActive" />
      <!-- </keep-alive> -->
    </div>
  </div>
</template>

<script>
import TonghuaRecord from './tonghuaRecord'
import DuijiangRecord from './duijiangRecord'
import LunxunRecord from './lunxunRecord'
import yuyinhuiyiRecord from './yuyinhuiyiRecord'
import messageSendRecord from './messageSendRecord'
export default {
  name: 'Record',
  components: {
    TonghuaRecord,
    DuijiangRecord,
    LunxunRecord, yuyinhuiyiRecord, messageSendRecord
  },
  data() {
    return {
      navActive: 'TonghuaRecord',
      tabNav: [
        {
          name: '通话记录',
          id: 'TonghuaRecord',
          isActive: true
        }, {
          name: '语音会议记录',
          id: 'yuyinhuiyiRecord',
          isActive: false
        }, {
          name: '视频轮询记录',
          id: 'LunxunRecord',
          isActive: false
        }, {
          name: '对讲记录',
          id: 'DuijiangRecord',
          isActive: false
        }, {
          name: '短信发送记录',
          id: 'messageSendRecord',
          isActive: false
        }
      ]
    }
  },
  computed: {
  },
  watch: {
    $route: {
      handler(val) {
        if (val?.query?.name === 'videoScheduling') {
          this.navActive = 'LunxunRecord'
        }
      },
      immediate: true
    }
  },
  created() {
  },
  methods: {
    isShowPanel(val) {
      this.navActive = val
    }
  }
}
</script>
<style lang="scss" scoped>
.record {
  position: absolute;
  width: 100%;
  height: calc(100%);
  top: 0px;
  background: url('../../assets/images/login/bg.png') center center no-repeat;
  background-size: 100% 100%;
  padding-top: 0.75rem;
  .record_container {
    height: 100%;
    padding: 20px 15px 15px;
    .tab-cards{
      box-sizing: content-box;
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
  }
}
</style>
