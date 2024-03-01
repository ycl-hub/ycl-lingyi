<template>
  <div class="Organize">
    <div class="dialog-con">
      <div class="left dialog-con_left" :class="{is_jstx:dialogTitle==='邀请警员'||tabNav.length<=1}">
        <div v-if="dialogTitle!=='邀请警员'&&tabNav.length>1" class="tabContainer">
          <ul class="tab-cards">
            <li v-for="(item,i) in tabNav" :key="i" :class="{'active': navActive==item.name, 'fz12': item.name==='mcu'}" @click="isShowPanel(item.name)">{{ item.name }}</li>
          </ul>
        </div>
        <el-input v-show="navActive!=='外部联系人'" v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
          <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
        </el-input>
        <div class="treeBox">
          <VueEasyTree
            v-show="navActive=='人员'"
            ref="tree1"
            :data="userTree"
            class="t01_tree t01_checkBox_tree"
            :default-expanded-keys="[String(TONE_voip.cmd.UNIT_ID)]"
            node-key="UnitId"
            :props="unitProps"
            :expand-on-click-node="true"
            :filter-node-method="filterNode"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100% -10px)"
          >
            <span slot-scope="{ data }" class="custom-tree-node">
              <span class="ellipsis" :style="{ color: data.type=='people'? (data.yonghuzxbj == '1' ? '#67C23A':'#999'):'#01d3f9',flex:1,width:'146px'}" :title="data.UnitName">{{ data.UnitName }}</span>
              <span v-if="data.type=='people'&&!(dialogType==='标绘名称-关联资源'&&data.login_pc==='1')">
                <i v-if="data.yonghuid!=userInfo.userName" class="el-icon-plus tree-btn" @click="addMeetingMember(data)" />
              </span>
            </span>
          </VueEasyTree>
          <VueEasyTree
            v-show="navActive=='设备'"
            ref="tree2"
            class="t01_tree t01_checkBox_tree"
            :data="devTree"
            :props="unitProps"
            :expand-on-click-node="true"
            node-key="UnitId"
            :filter-node-method="filterNode"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100%)"
          >
            <span slot-scope="{ data }" class="custom-tree-node">
              <span class="ellipsis" :style="{ color: data.isType||data.countExt ? '#01d3f9':(data.status== '1'?'#32b16c':'#999'),flex:1,width:'146px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.UnitName }}</span>
              <span v-if="data.type=='dev'">
                <i class="el-icon-plus tree-btn" @click="addMeetingMember(data)" />
              </span>
            </span>
          </VueEasyTree>
          <VueEasyTree
            v-show="navActive=='终端'"
            ref="treezd"
            class="t01_tree t01_checkBox_tree"
            :data="zdTree"
            :props="unitProps"
            :expand-on-click-node="true"
            node-key="UnitId"
            :filter-node-method="filterNode"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100%)"
          >
            <span slot-scope="{ data }" class="custom-tree-node">
              <span class="ellipsis" :style="{ color: data.isType ? '#01d3f9':(data.type=='dev'?'#32b16c':'#01d3f9'),flex:1,width:'146px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.UnitName }}</span>
              <span v-if="data.type=='dev'">
                <i class="el-icon-plus tree-btn" @click="addMeetingMember(data)" />
              </span>
            </span>
          </VueEasyTree>
          <VueEasyTree
            v-show="navActive=='mcu'"
            ref="treemcu"
            class="t01_tree t01_checkBox_tree"
            :data="mcuTree"
            :props="unitProps"
            :expand-on-click-node="true"
            node-key="UnitId"
            :filter-node-method="filterNode"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100%)"
          >
            <span slot-scope="{ data }" class="custom-tree-node">
              <span class="ellipsis" :style="{ color: data.isType ? '#01d3f9':(data.type=='dev'?'#32b16c':'#01d3f9'),flex:1,width:'146px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.UnitName }}</span>
              <span v-if="data.type=='dev'">
                <i class="el-icon-plus tree-btn" @click="mcuAddMember(data)" />
              </span>
            </span>
          </VueEasyTree>

          <div v-show="navActive=='外部联系人'" class="addPhone">
            <div class="box"><span style="margin-left: 11.23px;">姓名：</span> <el-input v-model="phoneName" /></div>
            <div class="box">
              <span class="require">电话：</span>
              <el-input v-model="phoneNumber" type="number" />
              <i class="el-icon-plus" @click="addPhone" />
            </div>
          </div>
        </div>
        <!-- 邀请MCU弹窗 -->
        <div class="inner">
          <el-dialog
            v-el-drag-dialog
            :title="'邀请MCU'"
            :visible.sync="dialogVisibleMCU"
            width="500px"
            append-to-body
            custom-class="organizeDialog bevel"
            :show-close="false"
            :close-on-click-modal="false"
          >
            <div class="organizeDialog_content">
              <el-form ref="ruleForm" label-position="left" :model="listQuery" :rules="rules" label-width="80px" class="listQuery" size="mini" @submit.native.prevent>
                <el-form-item label="会议号：" prop="number" class="plottingName">
                  <el-input v-model.trim="listQuery.number" class="filter" type="text" placeholder="请输入会议号" />
                </el-form-item>
                <el-form-item label="会议密码：" prop="pwd" class="plottingName">
                  <el-input v-model.trim="listQuery.pwd" class="filter" placeholder="请输入会议密码" />
                </el-form-item>
              </el-form>
            </div>
            <div slot="footer" class="dialog-footer btnWrap">
              <div class="btn" @click="cancelMCU"><span>取 消</span></div>
              <div class="btn" @click="sureMCU"><span>确 定</span></div>
            </div>
          </el-dialog>
        </div>
      </div>
      <div class="right dialog-con_right" style="width:300px;">
        <el-input v-model.trim="filterTextAddList" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtnAddList">
          <img slot="suffix" :src="search" alt="" class="img" @click="searchBtnAddList">
        </el-input>
        <div class="addMemberListBox">
          <VueEasyTree
            ref="tree3"
            class="t01_tree t01_checkBox_tree"
            :data="addMeetingMemberListClone"
            :props="unitProps"
            :expand-on-click-node="true"
            node-key="userId"
            :filter-node-method="filterNode2"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100%)"
          >
            <span slot-scope="{ data }" class="custom-tree-node">
              <span class="name ellipsis" :style="{ color: data.yonghuzxbj == '1'||data.status||data.devType==='zd'||data.devType==='mcu'||data.devId==='phone'? '#67C23A':'#999',flex:1,width:'146px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.devId=='phone'?data.userName+data.userId:data.userName||data.UnitName }}</span>
              <i class="tree-btn el-icon-minus" @click="munusMeetingMember(data)" />
            </span>
          </VueEasyTree>
          <!-- <ul class="add-member-list">
            <li v-for="(item,i) in addMeetingMemberListClone" :key="item.userId+Math.random()">
              <span class="name" :style="{ color: item.yonghuzxbj == '1' ? '#67C23A':'#999'}">{{ item.userName }}</span>
              <i class="tree-btn el-icon-minus" @click="munusMeetingMember(i, item)" />
            </li>
          </ul> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import { cloneDeep } from 'lodash'
import { mapGetters } from 'vuex'
import axios from 'axios'
import { validatePhoneBol } from '@/utils/validate'
const qs = require('qs')
export default {
  name: 'Organize',
  props: {
    tabNav: {
      required: false,
      type: Array,
      default() {
        return [
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
        ]
      }
    },
    dialogTitle: {
      type: String || Array || Object,
      default: '邀请成员'
    },
    addMeetingMemberList: {
      required: false,
      type: Array,
      default() {
        return []
      }
    },
    dialogType: {
      required: false,
      type: String,
      default: 'add'
    },
    // 语音会议的会议成员
    meetingMemberList: {
      required: false,
      type: Array,
      default() {
        return []
      }
    },
    callType: {
      type: String,
      default: ''
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
    }
  },
  data() {
    return {
      phoneName: '',
      phoneNumber: '',
      search,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      TONE_voip: sessionStorage.get('TONE_voip'),
      unitProps: {
        label: 'UnitName',
        children: 'children',
        isLeaf: 'leaf'
      },
      filterText: '',
      filterTextAddList: '',
      addMeetingMemberListClone: cloneDeep(this.addMeetingMemberList),
      navActive: '人员',
      appId: 'beb7da4ced7c42a085c3c99697f9aa42',
      sr: process.env.NODE_ENV === 'development' ? '/devSr' : `https://${sessionStorage.get('TONE_voip').sphyIP}:${sessionStorage.get('TONE_voip').sphyPort}`,
      zdTree: [],
      mcuTree: [],
      dialogVisibleMCU: false,
      listQuery: {
        number: '',
        pwd: ''
      },
      rules: {
        number: [
          { required: true, message: '请输入会议号', trigger: 'blur' }
        ]
      },
      mcuMember: null
    }
  },
  watch: {
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        // 用户上下线状态 右侧列表更新
        // console.log(json, '添加人员弹窗')
        if (json.MSG_KEY === 'POLICE_STATUS') {
          _this.addMeetingMemberListClone.forEach((item, index) => {
            if (String(item.userId) === String(json.POLICE_ID)) {
              _this.$set(_this.addMeetingMemberListClone[index], 'yonghuzxbj', Number(json.STATUS))
            }
          })
        }
        if (json.MSG_KEY === 'DEV_ONLINE_STATUS') {
          _this.addMeetingMemberListClone.forEach((item, index) => {
            if (String(item.userId) === String(json.GPSID)) {
              _this.$set(_this.addMeetingMemberListClone[index], 'yonghuzxbj', Number(json.STATUS))
              _this.$set(_this.addMeetingMemberListClone[index], 'STATUS', Number(json.STATUS))
            }
          })
        }
      },
      immediate: true
    },
    filterText: {
      handler: function(val) {
        if (!val && this.navActive === '人员') {
          !val ? this.$refs.tree1.filter(val) : ''
        }
        if (!val && this.navActive === '设备') {
          !val ? this.$refs.tree2.filter(val) : ''
        }
        if (!val && this.navActive === '终端') {
          !val ? this.$refs.treezd.filter(val) : ''
        }
        if (!val && this.navActive === 'mcu') {
          !val ? this.$refs.treemcu.filter(val) : ''
        }
        if (!val && this.navActive === '外部联系人') {
          // 外部联系人
        }
      }
    },
    filterTextAddList: {
      handler: function(val) {
        !val ? this.$refs.tree3.filter(val) : ''
      }
    },
    addMeetingMemberList: {
      handler: function(val) {
        if (val.length === 0) {
          this.addMeetingMemberListClone = []
        } else {
          this.addMeetingMemberListClone = cloneDeep(val)
        }
      },
      immediate: true,
      deep: true
    },
    // 视频会商
    callType: {
      handler: function(val) {
        if (val === 'videoMeet') {
          // 登录随锐账号
          axios.post(`${this.sr}/api/v3/user/login`, qs.stringify({
            appId: this.appId,
            account: this.TONE_voip.cmd.POLICE_ID,
            pwd: this.$md5(this.TONE_voip.cmd.POLICE_ID),
            type: '1'
          })).then((res) => {
            // 获取终端
            axios.post(`${this.sr}/api/v3/terminal/list`, qs.stringify({
              appId: this.appId,
              token: res.data.data.token,
              secretKey: this.appId
            })).then((response) => {
              if (response.data.terminals.length > 0) {
                const zd = []
                const mcu = []

                response.data.terminals.forEach((item) => {
                  if (item.type === 3 && item.terminalType === 1) {
                    mcu.push(item)
                  } else {
                    zd.push(item)
                  }
                })
                const zdTree = zd.map((val) => {
                  return {
                    id: val.id,
                    name: val.name,
                    UnitName: val.name,
                    UnitId: val.id,
                    label: val.name,
                    type: 'dev',
                    leaf: true,
                    devType: 'zd'
                  }
                })
                const mcuTree = mcu.map((val) => {
                  return {
                    id: val.id,
                    name: val.name,
                    UnitName: val.name,
                    UnitId: val.id,
                    label: val.name,
                    type: 'dev',
                    leaf: true,
                    devType: 'mcu'
                  }
                })
                this.zdTree = zdTree
                this.mcuTree = mcuTree
                // console.log(zdTree, 124)
                // console.log(mcuTree, 456)
              }
            }).catch(function(error) {
              console.log(error)
            })
          }).catch(function(error) {
            console.log(error)
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapGetters([
      'userTree',
      'devTree',
      'checkResourcelist',
      'mqResponseData'
    ])
  },
  created() {
    // axios.post(`${this.sr}/api/v3/user/register`, qs.stringify({
    //   appId: this.appId,
    //   secretKey: '6b97a7ea798243d3b4c72b862fd4d9c8',
    //   account: 70000001,
    //   nickname: '测试密码1234',
    //   pwd: this.$md5('1234'),
    //   corporationCode: '1728'
    // })).then((res) => {
    //   console.log(res, 123)
    // }).catch(function(error) {
    //   console.log(error)
    // })
  },
  methods: {
    mcuAddMember(data) {
      this.dialogVisibleMCU = true
      this.mcuMember = data
    },
    cancelMCU() {
      this.$refs['ruleForm'].resetFields()
      this.dialogVisibleMCU = false
      this.mcuMember = null
    },
    sureMCU() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          console.log(this.listQuery)
          this.mcuMember.number = this.listQuery.number
          this.mcuMember.pwd = this.listQuery.pwd
          this.addMeetingMember(this.mcuMember)
          this.cancelMCU()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    //
    filterNode2(value, data) {
      if (!value) return true
      return data.userName.indexOf(value) !== -1
    },
    filterNode(value, data) {
      if (!value) return true
      return data.UnitName.indexOf(value) !== -1
    },
    addPhone() {
      const find = this.addMeetingMemberList.find(item => item.userId === this.phoneNumber)
      if (this.isVideoGroup) {
        const find = this.videoDev.find(item => String(item.id) === String(this.phoneNumber))
        if (find) {
          this.$alert('该用户已在群呼列表中', '提示', {
            type: 'warning'
          })
          return
        }
      }
      if (find) {
        this.$alert('该用户已添加', '提示', {
          type: 'warning'
        })
        return
      }
      if (!validatePhoneBol(this.phoneNumber)) {
        this.$alert('请输入正确的手机号格式', '提示', {
          type: 'warning'
        })
        return
      }
      const obj = {
        userId: this.phoneNumber,
        userName: this.phoneName,
        yonghuzxbj: '1',
        power: '1,2',
        devId: 'phone'
      }
      this.addMeetingMemberList.push(obj)
      this.addMeetingMemberListClone.push(obj)
      const checkArr = this.checkResourcelist
      checkArr.push(obj)
      this.$store.commit('app/SET_checkResourceList', checkArr)
      this.phoneNumber = ''
      this.phoneName = ''
    },
    // 添加会议成员
    addMeetingMember(data) {
      // console.log(data, '要添加的成员信息')
      if (this.callType === 'audio' && 'power' in data && data.power.search('1') === -1) {
        this.$message.warning('该设备不支持语音通话')
        return
      }
      if (this.callType === 'video' && 'power' in data && data.power.search('2') === -1) {
        this.$message.warning('该设备不支持视频')
        return
      }
      if (this.isVideoGroup) {
        const userId = data.yonghuid || data.devId || data.UnitId
        const find = this.videoDev.find(item => String(item.id) === String(userId))
        if (find) {
          this.$alert('该用户已在群呼列表中', '提示', {
            type: 'warning'
          })
          return
        }
      }
      var obj = {
        userId: data.yonghuid || data.devId || data.UnitId,
        id: data.yonghuid || data.devId || data.UnitId,
        userName: data.UnitName,
        yonghuzxbj: 'devId' in data ? data.status : data.yonghuzxbj,
        POLICE_ID: data.yonghuid || data.devId || data.UnitId,
        devType: data.devType,
        number: data.number || '',
        pwd: data.pwd || '',
        hsUser: data.hsUser || '',
        mobile: data.mobile || ''
      }
      if (data.yonghuid) {
        obj.userId = data.yonghuid
      }
      if (data.devId) {
        obj.devId = data.devId
      }
      if (data.type === 'dev') {
        obj.devId = data.UnitId || data.devId
      }
      if (!('power' in data)) {
        obj.power = '1,2'
      } else {
        obj.power = data.power
      }
      // console.log(this.addMeetingMemberList, obj)
      for (let i = 0; i < this.addMeetingMemberList.length; i++) {
        if ('userId' in this.addMeetingMemberList[i] && String(this.addMeetingMemberList[i].userId) === String(obj.userId)) {
          this.$alert('该用户已添加', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      if (this.dialogType === 'invite') {
        console.log(this.meetingMemberList, obj.userId, '邀请人信息')
        for (let i = 0; i < this.meetingMemberList.length; i++) {
          if (String(this.meetingMemberList[i].user_id) === String(obj.userId)) {
            this.$alert('该用户已在会议组，请单独进行追呼', '提示', {
              type: 'warning'
            })
            return false
          }
        }
      }
      this.addMeetingMemberList.push(obj)
      this.addMeetingMemberListClone.push(obj)
      const checkArr = this.checkResourcelist
      checkArr.push(obj)
      this.$store.commit('app/SET_checkResourceList', checkArr)
    },
    // 删除添加会议成员
    munusMeetingMember(item, index) {
      for (let index = 0; index < this.addMeetingMemberList.length; index++) {
        const element = this.addMeetingMemberList[index]
        if (String(element.userId) === String(item.userId)) {
          this.addMeetingMemberList.splice(index, 1)
          break
        }
      }
      for (let index = 0; index < this.addMeetingMemberListClone.length; index++) {
        const element = this.addMeetingMemberListClone[index]
        if (String(element.userId) === String(item.userId)) {
          this.addMeetingMemberListClone.splice(index, 1)
          break
        }
      }
      for (let index = 0; index < this.checkResourcelist.length; index++) {
        const element = this.checkResourcelist[index]
        if (String(element.userId) === String(item.userId) || String(element.id) === String(item.userId)) {
          this.checkResourcelist.splice(index, 1)
          break
        }
      }
    },
    // 关键词搜索
    searchBtn() {
      if (this.navActive === '人员') {
        this.$refs.tree1.filter(this.filterText)
      }
      if (this.navActive === '设备') {
        this.$refs.tree2.filter(this.filterText)
      }
      if (this.navActive === '终端') {
        this.$refs.treezd.filter(this.filterText)
      }
      if (this.navActive === 'mcu') {
        this.$refs.treemcu.filter(this.filterText)
      }
      if (this.navActive === '外部联系人') {
        // 外部联系人
      }
    },
    // 已经添加的人员关键词搜索
    searchBtnAddList() {
      // 模糊搜索
      this.$refs.tree3.filter(this.filterTextAddList)
    },
    // 显示的模块
    isShowPanel(val) {
      this.navActive = val
      this.filterText = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.Organize{
  ::v-deep .addMemberListeBox{
    ::v-deep .tree-btn {
      cursor: pointer;
      width: 18px;
      height: 18px;
      line-height: 21px !important;
      font-size: 14px;
      text-align: center;
      display: inline-block;
      color: #999;
      margin-right: 10px;
      border-radius: 50%;
      background: rgba(0,0,0,.3);
      color: #FFF !important;
    }
  }
  .tab-cards {
    .fz12 {
      font-size: 12px;
    }
  }
}
::v-deep .listQuery {
  .el-form-item {
    margin-bottom: 16px;
    .el-form-item__label {
      color: #00d8ff;
      font-size: 12px;
      font-weight: 500 !important;
      padding-right: 0px;
    }
    .el-form-item__content {
      p {
        font-size: 12px;
        width: 100%;
      }
    }
  }
  .filter {
    width: 100%;
    .el-input__inner {
      border: 1px solid #01cfff;
      background-color: rgba(0, 85, 128, 0.6);
      color: #fff;
      font-size: 12px;
      padding: 0 7px;
      &::-webkit-input-placeholder {
        font-size: 12px;
      }
      &:-moz-placeholder {
        font-size: 12px;
      }
      &::-moz-placeholder {
        font-size: 12px;
      }
      &:-ms-input-placeholder {
        font-size: 12px;
      }
    }
  }
}
</style>
