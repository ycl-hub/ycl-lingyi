<template>
  <el-dialog
    v-el-drag-dialog
    :title="dialogTitle"
    :visible.sync="isShow"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
    :custom-class="customClass"
  >
    <div :class="[dialogType==='add'||'create'?'organizeDialog_content_add':'organizeDialog_content', callType==='videoMeet'?'organizeDialog_content_videoMeet':'']">
      <div v-if="dialogType=='add'" class="text-center cerate-top">
        <span>会议名称：</span><el-input v-model="createMeetingName" size="small" placeholder="请输入名称" style="width:300px;" />
      </div>
      <div v-if="dialogTitle.indexOf('常用群组')!==-1" class="body-item text-center cerate-top">
        <span>群组名称：</span><el-input v-model="createMeetingName" show-word-limit size="small" maxlength="6" placeholder="请输入名称" style="width:300px;" />
      </div>
      <div v-show="warnText" class="msg_text">
        {{ warnText }}
      </div>
      <Organize :is-video-group="isVideoGroup" :call-type="callType" :dialog-title="dialogTitle" :tab-nav="tabNav" :add-meeting-member-list="addMeetingMemberList" :dialog-type="dialogType" :video-dev="videoDev" />
    </div>
    <div slot="footer" class="dialog-footer btnWrap">
      <div class="btn" @click="closeVisible"><span>取 消</span></div>
      <div class="btn" @click="sureClick"><span>{{ isVideoGroup?'邀 请':'创 建' }}</span></div>
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
    videoDev: {
      type: Array,
      default() {
        return []
      }
    },
    isVideoGroup: {
      default: false,
      type: Boolean
    },
    callType: {
      type: String,
      default: ''
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
      dialogTypeClass: ''
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
    // 视频会商
    callType: {
      handler: function(val) {
        if (val === 'videoMeet') {
          this.tabNav = [
            {
              name: '人员',
              isActive: true
            }, {
              name: '设备',
              isActive: false
            }, {
              name: '终端',
              isActive: false
            }, {
              name: 'mcu',
              isActive: false
            }, {
              name: '外部联系人',
              isActive: false
            }
          ]
        }
      },
      immediate: true,
      deep: true
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
        } else if (this.dialogTitle.indexOf('群组') !== -1) {
          return ''
        } else if (this.dialogTitle.indexOf('即时') !== -1) {
          msg = '即时通信'
        }
        return `已自动过滤了不支持${msg}的用户`
      }
    },
    customClass: {
      get() {
        let c = ''
        if (this.dialogType === 'add') {
          c = 'organizeDialog bevel createDialog'
        } else if (this.dialogType === 'cyqz') {
          c = 'organizeDialog bevel createDialogGroup'
        } else {
          c = 'organizeDialog_content_long createDialog organizeDialog bevel'
        }
        if (this.callType === 'videoMeet') {
          c = 'organizeDialog bevel organizeDialog_videoMeet'
        }
        return c
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
    if (this.dialogType === 'add') {
      this.dialogTypeClass = 'organizeDialog bevel createDialog'
    } else if (this.dialogType === 'cyqz') {
      this.dialogTypeClass = 'organizeDialog bevel createDialogGroup'
    } else {
      this.dialogTypeClass = 'organizeDialog_content_long createDialog organizeDialog bevel'
    }
  },
  methods: {
    sureClick() {
      this.$emit('sureClick')
    },
    closeVisible() {
      this.$emit('closeVisible')
    }
  }
}
</script>

