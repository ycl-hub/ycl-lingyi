<template>
  <el-dialog
    v-el-drag-dialog
    title="创建群聊组"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="isShow"
    custom-class="organizeDialog bevel"
  >
    <div class="organizeDialog_content_add">
      <div class="text-center cerate-top">
        <span>群聊名称：</span><el-input v-model.trim="GROUP_NAME" size="small" placeholder="请输入群聊名称" style="width:300px;" />
      </div>
      <OrganizePer :add-meeting-member-list="addMeetingMemberList" />
    </div>
    <div slot="footer" class="dialog-footer btnWrap">
      <div class="btn" @click="$emit('closeVisible')"><span>取 消</span></div>
      <div class="btn" @click="sureClickHandle"><span>创 建</span></div>
    </div>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { sessionStorage } from '@/utils/storage'
import OrganizePer from '@/components/organizePer'
export default {
  components: { OrganizePer },
  props: {
    dialogVisible: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      GROUP_NAME: '',
      TONE_voip: sessionStorage.get('TONE_voip'),
      isShow: false
    }
  },
  computed: {
    ...mapGetters([
      'addMeetingMemberList'
    ])
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
    }
  },
  created() {
    this.getGroupList()
  },
  methods: {
    sureClickHandle() {
      // 群聊名称未填写
      if (!this.GROUP_NAME) {
        this.$alert('请填写群聊名称', '提示', {
          type: 'warning'
        })
        return false
      }
      if (this.GROUP_NAME.indexOf(' ') !== -1) {
        this.$alert('群聊名称不允许存在空格', '提示', {
          type: 'warning'
        })
        return false
      }
      // 未选择群聊成员
      if (this.addMeetingMemberList.length === 0) {
        this.$alert('请选择群聊人员', '提示', {
          type: 'warning'
        })
        return false
      }
      // 群聊名称已存在
      for (var i = 0; i < this.groupList.length; i++) {
        if (this.groupList[i].GROUP_NAME === this.GROUP_NAME) {
          this.$alert('该群聊名称已存在', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      var MEMBER_LIST = this.addMeetingMemberList.map(v => {
        return { 'POLICE_ID': v.userId }
      })
      MEMBER_LIST.push({ 'POLICE_ID': this.TONE_voip.cmd.POLICE_ID })
      var data = {
        OPERATOR: this.userInfo.userName,
        GROUP_NAME: this.GROUP_NAME,
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        MEMBER_LIST: MEMBER_LIST,
        TEMP: '0'
      }
      this.$api.im.CreateGroup(data).then(res => {
        this.$emit('closeVisible')
        this.$root.$emit('IM', {
          type: 'Group'
        })
      })
    },
    getGroupList() {
      this.$api.im.GetGroupList({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        TEMP: '0'
      }).then(res => {
        if (res.data && res.data.GROUPLIST) {
          const GROUPLIST = res.data.GROUPLIST.reverse()
          this.groupList = GROUPLIST
        }
      })
    }
  }
}
</script>
