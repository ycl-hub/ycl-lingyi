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
            <span class="name">{{ user.POLICE_NAME }}</span>
            <button class="btn fr" @click="delMember(user)">
              移除
            </button>
          </p>
          <p class="message" :title="user.UNIT_NAME">{{ user.UNIT_NAME }}</p>
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
          <div v-if="false" class="text-center cerate-top">
            <span>群聊名称：</span><el-input v-model="GROUP_NAME" size="small" placeholder="请输入群聊名称" style="width:300px;" />
          </div>
          <OrganizePer :add-meeting-member-list="addImMemberList" />
        </div>
        <div slot="footer" class="dialog-footer btnWrap">
          <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
          <div class="btn" @click="sureClickHandle"><span>创 建</span></div>
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
export default {
  name: 'GroupMember',
  components: {
    OrganizePer
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
      GROUP_NAME: '',
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
    'activeUserOrGroup.GROUP_ID': {
      handler: function(val) {
        if (val) {
          this.GetGroupMember()
        }
      }
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
    GetGroupMember() {
      this.$api.im.GetGroupMember({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        GROUP_ID: this.activeUserOrGroup.GROUP_ID
      }).then(res => {
        this.memberList = res.data.MEMBERLIST
        this.cloneMemberList = res.data.MEMBERLIST
      })
    },
    // 添加成员
    addMember() {
      this.dialogVisible = true
      this.GROUP_NAME = this.activeUserOrGroup.GROUP_NAME
      this.addImMemberList = []
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      this.createIm()
    },
    // 创建群聊
    createIm() {
      // 群聊名称未填写
      if (!this.GROUP_NAME) {
        this.$alert('请填写群聊名称', '提示', {
          type: 'warning'
        })
        return false
      }
      // 未选择群聊成员
      if (this.addImMemberList.length === 0) {
        this.$alert('请选择群聊人员', '提示', {
          type: 'warning'
        })
        return
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
      var MEMBER_LIST = this.addImMemberList.map(v => {
        return { 'POLICE_ID': v.userId }
      })
      this.$api.im.AddMember({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        GROUP_ID: this.activeUserOrGroup.GROUP_ID,
        MEMBER_LIST: MEMBER_LIST
      }).then(res => {
        if (res.data.result) {
          this.dialogVisible = false
          this.GetGroupMember()
          this.$emit('getGroup')
        }
      })
    },
    // 移除成员
    delMember(user) {
      this.$confirm(`此操作将永久移除 ${user.POLICE_NAME}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.im.RemoveMember({
          TOKEN: this.TONE_voip.cmd.TOKEN,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          GROUP_ID: this.activeUserOrGroup.GROUP_ID,
          MEMBER_LIST: [{
            'POLICE_ID': user.POLICE_ID
          }]
        }).then(res => {
          if (res.data.result) {
            this.GetGroupMember()
          } else {
            this.$message({
              type: 'info',
              message: '移除失败'
            })
          }
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
          overflow: hidden;
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
