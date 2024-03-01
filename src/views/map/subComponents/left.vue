<template>
  <div v-move="{parent: '.posi-panel', childrenHeader: '.el-tabs--top'}" class="left">
    <!--===漂浮模块==-->
    <div class="posi-panel" :class="{rightHide:isleft}">
      <div class="arrow">
        <img v-if="isOpen" :src="isleft?leftArrow:rightArrow" @click="arrowClick">
      </div>
      <div class="noArrow bevel">
        <div class="leftWrap">
          <el-tabs v-model="isAll">
            <el-tab-pane label="全部" name="全部" />
            <el-tab-pane label="在线资源" name="在线资源" />
          </el-tabs>
          <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
            <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
          </el-input>
          <div class="tab-con">
            <div :class="['tab-con-item',navActive=='person'?'active':'']">
              <!-- <el-scrollbar class="height-full scrollbar" :native="false"> -->
              <VueEasyTree
                ref="tree1"
                class="t01_checkBox_tree"
                :data="userTree"
                :default-expanded-keys="[String(TONE_voip.cmd.UNIT_ID)]"
                node-key="UnitId"
                :props="unitProps"
                show-checkbox
                :filter-node-method="filterNode"
                :icon-class="'el-icon-arrow-right'"
                height="calc(100%)"
              >
                <span slot-scope="{ data }" class="custom-tree-node">
                  <span class="ellipsis" :style="{ color: data.type=='people'? (data.yonghuzxbj == '1' ? '#32b16c':'#999'):'#01d3f9',flex:1,width:'146px',wordBreak: 'break-word',whiteSpace:'initial'}" :title="data.UnitName+onLine(data)" @click="$root.$emit('getTreeDevInfo', data)"><i :class="data.type== 'people'? 'el-icon-s-custom' :''" />{{ data.UnitName+onLine(data) }}</span>
                  <span v-if="data.type=='people'&&data.yonghuzxbj == '1'">
                    <img :src="phone" alt="" class="tree-btn" @click="makeCall({callNumber:data.yonghuid,audioOrVideo:'audio'})">
                    <img :src="camera" alt="" class="tree-btn" @click="makeCall({callNumber:data.yonghuid,audioOrVideo:'video'})">
                  </span>
                  <img v-if="validatePhoneBol(data.mobile)" style="border-radius: 0;background-color: transparent;transform: scale(0.9);" :src="msg" alt="" class="tree-btn" @click="sendMessage(data)">
                </span>
              </VueEasyTree>
              <!-- </el-scrollbar> -->
            </div>
            <div :class="['tab-con-item dev-type-list',navActive=='txzy'?'active':'']">
              <!-- <el-scrollbar class="height-full scrollbar" :native="false"> -->
              <VueEasyTree
                ref="tree2"
                class="t01_checkBox_tree"
                :data="devTree"
                node-key="UnitId"
                :accordion="true"
                :props="unitProps"
                show-checkbox
                height="calc(100%)"
                :filter-node-method="filterNode"
                :icon-class="'el-icon-arrow-right'"
              >
                <span slot-scope="{ data }" class="custom-tree-node">
                  <span class="ellipsis" :style="{ color: data.isType||data.countExt ? '#01d3f9':(data.status== '1'?'#32b16c':'#999'),flex:1,width:'146px'}" :title="data.UnitName+onLine(data, 'children', 'countExt')" @click="$root.$emit('getTreeDevInfo', data)"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.UnitName+onLine( data, 'children', 'countExt') }}</span>
                  <span v-if="data.type=='dev'&&data.status== '1'">
                    <img v-if="data.power&&data.power.search('1') !== -1" :src="phone" alt="" class="tree-btn" @click="makeCall({callNumber:data.devId, audioOrVideo:'audio'})">
                    <img v-if="data.power&&data.power.search('2') !== -1" :src="camera" alt="" class="tree-btn" @click="makeCall({callNumber:data.devId, audioOrVideo:'video'})">
                  </span>
                  <img v-if="validatePhoneBol(data.id)" style="border-radius: 0;background-color: transparent;transform: scale(0.9);" :src="msg" alt="" class="tree-btn" @click="sendMessage(data)">
                </span>
              </VueEasyTree>
              <!-- </el-scrollbar> -->
            </div>
            <div :class="['tab-con-item met-list jqdj',navActive=='jqdj'?'active':'']">
              <div class="duijiang-c clearfix">
                <div v-for="(item, i) in intercomListFilter" :key="i" class="duijiang-item fl" :style="{background: intercomStatusBgColor(item.intercomStatus)}" @click="intercom(item)">
                  <div class="jianting fl">
                    <!-- <img :src="jt_b" alt=""> -->
                    <!-- <img v-if="get(activeIntercom, 'intercomId', '' ) === item.intercomId" :src="jt" alt=""> -->
                    <img :src="item.isJt ? jt : jt_b" alt="" @click.stop="jtIntercom(item)">
                    <img v-if="get(activeIntercom, 'intercomId', '' ) === item.intercomId" :src="xz" alt="">
                  </div>
                  <div class="con fl">
                    <p class="name">{{ item.intercomName }}</p>
                    <p class="talk" :style="{color: intercomStatusColor(item.intercomStatus)}">
                      {{ item.takeUser ? getName(userListInfo, item.takeUser) : item.takeUser }}{{ intercomStatusFilter(item.intercomStatus) }}
                      <!-- {{ item.takeUser }}{{ intercomStatusFilter(item.intercomStatus) }} -->
                    </p>
                  </div>
                  <div class="statusWrap">
                    <div class="status" :style="{background: intercomStatusColor(item.intercomStatus)}" />
                  </div>
                </div>
                <div v-if="intercomListFilter.length===0" style="color: #909399;font-size: 14px;text-align: center;height: 60px;line-height: 60px;">暂无数据</div>
              </div>
            </div>
            <div :class="['tab-con-item met-list',navActive=='selectSource'?'active':'']">
              <div class="duijiang-c clearfix">
                <!-- <ul class="devlist">
                  <li v-for="(item, i) in devlist" :key="i" @click="getDevInfo(item)">
                    {{ item.name || item.UserName }}
                  </li>
                </ul> -->
                <VueEasyTree
                  ref="tree3"
                  class="t01_checkBox_tree"
                  node-key="id"
                  :data="devlist"
                  :props="devlistUnitProps"
                  show-checkbox
                  :filter-node-method="filterNodeResource"
                  :icon-class="'el-icon-arrow-right'"
                  height="calc(100%)"
                >
                  <span slot-scope="{ data }" class="custom-tree-node">
                    <span class="ellipsis" :style="{ color: '#32b16c',flex:1,width:'146px'}" :title="data.name||data.yonghuname" @click="getDevInfo(data)">{{ data.name|| data.yonghuname||data.UnitName }}</span>
                  </span>
                </VueEasyTree>
              </div>
            </div>
            <div :class="['tab-con-item met-list cyqz',navActive=='cyqz'?'active':'']">
              <div class="duijiang-c clearfix">
                <VueEasyTree
                  ref="tree4"
                  class="t01_checkBox_tree commonGroup"
                  :data="commonDataCopy"
                  :props="commonProps"
                  show-checkbox
                  :default-expanded-keys="defaultExpandIds"
                  :filter-node-method="filterNode2"
                  :expand-on-click-node="true"
                  :icon-class="'el-icon-arrow-right'"
                  node-key="ID"
                  height="calc(100%)"
                  @node-expand="handleNodeExpand"
                  @node-collapse="handleNodeCollapse"
                  @check="treeCheck"
                >
                  <span slot-scope="{ node, data }" class="custom-tree-node">
                    <span :style="{ color: data.GROUP_NAME ? '#01d3f9':getZxbj(data),width:'146px',overflow:'hidden',textOverflow:'ellipsis',flex:1}" :title="(data.GROUP_NAME||data.NAME)+(data.GROUP_NAME?onLine(data,'DEVS'):'')"><i class="labelName ellipsis" />{{ data.TYPE=='2'?data.NAME+data.CALL_NO: (data.GROUP_NAME||data.NAME) }}{{ data.GROUP_NAME?onLine(data,'DEVS'):'' }}</span>
                    <span v-if="data.GROUP_NAME" class="listBtn">
                      <img style="width: 20px;height: 20px;" :src="editPng" title="编辑" alt="" @click="edit(node, data,$event)">
                      <img style="width: 20px;height: 20px;" :src="del" title="删除" alt="" @click="remove(node, data,$event)">
                    </span>
                  </span>
                </VueEasyTree>
              </div>
            </div>
            <div v-if="navActive !== 'jqdj'" class="btnWrap">
              <div v-if="navActive==='cyqz'" class="btn" @click="addGroup()">
                <span class="">新建</span>
              </div>
              <div v-has="'yyhy'" class="btn" @click="audioMeet()">
                <span class="">语音会议</span>
              </div>
              <div v-has="'sphs'" class="btn" @click="videoMeetHandle()">
                <span class="">视频会商</span>
              </div>
              <div v-has="'jsxx'" class="btn" @click="IMChange()">
                <span class="">即时通信</span>
              </div>
              <div class="btn" @click="videoCall()">
                <span class="">视频群呼</span>
              </div>
              <div v-has="'gb'" class="btn" @click="broadcast()">
                <span class="">广播</span>
              </div>
              <div class="btn" @click="sendMsgGroup()">
                <span class="">短信群发</span>
              </div>
            </div>
            <div v-if="navActive === 'jqdj'" class="duijiang-btn">
              <div class="jt fl">
                <img :src="jtbtn" alt="" @click="jtIntercomAll()">
              </div>
              <div class="ptt fl" @click="pttBtn()">
                {{ filterIntercomBtn() }}
              </div>
            </div>
          </div>
        </div>
        <div class="rightWrap">
          <div class="tabContainer">
            <ul class="tab-cards">
              <li v-for="(item,i) in tabNav" :key="i" :class="navActive==item.id?'active':''" @click="isShowPanel(item.id)">
                <span>{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isleft" class="tabTitle" @click="arrowClick"><span>{{ tabTitle }}</span></div>
    <!-- 创建常用群组 -->
    <CreateDialog v-if="dialogVisible" :dialog-type="'cyqz'" :dialog-title="dialogTitle" :dialog-visible="dialogVisible" @closeVisible="dialogVisible = false" @sureClick="sureClickHandle" />
    <!-- 创建广播 -->
    <CreateBroadcast v-if="dialogVisibleBroadcast" :dialog-visible="dialogVisibleBroadcast" @closeVisible="dialogVisibleBroadcast = false" />
    <!-- 创建即时消息 -->
    <CreateImGroup v-if="dialogVisibleIM" :dialog-visible="dialogVisibleIM" @closeVisible="dialogVisibleIM = false" />
    <!-- 短信弹窗 -->
    <msgPopup v-show="dialogVisibleMSG" :list-query="listQuery" :dialog-title="msgTitle" :dialog-visible="dialogVisibleMSG" :send-group="sendGroup" @closeVisible="dialogVisibleMSG = false" />
  </div>
</template>
<script>
import phone from '@/assets/images/equipment/phone.png'
import camera from '@/assets/images/equipment/camera.png'
import search from '@/assets/images/equipment/search.png'
import sip from '@/components/mixins/sip.js'
import { sessionStorage } from '@/utils/storage'
import jt from '@/assets/images/equipment/jt.png'
import jt_b from '@/assets/images/equipment/jt_b.png'
import xz from '@/assets/images/equipment/xz.png'
import jtbtn from '@/assets/images/equipment/jtbtn.png'
import xuanzhong from '@/assets/images/equipment/xuanzhong.png'
import renyuan from '@/assets/images/equipment/renyuan.png'
import leftArrow from '@/assets/images/leftArrow.png'
import rightArrow from '@/assets/images/rightArrow.png'
import { mapGetters } from 'vuex'
import { cloneDeep, get, throttle } from 'lodash'
import { queryId, getName } from '@/utils'
import CreateDialog from '@/components/createDialog'
import del from '@/assets/images/videoScheduling/remove.png'
import editPng from '@/assets/images/videoScheduling/edit.png'
import CreateBroadcast from '@/components/createBroadcast'
import CreateImGroup from '@/components/createImGroup'
import msg from '@/assets/images/msg.png'
import { validatePhoneBol } from '@/utils/validate'
export default {
  name: 'Left',
  components: {
    CreateDialog, CreateBroadcast, CreateImGroup,
    msgPopup: () => import('./MessagePopup.vue')
  },
  mixins: [sip],
  data() {
    return { del, editPng,
      defaultExpandIds: [],
      dialogVisibleIM: false,
      isAll: '全部',
      tabTitle: '资源',
      isOpen: true,
      phone: phone,
      camera: camera, jt, jt_b, xz, jtbtn, xuanzhong, renyuan, leftArrow, rightArrow, get, msg,
      navActive: 'person',
      tabNav: [
        {
          id: 'person',
          name: '人员',
          isActive: true
        }, {
          id: 'txzy',
          name: '通信资源',
          isActive: false
        },
        {
          id: 'jqdj',
          name: '集群对讲',
          isActive: false
        }, {
          id: 'selectSource',
          name: '已选资源',
          isActive: false
        }
      ],
      unitProps: {
        label: 'UnitName',
        children: 'children'
      },
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      filterText: '',
      search: search,
      isleft: true,
      intercomList: [],
      intercomListFilter: [],
      activeIntercom: null,
      devlistUnitProps: {
        label: 'name',
        children: 'children'
      },
      jtIntercomAllFlag: false,
      // 只接听一路，谁先说话接听谁的
      jtAgreeFlag: false,
      dialogVisible: false,
      dialogTitle: '',
      commonProps: {
        label(v) {
          // console.log(v, 'xxx')
          return v.NAME || v.GROUP_NAME
        },
        children: 'DEVS',
        isLeaf: 'CALL_NO'
      },
      editCommonData: {},
      commonData: [],
      commonDataCopy: [],
      dialogVisibleBroadcast: false,
      dialogVisibleMSG: false, // 短信弹窗显隐
      listQuery: {
        msgDetail: '',
        addressee: '' // 短信要发送哪些人
      },
      msgTitle: '', // 群发还是单发
      sendGroup: [],
      validatePhoneBol
    }
  },
  computed: {
    mapCallList: function() {
      // console.log(this.callList, 'left')
      // const aaa = this.callList.filter((item) => {
      //   return item.belong === 'map'
      // })
      // return aaa
      return this.callList
    },
    ...mapGetters([
      'userListInfo',
      'mqResponseData',
      'settings',
      'listenCallList',
      'createMeetingName',
      'checkResourcelist',
      'addMeetingMemberList',
      'devlist',
      'userTree',
      'devTree'
    ])
  },
  watch: {
    isAll: {
      handler(val) {
        // console.log('单选哪个', val)
        const { navActive, filterText } = this
        if (navActive === 'person') {
          this.$refs.tree1.filter(filterText)
        } else if (navActive === 'txzy') {
          this.$refs.tree2.filter(filterText)
        } else if (navActive === 'selectSource') {
          this.$refs.tree3.filter(filterText)
        } if (navActive === 'cyqz') {
          this.$refs.tree4.filter(filterText)
        }
      }
    },
    'devlist': {
      handler: function(val) {
        // console.log(val, 'Leftdevlist')
      }
    },
    filterText: {
      handler: function(val) {
        if (!val && this.navActive === 'person') {
          this.$refs.tree1.filter(val)
        }
        if (!val && this.navActive === 'txzy') {
          this.$refs.tree2.filter(val)
        }
        if (!val && this.navActive === 'cyqz') {
          this.$refs.tree4.filter(val)
        }
        if (!val && this.navActive === 'jqdj') {
          this.intercomListFilter = this.intercomList.filter((item) => {
            return item.intercomName.search(val) !== -1
          })
        }
        if (!val && this.navActive === 'selectSource') {
          this.$refs.tree3.filter(val)
        }
      }
    },
    mqResponseData: {
      handler: function(val) {
        // console.log(val, 'mqResponseData-intercom')
        if (!val) return false
        const json = JSON.parse(val)
        if (json.MSG_KEY !== 'REPORT_LOCATION') {
          // console.log(val, 'mqResponseData-left')
        }
        // 对讲组状态改变
        if (json.MSG_KEY === 'intercomStatus') {
          // if (this.activeIntercom && this.activeIntercom.intercomId === json.intercomId) {
          //   this.activeIntercom.intercomStatus = json.STATUS
          //   this.intercomList = this.intercomListFilter
          // } else {
          //   // 由于全局加了不允许呼叫重复号码，这里对讲组呼叫不同，失败回调太久没有清除listenCallList里面的对讲组，下次呼叫就没法通过监听listenCallList来控制对讲组的接听，这里不论对讲组是否接听，只要状态为0，则提前清除listenCallList里面的对讲组
          //   for (var i = 0; i < this.listenCallList.length; i++) {
          //     if (this.listenCallList[i].from === json.intercomId) {
          //       this.listenCallList.splice(i, 1)
          //       break
          //     }
          //   }
          // }
          this.intercomListFilter.forEach((item) => {
            if (item.intercomId === json.intercomId) {
              item.intercomStatus = json.STATUS
            }
          })
          this.intercomList = this.intercomListFilter
        }
        // 获取话权/释放话权
        if (json.MSG_KEY === 'intercomUserStatus' && json.intercomId) {
          this.intercomListFilter.forEach((item) => {
            if (item.intercomId === json.intercomId && json.STATUS === 2) {
              item.intercomStatus = 2
              item.takeUser = json.user
              // 如果是监听状态，应该被接听
              if (item.isJt && !this.jtAgreeFlag) {
                console.log(this.listenCallList, 888)
                // 如果session中有这个对讲组，正常接听
                for (let index = 0; index < this.listenCallList.length; index++) {
                  const ele = this.listenCallList[index]
                  if (json.intercomId === ele.from) {
                    const ev = {
                      target: {
                        dataset: {
                          type: ele.type,
                          sessionid: ele.sessionId
                        },
                        style: {
                          display: ''
                        }
                      }
                    }
                    this.agree(ev)
                    this.jtAgreeFlag = true
                  }
                }
              }
            }
            if (item.intercomId === json.intercomId && json.STATUS === 1 && json.MSG === '释放话权') {
              item.intercomStatus = 1
              item.takeUser = ''
            }
            if (item.isJt && item.intercomId === json.intercomId && json.STATUS === 1 && json.MSG === '后台强制释放话权') {
              item.intercomStatus = 1
              item.takeUser = ''
              this.$message({
                message: '说话已经超时，已释放话权，请重新发起讲话！',
                type: 'warning'
              })
            }
            if (item.intercomId === json.intercomId && json.STATUS === 0) {
              item.intercomStatus = 1
              item.takeUser = ''
              this.jtAgreeFlag = false
            }
          })
          this.intercomList = this.intercomListFilter
        }
        // 后台在已有对讲组添加改人员
        if (json.MSG_KEY === 'intercom' && json.MSG === 'addUser') {
          // 新增对讲组只推送了对讲组的id，所以先去请求所有的对讲组，再把新增的id对比出来，把当前对讲组的所有信息push进去
          this.$api.intercom.getIntercomList({
            userId: this.userInfo.userName
          }).then(res => {
            for (let index = 0; index < res.data.data.length; index++) {
              const element = res.data.data[index]
              if (element.intercomId === json.intercomId) {
                element.isJt = false
                this.intercomListFilter.push(element)
                this.intercomList = this.intercomListFilter
                break
              }
            }
          })
        }
        if (json.MSG_KEY === 'intercom' && json.MSG === 'deleteUser') {
          // manger删除对讲组人员
          this.intercomListFilter.forEach((item, i) => {
            if (item.intercomId === json.intercomId) {
              this.intercomListFilter.splice(i, 1)
            }
          })
          this.intercomList = this.intercomListFilter
        }
        if (json.MSG_KEY === 'intercom' && json.MSG === 'delete') {
          // manger删除对讲组
          this.intercomListFilter.forEach((item, i) => {
            if (item.intercomId === json.intercomId) {
              this.intercomListFilter.splice(i, 1)
            }
          })
          this.intercomList = this.intercomListFilter
        }
        if (json.MSG_KEY === 'intercom' && json.MSG === 'update') {
          // manger修改对讲组名称
          this.$api.intercom.getIntercomList({
            userId: this.userInfo.userName
          }).then(res => {
            for (let index = 0; index < res.data.data.length; index++) {
              const element = res.data.data[index]
              if (element.intercomId === json.intercomId) {
                for (let j = 0; j < this.intercomListFilter.length; j++) {
                  const e = this.intercomListFilter[j]
                  if (e.intercomId === json.intercomId) {
                    e.intercomName = element.intercomName
                    break
                  }
                }
                this.intercomList = this.intercomListFilter
                break
              }
            }
          })
        }
        const _this = this
        const { navActive } = _this
        if (json.MSG_KEY === 'POLICE_STATUS' || json.MSG_KEY === 'DEV_ONLINE_STATUS') {
          _this.commonData.forEach((item, index) => {
            if (!Array.isArray(item?.DEVS)) return
            const findIndex = item?.DEVS?.findIndex(obj => obj.CALL_NO === json.POLICE_ID || obj.CALL_NO === json.GPSID)
            if (findIndex !== -1) {
              if (Number(json.STATUS)) {
                item.zxCount++
              } else {
                item.zxCount--
              }
              _this.$set(item?.DEVS[findIndex], 'yonghuzxbj', Number(json.STATUS))
              _this.$set(item?.DEVS[findIndex], 'zxCount', item.zxCount)
            }
          })
          _this.commonDataCopy = _this.commonData.filter(item => item)
          _this.$nextTick(_ => {
            if (navActive === 'person') {
              this.$refs.tree1.filter(this.filterText)
            } else if (navActive === 'txzy') {
              this.$refs.tree2.filter(this.filterText)
            } else if (navActive === 'selectSource') {
              this.$refs.tree3.filter(this.filterText)
            } if (navActive === 'cyqz') {
              this.$refs.tree4.filter(this.filterText)
            }
          })
        }
      },
      immediate: true
    },
    'settings.FEATURE_SETTING': {
      immediate: true,
      handler(val) {
        let arr = queryId('resource', val)
        this.tabTitle = arr.text
        arr = arr.children[0].children
        this.tabNav = []
        arr.forEach((item) => {
          this.tabNav.push({
            id: item.id,
            name: item.text,
            isActive: false
          })
        })
        this.tabNav.push({
          id: 'cyqz',
          name: '常用群组',
          isActive: false
        })
        this.tabNav.push({
          id: 'selectSource',
          name: '已选资源',
          isActive: false
        })
      },
      deep: true
    },
    userTree: {
      handler(val, oldVal) {
        if (val && this?.devTree?.length > 0 && this.commonDataCopy.length === 0) {
          // 等获取到人员和设备列表 再去查询常用群组 否则第一次查询出来的状态不对
          this.queryCommonByUnit()
        }
      },
      immediate: true
    },
    devTree: {
      handler(val, oldVal) {
        if (val && this?.userTree?.length > 0 && this.commonDataCopy.length === 0) {
          // 等获取到人员和设备列表 再去查询常用群组 否则第一次查询出来的状态不对
          this.queryCommonByUnit()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getIntercomList()
  },
  mounted() {
    this.loadResource()
    // 仅供map>subComponents>equipment组件使用
    this.$root.$on('isShowPanel', () => {
      this.isShowPanel('selectSource')
    })
    this.$root.$on('sendMessage', (data, noLeft) => {
      this.sendMessage(data, noLeft)
    })
    this.$root.$on('jtIntercomAll', (force) => {
      this.jtIntercomAll(force)
    })
  },
  activated() {
    this.mapCallList.forEach((item) => {
      this.setupRemoteMedia(item.session, item.sessionId)
    })
    this.$nextTick(_ => {
      this.loadResource()
    })
  },
  deactivated() {
  },
  beforeDestroy() {
    this.commonDataCopy = []
    this.$root.$off('isShowPanel')
    this.$root.$off('sendMessage')
    this.$root.$off('jtIntercomAll')
  },
  methods: {
    getName,
    // 发送短信
    sendMessage(data, noLeft) {
      console.log(data, noLeft, 89)
      if (noLeft) {
        data.mb = data.mobile
        this.listQuery = {
          addressee: data.name,
          msgDetail: ''
        }
      } else {
        if (this.navActive === 'person') {
          data.mb = data.mobile
          this.listQuery = {
            addressee: data.UnitName,
            msgDetail: ''
          }
        } else if (this.navActive === 'txzy') {
          data.mb = data.id
          this.listQuery = {
            addressee: data.name,
            msgDetail: ''
          }
        } else if (this.navActive === 'selectSource') {
          data.mb = data.id
          this.listQuery = {
            addressee: data.name,
            msgDetail: ''
          }
        } else if (this.navActive === 'cyqz') {
          data.mb = data.TELEPHONE
          this.listQuery = {
            addressee: data.NAME,
            msgDetail: ''
          }
        }
      }
      this.msgTitle = '短信单发'
      this.dialogVisibleMSG = true
      this.sendGroup = [data]
    },
    // 短信群发
    sendMsgGroup(v, addList) {
      this.sendGroup = []
      if (this.navActive === 'person') {
        const getCheckedNodes = this.$refs.tree1.getCheckedNodes().filter(item => !item.children)
        this.sendMsgInfo(getCheckedNodes, 'mobile', 'UnitName')
      } else if (this.navActive === 'txzy') {
        const getCheckedNodes = this.$refs.tree2.getCheckedNodes().filter(item => !item.countExt)
        this.sendMsgInfo(getCheckedNodes, 'id', 'name')
      } else if (this.navActive === 'selectSource') {
        const getCheckedNodes = this.$refs.tree3.getCheckedNodes()
        this.sendMsgInfo(getCheckedNodes, 'id', 'name')
      } else if (this.navActive === 'cyqz') {
        const getCheckedNodes = this.$refs.tree4.getCheckedNodes().filter(item => item.TELEPHONE)
        this.sendMsgInfo(getCheckedNodes, 'TELEPHONE', 'NAME')
      }
      // mobile id TELEPHONE id
      // UnitName name NAME name
    },
    // 发送短信信息整理，针对不同设备获取不同的字段号码，以及名称
    sendMsgInfo(getCheckedNodes, id, name) {
      if (getCheckedNodes.length === 0) {
        this.$message.warning('请选择成员')
        return
      }
      console.log(getCheckedNodes, 55)
      let noPhoneName = ''
      let phoneName = ''
      getCheckedNodes.forEach((item) => {
        item.mb = item[id]
        // 没有手机号或者手机号格式不合法
        if (!validatePhoneBol(item[id])) {
          noPhoneName += item[name] + '、'
        }
        if (validatePhoneBol(item[id])) {
          phoneName += item[name] + '、'
          this.sendGroup.push(item)
        }
      })
      noPhoneName = noPhoneName.slice(0, -1)
      phoneName = phoneName.slice(0, -1)
      if (noPhoneName) {
        this.$message.warning(noPhoneName + '无手机号，无法接收短信!')
      }
      this.listQuery = {
        addressee: phoneName,
        msgDetail: ''
      }
      if (!phoneName) {
        this.dialogVisibleMSG = false
      } else if (phoneName.split('、').length === 1) {
        this.msgTitle = '短信群发'
        this.dialogVisibleMSG = true
      } else {
        this.msgTitle = '短信群发'
        this.dialogVisibleMSG = true
      }
    },
    handleNodeExpand(data) {
      // 保存当前展开的节点
      let flag = false
      this.defaultExpandIds.some(item => {
        if (item === data.ID) { // 判断当前节点是否存在， 存在不做处理
          flag = true
          return true
        }
      })
      if (!flag) { // 不存在则存到数组里
        this.defaultExpandIds.push(data.ID)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.defaultExpandIds.some((item, i) => {
        if (item === data.ID) {
          this.defaultExpandIds.splice(i, 1)
        }
      })
    },
    filterDev() {
      const arr = ['1', '2', 'dev']
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
      this.checkResourcelist.forEach((item) => {
        // 设备  外部联系人 不进行广播操作
        if (item.MSG_KEY || ('type' in item ? arr.indexOf(item.type) === -1 : true)) {
          var obj = {
            userId: item.id,
            userName: item.name,
            yonghuzxbj: 'yonghuzxbj' in item ? item.yonghuzxbj : '1'
          }
          if (item.type === '2') {
            obj.devId = 'phone'
          }
          this.$store.commit('audioMeet/SET_addMeetingMemberList_PUSH', obj)
        }
      })
    },
    // 广播 和 IM 暂只支持发起人员
    broadcast() {
      this.setCheckedResourceList()
      this.filterDev()// 将设备筛选出来
      this.dialogVisibleBroadcast = true
    },
    IMChange() {
      const { navActive } = this
      this.setCheckedResourceList()
      this.filterDev()// 将设备筛选出来
      if (this.addMeetingMemberList.length === 0) {
        // 多人走 IM新建群聊
        this.$root.$emit('IM', {
          type: 'message'
        })
      } else if (navActive !== 'cyqz' && this.addMeetingMemberList.length > 1) {
        // 多人走 IM新建群聊
        this.dialogVisibleIM = true
      } else if (navActive !== 'cyqz' && this.addMeetingMemberList.length === 1) {
        // 单人 IM 直接走单聊聊天窗口
        this.$root.$emit('IM', {
          type: 'single',
          yonghuid: this.addMeetingMemberList[0].userId
        })
      } else if (navActive === 'cyqz' && this.addMeetingMemberList.length > 0) {
        const find = this.$refs.tree4.getCheckedNodes().filter(obj => Number(obj.PARENT_ID) === -1)[0]
        const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
        // console.log(this.$refs.tree4.getCheckedNodes())
        // 常用群组 走接口 请求群组是否存在
        this.$api.common.syncCommonToIm({
          'token': TOKEN,
          'POLICENO': POLICE_ID,
          'COMMON_ID': find.ID
        }).then(res => {
          if (res.data.result === 1) {
            // 说明该常用群组已创建 im群聊 直接进入聊天窗口就行
            this.$root.$emit('IM', { type: 'common', ID: find.ID })
          } else {
            this.$root.$emit('IM', { type: 'Group' })
          }
        }).catch(err => {
          console.log(err)
          this.$message.error('数据异常')
        })
      }
      this.dialogTitle = '即时通信'
      // IM聊天窗口
    },
    treeCheck(data, list) {
    // data 该节点所对应的对象、list 树目前的选中状态对象
    // 选中事件在选中后执行，当lis中有两个选中时，使用setCheckedKeys方法，选中一个节点
    // 单选实现
      if (list.checkedKeys.length > 0) {
      // 单选实现
        this.$refs.tree4.setCheckedKeys([data.ID])
      } else {
      // 取消当前选中节点
        this.$refs.tree4.setCheckedKeys([])
      }
    },
    // 编辑常用群组
    edit(node, data, e) {
      e.stopPropagation()
      e.preventDefault()
      // console.log(node, data)
      this.editCommonData = data
      this.dialogTitle = '编辑常用群组'
      this.$store.commit('audioMeet/SET_createMeetingName', data.GROUP_NAME)
      const arr = data.DEVS.map(item => {
        const obj = {
          userName: item.NAME,
          POLICE_ID: item.CALL_NO,
          userId: item.CALL_NO,
          devId: item.TYPE === '1' ? item.DEV_ID : item.TYPE === '2' ? 'phone' : '',
          yonghuzxbj: item.yonghuzxbj
        }
        if (item.TYPE === '1') {
          obj.devId = item.CALL_NO
        }
        return obj
      })
      // 组合arr到列表
      this.$store.commit('audioMeet/SET_addMeetingMemberList', arr)
      this.dialogVisible = true
    },
    // 移除常用群组
    remove(node, data, e) {
      e.stopPropagation()
      e.preventDefault()
      this.$confirm(`此操作将永久删除群组${data.GROUP_NAME}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
        this.$api.common.deleteCommon({
          COMMON_ID: data.ID,
          POLICENO: POLICE_ID,
          TOKEN
        }).then(res => {
          if (res.data.result) {
            this.$message.closeAll()
            this.$message.success('删除成功')
            this.queryCommonByUnit()
          }
        })
      }).catch(() => {
      })
    },
    queryCommonByUnit() {
      const { TOKEN, POLICE_ID, UNIT_ID } = this.TONE_voip.cmd
      this.$api.common.queryCommonByUnit(`?POLICENO=${POLICE_ID}&TOKEN=${TOKEN}&UNIT_ID=${UNIT_ID}`).then(res => {
        if (res && res.data && res.data.List && Array.isArray(res.data.List)) {
          res.data.List.forEach((item) => {
            let count = 0
            if (!Array.isArray(item.DEVS)) return
            item.DEVS.forEach(obj => {
              obj.parentName = item.GROUP_NAME
              let res = 0
              const getUserLineStatus = (tree, key, status) => {
                for (let index = 0; index < tree.length; index++) {
                  const element = tree[index]
                  if (element.children && element.children.length > 0) {
                    getUserLineStatus(element.children, key, status)
                  } else {
                    if (`${element[key]}` === obj.CALL_NO) {
                      res = element[status]
                    }
                  }
                }
              }
              if (obj.TYPE === '0') {
                getUserLineStatus(this.userTree, 'yonghuid', 'yonghuzxbj')
              } else if (obj.TYPE === '1') {
                getUserLineStatus(this.devTree, 'devId', 'status')
              }
              if (Number(res) === 1) {
                count++
                obj.yonghuzxbj = 1
              } else {
                obj.yonghuzxbj = 0
              }
            })
            const dev = item.DEVS.filter(objs => objs.TYPE === '2')
            // 外部联系人默认都是在线状态
            count += dev.length
            item.zxCount = count
          })
        }// 筛选人员在线状态
        this.commonData = res.data.List
        this.commonDataCopy = cloneDeep(this.commonData)
        this.$nextTick(_ => {
          const { navActive } = this
          if (navActive === 'person') {
            this?.$refs?.tree1?.filter()
          } else if (navActive === 'txzy') {
            this?.$refs?.tree2?.filter()
          } if (navActive === 'cyqz') {
            this?.$refs?.tree4?.filter()
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    filterNode2(value, data) {
      // 筛选调度台 APP
      const isZx = data.yonghuzxbj === 1 || data.status === 1 || data.TYPE === '2'// 在线状态
      const isUniName = data && data.GROUP_NAME && data.GROUP_NAME.indexOf(value) !== -1 // 群组名称
      const isSelfName = data && data.NAME && data.NAME.indexOf(value) !== -1 // 群组成员名称
      const isUniNameChild = data && data.parentName && data.parentName.indexOf(value) !== -1
      if (!value && this.isAll === '全部') {
        return true
      } else if (!value && this.isAll === '在线资源') {
        return isZx
      }
      if (this.isAll === '全部') {
        return isUniName || isUniNameChild || isSelfName
      } else {
        return ((isUniName || isUniNameChild || isSelfName) && isZx)
      }
    },
    addGroup() {
      this.dialogVisible = true
      this.dialogTitle = '新建常用群组'
      this.$store.commit('audioMeet/SET_createMeetingName', '')
      this.$store.commit('audioMeet/SET_addMeetingMemberList', [])
    },
    sureClickHandle() {
      // 创建或编辑确认常用群组
      const { TOKEN, POLICE_ID } = this.TONE_voip.cmd
      const { editCommonData, createMeetingName, addMeetingMemberList } = this
      this.$message.closeAll()
      if (!createMeetingName) {
        this.$message.warning('请填写群组名称')
        return
      }
      if (this.commonDataCopy.find(item => item.ID !== editCommonData.ID && item.GROUP_NAME === createMeetingName)) {
        this.$message.warning('群组名称重复')
        return
      }
      const DEVIDS = addMeetingMemberList.map(item => {
        return {
          'DEV_ID': item.POLICE_ID || item.userId,
          'CALL_NO': item.POLICE_ID || item.userId,
          'NAME': item.userName,
          'TYPE': item.devId === 'phone' ? '2' : item.devId ? '1' : '0',
          'TELEPHONE': item.mobile || item.userId
        }
      })
      if (!DEVIDS || DEVIDS.length === 0) {
        this.$message.warning(`请选择成员`)
        return
      }
      const query = {
        POLICENO: POLICE_ID,
        TOKEN,
        GROUP_NAME: createMeetingName,
        DEVIDS
      }
      // console.log(query, data, '组合出来的数据')
      // 进行一些操作 组合数据
      if (this.dialogTitle === '编辑常用群组') {
        query.COMMON_ID = editCommonData.ID
        this.$api.common.addOrUpdateCommonDevs(query).then(res => {
          if (res.data.result) {
            this.$message.success('编辑成功')
            this.queryCommonByUnit()
          }
        })
      } else {
        this.$api.common.addOrUpdateCommonDevs(query).then(res => {
          if (res.data.result) {
            this.$message.success('添加成功')
            this.queryCommonByUnit()
          }
        })
      }
      this.dialogVisible = false
    },
    // 常用群组 获取用户在线状态
    getZxbj(item) {
      let res = 0
      if (item.yonghuzxbj === 1 || item.TYPE === '2') {
        res = '#32b16c'
      } else {
        res = '#999'
      }
      return res
    },
    // 用户在线人数
    onLine(data, name = 'children', len = 'countYh') {
      // 统计在线人数
      // eslint-disable-next-line no-unused-vars
      let devCount = 0// 因为设备不只有总数 还有分类 要计算分类下的单位下的设备总数
      const deepCount = (obj, count = 0) => {
        if (obj[name]?.length > 0) {
          obj[name].forEach(item => {
            // 在线字段 对应人员APP调度台的实时在线 和设备 外部联系人的在线
            if (item?.yonghuzxbj === 1 || item.TYPE === '2' || item.status === 1) {
              count++
            }
            if (!item[name]) { // 单位下的总设备数
              devCount++
            }
            if (item[name]?.length > 0) {
              count += deepCount(item, 0)
            }
          })
        }
        return count
      }
      if (data.isType) {
        return ''
      }
      if (data[name]?.length > 0) {
        const obj = deepCount(data)
        if (len === 'countExt') {
          return `(${obj}/${devCount})`
        } else if (name === 'children') {
          return `(${obj}/${data[len]})`
        } else if (name === 'DEVS') {
          return `(${obj}/${data?.DEVS?.length})`
        } else {
          return `(${obj}/${data[len]})`
        }
      } else {
        return ''
      }
    }, // 常用在线人数
    getDevInfo(data) {
      // data.selectFlag = true
      this.$set(data, 'selectFlag', true)
      this.$root.$emit('getDevInfo', data)
    },
    audioMeet() {
      this.setCheckedResourceList()
      this.$root.$emit('audioMeet')
    },
    videoCall() {
      this.setCheckedResourceList()
      this.$root.$emit('videoCall')
    },
    videoMeetHandle() {
      this.setCheckedResourceList()
      this.$root.$emit('videoMeetHandle', true)
    },
    loadResource() {
      const result = queryId('resource', this.settings.FEATURE_SETTING)
      if (result && !result.isOpen) {
        this.isOpen = false
      } else {
        this.isOpen = true
      }
      if (result && result.isOpen && result.children && result.children[0] && result.children[0].children) {
        const arr = result.children[0]
        if (Array.isArray(arr.children)) {
          arr.children.forEach(item => {
            if (item.text === arr.active) {
              this.isShowPanel(item.id)
            }
          })
        }
      }
      if (result.isSpread && result.isOpen) {
        // 默认展开
        this.isleft = false
      } else {
        this.isleft = true
      }
    },
    // 显示的模块
    isShowPanel(val) {
      this.navActive = val
      const navActive = val
      this.filterText = ''
      if (navActive === 'person') {
        this.$refs.tree1.filter()
      } else if (navActive === 'txzy') {
        this.$refs.tree2.filter()
      } else if (navActive === 'selectSource') {
        this.$refs.tree3.filter()
      } if (navActive === 'cyqz') {
        this.$refs.tree4.filter()
      }
    },
    filterNode(value, data) {
      // 筛选调度台 APP
      const isZx = data.yonghuzxbj === 1 || data.status === 1// 在线状态
      const isParent = data.uName && data.uName.indexOf(value) !== -1// 携带父节点
      const isUniName = data.unitName && data.unitName.indexOf(value) !== -1
      if (!value && this.isAll === '全部') {
        return true
      } else if (!value && this.isAll === '在线资源') {
        return isZx
      }
      if (this.isAll === '全部') {
        return isParent || (isUniName) || data.UnitName.indexOf(value) !== -1
      } else {
        return (isParent && isZx) || (isUniName && isZx) || (data.UnitName.indexOf(value) !== -1 && isZx)
      }
    },
    filterNodeResource(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 关键词搜索
    searchBtn() {
      if (this.navActive === 'person') {
        this.$refs.tree1.filter(this.filterText)
      }
      if (this.navActive === 'txzy') {
        this.$refs.tree2.filter(this.filterText)
      }
      if (this.navActive === 'jqdj') {
        // 模糊搜索
        this.intercomListFilter = this.intercomList.filter((item) => {
          return item.intercomName.search(this.filterText) !== -1
        })
      }
      if (this.navActive === 'selectSource') {
        this.$refs.tree3.filter(this.filterText)
      }
      if (this.navActive === 'cyqz') {
        this.$refs.tree4.filter(this.filterText)
      }
    },
    arrowClick() {
      this.isleft ? this.isleft = false : this.isleft = true
    },
    // 获取对讲列表
    getIntercomList() {
      this.$api.intercom.getIntercomList({
        userId: this.userInfo.userName
      }).then(res => {
        res.data.data.forEach((item) => {
          item.isJt = false
        })
        this.intercomListFilter = cloneDeep(res.data.data)
        this.intercomList = this.intercomListFilter
      })
    },
    // 选择对讲组
    async intercom(item) {
      // 选中对讲组时，设为监听状态，取消选中，监听状态不变,相对于item.isJt = true在做后续功能，已是活跃或者讲话状态下的接听更简洁。。。
      // 推翻上面说的，已是活跃或者讲话状态下的不去接听，只接听一路，谁先说话接谁的，不然出现听到一半的情况，所以item.isJt = true也行
      if (!item.isJt) {
        this.jtIntercom(item)
      }
      // item.isJt = true
      // 未选中状态
      if (!this.activeIntercom) {
        this.activeIntercom = item
        return false
      }
      // 选中状态下，再次点击自己
      if (this.activeIntercom && this.activeIntercom.intercomId === item.intercomId) {
        // 未启动状态直接取消选中，空闲及正在讲话状态，先挂断对讲组再进行取消选中
        // else if (item.intercomStatus === 1) {
        //   // 空闲状态取消选中，把请求话权按钮给变成ptt就行了
        //   // this.activeIntercom = null
        // }
        if (item.intercomStatus === 0) {
          this.activeIntercom = null
        } else if (item.intercomStatus === 1) {
          // 空闲状态取消选中，把请求话权按钮给变成ptt就行了
          this.activeIntercom = null
        } else {
          // 取消选中状态，不去挂断，而是去不让他请求话权，在取消监听的时候再去挂断
          // if (await this.endCallIntercom() === 'success') {
          //   this.activeIntercom.intercomStatus = 0
          //   this.activeIntercom.takeUser = ''
          //   this.activeIntercom = null
          // }
          this.$api.intercom.relaceTalk({
            userId: this.userInfo.userName,
            intercomId: this.activeIntercom.intercomId
          }).then(res => {
            // this.activeIntercom.intercomStatus = 1
            // this.activeIntercom.takeUser = ''
            this.activeIntercom = null
          })
        }
        return false
      }
      // 选中状态下，再次点击别的对讲组
      if (this.activeIntercom && this.activeIntercom.intercomId !== item.intercomId) {
        // 未启动状态直接切换，空闲及正在讲话状态，先挂断对讲组再进行切换
        if (this.activeIntercom.intercomStatus === 0) {
          this.activeIntercom = item
        } else {
          if (await this.endCallIntercom() === 'success') {
            this.activeIntercom.intercomStatus = 0
            this.activeIntercom.takeUser = ''
            this.activeIntercom = item
          }
        }
        return false
      }
    },
    // 监听对讲组
    jtIntercom(item) {
      // 监听对讲组
      item.isJt = !item.isJt
      // 取消监听挂断对讲组
      if (!item.isJt) {
        this.activeIntercom = null
        for (let index = 0; index < this.callList.length; index++) {
          const element = this.callList[index]
          if (element.from === item.intercomId || element.to === item.intercomId) {
            this.$api.common.meetControl({
              cmd: 'kick',
              roomid: item.intercomId,
              data: 'all'
            }).then((res) => {
              if (res.data === 'success') {
                console.log(this.listenCallList, 88777)
              } else {
                this.$alert('挂断对讲组失败', '提示', {
                  type: 'error'
                })
              }
            }).catch((error) => {
              console.log(error)
            })
            // this.endCall(element.sessionId, element.session, true)
          }
        }
      } else if (item.isJt && !this.jtAgreeFlag) { // 如果是监听状态，应该被接听
        // 如果session中有这个对讲组，正常接听
        // for (let index = 0; index < this.listenCallList.length; index++) {
        //   const ele = this.listenCallList[index]
        //   if (item.intercomId === ele.from) {
        //     const ev = {
        //       target: {
        //         dataset: {
        //           type: ele.type,
        //           sessionid: ele.sessionId
        //         },
        //         style: {
        //           display: ''
        //         }
        //       }
        //     }
        //     this.agree(ev)
        //     this.jtAgreeFlag = true
        //   }
        // }
      }
    },
    // 全部监听/全部取消监听对讲组
    jtIntercomAll(force) {
      if (force) {
        this.jtIntercomAllFlag = false
      } else {
        this.jtIntercomAllFlag = !this.jtIntercomAllFlag
      }
      // 全部选中
      if (this.jtIntercomAllFlag) {
        this.intercomListFilter.forEach((item) => {
          item.isJt = true
          // 如果是监听状态，应该被接听
          // if (item.isJt && !this.jtAgreeFlag) {
          //   // 如果session中有这个对讲组，正常接听
          //   for (let index = 0; index < this.listenCallList.length; index++) {
          //     const ele = this.listenCallList[index]
          //     if (item.intercomId === ele.from) {
          //       const ev = {
          //         target: {
          //           dataset: {
          //             type: ele.type,
          //             sessionid: ele.sessionId
          //           },
          //           style: {
          //             display: ''
          //           }
          //         }
          //       }
          //       this.agree(ev)
          //       this.jtAgreeFlag = true
          //     }
          //   }
          // }
        })
      } else {
        // 全部取消
        this.activeIntercom = null
        this.intercomListFilter.forEach((item) => {
          item.isJt = false
          // 全部取消时查看是否有正在通话的，有的话直接挂断
          for (let index = 0; index < this.callList.length; index++) {
            const element = this.callList[index]
            if (element.from === item.intercomId || element.to === item.intercomId) {
              this.$api.common.meetControl({
                cmd: 'kick',
                roomid: item.intercomId,
                data: 'all'
              }).then((res) => {
                if (res.data === 'success') {
                  console.log(this.listenCallList, 88777)
                } else {
                  this.$alert('挂断对讲组失败', '提示', {
                    type: 'error'
                  })
                }
              }).catch((error) => {
                console.log(error)
              })
            }
          }
        })
      }
    },
    intercomStatusFilter(status) {
      return { 0: '未启动', 1: '空闲', 2: '正在讲话' }[status] || '未启动'
    },
    intercomStatusColor(status) {
      return { 0: '#88ABDA', 1: '#32B16C', 2: '#EB6100' }[status] || '#88ABDA'
    },
    intercomStatusBgColor(status) {
      return { 0: 'rgba(136, 171, 218, 0.1)', 1: 'rgba(50, 177, 108, 0.1)', 2: 'rgba(235, 97, 0, 0.3)' }[status] || 'rgba(136, 171, 218, 0.1)'
    },
    // 过滤按钮文字
    filterIntercomBtn() {
      if (!this.activeIntercom) {
        return 'PTT'
      } else if (this.activeIntercom && (this.activeIntercom.intercomStatus === 1 || this.activeIntercom.intercomStatus === 0)) {
        return '请求话权'
      } else if (this.activeIntercom && this.activeIntercom.intercomStatus === 2) {
        // bug 1182
        return this.activeIntercom.takeUser === this.userInfo.userName ? '释放话权' : '请求话权'
        // return '释放话权'
      }
    },
    // PTT、请求话权、释放话权按钮
    pttBtn: throttle(function() {
      if (!this.activeIntercom) {
        this.$message({
          message: '请先选择一个对讲组！',
          type: 'warning'
        })
        return false
      }
      if (this.activeIntercom.intercomStatus === 0) {
        this.makeCall({ callNumber: this.activeIntercom.intercomId, audioOrVideo: 'audio', isMeeting: true })
      } else if (this.activeIntercom.intercomStatus === 1) {
        this.$api.intercom.requestTalk({
          userId: this.userInfo.userName,
          intercomId: this.activeIntercom.intercomId
        }).then(res => {
          if (res.data.result !== 'success') {
            this.$message({
              message: res.data.result,
              type: 'warning'
            })
          }
        })
      } else if (this.activeIntercom.intercomStatus === 2) {
        if (this.activeIntercom.takeUser !== this.userInfo.userName) {
          this.$message({
            message: '当前有人正在讲话，请稍后再试',
            type: 'warning'
          })
          return
        }
        this.$api.intercom.relaceTalk({
          userId: this.userInfo.userName,
          intercomId: this.activeIntercom.intercomId
        }).then(res => {
        })
      }
    }, 500, { 'trailing': false }),
    // 挂断对讲组
    async endCallIntercom() {
      try {
        const res = await this.$api.common.meetControl({
          cmd: 'kick',
          roomid: this.activeIntercom.intercomId,
          data: 'all'
        })
        if (res.data === 'success') {
          return res.data
        } else {
          this.$alert('挂断对讲组失败', '提示', {
            type: 'error'
          })
        }
      } catch (error) {
        console.log(error)
      }
    },
    setCheckedResourceList() {
      if (this.navActive === 'person') {
        const tree1Date = []
        this.$refs.tree1.getCheckedNodes().forEach((item) => {
          if (item.leaf) {
            tree1Date.push({
              power: '1,2',
              id: item.yonghuid,
              name: item.UnitName,
              yonghuzxbj: item.yonghuzxbj
            })
          }
        })
        this.$store.commit('app/SET_checkResourceList', tree1Date)
      }
      if (this.navActive === 'txzy') {
        const tree2Date = []
        this.$refs.tree2.getCheckedNodes().forEach((item) => {
          if (item.type === 'dev') {
            tree2Date.push(item)
            item.yonghuzxbj = item.status
          }
        })
        this.$store.commit('app/SET_checkResourceList', tree2Date)
      }
      if (this.navActive === 'cyqz') {
        const tree4Date = []
        this.$refs.tree4.getCheckedNodes().forEach((item) => {
          if (!('PARENT_ID' in item)) {
            tree4Date.push({
              power: '1,2',
              id: item.CALL_NO,
              name: item.NAME,
              yonghuzxbj: 'yonghuzxbj' in item ? item.yonghuzxbj : 1,
              type: item.TYPE
            })
          }
        })
        this.$store.commit('app/SET_checkResourceList', tree4Date)
      }
      if (this.navActive === 'selectSource') {
        this.$store.commit('app/SET_checkResourceList', this.$refs.tree3.getCheckedNodes())
      }
    },
    tree1CheckChange() {
      const tree1Date = []
      this.$refs.tree1.getCheckedNodes().forEach((item) => {
        if (item.leaf) {
          tree1Date.push({
            power: '1,2',
            id: item.yonghuid,
            name: item.UnitName,
            yonghuzxbj: item.yonghuzxbj
          })
        }
      })
      this.$store.commit('app/SET_checkResourceList', tree1Date)
    },
    tree2CheckChange() {
      const tree2Date = []
      this.$refs.tree2.getCheckedNodes().forEach((item) => {
        if (item.type === 'dev') {
          tree2Date.push(item)
        }
      })
      this.$store.commit('app/SET_checkResourceList', tree2Date)
    },
    tree3CheckChange() {
      this.$store.commit('app/SET_checkResourceList', this.$refs.tree3.getCheckedNodes())
    }
  }
}
</script>
<style lang="scss" scoped>
.left {
  user-select: none;
  .tabTitle {
    position: fixed;
    z-index: 1000;
    left: calc(100% - 28px);
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    cursor: pointer;
    box-sizing: content-box;
    width: 28px;
    background: -webkit-gradient(linear, left bottom, left top, from(#2A7AA2), to(#055984));
    background: linear-gradient(0deg, #2A7AA2, #055984);
    border: 1px solid #01CFFF;
    color:#01CFFF;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    span{
      display: inline-block;
      word-break: break-all;
      width: 14px;
      line-height: 2;
    }
  }
  .posi-panel{
    position: fixed;
    width: 360px;
    left: calc(100% - 380px);
    top: 0px;
    margin-top: 0.85rem;
    height: calc(100% - 1.7rem);
    min-height: 400px;
    .arrow {
      position: absolute;
      height: 90px;
      top: calc(50% - 45px);
      left: -9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .noArrow {
      height: 100%;
    }
    // transition: all .1s linear;
    &.rightHide {
      left: calc(100% - 28px) !important;
      .noArrow {
        display: none;
      }
    }
    .leftWrap {
      float: right;
      width: 100%;
      height: 100%;
      ::v-deep .el-tabs {
          .el-tabs__header {
            margin: 0;
            .el-tabs__nav-wrap::after {
              width: 90% !important;
              height: 1px;
              background-color: rgba(2, 167, 253, 0.24);
            }
            .el-tabs__item {
              padding: 0 10px;
              font-size: 12px;
              height: 30px;
              line-height: 30px;
              color: #ccc;
              &.is-active {
                color: #fff;
              }
            }
            .el-tabs__active-bar {
              height: 2px;
              background-color: #FF6A00;
            }
          }
        }
    }
    ::v-deep .filter {
      width: 100%;
      // height: 30px;
      // margin-left: 10px;
      padding: 5px 40px 15px 10px;
      .el-input__inner {
        height: 30px;
        border: 1px solid #197491;
        background-color: #265872;
        color: #fff;
        font-size: 12px;
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
        right: 40px;
        .img {
          margin-top: 7px;
          cursor: pointer;
        }
      }
    }
    .tab-con{
      position: absolute;
      top: 55px;
      left: 10px;
      right: 40px;
      bottom: 8px;
    }
    .tab-con-item{
      position: absolute;
      width: 100%;
      height: calc(100% - 80px);
      transition: all 0.2s linear;
      left: calc(-100% - 20px);
      background-size: cover;
      z-index: 1001;
      top: 10px;
      overflow: auto;
      &.cyqz {
        height: calc(100% - 120px);
      }
      &.jqdj {
        height: calc(100% - 65px);
        margin-top: 10px;
      }
    }
    .btnWrap {
      position: absolute;
      width: 100%;
      bottom: 2px;
      border-top: 1px solid #497a7a;
      .btn{
        cursor: pointer;
        background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
        background-size: 100% 100%;
        width: 80px;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        display: inline-block;
        color: #01cfff;
        text-align: center;
        margin-top: 10px;
        margin-right: 27px;
        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
    .duijiang-btn {
      position: absolute;
      width: 100%;
      bottom: 0px;
      width: 100%;
      height: 34px;
      .jt {
        width: 33px;
        height: 100%;
        margin-right: 5px;
        cursor: pointer;
        img {
          width: 33px;
          height: calc(100% - 1px);
        }
      }
      .ptt {
        width: calc(100% - 40px);
        height: calc(100% - 3px);
        text-align: center;
        line-height: 28px;
        font-size: 14px;
        font-family: PingFang SC;
        font-weight: 600;
        color: #FFFFFF;
        cursor: pointer;
        margin-top: 1px;
        background: linear-gradient(0deg, #2A7AA2, #055984);
        border: 1px solid #01CFFF;
        border-radius: 2px;
      }
    }
    .tab-con-item.active{left: 0; z-index: 1002;}
    .met-list {
      overflow: unset;
      .duijiang-c {
        height: calc(100%);
        overflow: auto;
        .duijiang-item {
          width: calc((100% - 5px)/2);
          height: 50px;
          margin-right: 5px;
          background: rgba(42, 122, 162, 0.3);
          border: 1px solid #01CFFF;
          margin-bottom: 10px;
          cursor: pointer;
          position: relative;
          .jianting {
            width: 30px;
            height: 100%;
            img {
              margin-left: 8px;
              margin-top: 4px;
            }
          }
          .con {
            color: rgba(255,255,255,0.6);
            font-size: 12px;
            font-family: PingFang SC;
            font-weight: 500;
            width: calc(100% - 30px);
            .name {
              margin-top: 8px;
              width: calc(100% - 20px);
              overflow: hidden;
            }
            .talk {
              margin-top: 8px;
              overflow: hidden;
            }
          }
          .statusWrap {
            position: absolute;
            right: 4px;
            top: 8px;
            .status {
              width: 12px;
              height: 12px;
              background: #32B16C;
              border-radius: 50%;
            }
            .radio {
              margin-top: 10px;
              img {
                width: 12px;
                height: 12px;
              }
            }
          }
          &:nth-child(2n) {
            margin-right: 0;
          }
        }
      }
    }
    .rightWrap {
      width: 30px;
      height: 100%;
      position: absolute;
      right: 5px;
      top: 15px;
      .tabContainer {
        width: 30px;
        position: absolute;
        left: 0px;
        height: calc(100% - 26px);
        .tab-cards{
          box-sizing: content-box;
          width: 28px;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: linear-gradient(0deg, #2A7AA2, #055984);
          border: 1px solid #01CFFF;
          border-radius: 4px;
          li{
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            width: 28px;
            float: left;
            // height: 25%;
            flex: 1;
            color: #00d8ff;
            cursor: pointer;
            user-select: none;
            box-sizing: border-box;
            span {
              display: inline-block;
              word-break: break-all;
              width: 14px;
              line-height: 2;
            }
            &.active{
              color: #fff;
              // height: 25%;
              background: url('../../../assets/images/equipment/active.png') no-repeat;
              background-size: 100% 100%;
            }
          }
        }
      }
    }
  }
  .tone_sip_dialog{
    width: 100%;
    color: #F1F1F1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(circle, #00273C, #004F78);
    border: 1px solid rgba(52, 193, 218, 0.6);
    box-shadow: inset 0px 0px 10px 2px #35879d;
  }
  .tone_sip_dialog_tit{height: 31px; line-height: 31px; padding:0px 10px; overflow: hidden; cursor: move;}
  .tone_sip_dialog_tit span.tit{float: left;}
  .tone_sip_dialog_tit span.close{float: right; font-size: 16px; cursor: pointer; line-height: 31px;}
  .tone_sip_con{background:rgba(2,51,67,.7); position: absolute; top: 31px; height: calc(100% - 31px); width: 100%;overflow: hidden;}
  .tone_sip_con_c{width: 100%;height: 100%;}
  .tone_sip .vdr.active:before{display: none; position: unset; width: 0; height:0;}
  .tone_sip_con_c video{ width: 100%; height: 100%; background-color: #000;object-fit:fill}
  .tone_sip_con_c:hover .vodeocontrol{bottom: 0px;}
  .tone_sip_con_c .vodeocontrol{position: absolute; height: 40px; width: 100%; bottom: -40px; background:rgba(255,255,255,.2); transition: all .3s;}
  .btn{ display: inline-block; margin:  0 5px;  cursor: pointer;  text-align: center;}
  .btn-circle{ width: 30px; height: 30px; border-radius: 50%; font-size: 18px; background-color:#409EFF; color: #F1F1F1; }
  .btn-circle::before{line-height: 30px;}
}
</style>
