<template>
  <div class="audioMeet">
    <el-dialog
      v-el-drag-dialog
      title="语音会议"
      :visible.sync="isShow"
      width="980px"
      :close-on-click-modal="false"
      custom-class="meetWrap bevel"
      append-to-body
      @close="closeMeet"
    >
      <div class="inner">
        <el-dialog
          v-el-drag-dialog
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          width="700px"
          append-to-body
          :close-on-click-modal="false"
          custom-class="organizeDialog bevel"
        >
          <div :class="dialogType==='add'?'organizeDialog_content_add':'organizeDialog_content'">
            <div v-if="dialogType=='add'" class="text-center cerate-top">
              <span>会议名称：</span><el-input v-model.trim="createMeetingName" size="small" placeholder="请输入名称" style="width:300px;" />
            </div>
            <Organize :add-meeting-member-list="addMeetingMemberList" :dialog-type="dialogType" :meeting-member-list="meetingMemberList" />
          </div>
          <div slot="footer" class="dialog-footer btnWrap">
            <div class="btn" @click="dialogVisible = false"><span>取 消</span></div>
            <div class="btn" @click="sureClickHandle"><span>创 建</span></div>
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
              <li v-for="item in meetingList" :key="item.Conference_Id" :class="meetingAcitve.Conference_Id === item.Conference_Id ? 'active' :''" @click="getMeetingMember(item,true)">
                <i class="el-icon-s-promotion meeting-icon" />
                <span class="name ellipsis" :title="item.Conference_name">
                  {{ item.Conference_name }}
                  <!-- <div>{{ item.Conference_name }}</div> -->
                  <!-- <div>{{ item.Create_time }}</div> -->
                  <!-- 创建时间 -->
                </span>
                <span class="li-btn-box">
                  <i class="el-icon-delete li-btn" @click.stop="delMeeting(item)" />
                </span>
              </li>
            </ul>
          </div>
          <div class="creatMeetBtn">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="createHandle">新建会议</el-button>
          </div>
        </div>
        <div class="right">
          <div class="meeting-member">
            <div class="meeting-member-box">
              <ul class="meeting-member-list text-center clearfix">
                <li v-for="item in meetingMemberList" :key="item.user_id" :class="item.user_id == memberActive ? 'active':''" @click="selectMember(item)">
                  <div class="member_header">
                    <span :style="{color:item.controlId ? '#0099ff' : ''}" class="el-icon-s-custom" />
                  </div>
                  <div class="name">
                    <span><i class="el-icon-s-promotion" :style="{color: item.yonghuzxbj=='1' ? '#67C23A' : '#909399' }" />{{ item.yonghuname||item.wbname }}</span>
                  </div>
                  <div class="over-hidden icon-box">
                    <span v-show="item.muteDetec" :class="item.muteDetec && item.muteDetec.toString() == 'true' ? 'el-icon-microphone': 'el-icon-turn-off-microphone'" />
                    <span v-show="item.muteDetec" :style="{ color: item.talking && item.talking.toString() == 'true' ? '#67C23A' :'' }" class="el-icon-mic" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="ulbtn-box">
            <ul class="btn-list text-center">
              <li><el-button type="success" :disabled="meetingAcitve.state" size="small" @click="launchMeeting(meetingAcitve.Conference_Id)">开始会议</el-button></li>
              <li><el-button type="primary" :disabled="!meetingAcitve.state" size="small" @click="inviteHandle">邀请</el-button></li>
              <li><el-button type="primary" :disabled="!meetingAcitve.state||!memberActive" size="small" @click="inviteMeeting(memberActive)">追呼</el-button></li>
              <li v-show="memberActiveMuteDetec && memberActiveMuteDetec.toString() == 'true' "><el-button type="primary" :disabled="!meetingAcitve.state||!memberActive || !memberActiveControlId" size="small" @click="controlMeeting('mute')">禁言</el-button></li>
              <li v-show="!memberActiveMuteDetec || memberActiveMuteDetec.toString() == 'false' "><el-button type="primary" :disabled="!meetingAcitve.state||!memberActive || !memberActiveControlId" size="small" @click="controlMeeting('unmute')">解除禁言</el-button></li>
              <li><el-button type="danger" :disabled="!meetingAcitve.state||!memberActive || !memberActiveControlId" size="small" @click="controlMeeting('kick')">踢出</el-button></li>
            </ul>
            <div v-if="meetingAcitve.state" class="meeting-runtime">
              <p v-if="meetingTime === '00:00:00'">会议正在拉起中，请稍后...</p>
              <div v-else>
                <p>正在进行语音会议....</p>
                <p><span class="letspace">房间号</span>：<span>{{ meetingAcitve.Conference_Id }}</span></p>
                <p>会议时长：<span>{{ meetingTime }}</span></p>
              </div>
            </div>
            <ul class="text-center kill">
              <li>
                <el-button type="danger" :disabled="!meetingAcitve.state" size="small" @click="controlMeeting('killAll')">结束</el-button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import sip from '@/components/mixins/sip.js'
const x2js = require('x2js')
import { mapGetters } from 'vuex'
import Organize from '@/components/organize'
import search from '@/assets/images/equipment/search.png'
import { getName } from '@/utils'
export default {
  name: 'Meet',
  components: {
    Organize
  },
  mixins: [sip],
  props: {
    // 用于扇形组件控制语音会议的初始化接口
    // getList: {
    //   required: false,
    //   type: Boolean,
    //   default: false
    // }
  },
  data() {
    return {
      search,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      meetingList: [], // 会议列表
      meetingAcitve: {},
      meetingTime: '00:00:00',
      meetingInterObj: '', // 会议定时器，用于管理会议定时器
      dialogTitle: '', // 弹框标题
      dialogType: '', // 弹框类别add为添加,invite为邀请,distribute为分发
      meetingMemberList: [], //
      dialogVisible: false,
      meetingConduct: false, // 会议正在进行
      memberActiveControlId: '', // 控制ID
      memberActiveMuteDetec: true, // 选中的成员是否静音
      memberActive: '', // 选中的成员
      filterText: ''
    }
  },
  computed: {
    ...mapGetters([
      'userListInfo',
      'userAgent',
      'mqResponseData',
      'meetDialog',
      'addMeetingMemberList'
    ]),
    isShow: {
      get() {
        return this.meetDialog
      },
      set(val) {
        this.$store.commit('audioMeet/SET_meetDialog', val)
      }
    },
    createMeetingName: {
      get() {
        return this.$store.getters.createMeetingName
      },
      set(val) {
        this.$store.commit('audioMeet/SET_createMeetingName', val)
      }
    }
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
    meetDialog: {
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
        const json = JSON.parse(val)
        if (json.MSG === 'create' && json.MSG_KEY === 'MEETROOM') {
          this.getMeetingList()
        }
      },
      immediate: false
    },
    // 监听是否为手机呼叫过来的会议
    callList: {
      handler: function(val) {
        for (let index = 0; index < this.meetingList.length; index++) {
          const meetRoom = this.meetingList[index]
          for (let j = 0; j < val.length; j++) {
            const singleMeet = val[j]
            if (singleMeet.from === meetRoom.Conference_Id) {
              this.$store.commit('audioMeet/SET_meetDialog', true)
              this.meetingAcitve = meetRoom
              this.launchMeeting(meetRoom, true)
              break
            }
          }
        }
      },
      deep: false
    }
  },
  created() {
    if (this.userAgent) {
      this.getMeetingList()
    }
  },
  mounted() {
    this.$nextTick(() => {
      const body = document.querySelector('.sectorWrap')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
    // 仅供map>subComponents>left组件使用
    this.$root.$on('createMeeting', (isReadyLaunch) => {
      setTimeout(async _ => {
        await this.createMeeting(isReadyLaunch)
      }, 10)
    })
  },
  beforeDestroy() {
    this.$root.$off('createMeeting')
    if (!this.meetingAcitve.state) {
      return
    }
    this.controlMeeting('killAll')
  },
  methods: {
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
        this.$confirm(`当前正在会议期间，是否确认关闭?`, '提示', {
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
    },
    closeMeetForce() {
      // 强插关闭
      this.controlMeeting('killAll')
      clearInterval(this.meetingInterObj)
      this.meetingInterObj = null
    },
    // 获取会议列表
    async getMeetingList() {
      try {
        const res = await this.$api.common.getMeetingList({
          userId: this.userInfo.userName,
          type: 2,
          userPwd: this.$md5(this.userInfo.userPwd)
        })
        this.meetingList = res.data
        // 获取第一个会议成员  并选中第一个会议  当从其他入口拉起语音会议时 要更新当前会议列表
        if (!this.meetingAcitve.Conference_Id) {
          this.meetingAcitve = this.meetingList[0] || {}
          await this.getMeetingMember(this.meetingAcitve, false)
        } else {
          await this.getMeetingMember(this.meetingAcitve, false)
        }
      } catch (error) {
        console.log(error)
      }
    },
    // 获取会议成员
    async getMeetingMember(data, flag) {
      // 有会议正在进行中 通过左侧点击，不进行切换
      if (this.meetingAcitve.state && flag) {
        return false
      }
      this.meetingAcitve = data
      try {
        const res = await this.$api.common.getMeetingMember({
          userId: this.userInfo.userName,
          userPwd: this.$md5(this.userInfo.userPwd),
          type: '2',
          conferId: data.Conference_Id
        })
        this.meetingMemberList = res.data
        this.memberActive = ''
      } catch (error) {
        console.log(error)
      }
    },
    // 获取会议成员状态
    getMeetiingMemberState() {
      var t = +new Date()
      this.$api.common.conference_interactive({
        roomid: this.meetingAcitve.Conference_Id,
        cmd: 'xml_list',
        t: t
      }).then(res => {
        if (res.data.indexOf('not found') > -1) {
          // 会议被挂断需要清除状态查询，会议人员状态初始化，会议状态初始化，会议正在进行状态重置
          window.clearInterval(this.meetingInterObj)
          this.meetingInterObj = null
          this.getMeetingMember(this.meetingAcitve, false)
          this.meetingAcitve.state = false
          this.meetingConduct = false
          return false
        }
        const a = new x2js()
        var data = a.xml2js(res.data).conferences.conference
        // 组合数据与成员比对
        // console.log(data, 678)
        if (data._name === this.meetingAcitve.Conference_Id) {
          var meetingTime = data._run_time
          var hours = parseInt(meetingTime / 3600) < 10 ? ('0' + parseInt(meetingTime / 3600)) : parseInt(meetingTime / 3600)
          var minutes = parseInt(meetingTime / 60) < 10 ? ('0' + parseInt(meetingTime / 60)) : parseInt(meetingTime / 60)
          var seconds = meetingTime % 60 < 10 ? ('0' + (meetingTime % 60)) : (meetingTime % 60)
          this.meetingTime = hours + ':' + minutes + ':' + seconds
          var member = data.members.member.caller_id_number ? [data.members.member] : data.members.member
          member = member.filter((item) => {
            return item._type === 'caller'
          })
          for (let i = 0; i < member.length; i++) {
            var flag = true
            var id = member[i].id
            var muteDetec = member[i].flags.can_speak
            var talking = member[i].flags.talking
            var number = member[i]['caller_id_number']
            var isModerator = member[i].flags.is_moderator
            var yonghuname = getName(this.userListInfo, number)
            for (let j = 0; j < this.meetingMemberList.length; j++) {
              var userId = this.meetingMemberList[j].user_id
              if (userId === number) {
                var newObj = this.meetingMemberList[j]
                newObj.controlId = id
                newObj.muteDetec = muteDetec
                newObj.talking = talking
                newObj.isModerator = isModerator
                newObj.yonghuname = yonghuname
                this.$set(this.meetingMemberList, j, newObj)
                flag = false
                break
              }
            }
            if (flag && number !== this.userInfo.userName) {
              var obj = {
                user_id: number,
                controlId: id,
                talking: talking,
                isModerator: isModerator,
                yonghuzxbj: '1',
                yonghuname: yonghuname
              }
              this.meetingMemberList.push(obj)
            }
          }
          // 监侧数据改变、踢出
          for (let i = 0; i < this.meetingMemberList.length; i++) {
            var dataFlag = true
            const userId = this.meetingMemberList[i].user_id
            for (let j = 0; j < member.length; j++) {
              const number = member[j]['caller_id_number']
              if (userId === number) {
                dataFlag = false
                break
              }
            }
            if (dataFlag) {
              const obj = {
                user_id: userId,
                yonghuname: this.meetingMemberList[i].yonghuname,
                yonghuzxbj: this.meetingMemberList[i].yonghuzxbj
              }
              this.$set(this.meetingMemberList, i, obj)
            }
            if (userId === this.memberActive) {
              this.memberActiveControlId = this.meetingMemberList[i].controlId ? this.meetingMemberList[i].controlId : ''
              this.memberActiveMuteDetec = this.meetingMemberList[i].muteDetec ? this.meetingMemberList[i].muteDetec : true
            }
          }
        }
      })
    },
    // 删除会议
    delMeeting(item) {
      // this.$confirm(`此操作将删除该会议（${item.Conference_name}），是否继续？`, '提示', {
      // 当前会议正在进行中，不进行删除
      if (this.meetingAcitve.state && this.meetingAcitve.Conference_Id === item.Conference_Id) {
        this.$message.closeAll()
        this.$message({
          type: 'info',
          message: '当前会议正在进行中，不能删除！'
        })
        return false
      }
      this.$confirm(`此操作将删除该会议（${item.Conference_name}），是否继续？`, '提示', {
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
            //
            this.meetingMemberList = []
            this.meetingAcitve = {}
            this.getMeetingList()
          }
        })
      }).catch(() => {
        // this.$message.closeAll()
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 创建会议按钮点击
    createHandle() {
      this.createMeetingName = ''
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.dialogTitle = '创建会议'
      this.dialogVisible = true
      this.dialogType = 'add'
    },
    // 弹框确定按钮点击事件
    sureClickHandle() {
      switch (this.dialogType) {
        case 'add':
          setTimeout(() => {
            this.createMeeting(false)
          }, 0)
          break
        case 'invite':
          this.inviteMeeting()
          break
      }
    },
    // 创建会议
    async createMeeting(isReadyLaunch) {
      if (this.meetingAcitve.state && isReadyLaunch) {
        this.$message.closeAll()
        this.$message({
          type: 'info',
          message: '当前有会议正在进行中，请稍后发起会议！'
        })
        return false
      }
      // 会议名称未填写
      if (!this.createMeetingName) {
        this.$alert('请填写会议名称', '提示', {
          type: 'warning'
        })
        return false
      }
      // 会议名称不能为空
      if (this.createMeetingName.length === 0) {
        this.$alert('会议名称不能为空', '提示', {
          type: 'warning'
        })
        return false
      }
      // 未选择会议成员
      if (this.addMeetingMemberList.length === 0) {
        this.$alert('请选择会议人员', '提示', {
          type: 'warning'
        })
        return false
      }
      // 会议名称已存在
      for (var i = 0; i < this.meetingList.length; i++) {
        if (this.meetingList[i].Conference_name === this.createMeetingName) {
          this.$alert('该会议名称已存在', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      var meetingMember = this.addMeetingMemberList.map(v => {
        if (v.devId === 'phone') {
          return v.userId + '-' + v.userName
        }
        return v.userId
      }).join(',')
      var data = {
        createId: this.userInfo.userName,
        conferenceName: this.createMeetingName,
        groupId: '',
        conferenceType: '0',
        conferenceUserNum: this.addMeetingMemberList.length + 1,
        meetingMember: meetingMember + ',' + this.userInfo.userName,
        compType: '0',
        size: '0'
      }
      try {
        const res = await this.$api.common.createMeetingRoom({
          userId: this.userInfo.userName,
          userPwd: this.$md5(this.userInfo.userPwd),
          userType: 2,
          data: JSON.stringify(data)
        })
        if (res.data.result === 'success') {
          // 电脑和手机创建都推送mq，所以这里注释
          // await this.getMeetingList()
          this.dialogVisible = false
          const conferenceId = res.data.conferenceId
          // 如果是保存并发起会议，首先创建的会议列表中的选中项必须重置为新创建的会议
          // console.log('语音会议' + this.dialogVisible, isReadyLaunch)
          if (isReadyLaunch) {
            await this.getMeetingList() // 如果通过mq去获取列表，可能是列表没有加载完，这边就去赋值meetingAcitve，导致找不到
            for (let index = 0; index < this.meetingList.length; index++) {
              const meetRoom = this.meetingList[index]
              if (conferenceId === meetRoom.Conference_Id) {
                this.meetingAcitve = meetRoom
                break
              }
            }
            this.$store.commit('audioMeet/SET_meetDialog', true)
            this.launchMeeting(conferenceId)
          }
          return conferenceId
        } else {
          this.$alert('创建会议失败', '提示', {
            type: 'warning'
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
    // 会议邀请
    inviteMeeting(userId) {
      const user = userId || this.addMeetingMemberList.map(v => {
        return v.userId
      }).join(',')
      if (!user) {
        this.$alert('未选择成员', '提示', {
          type: 'warning'
        })
        return false
      }
      this.$api.common.invite_one_member({
        callee: user,
        roomid: this.meetingAcitve.Conference_Id
      }).then(res => {
        this.dialogVisible = false
      })
    },
    // 拉起会议
    launchMeeting(id, isLaunchOrCall) {
      if (this.meetingConduct) {
        this.$alert('已有会议正在进行,如需继续请先结束上一个会议', '提示', {
          type: 'warning'
        })
        return false
      }
      if (JSON.stringify(this.meetingAcitve) === '{}') {
        this.$alert('请选择会议', '提示', {
          type: 'warning'
        })
        return
      }
      this.meetingConduct = true
      this.meetingAcitve.state = true
      if (!isLaunchOrCall) {
        this.makeCall({ callNumber: id, audioOrVideo: 'audio', isMeeting: true, confirmedFunc: (data) => {
          this.meetingInterObj = setInterval(() => {
            this.getMeetiingMemberState()
          }, 1000)
        } })
      } else {
        // 被拉起的成员显示会控状态
        this.meetingInterObj = setInterval(() => {
          this.getMeetiingMemberState()
        }, 1000)
      }
      // this.meetingInterObj = setInterval(() => {
      //   this.getMeetiingMemberState()
      // }, 1000)
    },
    // 会议控制
    controlMeeting(cmd) {
      if (parseInt(this.memberActive) === parseInt(this.userInfo.userName) && cmd === 'kick') {
        this.$alert('不可将自己踢出会议', '提示', {
          type: 'warning'
        })
        return
      }
      this.$api.common.meetControl({
        cmd: cmd === 'killAll' ? 'kick' : cmd,
        roomid: this.meetingAcitve.Conference_Id,
        data: cmd === 'killAll' ? 'all' : this.memberActiveControlId
      }).then(res => {
        if (cmd === 'killAll') {
          this.meetingTime = '00:00:00'
          this.meetingConduct = false
          this.meetingAcitve.state = false
          this.getMeetingMember(this.meetingAcitve)
          if (this.meetingInterObj) {
            window.clearInterval(this.meetingInterObj)
            this.meetingInterObj = null
          }
          this.$store.commit('audioMeet/SET_createMeetingName', '')
          this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
        }
      })
    },
    // 选中会议成员
    selectMember(data) {
      this.memberActive = data.user_id
      this.memberActiveControlId = data.controlId
      this.memberActiveMuteDetec = data.muteDetec ? data.muteDetec : true
    },
    // 会议邀请按钮点击
    inviteHandle() {
      this.dialogTitle = '邀请成员'
      this.dialogType = 'invite'
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.dialogVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
