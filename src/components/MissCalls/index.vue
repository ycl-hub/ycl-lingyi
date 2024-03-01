<template>
  <!-- 未接来电 -->
  <el-dialog
    v-el-drag-dialog
    :title="'未接来电('+callListListen.length+')'"
    :visible.sync="missdialog"
    width="630px"
    :close-on-click-modal="false"
    custom-class="activeLine bevel"
    @close="closeS"
  >
    <div class="tone_sip_dialog">
      <div class="tone_sip_con">
        <div class="tone_sip_con_c">
          <el-table
            :data="list"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column
              label="序号"
              type="index"
              width="60"
            />
            <el-table-column
              label="电话号码"
              width="120"
              prop="from"
            />
            <el-table-column
              label="来电时间"
              width="240"
              prop="forTime"
            />
            <el-table-column
              label="响铃时间"
              width="120"
              prop="ringTime"
            />
            <el-table-column label="操作" class-name="listenCall">
              <template slot-scope="{row}">
                <i class="el-icon-phone" title="语音呼叫" @click="makeCall({callNumber:row.from,audioOrVideo:'audio',belong:'map'})" />
                <i class="el-icon-video-camera-solid" title="视频呼叫" @click="makeCall({callNumber:row.from,audioOrVideo:'video',belong:'map'})" />
                <i class="el-icon-delete" title="删除" @click="deleteListen(row.forTime)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- <el-button type="primary" class="foot-btn" style="position: absolute;left:50%;bottom:10px;transform:translateX(-50%);padding:8px 15px;" @click="deleteListen(0,false)">清 空</el-button> -->
      <div class="btn">
        <span @click="deleteListen(0,false)">清 空</span>
      </div>
    </div>

  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import sip from '@/components/mixins/sip.js'
import { sessionStorage, localStorage } from '@/utils/storage'
import { cloneDeep } from 'lodash'
export default {
  mixins: [sip],
  data() {
    return {
      missdialog: true,
      list: []
    }
  },
  computed: {
    ...mapGetters([
      'callList',
      'callListListen'
    ])
  },
  watch: {
    callListListen: {
      deep: false,
      handler(newVal) {
        this.list = cloneDeep(newVal).reverse()
      },
      immediate: true
    }
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'deep-row'
      }
      return ''
    },
    closeS() {
      this.$emit('closeDialog')
    },
    deleteListen(i, flag = true) {
      // 删除当前 未接记录
      const arr = JSON.parse(JSON.stringify(this.callListListen))
      const userName = sessionStorage.get('TONE_sipUserInfo').userName
      const CallListStorage = localStorage.get('listenCallList')
      if (flag) {
        i = arr.findIndex(item => item.forTime === i)
        arr.splice(i, 1)
        this.$store.commit('sip/SET_CALL_LISTEN', arr)
        if (CallListStorage) {
          CallListStorage[userName].splice(i, 1)
          localStorage.set('listenCallList', CallListStorage)
        }
      } else {
        this.$store.commit('sip/SET_CALL_LISTEN', [])
        CallListStorage[userName] = []
        localStorage.set('listenCallList', CallListStorage)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
    .el-dialog__body {
      .tone_sip_con_c{
        height: calc(100% - 49px) !important;
        overflow-y: scroll !important;
      }
      .btn{
        position: absolute;
        left:50%;
        bottom:10px;
        transform:translateX(-50%);
        padding:8px 15px;
        cursor: pointer;
        background: url('../../assets/images/equipment/btnBg.png') no-repeat;
        background-size: 100% 100%;
        width: 80px;
        height: 24px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        margin-top: 10px;
        margin-right: 27px;
        line-height: 10px;
      }
    }
</style>
