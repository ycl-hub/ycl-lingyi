<template>
  <el-dialog
    v-el-drag-dialog
    :title="dialogTitle"
    :visible.sync="isShow"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    :custom-class="'msg_Dialog bevel'"
  >
    <div class="msg_Dialog_content">
      <div class="msg_content">
        <el-form ref="ruleForm" :model="listQuery" label-position="left" :rules="rules" label-width="80px" class="listQuery" size="mini">
          <el-form-item label="收信人：" class="jqGrade is-required" prop="addressee" :title="listQuery.addressee">
            {{ listQuery.addressee }}
          </el-form-item>
          <el-form-item label="短信内容：" prop="msgDetail" class="conferenceName">
            <el-input
              v-model.trim="listQuery.msgDetail"
              type="textarea"
              placeholder="请输入短信内容"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div slot="footer" class="dialog-footer btnWrap">
      <div class="btn" @click="sureClick"><span>发 送</span></div>
      <div class="btn" @click="closeVisible"><span>取 消</span></div>
    </div>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import { sessionStorage } from '@/utils/storage'
import { throttle } from 'lodash'
export default {
  name: 'MessagePopup',
  props: {
    dialogTitle: {
      type: String || Array || Object,
      default: '发送短信'
    },
    dialogVisible: {
      default: false,
      type: Boolean
    },
    listQuery: {
      type: Object,
      default: () => {
        return {
          msgDetail: '',
          addressee: ''
        }
      }
    },
    sendGroup: {
      default: () => {
        return []
      },
      type: Array
    }
  },
  data() {
    return {
      isShow: false,
      rules: {
        msgDetail: [
          { required: true, message: '请输入短信内容', trigger: 'blur' }
        ],
        addressee: [
          { required: true, message: '请选择收信人', trigger: 'blur' }
        ]
      },
      successMessage: [], // 成功的短信
      failedMessage: [], // 失败的短信
      sendTime: '', // 发送时间
      TONE_voip: sessionStorage.get('TONE_voip')
    }
  },
  computed: {
    ...mapGetters([
      'userAgent'
    ]),
    callBackLength() {
      return this.successMessage.length + this.failedMessage.length
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
        } else {
          this.getSmsTemplate()
        }
      }
    },
    callBackLength: {
      handler(val) {
        if (val && val === this.sendGroup.length) {
          // 和传的人员数量一致 调用存储历史记录接口
          let SEND_METHOD = 0
          val === 1 ? SEND_METHOD = 1 : ''
          if (this.successMessage.length) {
            // 成功的存储记录接口
            let sendStr = ''
            this.successMessage.forEach(item => {
              sendStr += item + '、'
            })
            sendStr.slice(0, -1)
            const QueryParameter = {
              'token': this.TONE_voip.cmd.TOKEN,
              'POLICENO': this.TONE_voip.cmd.POLICE_ID,
              'SENDER': this.TONE_voip.cmd.POLICE_NAME,
              'RECEIVER': sendStr,
              'SEND_METHOD': SEND_METHOD,
              'CONTENT': this.listQuery.msgDetail,
              'SEND_TIME': this.sendTime,
              'SEND_RESULT': 1
            }
            this.$api.record.addSmsRecord(QueryParameter).then(res => {
              console.log(res)
            }).catch(err => {
              console.log(err)
            })
          }
          if (this.failedMessage.length) {
            // 失败的存储记录接口
            let sendStr = ''
            this.failedMessage.forEach(item => {
              sendStr += item + '、'
            })
            sendStr.slice(0, -1)
            const QueryParameter = {
              'token': this.TONE_voip.cmd.TOKEN,
              'POLICENO': this.TONE_voip.cmd.POLICE_ID,
              'SENDER': this.TONE_voip.cmd.POLICE_NAME,
              'RECEIVER': sendStr,
              'SEND_METHOD': SEND_METHOD,
              'CONTENT': this.listQuery.msgDetail,
              'SEND_TIME': this.sendTime,
              'SEND_RESULT': 0
            }
            this.$api.record.addSmsRecord(QueryParameter).then(res => {
              console.log(res)
            }).catch(err => {
              console.log(err)
            })
          }
        }
      }

    }
  },
  created() {
    this.getSmsTemplate()
  },
  methods: {
    getSmsTemplate() {
      this.$api.common.getSmsTemplate({
        template_id: '00000001'
      }).then(res => {
        this.listQuery.msgDetail = res.data.data[0].CONTENT
      })
    },
    // 发送短信
    sureClick: throttle(function() {
      this.$refs['ruleForm'].validate((val) => {
        if (val) {
          this.sendTime = parseTime(new Date(), '{y}:{m}:{d} {h}:{i}:{s}')// 短信发送时间
          this.successMessage = []
          this.failedMessage = []
          this.sendGroup.forEach((item, index) => {
            this.send(item.mb, item)
          })
          this.$message.success('短信已发送!')
          this.$emit('closeVisible')
        }
      })
    }, 500, { 'trailing': false }),
    send(phoneNum, item) {
      const _this = this
      var eventHandlers = {
        'succeeded': function(e) {
          console.log('短信发送成功', e)
          _this.successMessage.push(item.name || item.UnitName)
        },
        'failed': function(e) {
          console.log('短信发送失败', e)
          _this.failedMessage.push(item.name || item.UnitName)
        }
      }
      var options = {
        'eventHandlers': eventHandlers,
        'contentType': 'text/plain'
      }
      if (this.userAgent) {
        this.userAgent.sendMessage(phoneNum, this.listQuery.msgDetail, options)
      }
    },
    closeVisible() {
      // this.$message.success('短信已发送!')
      this.$emit('closeVisible')
    }
  }
}
</script>
