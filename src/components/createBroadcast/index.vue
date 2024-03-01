<template>
  <el-dialog
    v-el-drag-dialog
    v-loading="loading"
    title="新建广播"
    :width="'980px'"
    append-to-body
    :visible.sync="isShow"
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
      <OrganizePer v-if="dialogType === 'add'" :add-meeting-member-list="addMeetingMemberList" :dialog-type="dialogType" />
    </div>
    <div slot="footer" class="dialog-footer btnWrap">
      <div class="btn" @click="createMeeting('save')"><span>保存</span></div>
      <div class="btn" @click="createMeeting('saveInit')"><span>保存并发起</span></div>
      <div class="btn" @click="$emit('closeVisible')"><span>取 消</span></div>
    </div>
  </el-dialog>
</template>
<script>
import { sessionStorage } from '@/utils/storage'
import OrganizePer from '@/components/organizePer'
import { api } from '@/api/env'
import { mapGetters } from 'vuex'
export default {
  name: 'Broadcast',
  components: {
    OrganizePer
  },
  props: {
    dialogVisible: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      loading: false,
      isShow: false,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      dialogType: 'add', // 弹框类别add为添加,invite为邀请,distribute为分发
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
      fileList: [],
      dataFile: {
        FileName: ''
      }
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
  methods: {
    upImg() {
      return `${api}/androidApi/voip/upLoadfiles.action`
    },
    // 创建会议
    async createMeeting(v) {
      try {
        const res = await this.$api.common.getMeetingList({
          userId: this.userInfo.userName,
          type: 2,
          userPwd: this.$md5(this.userInfo.userPwd),
          broadcast: '1'
        })

        const meetingList = res.data
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
            for (var i = 0; i < meetingList.length; i++) {
              if (meetingList[i].Conference_name === this.listQuery.conferenceName) {
                this.$alert('该广播名称已存在', '提示', {
                  type: 'warning'
                })
                return false
              }
            }
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
            this.loading = true
            this.$api.common.createBroadcast({
              userId: this.userInfo.userName,
              userPwd: this.$md5(this.userInfo.userPwd),
              userType: '2',
              meetingMember: meetingMember + ',' + this.userInfo.userName,
              data: JSON.stringify(data)
            }).then((res) => {
              if (res.data.result === 'success') {
                if (v === 'save') {
                // 跳转到广播界面
                  this.$root.$emit('broadcast', 'save')
                } else {
                // 创建广播并发起
                  this.$root.$emit('broadcast', 'saveInit')
                }
                this.$emit('closeVisible')
              // 跳转到广播页面
              } else {
                this.$emit('closeVisible')
                this.$message({
                  type: 'error',
                  message: res.data.error || '创建会议失败'
                })
              }
              this.loading = false
            }).catch((error) => {
              this.loading = false
              console.log(error)
            }).finally(() => {
              this.loading = false
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } catch (error) {
        this.loading = false
        console.log(error)
      }
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
    }

  }
}

</script>
