<template>
  <!-- 成员管理抽屉 -->
  <div class="ReGroupName">
    <div class="inner">
      <el-dialog
        v-el-drag-dialog
        title="修改群组名称"
        :visible.sync="reGroupNameDialog"
        width="300px"
        append-to-body
        :show-close="false"
        :close-on-click-modal="false"
        custom-class="ReGroupNameWrap bevel"
      >
        <el-form ref="ruleForm" label-position="left" :model="listQuery" :rules="rules" label-width="100px" class="listQuery" size="mini" @submit.native.prevent>
          <el-form-item label="群组名称：" prop="GROUP_NAME">
            <el-input v-model.trim="listQuery.GROUP_NAME" class="filter" type="text" placeholder="请输入群组名称" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer btnWrap">
          <div class="btn" @click="close"><span>取 消</span></div>
          <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
export default {
  name: 'ReGroupName',
  components: {
  },
  props: {
    activeUserOrGroup: {
      required: false,
      type: Object,
      default() {
        return {}
      }
    },
    reGroupNameDialog: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      listQuery: {
        GROUP_NAME: this.activeUserOrGroup.GROUP_NAME
      },
      rules: {
        GROUP_NAME: [
          { required: true, message: '请输入群组名称', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    // 弹框确定按钮点击事件
    sureClickHandle() {
      // 群聊名称未填写
      if (!this.listQuery.GROUP_NAME) {
        this.$alert('请填写群聊名称', '提示', {
          type: 'warning'
        })
        return false
      }
      // 群聊名称已存在
      // for (var i = 0; i < this.groupList.length; i++) {
      //   if (this.groupList[i].GROUP_NAME === this.GROUP_NAME) {
      //     this.$alert('该群聊名称已存在', '提示', {
      //       type: 'warning'
      //     })
      //     return false
      //   }
      // }
      this.$api.im.RenameGroup({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        GROUP_ID: this.activeUserOrGroup.GROUP_ID,
        GROUP_NAME: this.listQuery.GROUP_NAME
      }).then(res => {
        if (res.data.result) {
          this.$emit('update:reGroupNameDialog', false)
        }
      })
    },
    close() {
      this.reGroupNameDialog && this.$emit('update:reGroupNameDialog', false)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
