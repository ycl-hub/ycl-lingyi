<template>
  <!-- 成员管理抽屉 -->
  <div class="groupMember">
    <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
      <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
    </el-input>
    <ul class="list">
      <li v-for="user in memberList" :key="user.POLICE_ID" class="listItem clearfix">
        <img :src="icon_single" alt="" class="picture">
        <div class="itemRight clearfix">
          <p class="top">
            <span
              :class="user.active||(user.yonghuid=== userInfo.userName&&
                $parent.meetingConduct)?'name active':'name'"
            >{{ user.yonghuname }}</span>
            <button class="btn fr" @click="delMember(user)">
              移除
            </button>
          </p>
          <p class="message">{{ user.yonghuzxbj === 0||!'yonghuzxbj' in user ? '离线' : '在线' }}</p>
        </div>
      </li>
      <li v-if="memberList && memberList.length===0" class="noMessage">暂无成员</li>
    </ul>
    <div class="groupMemberBtnWrap">
      <button class="btn" @click="addMember">
        添加人员
      </button>
    </div>
    <div class="inner">
      <el-dialog
        v-el-drag-dialog
        title="添加成员"
        :visible.sync="dialogVisible"
        width="700px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="organizeDialog bevel"
      >
        <div class="organizeDialog_content">
          <OrganizePer :add-meeting-member-list="addImMemberList" />
        </div>
        <div slot="footer" class="dialog-footer btnWrap">
          <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
          <div class="btn" @click="sureClickHandle"><span>确 定</span></div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import icon_single from '@/assets/images/im/icon_single.png'
import OrganizePer from '@/components/organizePer'
import { mapGetters } from 'vuex'
import { get } from 'lodash'
export default {
  name: 'GroupMember',
  components: {
    OrganizePer
  },
  computed: {
    ...mapGetters([
      'mqResponseData',
      'userTree'
    ])
  },
  props: {
    activeUserOrGroup: {
      required: false,
      type: Object,
      default() {
        return {}
      }
    },
    drawer: {
      required: true,
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search, icon_single,
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      filterText: '',
      memberList: [],
      cloneMemberList: [],
      dialogVisible: false,
      addImMemberList: [] // 群聊添加成员
    }
  },
  watch: {
    filterText: {
      handler: function(val) {
        if (!val) {
          this.memberList = this.cloneMemberList
        }
      }
    },
    'activeUserOrGroup.Conference_Id': {
      handler: function(val) {
        if (val) {
          this.GetGroupMember()
        }
      }
    },
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        // 用户上下线状态
        if (json.MSG_KEY === 'POLICE_STATUS') {
          const arr = get(_this, 'memberList', [])
          const findIndex = arr.findIndex(item => Number(item.yonghuid) === Number(json.POLICE_ID))
          if (Number(json.STATUS) === 1 && _this.memberList[findIndex]) {
            _this.$set(_this.memberList[findIndex], 'yonghuzxbj', 1)
          } else if (_this.memberList[findIndex]) {
            _this.$set(_this.memberList[findIndex], 'yonghuzxbj', 0)
          }
        }
      },
      immediate: true
    }
  },
  created() {
    this.GetGroupMember()
  },
  methods: {
    // 模糊搜索
    searchBtn() {
      this.memberList = this.cloneMemberList.filter((item) => {
        const name = item.POLICE_NAME || item.yonghuname
        return name.search(this.filterText) !== -1
      })
    },
    // 关闭成员列表弹层
    closeGroupMember() {
      this.drawer && this.$emit('update:drawer', false)
    },
    // 获取成员列表
    async  GetGroupMember() {
      const res = await this.$api.common.getMeetingMember({
        userId: this.userInfo.userName,
        userPwd: this.$md5(this.userInfo.userPwd),
        type: '2',
        conferId: this.activeUserOrGroup.Conference_Id
      })
      this.memberList = res.data
      this.cloneMemberList = res.data
    },
    // 添加成员
    addMember() {
      this.dialogVisible = true
      this.addImMemberList = []
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      this.createIm()
    },
    // 创建群聊
    createIm() {
      const _this = _this
      if (this.addImMemberList.length === 0) {
        this.$alert('请选择人员', '提示', {
          type: 'warning'
        })
        return false
      }
      let flag = false
      this.addImMemberList.forEach(obj => {
        console.log(this.memberList.find(item => item.userId === obj.userId))
        if (this.memberList.find(item => parseInt(item.user_id) === parseInt(obj.userId))) {
          flag = true
          return
        }
      })
      if (flag) {
        this.$alert('请不要选择重复的人员', '提示', {
          type: 'warning'
        })
        return
      }
      var MEMBER_LIST = this.addImMemberList.map(v => {
        return v.userId
      })
      var old_MEMBER_LIST = this.cloneMemberList.map(v => {
        return v.user_id + ''
      })
      MEMBER_LIST = MEMBER_LIST.concat(old_MEMBER_LIST)
      this.$api.common.addDelBroadcastMem({
        data: {
          id: this.activeUserOrGroup._id,
          yhIds: MEMBER_LIST.join(',')
        }
      }).then(res => {
        if (res.data.error) {
          this.$message({
            type: 'error',
            message: res.data.error
          })
          return false
        }
        this.dialogVisible = false
        this.GetGroupMember()
        this.$emit('refresh', this.addImMemberList, 'add')
      }).catch(() => {
        // this.$message({
        //   type: 'error',
        //   message: '添加失败'
        // })
      })
    },
    // 移除成员
    delMember(user) {
      console.log(user, this.userInfo, '删除信息')
      if (user.user_id === this.userInfo.userName) {
        this.$message.warning('不可以移除自己')
        return
      }
      this.$confirm(`此操作将永久移除 ${user.yonghuname}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var old_MEMBER_LIST = this.cloneMemberList
        var MEMBER_LIST = old_MEMBER_LIST.map(v => {
          return v.user_id + ''
        })
        MEMBER_LIST.splice(MEMBER_LIST.indexOf(user.user_id), 1)
        this.$api.common.addDelBroadcastMem({
          data: {
            id: this.activeUserOrGroup._id,
            yhIds: MEMBER_LIST.join(',')
          }
        }).then(res => {
          if (res.data.error) {
            this.$message({
              type: 'error',
              message: res.data.error
            })
            return false
          }
          this.dialogVisible = false
          this.GetGroupMember()
          this.$emit('refresh', user.user_id, 'delete')
        }).catch(() => {
          // this.$message({
          //   type: 'error',
          //   message: '添加失败'
          // })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消移除'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.groupMember {
  position: absolute;
  width: 200px;
  height: 100%;
  top: 0;
  right: 0;
  // background: red;
  border-left: 1px solid #497a7a;
  ::v-deep .filter {
    width: 100%;
    height: 30px;
    .el-input__inner {
      height: 30px;
      border: 1px solid #197491;
      background-color: #265872;
      color: #fff;
      font-size: 12px;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
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
  .groupMemberBtnWrap {
    position: absolute;
    bottom: 0px;
    z-index: 2;
    width: 100%;
    display: flex;
    justify-content: space-between;
    .btn {
      width: 100%;
      height: 28px;
      background: linear-gradient(0deg, #2A7AA2, #055984);
      border: 1px solid #01CFFF;
      border-radius: 2px;
      color: #00d8ff;
      cursor: pointer;
    }
  }
  .list {
    height: calc(100% - 60px);
    overflow: auto;
    .listItem {
      width: 100%;
      height: 54px;
      padding: 5px;
      border-bottom: 1px solid #497a7a;
      cursor: pointer;
      position: relative;
      .picture {
        width: 44px;
        height: 44px;
        float: left;
      }
      .number {
        position: absolute;
        width: 16px;
        height: 16px;
        background: #FF3333;
        box-shadow: 0px 2px 4px 0px rgba(255, 51, 51, 0.4);
        border-radius: 50%;
        color: #FAFDFF;
        left: 44px;
        top: 6px;
        text-align: center;
        line-height: 16px;
        font-size: 12px;
      }
      .itemRight {
        float: right;
        width: calc(100% - 50px);
        height: 100%;
        .top {
          height: 22px;
          line-height: 22px;
          .name {
            float: left;
            font-size: 14px;
            font-family: MicrosoftYaHei;
            color: #FAFDFF;
          }
          .active{
            color: #30deff;
          }
          .time {
            float: right;
            font-size: 12px;
            font-family: ArialMT;
            color: rgba(250, 253, 255, 0.6);
          }
          .btn {
            height: 24px;
            background: linear-gradient(0deg, #2A7AA2, #055984);
            border: 1px solid #01CFFF;
            border-radius: 2px;
            color: #00d8ff;
            cursor: pointer;
          }
        }
        .message {
          height: 22px;
          line-height: 22px;
          font-size: 12px;
          font-family: MicrosoftYaHei;
          color: rgba(250, 253, 255, 0.6);
        }
      }
    }
    .noMessage {
      font-family: ArialMT;
      color: rgba(250, 253, 255, 0.6);
      text-align: center;
      height: 64px;
      line-height: 64px;
    }
  }
}
</style>
