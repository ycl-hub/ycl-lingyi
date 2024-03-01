<template>
  <div class="broadcast">
    <el-dialog
      v-el-drag-dialog
      title="广播"
      :visible.sync="isShow"
      width="980px"
      :close-on-click-modal="false"
      custom-class="meetWrap bevel"
      @close="closeMeet"
    >
      <div class="inner">
        <el-dialog
          v-el-drag-dialog
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          :width="dialogType==='add' ? '980px' : '300px'"
          append-to-body
          :close-on-click-modal="false"
          custom-class="organizeDialog bevel organizeDialogBroadcast"
        >
          <div class="organizeDialog_broadcast_content">
            <div class="broadcast_left">
              <el-form ref="ruleForm" label-position="left" :model="listQuery" :rules="rules" label-width="80px" class="listQuery" size="mini" @submit.native.prevent>
                <el-form-item label="广播类型：" prop="broadcastType" class="jqGrade is-required">
                  <el-radio v-model="listQuery.broadcastType" label="1">语音广播</el-radio>
                  <el-radio v-model="listQuery.broadcastType" label="2">文件广播</el-radio>
                </el-form-item>
                <el-form-item v-if="listQuery.broadcastType === '2'" label="上传文件：" prop="BroadcastFilename" class="uploadBroadcastFile conferenceName is-required">
                  <div class="addBtnWrap">
                    <el-upload
                      ref="upImg"
                      :action="upImg()"
                      name="upfile"
                      :data="dataFile"
                      :before-upload="beforeAvatarUpload"
                      :on-success="handleAvatarSuccess"
                      :on-exceed="handleExceed"
                      :on-remove="handleRemove"
                      :before-remove="beforeRemove"
                      multiple
                      :limit="1"
                      :file-list="fileList"
                    >
                      <button class="addBtn">
                        <span class="el-icon-circle-plus-outline" />
                        <span>上传文件</span>
                      </button>
                      <div slot="tip" class="el-upload__tip">
                        只能上传wav，且不超过200M
                      </div>
                    </el-upload>
                  </div>
                </el-form-item>
                <el-form-item label="广播主题：" prop="conferenceName" :class="{'broadcastType': listQuery.broadcastType === '2' ? true : false}" class="conferenceName">
                  <el-input
                    v-model.trim="listQuery.conferenceName"
                    type="textarea"
                    placeholder="请输入广播主题"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </el-form>
            </div>
            <OrganizePer v-if="dialogType === 'add'" :add-meeting-member-list="addMeetingMemberList" :dialog-type="dialogType" :meeting-member-list="meetingMemberList" />
          </div>
          <div slot="footer" class="dialog-footer btnWrap">
            <div class="btn" @click="cancel"><span>取 消</span></div>
            <div class="btn" @click="sureClickHandle"><span>确定</span></div>
          </div>
        </el-dialog>
      </div>
      <div class="out">
        <div class="left">
          <div class="met-list">
            <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
              <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
            </el-input>
            <ul>
              <li v-for="item in meetingList" :key="item.Conference_Id" :class="meetingAcitve.Conference_Id === item.Conference_Id ? 'active' :''" @click="getMeetingMember(item)">
                <i class="el-icon-s-promotion meeting-icon" />
                <span class="name ellipsis">
                  <div> {{ item.Conference_name }}</div>
                  <div> {{ item.onLine||'' }}</div>
                </span>
                <span class="li-btn-box">
                  <i class="el-icon-delete li-btn" @click.stop="delMeeting(item)" />
                </span>
              </li>
            </ul>
          </div>
          <div class="creatMeetBtn">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="createHandle">新建广播</el-button>
          </div>
        </div>
        <div class="right">
          <div v-if="meetingAcitve.Conference_Id" class="rightContent">
            <div class="name clearfix">
              <span class="left">广播类型：</span>
              <span class="right">{{ meetingAcitve && meetingAcitve.Broadcast_type === 2 ? '文件广播' : '语音广播' }}</span>
            </div>
            <div v-if="meetingAcitve && meetingAcitve.Broadcast_type === 2" class="name clearfix">
              <span class="left">广播文件：</span>
              <span class="right">{{ meetingAcitve && meetingAcitve.Broadcast_filename }}</span>
            </div>
            <div class="name clearfix">
              <span class="left">广播主题：</span>
              <span class="right">{{ meetingAcitve && meetingAcitve.Conference_name }}</span>
            </div>
          </div>
          <div v-if="meetingList.length!=0" class="creatMeetBtn">
            <el-button type="primary" size="mini" @click="editHandle(meetingAcitve)">编辑广播</el-button>
            <el-button v-if="!meetingConduct" type="primary" size="mini" @click="callBroadcastHandle">发起广播</el-button>
            <el-button v-if="meetingConduct" type="danger" size="mini" @click="controlMeeting('killAll')">结束广播</el-button>
            <el-button type="primary" size="mini" @click="memberManagerBtn(meetingAcitve)">人员管理</el-button>
          </div>
          <!-- 成员管理抽屉 -->
          <GroupMember v-if="drawer" ref="groupMember" :drawer.sync="drawer" :active-user-or-group="meetingAcitve" @refresh="editPeople" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import sip from '@/components/mixins/sip.js'
import { mapGetters } from 'vuex'
import OrganizePer from '@/components/organizePer'
import search from '@/assets/images/equipment/search.png'
import { api } from '@/api/env'
import GroupMember from './groupMember'
const x2js = require('x2js')
import { throttle } from 'lodash'
import { resolve } from 'path'
export default {
  name: 'Broadcast',
  components: {
    OrganizePer, GroupMember
  },
  mixins: [sip],
  props: {
    // 用于扇形组件控制语音会议的初始化接口
    getList: {
      required: false,
      type: Boolean,
      default: false
    },
    broadcastDialog: {
      required: true,
      type: Boolean
    }
  },
  data() {
    return {
      MeetZxzt: 0,
      meetingInterObj: null,
      search,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      meetingList: [], // 会议列表
      meetingAcitve: {},
      meetingConduct: false, // 会议正在进行
      dialogTitle: '', // 弹框标题
      dialogType: '', // 弹框类别add为添加,invite为邀请,distribute为分发
      meetingMemberList: [], //
      addMeetingMemberList: [], // 会议添加成员
      dialogVisible: false,
      memberActive: '', // 选中的成员
      filterText: '',
      listQuery: {
        broadcastType: '1',
        conferenceName: ''
      },
      rules: {
        conferenceName: [
          { required: true, message: '请输入广播主题', trigger: 'blur' }
        ]
      },
      // fileList: [{ name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }],
      fileList: [],
      dataFile: {
        FileName: ''
      },
      drawer: false
    }
  },
  computed: {
    isShow: {
      get() {
        return this.broadcastDialog
      },
      set(val) {
        this.$emit('update:broadcastDialog', val)
      }
    },
    ...mapGetters([
      'userAgent',
      'mqResponseData'
    ])
  },
  watch: {
    filterText: {
      handler: function(val) {
        if (!val) {
          this.getMeetingList()
        }
      },
      immediate: false
    },
    getList: {
      handler: function(val) {
        val && this.getMeetingList()
      },
      immediate: true
    },
    isShow: {
      handler: function(val) {
        if (!val) {
          // this.addMeetingMemberList = []
          // this.dialogType = 'add'
        }
      }
    },
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        // 左侧 用户上下线状态
        if (json.MSG_KEY === 'POLICE_STATUS') {
          _this.meetingList.forEach((item, i) => {
            if (!(item.userArr && item.userArr.length > 0)) return
            const findIndex = item.userArr.findIndex(obj => Number(obj.yonghuid) === Number(json.POLICE_ID))
            if (findIndex !== -1) {
              if (Number(json.STATUS) === 1) {
                _this.$set(_this.meetingList[i].userArr[findIndex], 'yonghuzxbj', 1)
              } else {
                _this.$set(_this.meetingList[i].userArr[findIndex], 'yonghuzxbj', 0)
              }
              const lx = item.userArr.filter(obs => Number(obs.yonghuzxbj) === 0)// 离线人数
              this.$set(this.meetingList[i], 'onLine', `${item.userArr.length - lx.length}/${item.userArr.length}`)
            }
          })
        }
      },
      immediate: false
    },
    // 监听是否为手机呼叫过来的会议
    callList: {
      handler: function(val) {
        // for (let index = 0; index < this.meetingList.length; index++) {
        //   const meetRoom = this.meetingList[index]
        //   for (let j = 0; j < val.length; j++) {
        //     const singleMeet = val[j]
        //     if (singleMeet.from === meetRoom.Conference_Id) {
        //       this.$emit('update:broadcastDialog', true)
        //       this.meetingAcitve = meetRoom
        //       this.launchMeeting(meetRoom, true)
        //       break
        //     }
        //   }
        // }
      },
      deep: false
    },
    meetingList: {
      handler: function(val) {
        if (val.length === 0) {
          this.meetingAcitve = {}
        }
      }
    }
  },
  created() {
    if (this.userAgent) {
      this.getMeetingList()
    }
  },
  mounted() {
    window.addEventListener('beforeunload', this.beforeunloadHandler)
    this.$nextTick(() => {
      const body = document.querySelector('.sectorWrap')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
  },
  destroyed() {
    window.removeEventListener('beforeunload', this.beforeunloadHandler)
  },
  methods: {
    beforeunloadHandler() {
      if (this.meetingConduct) {
        this.controlMeeting('killAll')
      }
      // console.log(this.meetingAcitve.Conference_Id, 888)
    },
    editPeople(v, key) {
      // console.log(v, key, '被删除或添加成员的信息', this.meetingAcitve.userArr.concat(v))
      if (key === 'add') {
        this.$set(this.meetingAcitve, 'userArr', this.meetingAcitve.userArr.concat(v))
      } else {
        if (this.meetingAcitve && this.meetingAcitve.userArr && this.meetingAcitve.userArr.length > 0) {
          this.meetingAcitve.userArr.forEach((item, index) => {
            if (String(item.user_id) === String(v)) {
              this.meetingAcitve.userArr.splice(index, 1)
            }
          })
        }
      }

      this.getMeetingList()
    },
    upImg() {
      return `${api}/androidApi/voip/upLoadfiles.action`
    },
    beforeAvatarUpload(file) {
      return new Promise((resolve, reject) => {
        this.dataFile.FileName = file.name
        var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
        const isWAV = testmsg === 'wav'
        const isLt8M = file.size / 1024 / 1024 < 200
        if (!isWAV) {
          this.$message.warning('上传文件格式只能是wav文件!')
          return reject(false)
        }
        if (!isLt8M) {
          this.$message.warning('上传文件大小不能超过 200MB!')
          return reject(false)
        }
        return resolve(isWAV && isLt8M)
      })
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      this.fileList = fileList
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制上传 1 个文件`)
    },
    beforeRemove(file, fileList) {
      let a = true
      if (file && file.status === 'success') {
        a = this.$confirm(`确定移除 ${file.name}？`)
      }
      return a
    },
    handleAvatarSuccess(res, file, fileList) {
      console.log(res, file, fileList, 'success')
      this.fileList = fileList
      // this.navActive = '图标'
      // this.getImages()
      // this.ruleForm.tubiaoName = ''
    },
    // 关键词搜索
    searchBtn() {
      // 模糊搜索
      if (!this.filterText) {
        return false
      }
      this.meetingList = this.meetingList.filter((item) => {
        return item.Conference_name.search(this.filterText) !== -1
      })
    },
    closeMeet() {
      // 非强插，正常关闭
      this.isShow = true
      if (this.meetingConduct) {
        // 表示正有会议进行中
        this.$confirm(`当前正在广播期间，是否确认关闭?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.isShow = false
          this.controlMeeting('killAll')
          clearInterval(this.meetingInterObj)
          this.meetingInterObj = null
        })
      } else {
        this.isShow = false
      }
      // this.controlMeeting('killAll')
    },
    closeMeetForce() {
      // 强插关闭
      this.controlMeeting('killAll')
      clearInterval(this.meetingInterObj)
      this.meetingInterObj = null
    },
    // 获取会议列表
    async getMeetingList(v) {
      try {
        const res = await this.$api.common.getMeetingList({
          userId: this.userInfo.userName,
          type: 2,
          userPwd: this.$md5(this.userInfo.userPwd),
          broadcast: '1'
        })

        this.meetingList = res.data
        if (this.meetingList.length === 0) {
          this.drawer = false
        }
        res.data.forEach(async(item, i) => {
          const obj = await this.GetGroupMember(item.Conference_Id)
          // eslint-disable-next-line eqeqeq
          // console.log(obj)
          const lx = obj.filter(obs => obs.yonghuzxbj == 0)// 离线人数
          this.$set(this.meetingList[i], 'onLine', `${obj.length - lx.length}/${obj.length}`)
          this.$set(this.meetingList[i], 'userArr', obj)
          // console.log(res.data.length, i, v)
          if (i === res.data.length - 1 && v) {
            this.callBroadcastHandle()
          }
        })
        // 获取第一个会议成员并选中第一个会议
        // if (!this.meetingAcitve.Conference_Id) {
        this.meetingAcitve = this.meetingList[0] || {}
        // }
        if (this.$refs.groupMember && this.$refs.groupMember.GetGroupMember) {
          this.$refs.groupMember.GetGroupMember()
        }
      } catch (error) {
        console.log(error)
      }
    },
    async GetGroupMember(id) {
      const res = await this.$api.common.getMeetingMember({
        userId: this.userInfo.userName,
        userPwd: this.$md5(this.userInfo.userPwd),
        type: '2',
        conferId: id
      })
      return res.data
    },
    // 获取会议成员
    async getMeetingMember(data) {
      this.meetingAcitve = data
      // try {
      //   const res = await this.$api.common.getMeetingMember({
      //     userId: this.userInfo.userName,
      //     userPwd: this.$md5(this.userInfo.userPwd),
      //     type: '2',
      //     conferId: data.Conference_Id
      //   })
      //   this.meetingMemberList = res.data
      //   this.memberActive = ''
      // } catch (error) {
      //   console.log(error)
      // }
    },
    // 创建会议按钮点击
    createHandle() {
      this.dialogTitle = '创建广播'
      this.dialogVisible = true
      this.dialogType = 'add'
      this.listQuery = {
        broadcastType: '1',
        conferenceName: ''
      }
    },
    // 创建会议按钮点击
    editHandle(meetingAcitve) {
      console.log(meetingAcitve, 678)
      this.dialogTitle = '编辑广播'
      this.dialogVisible = true
      this.dialogType = 'edit'
      this.listQuery.broadcastType = meetingAcitve.Broadcast_type + ''
      this.listQuery.conferenceName = meetingAcitve.Conference_name
      this.fileList = [{ name: meetingAcitve.Broadcast_filename }]
      this.$forceUpdate()
    },
    // 弹框确定按钮点击事件
    sureClickHandle: throttle(function() {
      switch (this.dialogType) {
        case 'add':
          this.createMeeting()
          break
        case 'edit':
          this.createMeeting()
          break
      }
    }, 500, { 'trailing': false }),
    cancel() {
      this.$refs['ruleForm'].resetFields()
      this.addMeetingMemberList = []
      this.fileList = []
      this.dialogVisible = false
    },
    // 删除会议
    delMeeting(item) {
      // this.$confirm(`此操作将删除该会议（${item.Conference_name}），是否继续？`, '提示', {
      this.$confirm(`此操作将删除该广播，是否继续？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$api.common.delMeetingByConfId({
          userType: '2',
          userId: this.userInfo.userName,
          userPwd: this.$md5(this.userInfo.userPwd),
          id: item.Conference_Id
        }).then(res => {
          var data = res.data
          if (data.result === 'success') {
            this.$message({
              message: '删除成功',
              duration: 3000,
              type: 'success'
            })
            this.getMeetingList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 创建会议
    createMeeting() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          // 未上传文件
          if (this.listQuery.broadcastType === '2' && this.fileList.length === 0) {
            this.$alert('请先完成文件上传', '提示', {
              type: 'warning'
            })
            return false
          }
          // 未选择会议成员
          if (this.dialogType === 'add' && this.addMeetingMemberList.length === 0) {
            this.$alert('请选择广播人员', '提示', {
              type: 'warning'
            })
            return false
          }
          // 会议名称已存在
          for (var i = 0; i < this.meetingList.length; i++) {
            if (this.meetingList[i].Conference_name === this.listQuery.conferenceName) {
              this.$alert('该广播名称已存在', '提示', {
                type: 'warning'
              })
              return false
            }
          }
          if (this.dialogType === 'add') {
            var meetingMember = this.addMeetingMemberList.map(v => {
              return v.userId
            }).join(',')
            var data = {
              createId: this.userInfo.userName,
              conferenceName: this.listQuery.conferenceName,
              conferenceUserNum: this.addMeetingMemberList.length + 1,
              groupId: '',
              conferenceType: 2,
              meetingMember: meetingMember + ',' + this.userInfo.userName,
              broasdcast: 1,
              compType: 0,
              size: 0,
              broadcastType: this.listQuery.broadcastType,
              BroadcastMode: 0,
              BroadcastFilename: this.listQuery.broadcastType === '2' ? this.fileList[0].name : '',
              BroadcastLoop: '1',
              BroadcastTimeSet: 0,
              BroadcastFilePlayMillSeconds: 0
            }
            this.$api.common.createBroadcast({
              userId: this.userInfo.userName,
              userPwd: this.$md5(this.userInfo.userPwd),
              userType: '2',
              meetingMember: meetingMember + ',' + this.userInfo.userName,
              data: JSON.stringify(data)
            }).then((res) => {
              if (res.data.result === 'success') {
                this.listQuery = {
                  broadcastType: '1',
                  conferenceName: ''
                }
                this.getMeetingList()
                this.dialogVisible = false
                this.addMeetingMemberList = []
              } else {
                this.$message({
                  type: 'error',
                  message: res.data.error || '创建会议失败'
                })
              }
            }).catch((error) => {
              console.log(error)
            })
          } else {
            this.$api.common.editBroadcast({
              id: this.meetingAcitve._id,
              conferenceName: this.listQuery.conferenceName,
              conferenceId: this.meetingAcitve.Conference_Id,
              broadcastType: this.listQuery.broadcastType,
              broadcastLoop: this.listQuery.broadcastType === '2' ? '1' : '',
              broadcastFilename: this.listQuery.broadcastType === '2' ? this.fileList[0].name : '',
              broadcastFilenameOld: ''
            }).then((res) => {
              if (res.data.id) {
                this.getMeetingList()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'error',
                  message: res.data.error
                })
              }
            }).catch((error) => {
              console.log(error)
            })
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 发起广播
    callBroadcastHandle() {
      if (this.meetingConduct) {
        this.$alert('已有广播正在进行,如需继续请先结束上一个广播', '提示', {
          type: 'warning'
        })
        return false
      }
      this.meetingAcitve.state = true
      this.meetingConduct = true
      console.log(this.meetingAcitve.userArr)
      if (this.meetingAcitve.userArr.find(item => item.yonghuzxbj === 0)) {
        this.$message.warning('当前广播有用户离线')
      }
      this.makeCall({ callNumber: this.meetingAcitve.Conference_Id, audioOrVideo: 'audio', isMeeting: true })
      this.meetingInterObj = setInterval(() => {
        this.getMeetiingMemberState()
      }, 1000)
    },
    // 获取会议成员状态
    getMeetiingMemberState() {
      var t = +new Date()
      const _this = this
      _this.$api.common.conference_interactive({
        roomid: this.meetingAcitve.Conference_Id,
        cmd: 'xml_list',
        t: t
      }).then(res => {
        if (res.data.indexOf('not found') > -1) {
          window.clearInterval(this.meetingInterObj)
          this.meetingInterObj = null
          return false
        }
        // eslint-disable-next-line new-cap
        const a = new x2js()
        var data = a.xml2js(res.data).conferences.conference
        // 组合数据与成员比对
        // console.log(data, 798)
        if (_this.$refs.groupMember && data && data.members && data.members.member.length > 0) {
          _this.$refs.groupMember.memberList.forEach((item, index) => {
            _this.MeetZxzt = 0
            if (data.members.member.find(obj => obj.caller_id_number === item.user_id)) {
              _this.$set(_this.$refs.groupMember.memberList[index], 'active', true)
            } else {
              _this.$set(_this.$refs.groupMember.memberList[index], 'active', false)
            }
          })
          _this.$forceUpdate()
        } else if (!Array.isArray(data.members.member) && _this.$refs.groupMember && data.members.member) {
          _this.$refs.groupMember.memberList.forEach((item, index) => {
            _this.$set(_this.$refs.groupMember.memberList[index], 'active', false)
          })
        }
        if (!Array.isArray(data.members.member)) {
          _this.MeetZxzt++
        }
        if (_this.MeetZxzt >= 60) { // 一分钟挂断
          _this.MeetZxzt = 0
          _this.controlMeeting()
        }
      })
    },
    // 会议控制
    controlMeeting() {
      this.$api.common.meetControl({
        cmd: 'kick',
        roomid: this.meetingAcitve.Conference_Id,
        data: 'all'
      }).then(res => {
        this.meetingConduct = false
        this.meetingAcitve.state = false
        clearInterval(this.meetingInterObj)
        this.meetingInterObj = null
      })
    },
    memberManagerBtn(meetingAcitve) {
      this.drawer = !this.drawer
    }
  }
}
</script>
<style lang="scss" scoped>
.broadcast {
  ::v-deep .meetWrap {
    height: 500px;
    .el-dialog__header {
      padding: 15px 15px 10px;
      border-bottom: 1px solid #497a7a;
      .el-dialog__title,.el-dialog__close {
        font-size: 14px;
        font-family: PingFang SC;
        color: rgba(250, 253, 255, 1);
      }
      .el-dialog__headerbtn {
        top: 17px;
        right: 15px;
      }
    }
    .el-dialog__body {
      height: calc(100% - 50px);
      padding: 0px !important;
      .out {
        width: 100%;
        height: 100%;
        .left {
          width: 280px;
          height: 100%;
          border-right: 1px solid #497a7a;
          .met-list{
            width: 100%;
            height: calc(100% - 40px);
            overflow: auto;
            .filter {
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
            ul {
              height: calc(100% - 30px);
              overflow: auto;
            }
            li{
              display:flex;
              height: auto;
              line-height: 1;
              padding-left: 15px;
              border-bottom: 1px solid #1c213e;
              transition: all 0.1s;
              cursor: pointer;
              user-select: none;
              position: relative;
              align-items: center;
              box-sizing:border-box;
              padding: 5px 15px;
              span{
                div{
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
                display:flex;
                flex-direction: column;
                justify-content: space-around;
                i{
                  margin:0 !important;
                }
              }
            }
            li:hover{background:rgba(0,0,0,.1);}
            li.active{background:rgba(255,255,255,.1);}
            li .meeting-icon{
              font-size: 16px;
              color: #0099ff;
              float: left;
              width: 16px;
              height: 40px;
              // line-height: 40px;
            }
            li .name{
              font-size: 14px;
              color:#30deff;
              float: left;
              width: calc(100% - 56px);
              padding: 0 5px;
              .ellipsis{
                  display: flex;
                  flex-direction: column;
                  justify-content: space-around;
                  height: 100%;
              }
            }
            // li .li-btn-box{position: absolute; height: 40px; right: 5px;top:-2px;}
            li .li-btn{ float: left; margin: 5px 0 0 5px; width: 30px; height:30px; text-align: center; line-height: 30px; cursor: pointer; border-radius: 50%; background: rgba(0,0,0,.2); color: #9ef5ff;}
            li .li-btn:hover{background: rgba(0,0,0,.5)}
            li .li-btn:active{background: rgba(0,0,0,.5)}
          }
          .creatMeetBtn {
            text-align: center;
            width: 100%;
            height: 40px;
          }
        }
        .right {
          width: calc(100% - 280px);
          height: 100%;
          padding: 10px;
          position: relative;
          .rightContent {
            width: calc(100% - 200px);
            height: calc(100% - 30px);
            padding-bottom: 10px;
            overflow: auto;
            .name {
              font-family: PingFang SC;
              font-size: 12px;
              margin-top: 5px;
              .left {
                color: #becad2;
                width: 64px;
                margin-top: 4px;
                border-right: none;
              }
              .right {
                color: #fff;
                width: calc(100% - 64px);
                line-height: 20px;
                padding: 0px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
