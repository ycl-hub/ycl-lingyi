<template>
  <div v-move="{parent: '.pj_dialog', childrenHeader: '.pj_dialog_tit'}" class="pj_dialog bevel">
    <div class="pj_dialog_tit">
      <span class="tit">即时消息</span>
      <span class="el-icon-close close" @click="closeMeet" />
    </div>
    <div class="pj_con">
      <div class="pj_con_c">
        <div class="meetWrap">
          <div class="inner">
            <el-dialog
              v-el-drag-dialog
              title="创建群聊组"
              :visible.sync="dialogVisible"
              width="700px"
              append-to-body
              :close-on-click-modal="false"
              custom-class="organizeDialog bevel"
            >
              <div class="organizeDialog_content_add">
                <div class="text-center cerate-top">
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
          <div class="out">
            <div class="tabs">
              <div v-for="tab in tabs" :key="tab.name" class="tab" :title="tab.title" @click="tabClick(tab)">
                <img :src="activeTab === tab.name ? tab.image_h : tab.image" alt="" class="tabImage">
              </div>
            </div>
            <div class="noCreated">
              <div class="left">
                <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
                  <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
                </el-input>
                <div ref="leftListBar" class="list">
                  <ul v-if="activeTab==='message'">
                    <li v-for="(item, i) in list" :key="i" class="listItem clearfix" :style="{background:get(activeListItem, 'id', '')&&item.id===activeListItem.id?'#005580': ''}" @click="listClick(item)">
                      <img :src="item.TYPE==='0'?icon_single:icon_group" alt="" class="picture">
                      <span v-if="item.unRead" class="number"> {{ item.unRead }} </span>
                      <div class="itemRight clearfix">
                        <p class="top">
                          <span class="name ellipsis">{{ item.name }}</span>
                          <span class="time">{{ item.MSG_LIST.length > 0 ? formatTime(item.MSG_LIST[item.MSG_LIST.length - 1].SEND_TIME) : '' }}</span>
                        </p>
                        <p class="message ellipsis">{{ filterLastMag(item) }}</p>
                      </div>
                    </li>
                  </ul>
                  <ul v-if="activeTab==='single'">
                    <li v-for="user in userList" :key="user.yonghuid" class="listItem clearfix" :style="{background:user.yonghuid===activeUserOrGroup.yonghuid?'#005580': ''}" @click="listClick(user)">
                      <img :src="icon_single" alt="" class="picture">
                      <div class="itemRight clearfix">
                        <p class="top">
                          <span class="name ellipsis">{{ user.yonghuname }}</span>
                        </p>
                        <p class="message">{{ user.UnitName }}</p>
                      </div>
                    </li>
                    <li v-if="userList && userList.length===0" class="noMessage">暂无数据</li>
                  </ul>
                  <ul v-if="activeTab==='group'">
                    <li v-for="group in groupList" :key="group.GROUP_ID" class="listItem clearfix" :style="{background:group.GROUP_ID===activeUserOrGroup.GROUP_ID?'#005580': ''}" @click="listClick(group)">
                      <img :src="icon_group" alt="" class="picture">
                      <div class="itemRight clearfix">
                        <p class="top">
                          <span class="name ellipsis">{{ group.GROUP_NAME }}</span>
                        </p>
                        <p v-if="group.MEMBERLIST && group.MEMBERLIST.length>0" class="message ellipsis">
                          {{ MEMBERLISTFilter(group.MEMBERLIST) }}
                        </p>
                      </div>
                    </li>
                    <li v-if="groupList && groupList===0" class="noMessage">暂无数据</li>
                    <li v-if="false" class="creatGroupBtnLi">
                      <button class="creatGroupBtn" @click="tabClick({name: 'add',image: add,image_h: add_h,title: '新增群组'})">
                        新建群组
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="right">
                <div v-if="activeTab==='message'&&activeListItem" class="rightContentHis">
                  <div class="titleAndHis">
                    <h1 v-if="activeListItem.TYPE==='1'" class="title">{{ activeListItem.name }}</h1>
                    <div class="chat">
                      <div ref="scrollList" class="chatContainer">
                        <ul>
                          <li v-for="(msg, i) in activeListItem.MSG_LIST" :key="i" class="singleChat">
                            <div v-if="msg.SENDER!==TONE_voip.cmd.POLICE_ID" class="singleChatContainer1 clearfix">
                              <img class="chatPic" :src="icon_single" alt="">
                              <div class="chatRight clearfix">
                                <div class="nameTime">
                                  <span class="name">{{ msg.SENDERNAME }}</span>
                                  <span class="time">{{ msg.SEND_TIME }}</span>
                                </div>
                                <div v-if="msg.MSGTYPE==='0'" class="chatCon">
                                  {{ msg.CONTENT }}
                                </div>
                                <div v-if="msg.MSGTYPE==='1'" v-viewer="{'navbar': false, 'toolbar': false}" class="chatImg">
                                  <img :src="api + msg.URL" alt="">
                                </div>
                                <div v-if="msg.MSGTYPE==='40'" class="chatCon clearfix" @click="downFile(msg)">
                                  <div class="fileName">
                                    <p>{{ msg.FILE_OLD_NAME }}</p>
                                    <p>{{ format_File_Size(msg.FILE_SIZE) }}</p>
                                  </div>
                                  <img class="fileIcon" :src="file_fff" alt="">
                                </div>
                                <div v-if="msg.MSGTYPE==='3'" class="chatVideo" @click="videoPreview(msg.URL)">
                                  <video width="160" height="90" :src="api + msg.URL" style="objectFit: fill;" />
                                  <img class="videoPaly" :src="play" alt="">
                                  <span class="video_size"> {{ format_File_Size(msg.FILE_SIZE) }} </span>
                                </div>
                                <div v-if="msg.MSGTYPE==='2'" class="audioCon" @click="audioPreview(msg.URL)">
                                  <div class="audioIcon_right" :class="{'wifi-symbol': api + msg.URL === previewAudioUrl}">
                                    <div class="wifi-circle first" />
                                    <div class="wifi-circle second" />
                                    <div class="wifi-circle third" />
                                  </div>
                                  <!-- <audio class="audioleft" :src="api + msg.URL" controls="controls" /> -->
                                  <span class="audioTime"> {{ msg.AUDIO_TIME }}" </span>
                                </div>
                              </div>
                            </div>
                            <div v-else class="singleChatContainer2">
                              <img class="chatPic" :src="icon_single" alt="">
                              <div class="chatRight clearfix">
                                <div class="nameTime">
                                  <span class="name">{{ msg.SENDERNAME }}</span>
                                  <span class="time">{{ msg.SEND_TIME }}</span>
                                </div>
                                <div v-if="msg.MSGTYPE==='0'" class="chatCon">
                                  {{ msg.CONTENT }}
                                </div>
                                <div v-if="msg.MSGTYPE==='1'" v-viewer="{'navbar': false, 'toolbar': false}" class="chatImg">
                                  <img :src="api + msg.URL" alt="">
                                </div>
                                <div v-if="msg.MSGTYPE==='40'" class="chatCon clearfix" @click="downFile(msg)">
                                  <div class="fileName">
                                    <p>{{ msg.FILE_OLD_NAME }}</p>
                                    <p>{{ format_File_Size(msg.FILE_SIZE) }}</p>
                                  </div>
                                  <img v-if="!msg.percent || msg.percent===100" class="fileIcon" :src="file" alt="">
                                  <el-progress v-else class="fileIcon" :width="50" :stroke-width="3" type="circle" :percentage="msg.percent" />
                                </div>
                                <div v-if="msg.MSGTYPE==='3'" class="chatVideo" @click="videoPreview(msg.URL)">
                                  <div v-if="(!msg.percent || msg.percent===100)">
                                    <video width="160" height="90" :src="api + msg.URL" style="objectFit: fill;" />
                                    <span class="video_size"> {{ format_File_Size(msg.FILE_SIZE) }} </span>
                                    <img class="videoPaly" :src="play" alt="">
                                  </div>
                                  <div v-else class="chatVideoProgress">
                                    <div class="fileName">
                                      <p>{{ msg.FILE_OLD_NAME }}</p>
                                      <p>{{ format_File_Size(msg.FILE_SIZE) }}</p>
                                    </div>
                                    <el-progress class="fileIcon" :width="50" :stroke-width="3" type="circle" :percentage="msg.percent" />
                                  </div>
                                </div>
                                <div v-if="msg.MSGTYPE==='2'" class="audioCon" @click="audioPreview(msg.URL)">
                                  <div class="audioIcon_left" :class="{'wifi-symbol': api + msg.URL === previewAudioUrl}">
                                    <div class="wifi-circle first" />
                                    <div class="wifi-circle second" />
                                    <div class="wifi-circle third" />
                                  </div>
                                  <!-- <audio class="audioRight" :src="api + msg.URL" controls="controls" /> -->
                                  <span class="audioTime"> {{ msg.AUDIO_TIME }}" </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="domain">
                    <div v-if="isShowRecord" class="audioRecoring">
                      <div class="status" />
                      <span class="talk">正在录音... {{ recordTime }}s</span>
                      <button class="audioCancel" @click="audioCancel">取消</button>
                      <button class="audioSure" @click="audioSure">确定</button>
                    </div>
                    <ul>
                      <li class="domainItem">
                        <img :src="g_audio" alt="" title="发送语音" @click="startRecorder">
                      </li>
                      <li class="domainItem">
                        <el-upload
                          ref="upImg"
                          :action="upUrl()"
                          name="file"
                          :show-file-list="false"
                          :before-upload="beforeAvatarUploadImg"
                          :on-success="handleAvatarSuccessImg"
                        >
                          <img :src="g_pic" alt="" title="发送图片">
                        </el-upload>
                      </li>
                      <li class="domainItem">
                        <el-upload
                          ref="upVideo"
                          :action="upUrl()"
                          name="file"
                          :show-file-list="false"
                          :before-upload="beforeAvatarUploadVideo"
                          :on-progress="uploadVideoProcess"
                          :on-success="handleAvatarSuccessVideo"
                        >
                          <img :src="g_video" alt="" title="发送视频">
                        </el-upload>
                      </li>
                      <li class="domainItem">
                        <el-upload
                          ref="upFile"
                          :action="upUrl()"
                          name="file"
                          :show-file-list="false"
                          :before-upload="beforeAvatarUploadFile"
                          :on-success="handleAvatarSuccessFile"
                          :on-progress="uploadFileProcess"
                        >
                          <img :src="g_file" alt="" title="发送文件">
                        </el-upload>
                      </li>
                    </ul>
                  </div>
                  <div class="contextAndButt">
                    <el-input
                      v-model="Content"
                      type="textarea"
                      placeholder="请输入内容"
                      maxlength="500"
                      class="textarea"
                    />
                    <button class="send" @click="sendMessage">发送</button>
                  </div>
                </div>
                <div v-if="activeTab==='single'&&activeUserOrGroup" class="rightContent">
                  <img :src="icon_single" alt="" class="pic">
                  <p class="name">{{ activeUserOrGroup.yonghuname }}</p>
                  <p class="desc">{{ activeUserOrGroup.UnitName }}</p>
                  <button class="send" @click="goMessage(activeUserOrGroup)">发消息</button>
                </div>
                <div v-if="activeTab==='group'&&activeUserOrGroup" class="rightContent">
                  <img :src="icon_group" alt="" class="pic">
                  <p class="name">{{ activeUserOrGroup.GROUP_NAME }}</p>
                  <!-- <p class="desc">{{ MEMBERLISTFilter(activeUserOrGroup.MEMBERLIST) }}</p> -->
                  <div>
                    <button class="send" @click="goMessage(activeUserOrGroup)">进入群聊</button>
                    <button class="memberManage" @click="memberManagerBtn(activeUserOrGroup)">成员管理</button>
                  </div>
                  <div>
                    <button class="send" @click="DelGroup(activeUserOrGroup)">解散群组</button>
                    <button class="memberManage" @click="reGroupNameHandle()">修改群组</button>
                  </div>
                </div>
                <!-- 成员管理抽屉 -->
                <GroupMember v-if="drawer" :drawer.sync="drawer" :active-user-or-group="activeUserOrGroup" />
                <!-- 修改群组名称 -->
                <ReGroupName v-if="reGroupNameDialog" :re-group-name-dialog.sync="reGroupNameDialog" :active-user-or-group="activeUserOrGroup" />
              </div>
            </div>
          </div>
          <el-dialog
            v-el-drag-dialog
            :visible.sync="preview"
            append-to-body
            :close-on-click-modal="true"
            custom-class="preview"
            @close="closePreview"
          >
            <div :class="'preview_content'">
              <video id="preview_video" :src="previewVideoUrl" controls="controls" />
            </div>
          </el-dialog>
        </div>
      </div>
    </div>
    <audio id="preview_audio" :src="previewAudioUrl" controls="controls" />
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import sip from '@/components/mixins/sip.js'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import add from '@/assets/images/im/add.png'
import add_h from '@/assets/images/im/add_h.png'
import message from '@/assets/images/im/message.png'
import message_h from '@/assets/images/im/message_h.png'
import group from '@/assets/images/im/group.png'
import group_h from '@/assets/images/im/group_h.png'
import search from '@/assets/images/equipment/search.png'
import icon_single from '@/assets/images/im/icon_single.png'
import icon_group from '@/assets/images/im/icon_group.png'
import g_audio from '@/assets/images/im/g_audio.png'
import g_pic from '@/assets/images/im/g_pic.png'
import g_video from '@/assets/images/im/g_video.png'
import g_file from '@/assets/images/im/g_file.png'
import file from '@/assets/images/im/file.png'
import file_fff from '@/assets/images/im/file_fff.png'
import play from '@/assets/images/im/play.png'
import { cloneDeep, get } from 'lodash'
import { api } from '@/api/env'

import '@/styles/viewer.css'
import Viewer from 'v-viewer'
import Vue from 'vue'
Vue.use(Viewer)

import Recorder from 'js-audio-recorder'
import GroupMember from './groupMember'
import ReGroupName from './reGroupName'
import OrganizePer from '@/components/organizePer'
export default {
  name: 'IM',
  components: {
    GroupMember, ReGroupName, OrganizePer
  },
  mixins: [sip],
  props: {
    isShowIM: {
      required: true,
      type: Boolean
    },
    groupId: {
      required: false,
      type: String,
      default: function() {
        return ''
      }
    },
    detail: {
      required: false,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      search, icon_single, icon_group, get, g_audio, g_pic, g_file, g_video, file, file_fff, play, api, add, add_h,
      tabs: [
        {
          name: 'message',
          image: message,
          image_h: message_h,
          title: '聊天记录'
        },
        // {
        //   name: 'single',
        //   image: single,
        //   image_h: single_h,
        //   title: '人员列表'
        // },
        {
          name: 'group',
          image: group,
          image_h: group_h,
          title: '群组列表'
        }
        // {
        //   name: 'add',
        //   image: add,
        //   image_h: add_h,
        //   title: '新增群组'
        // }
      ],
      activeTab: 'group',
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      TONE_voip: sessionStorage.get('TONE_voip'),
      filterText: '',
      userList: [],
      dialogVisible: false,
      GROUP_NAME: '',
      addImMemberList: [], // 群聊添加成员
      groupList: [],
      activeUserOrGroup: null,
      Content: '',
      list: [],
      cloneList: [],
      cloneUserList: [],
      cloneGroupList: [],
      flag: true,
      activeListItem: null,
      preview: false,
      previewVideoUrl: '',
      recorder: null,
      isShowRecord: false,
      recordTime: 0,
      previewAudioUrl: '',
      myAudio: null,
      drawer: false,
      memberList: [],
      reGroupNameDialog: false
    }
  },
  computed: {
    isShow: {
      get() {
        return this.isShowIM
      },
      set(val) {
        this.$emit('update:isShowIM', val)
      }
    },
    ...mapGetters([
      'userAgent',
      'mqResponseData',
      'imList',
      'imListActiveId',
      'userUnitIdAuth'
    ])
  },
  watch: {
    userUnitIdAuth: {
      handler(val, oldVal) {
        if (val && val.length > 0) {
          // 等获取到单位权限 再请求人员列表
          this.getUserList()
        }
      },
      immediate: true
    },
    filterText: {
      handler: function(val) {
        if (!val && this.activeTab === 'message') {
          this.list = this.cloneList
        }
        if (!val && this.activeTab === 'single') {
          this.userList = this.cloneUserList
          if (this.userList.length > 0) {
            this.activeUserOrGroup = this.userList[0]
          }
        }
        if (!val && this.activeTab === 'group') {
          this.groupList = this.cloneGroupList
          if (this.groupList.length > 0) {
            this.activeUserOrGroup = this.groupList[0]
          }
        }
      }
    },
    // 初始化占来IM弹窗，历史记录拉到底部
    isShow: {
      handler: function(val) {
        if (val) {
          this.goBottom()
        }
      }
    },
    'imListActiveId': {
      handler: function(val) {
        // 更新全局组件IM的activeListItem
        this.list = this.imList
        this.cloneList = this.imList
        for (let index = 0; index < this.list.length; index++) {
          const element = this.list[index]
          if (element.id === val) {
            this.activeListItem = element
            break
          }
        }
      }
    },
    'activeListItem.id': {
      handler: function(val) {
        // console.log(val, 'activeListItem.id')
        this.$store.commit('app/SET_IM_LIST_ACTIVE_ID', val)
      }
    },
    activeTab: {
      handler: function(val) {
        if (val === 'message' && this.activeListItem) {
          this.$nextTick(() => {
            this.$refs.scrollList.addEventListener('scroll', this.handleScroll)
          })
        }
      },
      immediate: true
    },
    mqResponseData: {
      handler: function(val) {
        // console.log(val, 'mqResponseData-IM')
        if (!val) return false
        const json = JSON.parse(val)
        // console.log(json, 999)
        // 创建群组或者新增人员到群组
        if (json.MSG_KEY === 'CreatGroup' && !json.MEMBERLIST && json.TEMP === '1') {
          // 需要将和他相关的新创建的组加到群聊组里面
          // if (json.OPERATOR !== this.TONE_voip.cmd.POLICE_ID) {
          this.getGroupList()
          // }
        }
        // 删除群组内的人员
        if (json.MSG_KEY === 'DelMember' && json.TEMP === '1') {
          this.getGroupListToTop()
          // 删除存在记录中的群组
          for (let index = 0; index < this.imList.length; index++) {
            const element = this.imList[index]
            if (element.id === json.GROUP_ID) {
              this.imList.splice(index, 1)
              this.$store.commit('app/SET_IM_LIST', this.imList)
              // 并且如果当前选中项是删除的群组，则更改选中项
              if (this.imListActiveId === json.GROUP_ID) {
                this.$store.commit('app/SET_IM_LIST_ACTIVE_ID', this.imList.length > 0 ? this.imList[0].id : '')
                this.activeListItem = null
              }
              break
            }
          }
        }
        // 更改群组名称
        if (json.MSG_KEY === 'RENAME_GROUP' && json.TEMP === '1') {
          // 修改的人，由于只能在群组页面重命名，所以，不需要调用接口。但是接受的人可能不在群组，所以综合考虑，调用接口
          this.getGroupList()
          // tab为group
          if (this.activeUserOrGroup && this.activeUserOrGroup.GROUP_ID === json.GROUP_ID) {
            this.activeUserOrGroup.GROUP_NAME = json.GROUP_NAME
          }
          // 记录列表修改组名称
          for (let index = 0; index < this.imList.length; index++) {
            const element = this.imList[index]
            if (element.id === json.GROUP_ID) {
              element.name = json.GROUP_NAME
              this.$store.commit('app/SET_IM_LIST', this.imList)
              break
            }
          }
        }
        // 解散群组给所有人推送，包括自己
        if (json.MSG_KEY === 'DelGroup' && json.TEMP === '1') {
          // 重新获取新的群组
          this.getGroupListToTop()
          // 删除存在记录中的群组
          for (let index = 0; index < this.imList.length; index++) {
            const element = this.imList[index]
            if (element.id === json.GROUP_ID) {
              this.imList.splice(index, 1)
              this.$store.commit('app/SET_IM_LIST', this.imList)
              // 并且如果当前选中项是删除的群组，则更改选中项
              if (this.imListActiveId === json.GROUP_ID) {
                this.$store.commit('app/SET_IM_LIST_ACTIVE_ID', this.imList.length > 0 ? this.imList[0].id : '')
                this.activeListItem = null
              }
              break
            }
          }
        }
        if (json.MSG_KEY === 'ReceiveMessage') {
          // flag的含义是list列表里面找不到该人员或者群组
          this.flag = true
          // 首先判断list列表里面有
          if (this.list.length > 0) {
            this.list.forEach((item) => {
              // 推送的消息是群组还是人员，如果是人员通过send去判断，如果是群组通过RECEIVER判断
              if (json.TYPE === '0') {
                if (item.id === json.SENDER) {
                  this.flag = false
                  item.MSG_LIST.push(json)
                  this.goBottom()
                  // 如果现在不是展开的情况需要额外添加提示未信息
                  if (this.imListActiveId !== json.SENDER) {
                    item.unRead++
                  }
                }
              }
              if (json.TYPE === '1') {
                // 这里讲群聊组的推送分离出来，如果是本人发送，在群聊组mq也会推送，所以之前都放到这里没问题，现在想做一个大文件上传添加上传进度的优化，放到推送里就不行了，显然
                // 推送完成再去添加进度信息就没办法显示了，所以群聊组自己发送的地方需要分离出来，放到发送时去控制
                // if (item.id === json.RECEIVER) {
                if (item.id === json.RECEIVER) {
                  this.flag = false
                  if (json.SENDER === this.TONE_voip.cmd.POLICE_ID) return false // 上传进度添加代码
                  // 避免多条出现
                  var flag = item.MSG_LIST.some((item) => {
                    return item.MSG_ID === json.MSG_ID
                  })
                  if (!flag) {
                    item.MSG_LIST.push(json)
                    this.goBottom()
                    // 如果现在不是展开的情况需要额外添加提示未信息
                    if (this.imListActiveId !== json.RECEIVER) {
                      item.unRead++
                    }
                  }
                }
              }
            })
            // list列表里面找不到该人员或者群组
            if (this.flag) {
              this.getMqChatHis(json, false)
            }
          }
          // list列表没有的情况
          if (this.list.length === 0) {
            this.getMqChatHis(json, true)
          }
        }
      },
      immediate: true
    }
  },
  created() {
    this.list = this.imList
    this.cloneList = this.imList
    for (let index = 0; index < this.list.length; index++) {
      const element = this.list[index]
      if (element.id === this.imListActiveId) {
        this.activeListItem = element
        break
      }
    }
    // this.getUserList()
    // this.getGroupList()
  },
  updated() {
    // // 聊天定位到底部
    // if (document.getElementById('chatRecord')) {
    //   const ele = document.getElementById('chatRecord')
    //   ele.scrollTop = ele.scrollHeight
    // }
    // 更改到点击进入，不然点击视预览也会出发此函数，导致滚动天到最下面
  },
  mounted() {
    this.$nextTick(() => {
      const body = document.querySelector('.map')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
    window.addEventListener('beforeunload', this.beforeunloadHandler)
  },
  destroyed() {
    window.removeEventListener('beforeunload', this.beforeunloadHandler)
  },
  methods: {
    // 监听浏览器刷新事件，刷新前先把聊天列表记录存在浏览器本地
    beforeunloadHandler(e) {
      this.$store.commit('app/SET_IM_LIST', this.list)
    },
    async handleScroll() {
      // console.log(this.activeListItem, 1)
      if (this.$refs.scrollList.scrollTop === 0) {
        this.activeListItem.loadNumber++
        // 单聊或者群聊
        const oldscrollHeight = this.$refs.scrollList.scrollHeight
        const res = await this.$api.im.GetChatMsgHis({
          Group_ID: this.activeListItem.id + '',
          BeginTime: `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          Top_N: this.activeListItem.loadNumber * 10,
          TYPE: this.activeListItem.TYPE,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          TOKEN: this.TONE_voip.cmd.TOKEN
        })
        // this.activeListItem.MSG_LIST.unshift(...(res.data.MSG_LIST))
        this.activeListItem.MSG_LIST = res.data.MSG_LIST.reverse()
        // 用最新的scrollHeight - old作为目前的scrollTop
        this.$nextTick(() => {
          this.$refs.scrollList.scrollTop = this.$refs.scrollList.scrollHeight - oldscrollHeight
        })
      }
    },
    tabClick(tab) {
      // 正在录音点击其他地方给出提示
      if (this.isShowRecord === true) {
        this.$message.closeAll()
        this.$message({
          type: 'info',
          message: '当前正在进行录音，请先结束再进行其他操作！'
        })
        return false
      }
      if (tab.name === 'add') {
        this.dialogVisible = true
        this.GROUP_NAME = ''
        this.addImMemberList = []
      } else {
        this.activeTab = tab.name
        this.filterText = ''
        if (this.activeTab === 'message') {
          this.list = this.cloneList
          this.drawer = false
        }
        if (this.activeTab === 'single') {
          this.userList = this.cloneUserList
          if (this.userList.length > 0) {
            this.activeUserOrGroup = this.userList[0]
          }
          this.drawer = false
        }
        if (this.activeTab === 'group') {
          this.groupList = this.cloneGroupList
          if (this.groupList.length > 0) {
            this.activeUserOrGroup = this.groupList[0]
          }
        }
        this.dialogVisible = false
      }
    },
    closeMeet() {
      this.isShow = false
    },
    // 关键词搜索
    searchBtn() {
      // 人员模糊搜索
      if (this.activeTab === 'message') {
        if (!this.filterText) {
          return false
        }
        this.list = this.cloneList.filter((item) => {
          return item.name.search(this.filterText) !== -1
        })
      }
      // 人员模糊搜索
      if (this.activeTab === 'single') {
        if (!this.filterText) {
          return false
        }
        this.userList = this.cloneUserList.filter((item) => {
          return item.yonghuname.search(this.filterText) !== -1
        })
        if (this.userList.length > 0) {
          this.activeUserOrGroup = this.userList[0]
        }
      }
      // 群组模糊搜索
      if (this.activeTab === 'group') {
        if (!this.filterText) {
          return false
        }
        this.groupList = this.cloneGroupList.filter((item) => {
          return item.GROUP_NAME.search(this.filterText) !== -1
        })
        if (this.groupList.length > 0) {
          this.activeUserOrGroup = this.groupList[0]
        }
      }
    },
    getUserList() {
      const auth = this.userUnitIdAuth.map(v => {
        return v.UnitId
      }).join(',')
      this.$api.common.loadYonghuDDTByUnitid({
        unitid: auth,
        type: '2'
      }).then(res => {
        this.userList = cloneDeep(res.data)
        this.cloneUserList = cloneDeep(res.data)
      })
    },
    getGroupList() {
      this.$api.im.GetGroupList({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        TEMP: '1',
        ALARM_ID: this.detail.ALARM_ID
      }).then(res => {
        const GROUPLIST = res.data.GROUPLIST.reverse()
        this.groupList = cloneDeep(GROUPLIST)
        this.cloneGroupList = cloneDeep(GROUPLIST)
        if (this.groupId) {
          this.groupList.forEach((item) => {
            if (item.GROUP_ID === `${this.groupId}`) {
              console.log(item, this.groupId, 666)
              this.activeUserOrGroup = item
              this.activeTab = 'group'
              // this.goMessage(item)
            }
          })
        }
      })
    },
    getGroupListToTop() {
      this.$api.im.GetGroupList({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        TEMP: '1',
        ALARM_ID: this.detail.ALARM_ID
      }).then(res => {
        const GROUPLIST = res.data.GROUPLIST.reverse()
        this.groupList = cloneDeep(GROUPLIST)
        this.cloneGroupList = cloneDeep(GROUPLIST)
        this.activeUserOrGroup = this.groupList[0]
        this.drawer = false
        // 定位到顶部
        this.$nextTick(() => {
          if (this.$refs.leftListBar) {
            this.$refs.leftListBar.scrollTop = 0
          }
        })
      })
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
      var MEMBER_LIST = this.addImMemberList.map(v => {
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
        this.dialogVisible = false
        this.activeTab = 'group'
      })
    },
    MEMBERLISTFilter(MEMBERLIST) {
      if (MEMBERLIST && MEMBERLIST.length > 0) {
        return MEMBERLIST.map(v => {
          return v.POLICE_NAME
        }).join('、')
      }
    },
    goBottom() {
      this.$nextTick(() => {
        // 聊天定位到底部
        if (this.$refs.scrollList) {
          setTimeout(() => {
            // console.log(this.$refs.scrollList.scrollHeight, 'scrollHeight')
            // console.log(this.$refs.scrollList.clientHeight, 'clientHeight')
            // console.log(this.$refs.scrollList.scrollTop, 'scrollTop')
            this.$refs.scrollList.scrollTop = this.$refs.scrollList.scrollHeight - this.$refs.scrollList.clientHeight
          }, 10)
        }
      })
    },
    listClick(item) {
      // 正在录音点击其他地方给出提示
      if (this.isShowRecord === true) {
        this.$message.closeAll()
        this.$message({
          type: 'info',
          message: '当前正在进行录音，请先结束再进行其他操作！'
        })
        return false
      }
      this.activeTab === 'message' ? this.activeListItem = item : this.activeUserOrGroup = item
      if (item.unRead) {
        item.unRead = 0
      }
      this.goBottom()
    },
    // mq获取聊天记录
    async getMqChatHis(json, active) {
      if (json.TYPE === '0') {
        const res = await this.$api.im.GetChatMsgHis({
          Group_ID: json.SENDER,
          BeginTime: `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          Top_N: 10,
          TYPE: '0',
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          TOKEN: this.TONE_voip.cmd.TOKEN
        })
        // list里表中没有的情况下，应该直接获取的聊天记录里面就有这条，不用自增
        // res.data.MSG_LIST.unshift(json)
        this.list.unshift({
          id: json.SENDER,
          name: json.SENDERNAME,
          TYPE: '0',
          unRead: active ? 0 : 1,
          MSG_LIST: res.data.MSG_LIST.reverse(),
          loadNumber: 1
        })
      }
      if (json.TYPE === '1') {
        const res = await this.$api.im.GetChatMsgHis({
          Group_ID: json.RECEIVER,
          BeginTime: `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          Top_N: 10,
          TYPE: '1',
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          TOKEN: this.TONE_voip.cmd.TOKEN
        })
        // res.data.MSG_LIST.unshift(json)
        this.list.unshift({
          id: json.RECEIVER,
          name: json.GROUP_NAME,
          TYPE: '1',
          unRead: active ? 0 : 1,
          MSG_LIST: res.data.MSG_LIST.reverse(),
          loadNumber: 1
        })
      }
      this.cloneList = this.list
      active ? this.activeListItem = this.list[0] : ''
      this.goBottom()
    },
    // 去message
    async goMessage(item) {
      if (this.list.length > 0) {
        const arr = this.list.filter((l) => {
          return (l.id === item.yonghuid + '' || l.id === item.GROUP_ID)
        })
        if (arr.length > 0) {
          this.activeTab = 'message'
          this.activeListItem = arr[0]
          return false
        }
      }
      // 人员
      if (item.yonghuname) {
        const res = await this.$api.im.GetChatMsgHis({
          Group_ID: item.yonghuid + '',
          BeginTime: `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          Top_N: 10,
          TYPE: '0',
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          TOKEN: this.TONE_voip.cmd.TOKEN
        })
        this.list.unshift({
          id: item.yonghuid + '',
          name: item.yonghuname,
          TYPE: '0',
          unRead: 0,
          MSG_LIST: res.data.MSG_LIST.reverse(),
          loadNumber: 1
        })
      }
      // 群聊
      if (item.GROUP_NAME) {
        const res = await this.$api.im.GetChatMsgHis({
          Group_ID: item.GROUP_ID,
          BeginTime: `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          Top_N: 10,
          TYPE: '1',
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          TOKEN: this.TONE_voip.cmd.TOKEN
        })
        this.list.unshift({
          id: item.GROUP_ID,
          name: item.GROUP_NAME,
          TYPE: '1',
          unRead: 0,
          MSG_LIST: res.data.MSG_LIST.reverse(),
          loadNumber: 1
        })
      }
      this.cloneList = this.list
      this.$store.commit('app/SET_IM_LIST', this.list)
      this.activeListItem = this.list[0]
      this.activeTab = 'message'
      this.goBottom()
      this.drawer = false
    },
    // 过滤聊天人员列表最后一跳消息
    filterLastMag(item) {
      // item.MSG_LIST.length > 0? item.MSG_LIST[item.MSG_LIST.length - 1].CONTENT : ''
      if (item.MSG_LIST.length > 0) {
        const MSGTYPE = item.MSG_LIST[item.MSG_LIST.length - 1].MSGTYPE
        if (MSGTYPE === '0') return item.MSG_LIST[item.MSG_LIST.length - 1].CONTENT
        if (MSGTYPE === '1') return '[图片]'
        if (MSGTYPE === '2') return '[语音]'
        if (MSGTYPE === '3') return '[视频]'
        if (MSGTYPE === '40') return '[文件]'
      } else {
        return ''
      }
    },
    formatTime(time) {
      if (!time) return
      const i = time.indexOf(' ')
      const date = time.substring(0, i)
      const hms = time.substring(i + 1, time.length)
      if (parseTime(new Date(), '{y}-{m}-{d}') === date) {
        return hms
      } else {
        return date
      }
    },
    // 发送信息按钮
    sendMessage() {
      if (!this.Content) {
        this.$message.closeAll()
        this.$message.warning('不能发送空白信息！')
        return false
      }
      this.$api.im.SendMessage({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Type: this.activeListItem.TYPE,
        Sender: this.TONE_voip.cmd.POLICE_ID,
        Receiver: this.activeListItem.id,
        MsgType: '0',
        Content: this.Content
      }).then(res => {
        console.log(res.data, 'SendMessage')
        if (res.data.msg === '操作成功!') {
          // 群聊mq会推消息，在mq去添加
          // if (this.activeListItem.TYPE === '0') {
          this.activeListItem.MSG_LIST.push({
            CONTENT: this.Content,
            MSGTYPE: '0',
            RECEIVER: this.activeListItem.id,
            SENDER: this.TONE_voip.cmd.POLICE_ID,
            SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
            SEND_TIME: res.data.operTime,
            TYPE: this.activeListItem.TYPE
          })
          this.cloneList = this.list
          // }
          this.Content = ''
          this.goBottom()
        }
      })
    },
    downFile(msg) {
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style = 'display: none'
      const url = api + msg.URL
      a.href = url
      a.download = msg.FILE_OLD_NAME
      a.click()
      a.remove()
    },
    upUrl() {
      return `${api}/rstoneCmd/Service/UpLoad`
    },
    format_File_Size(ppp) {
      if (ppp / 1024 < 1024) {
        const size = ppp / 1024
        return `${size.toFixed(0)}KB`
      }
      if (ppp / 1024 > 1024 && ppp / 1024 / 1024 < 1024) {
        const size = ppp / 1024 / 1024
        return `${size.toFixed(0)}MB`
      }
      if (ppp / 1024 / 1024 > 1024) {
        const size = ppp / 1024 / 1024 / 1024
        return `${size.toFixed(0)}GB`
      }
    },
    // 发送图片
    beforeAvatarUploadImg(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isJPEG = testmsg === 'jpeg'
      const isJPG = testmsg === 'jpg'
      const isPNG = testmsg === 'png'
      const isGIF = testmsg === 'gif'
      const isLt8M = file.size / 1024 / 1024 < 8
      if (!isJPG && !isPNG && !isGIF && !isJPEG) {
        this.$message.warning('图片只能是 JPG、JPEG、PNG、GIF 格式!')
        return false
      }
      if (!isLt8M) {
        this.$message.warning('图片大小不能超过 8MB!')
        return false
      }
      return (isJPG || isPNG || isGIF || isJPEG) && isLt8M
    },
    handleAvatarSuccessImg(response) {
      console.log(response.obj[0].newFile, 789)
      this.$api.im.SendMessage({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Type: this.activeListItem.TYPE,
        Sender: this.TONE_voip.cmd.POLICE_ID,
        Receiver: this.activeListItem.id,
        MsgType: '1',
        URL: response.obj[0].newFile
      }).then(res => {
        console.log(res.data, 'SendMessage')
        if (res.data.msg === '操作成功!') {
          // 群聊mq会推消息，在mq去添加
          // if (this.activeListItem.TYPE === '0') {
          this.activeListItem.MSG_LIST.push({
            URL: response.obj[0].newFile,
            MSGTYPE: '1',
            RECEIVER: this.activeListItem.id,
            SENDER: this.TONE_voip.cmd.POLICE_ID,
            SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
            SEND_TIME: res.data.operTime,
            TYPE: this.activeListItem.TYPE
          })
          this.cloneList = this.list
          // }
          this.Content = ''
          this.goBottom()
        }
      })
    },
    // 发送文件
    beforeAvatarUploadFile(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isPdf = testmsg === 'pdf'
      const isZip = testmsg === 'zip'
      const isDoc = testmsg === 'doc'
      const isDocx = testmsg === 'docx'
      const isXls = testmsg === 'xls'
      const isXlsx = testmsg === 'xlsx'
      const isPpt = testmsg === 'ppt'
      const isRar = testmsg === 'rar'
      const isLt8M = file.size / 1024 / 1024 < 30
      if (!isPdf && !isZip && !isDoc && !isPpt && !isRar && !isDocx && !isXls && !isXlsx) {
        this.$message.warning('上传文件只能是 pdf、zip、doc、docx、xls、xlsx、ppt、rar格式!')
        return false
      }
      if (!isLt8M) {
        this.$message.warning('上传文件大小不能超过 30MB!')
        return false
      }
      return (isPdf || isZip || isDoc || isPpt || isRar || isDocx || isXls || isXlsx) && isLt8M
    },
    uploadFileProcess(event, file, fileList) {
      // console.log(event.percent, 666)
      // console.log(event, 7)
      // console.log(file, 8)
      // 第一次触发添加，随后触发则是改变进度,同时上传多个文件时进度互补影响
      let flag = true
      this.activeListItem.MSG_LIST.forEach((item) => {
        // console.log(file.uid, 1)
        // console.log(item.uid, 2)
        if (file.uid === item.uid) {
          item.percent = Number(event.percent.toFixed(0))
          flag = false
        }
      })
      if (flag) {
        this.activeListItem.MSG_LIST.push({
          URL: '',
          FILE_OLD_NAME: file.name,
          MSGTYPE: '40',
          RECEIVER: this.activeListItem.id,
          SENDER: this.TONE_voip.cmd.POLICE_ID,
          SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
          SEND_TIME: '',
          TYPE: this.activeListItem.TYPE,
          FILE_SIZE: file.size,
          percent: Number(event.percent.toFixed(0)),
          uid: file.uid
        })
        this.cloneList = this.list
        this.Content = ''
        this.goBottom()
      }
    },
    handleAvatarSuccessFile(response, file) {
      this.$api.im.SendMessage({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Type: this.activeListItem.TYPE,
        Sender: this.TONE_voip.cmd.POLICE_ID,
        Receiver: this.activeListItem.id,
        MsgType: '40',
        URL: response.obj[0].newFile,
        FILE_OLD_NAME: response.obj[0].oldfile,
        FILE_SIZE: file.size
      }).then(res => {
        console.log(res.data, 'SendMessage')
        if (res.data.msg === '操作成功!') {
          // 群聊mq会推消息，在mq去添加,修改：都在这里添加，原因是为了控制群组发送大文件提示进度
          this.activeListItem.MSG_LIST.forEach((item) => {
            if (file.uid === item.uid) {
              item.URL = response.obj[0].newFile
              item.SEND_TIME = res.data.operTime
            }
          })
          // if (this.activeListItem.TYPE === '0') {
          //   this.activeListItem.MSG_LIST.push({
          //     URL: response.obj[0].newFile,
          //     FILE_OLD_NAME: response.obj[0].oldfile,
          //     MSGTYPE: '40',
          //     RECEIVER: this.activeListItem.id,
          //     SENDER: this.TONE_voip.cmd.POLICE_ID,
          //     SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
          //     SEND_TIME: res.data.operTime,
          //     TYPE: this.activeListItem.TYPE,
          //     FILE_SIZE: file.size
          //   })
          //   this.cloneList = this.list
          // }
          // this.Content = ''
          // this.goBottom()
        }
      })
    },
    // 发送视频
    beforeAvatarUploadVideo(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isMp4 = testmsg === 'mp4'
      const isLt30M = file.size / 1024 / 1024 < 30
      if (!isMp4) {
        this.$message.warning('上传文件只能是 mp4格式!')
        return false
      }
      if (!isLt30M) {
        this.$message.warning('上传文件大小不能超过 30MB!')
        return false
      }
      return isMp4 && isLt30M
    },
    uploadVideoProcess(event, file, fileList) {
      // console.log(event.percent, 666)
      // console.log(event, 7)
      // console.log(file, 8)
      // 第一次触发添加，随后触发则是改变进度,同时上传多个文件时进度互补影响
      let flag = true
      this.activeListItem.MSG_LIST.forEach((item) => {
        if (file.uid === item.uid) {
          item.percent = Number(event.percent.toFixed(0))
          flag = false
        }
      })
      if (flag) {
        // var remoteStream = new MediaStream()
        // remoteStream = file.raw
        // mediaElement.srcObject = remoteStream
        this.activeListItem.MSG_LIST.push({
          URL: '',
          FILE_OLD_NAME: file.name,
          MSGTYPE: '3',
          RECEIVER: this.activeListItem.id,
          SENDER: this.TONE_voip.cmd.POLICE_ID,
          SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
          SEND_TIME: '',
          TYPE: this.activeListItem.TYPE,
          FILE_SIZE: file.size,
          percent: Number(event.percent.toFixed(0)),
          uid: file.uid
        })
        this.cloneList = this.list
        this.Content = ''
        this.goBottom()
      }
    },
    handleAvatarSuccessVideo(response, file) {
      // const url = URL.createObjectURL(file.raw)
      // var audioElement = new Audio(url)
      // audioElement.addEventListener('loadedmetadata', function() {
      //   const playTime = audioElement.duration // playTime就是当前视频长度
      //   console.log(playTime, 999)
      // })
      this.$api.im.SendMessage({
        TOKEN: this.TONE_voip.cmd.TOKEN,
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Type: this.activeListItem.TYPE,
        Sender: this.TONE_voip.cmd.POLICE_ID,
        Receiver: this.activeListItem.id,
        MsgType: '3',
        URL: response.obj[0].newFile,
        FILE_SIZE: file.size
      }).then(res => {
        console.log(res.data, 'SendMessage')
        if (res.data.msg === '操作成功!') {
          // 群聊mq会推消息，在mq去添加
          this.activeListItem.MSG_LIST.forEach((item) => {
            if (file.uid === item.uid) {
              item.URL = response.obj[0].newFile
              item.SEND_TIME = res.data.operTime
            }
          })
          // if (this.activeListItem.TYPE === '0') {
          //   this.activeListItem.MSG_LIST.push({
          //     URL: response.obj[0].newFile,
          //     MSGTYPE: '3',
          //     RECEIVER: this.activeListItem.id,
          //     SENDER: this.TONE_voip.cmd.POLICE_ID,
          //     SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
          //     SEND_TIME: res.data.operTime,
          //     TYPE: this.activeListItem.TYPE,
          //     FILE_SIZE: file.size
          //   })
          //   this.cloneList = this.list
          // }
          // this.Content = ''
          // this.goBottom()
        }
      })
    },
    videoPreview(url) {
      this.preview = true
      this.previewVideoUrl = api + url
      this.$nextTick(() => {
        const myVideo = document.getElementById('preview_video')
        myVideo.play()
      })
    },
    closePreview() {
      this.$nextTick(() => {
        const myVideo = document.getElementById('preview_video')
        myVideo.pause()
      })
    },
    endedFunc() {
      console.log('ended')
      this.previewAudioUrl = ''
      this.myAudio = null
    },
    audioPreview(url) {
      if (!this.previewAudioUrl) { // 不在在音频
        this.previewAudioUrl = api + url
        this.$nextTick(() => {
          this.myAudio = document.getElementById('preview_audio')
          this.myAudio.play()
          this.myAudio.addEventListener('ended', this.endedFunc)
        })
      } else if (this.previewAudioUrl && this.previewAudioUrl === api + url) { // 存在但是还是自己(点击了正在播放或者暂停的语音)
        if (this.myAudio.paused) { // 暂停状态
          this.myAudio.play()
        } else { // 播放状态
          this.myAudio.pause()
          // 如果想要暂停完成后再次重新播放，添加一下代码，如果暂停完成后想接着播放，将下面一行代码删除即可，这样即不会出现暂停状态的情况
          this.previewAudioUrl = ''
        }
      } else if (this.previewAudioUrl && this.previewAudioUrl !== api + url) { // 存在但是是别的语音(点击了正在播放以外的语音)
        // 先暂停上一条语音并且移除监听事件ended，并手动清空此对象
        this.myAudio.pause()
        this.myAudio.removeEventListener('ended', this.endedFunc)
        this.myAudio = null
        // 播放点击的语音
        this.previewAudioUrl = api + url
        this.$nextTick(() => {
          this.myAudio = document.getElementById('preview_audio')
          this.myAudio.play()
          this.myAudio.addEventListener('ended', this.endedFunc)
        })
      }
    },
    // 开始录音
    startRecorder() {
      if (this.isShowRecord) return false
      this.recorder = new Recorder({
        sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
        sampleRate: 16000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
        numChannels: 1 // 声道，支持 1 或 2， 默认是1
        // compiling: false,(0.x版本中生效,1.x增加中)  // 是否边录边转换，默认是false
      })
      // 录音过程
      this.recorder.onprogress = (params) => {
        this.recordTime = params.duration.toFixed(0)
        if (this.recordTime === '60') {
          this.audioSure()
        }
      }
      this.recorder.start().then(() => {
        this.isShowRecord = true
      }, (error) => {
        console.log(`${error.name} : ${error.message}`)
      })
    },
    audioSure() {
      if (this.recordTime < 1) {
        this.$message.closeAll()
        this.$message.warning('语音时间不能小于1s！')
        this.audioCancel()
        return false
      }
      this.recorder.stop()
      this.isShowRecord = false
      // this.recorder.play()
      const formData = new FormData()
      const blob = this.recorder.getWAVBlob()// 获取wav格式音频数据
      const AUDIO_TIME = this.recorder.duration.toFixed(0)
      // 此处获取到blob对象后需要设置fileName满足当前项目上传需求，其它项目可直接传把blob作为file塞入formData
      const newbolb = new Blob([blob], { type: 'audio/wav' })
      const fileOfBlob = new File([newbolb], new Date().getTime() + '.wav')
      formData.append('file', fileOfBlob)
      this.$api.im.UpLoad(formData).then(response => {
        console.log(response.data.obj[0].newFile, 678)
        this.$api.im.SendMessage({
          TOKEN: this.TONE_voip.cmd.TOKEN,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          Type: this.activeListItem.TYPE,
          Sender: this.TONE_voip.cmd.POLICE_ID,
          Receiver: this.activeListItem.id,
          MsgType: '2',
          URL: response.data.obj[0].newFile,
          AUDIO_TIME: AUDIO_TIME
        }).then(res => {
          console.log(res.data, 'SendMessage')
          if (res.data.msg === '操作成功!') {
          // 群聊mq会推消息，在mq去添加
            // if (this.activeListItem.TYPE === '0') {
            this.activeListItem.MSG_LIST.push({
              URL: response.data.obj[0].newFile,
              MSGTYPE: '2',
              RECEIVER: this.activeListItem.id,
              SENDER: this.TONE_voip.cmd.POLICE_ID,
              SENDERNAME: this.TONE_voip.cmd.POLICE_NAME,
              SEND_TIME: res.data.operTime,
              TYPE: this.activeListItem.TYPE,
              AUDIO_TIME: AUDIO_TIME
            })
            this.cloneList = this.list
            // }
            this.Content = ''
            this.goBottom()
          }
        })
      })
      // 销毁实例
      this.recorder.destroy().then(() => {
        this.recorder = null
        this.recordTime = 0
      })
    },
    audioCancel() {
      this.recorder.stop()
      this.isShowRecord = false
      // 销毁实例
      this.recorder.destroy().then(() => {
        this.recorder = null
        this.recordTime = 0
      })
    },
    memberManagerBtn(groupInfo) {
      this.drawer = true
      // this.$api.im.GetGroupMember({
      //   TOKEN: this.TONE_voip.cmd.TOKEN,
      //   PoliceNo: this.TONE_voip.cmd.POLICE_ID,
      //   GROUP_ID: groupInfo.GROUP_ID
      // }).then(res => {
      //   this.memberList = res.data.MEMBERLIST
      // })
    },
    // 解散群组
    DelGroup() {
      this.$confirm(`此操作将解散群组 ${this.activeUserOrGroup.GROUP_NAME}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api.im.DelGroup({
          TOKEN: this.TONE_voip.cmd.TOKEN,
          PoliceNo: this.TONE_voip.cmd.POLICE_ID,
          GROUP_ID: this.activeUserOrGroup.GROUP_ID
        }).then(res => {
          if (res.data.result) {
            // 解散群组mq会推送组内的所有人员，这里就不需要给父组件标识了
            // this.$emit('update:delGroupFlag', true)
          } else {
            this.$message({
              type: 'info',
              message: '解散群组失败'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消解散群组'
        })
      })
    },
    // 修改群组
    reGroupNameHandle() {
      this.reGroupNameDialog = true
    }
  }
}
</script>
<style lang="scss" scoped>
.pj_dialog{
  #preview_audio {
    display: none;
  }
  width: 980px;
  height: 500px;
  color: #fff;
  position: absolute;
  top: calc(50% - 250px);
  left: calc(50% - 490px);
  z-index: 100;
  .pj_dialog_tit{
    box-sizing: content-box;
    padding: 5px 10px;
    height: 30px; line-height: 30px;
    border-bottom: 1px solid #497a7a;
    font-size: 14px;
    font-family: PingFang SC;
    .tit{float: left;}
    .close{
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 30px;
      width: 30px;
      height: 30px;
      text-align: right;
    }
  }
  .pj_con{
    width: 100%;
    height: calc(100% - 40px);
    .pj_h {
      .title {
        padding-top: 10px;
        &.title2 {
          margin-top: 10px;
        }
      }
    }
    .pj_con_c{
      height: calc(100%);
      // margin-top: 10px;
      #preview_audio {
        display: none;
      }
      ::v-deep .meetWrap {
        // height: 500px;
        width: 100%;
        height: 100%;
        .inner {
          display: none;
        }
        .out {
          width: 100%;
          height: 100%;
          .tabs {
            float: left;
            width: 52px;
            height: 100%;
            border-right: 1px solid #497a7a;
            position: relative;
            .tab {
              width: 100%;
              height: 52px;
              text-align: center;
              cursor: pointer;
              .tabImage {
                margin-top: 15px;
                width: 22px;
                height: 22px;
              }
            }
          }
          .noCreated {
            float: left;
            width: calc(100% - 52px);
            height: 100%;
            .left {
              width: 224px;
              height: 100%;
              border-right: 1px solid #497a7a;
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
              .list {
                height: calc(100% - 30px);
                overflow: auto;
                .listItem {
                  width: 100%;
                  height: 64px;
                  padding: 10px;
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
                        width: calc(100% - 50px);
                      }
                      .time {
                        float: right;
                        font-size: 12px;
                        font-family: ArialMT;
                        color: rgba(250, 253, 255, 0.6);
                      }
                      .picture {
                        width: 18px;
                        height: 18px;
                        float: right;
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
            .right {
              position: relative;
              width: calc(100% - 224px);
              height: 100%;
              .rightContent {
                text-align: center;
                height: 100%;
                .pic {
                  width: 72px;
                  height: 72px;
                  margin-top: 122px;
                }
                .name {
                  font-size: 14px;
                  font-family: MicrosoftYaHei;
                  color: #FAFDFF;
                  margin-top: 10px;
                }
                .desc {
                  font-size: 12px;
                  font-family: MicrosoftYaHei;
                  color: rgba(250, 253, 255, 0.6);
                  margin-top: 6px;
                  padding: 0 20px;
                  line-height: 1.5;
                }
                // .send {
                //   height: 28px;
                //   background: linear-gradient(0deg, #2A7AA2, #055984);
                //   border: 1px solid #01CFFF;
                //   border-radius: 2px;
                //   color: #00d8ff;
                //   cursor: pointer;
                //   width: 96px;
                //   margin-top: 20px;
                // }
                .send, .memberManage {
                  height: 28px;
                  background: linear-gradient(0deg, #2A7AA2, #055984);
                  border: 1px solid #01CFFF;
                  border-radius: 2px;
                  color: #00d8ff;
                  cursor: pointer;
                  width: 96px;
                  margin-top: 20px;
                }
                .memberManage {
                  margin-left: 10px;
                }
              }
              .rightContentHis {
                height: 100%;
                .send {
                  height: 28px;
                  background: linear-gradient(0deg, #2A7AA2, #055984);
                  border: 1px solid #01CFFF;
                  border-radius: 2px;
                  color: #00d8ff;
                  cursor: pointer;
                  width: 96px;
                  margin-top: 20px;
                }
                .titleAndHis {
                  height: 280px;
                  .title {
                    height: 30px;
                    font-size: 14px;
                    font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
                    font-weight: bold;
                    color: #FAFDFF;
                    padding: 0 12px;
                    line-height: 30px;
                    float: left;
                  }
                  .chat {
                    height: 100%;
                    padding: 30px 10px 10px 10px;
                    .chatContainer {
                      height: 100%;
                      overflow: auto;
                    }
                    ul {
                      // height: auto;
                    }
                    .singleChat {
                      width: 100%;
                      margin-bottom: 15px;
                      &:last-child {
                        margin-bottom: 0px;
                      }
                      .singleChatContainer1 {
                        width: 100%;
                        padding-right: 100px;
                        .chatPic {
                          float: left;
                          width: 32px;
                          height: 32px;
                        }
                        .chatRight {
                          float: left;
                          width: calc(100% - 32px);
                          .nameTime {
                            margin-top: 2px;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: rgba(250, 253, 255, 0.8);
                            margin-left: 10px;
                            .name {
                              margin-right: 5px;
                            }
                          }
                          .chatCon {
                            max-width: 100%;
                            word-wrap: break-word;
                            cursor: pointer;
                            display: inline-block;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: #FAFDFF;
                            background: rgba(114, 178, 208, 0.4);
                            padding: 4px 8px;
                            line-height: 1.5;
                            margin-top: 4px;
                            margin-left: 10px;
                            position: relative;
                            &:before {
                              content: '';
                              position: absolute;
                              height: 0;
                              width: 0;
                              top: 6px;
                              left: -12px;
                              border: solid transparent;
                              border-width: 6px;
                              border-right-color: rgba(114, 178, 208, 0.4);
                            }
                            .fileName {
                              float: right;
                              max-width: 150px;
                            }
                            .fileIcon {
                              float: left;
                              width: 50px;
                              margin-right: 5px;
                              margin-left: -6px;
                            }
                          }
                          .audioCon {
                            width: 100px;
                            cursor: pointer;
                            display: inline-block;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: #FAFDFF;
                            background: rgba(114, 178, 208, 0.4);
                            padding: 4px 8px;
                            margin-top: 4px;
                            margin-left: 10px;
                            position: relative;
                            &:before {
                              content: '';
                              position: absolute;
                              height: 0;
                              width: 0;
                              top: 6px;
                              left: -12px;
                              border: solid transparent;
                              border-width: 6px;
                              border-right-color: rgba(114, 178, 208, 0.4);
                            }
                            .audioleft {
                              display: none;
                            }
                            .audioIcon_right {
                              width: 18px;
                              height: 18px;
                              float: left;
                              box-sizing: border-box;
                              overflow: hidden;
                              transform: rotate(135deg) translate(-2px, -2px);
                              .wifi-circle {
                                border: 1px solid #FAFDFF;
                                border-radius: 50%;
                                position: absolute;
                              }
                              .first {
                                width: 3px;
                                height: 3px;
                                background:#FAFDFF;
                                top: 15px;
                                left: 15px;
                              }
                              .second {
                                width: 10px;
                                height: 10px;
                                top: 11px;
                                left: 11px;
                              }
                              .third {
                                width: 16px;
                                height: 16px;
                                top: 7px;
                                left: 7px;
                              }
                            }
                            .wifi-symbol {
                              .second {
                                animation: fadeInOut 1s infinite 0.2s;
                              }
                              .third {
                                animation: fadeInOut 1s infinite 0.4s;
                              }
                              @keyframes fadeInOut {
                                0% {
                                  opacity: 0; /*初始状态 透明度为0*/
                                }
                                100% {
                                  opacity: 1; /*结尾状态 透明度为1*/
                                }
                              }
                            }
                            .audioTime {
                              margin-top: 2px;
                              float: left;
                            }
                          }
                          .chatImg {
                            cursor: pointer;
                            display: inline-block;
                            padding: 4px 0px;
                            line-height: 1.5;
                            margin-top: 4px;
                            margin-left: 10px;
                            height: 90px;
                            img {
                              height: 90px;
                            }
                          }
                          .chatVideo {
                            cursor: pointer;
                            float: left;
                            padding: 4px 0px;
                            margin-top: 4px;
                            margin-left: 10px;
                            position: relative;
                            video {
                              // max-height: 100px;
                              // object-fit: fill;
                            }
                            .videoPaly {
                              position: absolute;
                              width: 30px;
                              height: 30px;
                              left: 50%;
                              margin-left: -15px;
                              top: 50%;
                              margin-top: -15px;
                            }
                            .video_size {
                              position: absolute;
                              color: #fff;
                              left: 5px;
                              bottom: 10px;
                              font-size: 12px;
                            }
                          }
                        }
                      }
                      .singleChatContainer2 {
                        width: 100%;
                        padding-left: 100px;
                        display: flex;
                        flex-direction: row-reverse;
                        .chatPic {
                          width: 32px;
                          height: 32px;
                        }
                        .chatRight {
                          width: calc(100% - 32px);
                          .nameTime {
                            margin-top: 2px;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: rgba(250, 253, 255, 0.8);
                            margin-right: 10px;
                            display: flex;
                            flex-direction: row-reverse;
                            .name {
                              margin-left: 5px;
                            }
                          }
                          .chatCon {
                            max-width: 100%;
                            word-wrap: break-word;
                            cursor: pointer;
                            float: right;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: #002233;
                            background: #52D9F5;
                            padding: 4px 8px;
                            line-height: 1.5;
                            margin-top: 4px;
                            margin-right: 10px;
                            position: relative;
                            &:before {
                              content: '';
                              position: absolute;
                              height: 0;
                              width: 0;
                              top: 6px;
                              right: -12px;
                              border: solid transparent;
                              border-width: 6px;
                              border-left-color: #52D9F5;
                            }
                            .fileName {
                              float: left;
                              max-width: 150px;
                            }
                            .fileIcon {
                              float: right;
                              width: 50px;
                              margin-left: 5px;
                              margin-right: -6px;
                            }
                          }
                          .audioCon {
                            width: 100px;
                            cursor: pointer;
                            float: right;
                            font-size: 12px;
                            font-family: MicrosoftYaHei;
                            color: #002233;
                            background: #52D9F5;
                            padding: 4px 8px;
                            margin-top: 4px;
                            margin-right: 10px;
                            position: relative;
                            &:before {
                              content: '';
                              position: absolute;
                              height: 0;
                              width: 0;
                              top: 6px;
                              right: -12px;
                              border: solid transparent;
                              border-width: 6px;
                              border-left-color: #52D9F5;
                            }
                            .audioRight {
                              display: none;
                            }
                            .audioIcon_left {
                              width: 18px;
                              height: 18px;
                              float: right;
                              box-sizing: border-box;
                              overflow: hidden;
                              transform: rotate(315deg) translate(-2px, -2px);
                              .wifi-circle {
                                border: 1px solid #000;
                                border-radius: 50%;
                                position: absolute;
                              }
                              .first {
                                width: 3px;
                                height: 3px;
                                background: #000;
                                top: 15px;
                                left: 15px;
                              }
                              .second {
                                width: 10px;
                                height: 10px;
                                top: 11px;
                                left: 11px;
                              }
                              .third {
                                width: 16px;
                                height: 16px;
                                top: 7px;
                                left: 7px;
                              }
                            }
                            .wifi-symbol {
                              .second {
                                animation: fadeInOut 1s infinite 0.2s;
                              }
                              .third {
                                animation: fadeInOut 1s infinite 0.4s;
                              }
                              @keyframes fadeInOut {
                                0% {
                                  opacity: 0; /*初始状态 透明度为0*/
                                }
                                100% {
                                  opacity: 1; /*结尾状态 透明度为1*/
                                }
                              }
                            }
                            .audioTime {
                              margin-top: 2px;
                              float: right;
                            }
                          }
                          .chatImg {
                            cursor: pointer;
                            float: right;
                            padding: 4px 0px;
                            margin-top: 4px;
                            margin-right: 10px;
                            img {
                              height: 90px;
                            }
                          }
                          .chatVideo {
                            cursor: pointer;
                            float: right;
                            padding: 4px 0px;
                            margin-top: 4px;
                            margin-right: 10px;
                            position: relative;
                            video {
                              // max-height: 100px;
                            }
                            .videoPaly {
                              position: absolute;
                              width: 30px;
                              height: 30px;
                              left: 50%;
                              margin-left: -15px;
                              top: 50%;
                              margin-top: -15px;
                            }
                            .video_size {
                              position: absolute;
                              color: #fff;
                              right: 5px;
                              bottom: 10px;
                              font-size: 12px;
                            }
                            .chatVideoProgress {
                              cursor: pointer;
                              float: right;
                              font-size: 12px;
                              font-family: MicrosoftYaHei;
                              color: #002233;
                              background: #52D9F5;
                              padding: 4px 8px;
                              line-height: 1.5;
                              margin-top: 4px;
                              position: relative;
                              &:before {
                                content: '';
                                position: absolute;
                                height: 0;
                                width: 0;
                                top: 6px;
                                right: -12px;
                                border: solid transparent;
                                border-width: 6px;
                                border-left-color: #52D9F5;
                              }
                              .fileName {
                                float: left;
                                max-width: 150px;
                              }
                              .fileIcon {
                                float: right;
                                width: 50px;
                                margin-left: 5px;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                .domain {
                  width: 100%;
                  height: 40px;
                  border-top: 1px solid #497a7a;
                  border-bottom: 1px solid #497a7a;
                  background-color: rgba(0, 85, 128, 0.6);
                  position: relative;
                  .domainItem {
                    float: left;
                    height: 40px;
                    line-height: 40px;
                    padding: 0 10px;
                    cursor: pointer;
                  }
                  .audioRecoring {
                    position: absolute;
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                    background-color: rgba(0, 85, 128, 0.3);
                    top: -40px;
                    .status {
                      width: 10px;
                      height: 10px;
                      background: #00d8ff;
                      border-radius: 50%;
                      float: left;
                      margin: 15px 5px 0 13px;
                    }
                    .talk {
                      float: left;
                      color: #00d8ff;
                    }
                    .audioSure {
                      float: right;
                      height: 24px;
                      background: linear-gradient(0deg, #2A7AA2, #055984);
                      border: 1px solid #01CFFF;
                      border-radius: 2px;
                      color: #00d8ff;
                      cursor: pointer;
                      width: 60px;
                      margin-top: 8px;
                    }
                    .audioCancel {
                      float: right;
                      height: 24px;
                      background: linear-gradient(0deg, #2A7AA2, #055984);
                      border: 1px solid #01CFFF;
                      border-radius: 2px;
                      color: #00d8ff;
                      cursor: pointer;
                      width: 60px;
                      margin: 8px;
                    }
                  }
                }
                .contextAndButt {
                  height: 130px;
                  position: relative;
                  .textarea {
                    height: 100%;
                    .el-textarea__inner {
                      height: 100%;
                      border-radius: 0px;
                      background-color: rgba(0, 85, 128, 0.6);
                      border:none;
                      color: #fafdff;
                      padding: 5px 10px;
                    }
                  }
                  .send {
                    position: absolute;
                    right: 10px;
                    bottom: 5px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
