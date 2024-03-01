<template>
  <div class="OrganizePer">
    <div class="dialog-con">
      <div class="left dialog-con_left">
        <el-input v-model.trim="filterText" class="filter" type="text" placeholder="关键字搜索" @keyup.enter.native="searchBtn">
          <img slot="suffix" :src="search" alt="" class="img" @click="searchBtn">
        </el-input>
        <div class="treeBox">
          <VueEasyTree
            ref="tree1"
            class="t01_checkBox_tree"
            :data="userTree"
            :default-expanded-keys="[String(TONE_voip.cmd.UNIT_ID)]"
            node-key="UnitId"
            :props="unitProps"
            :filter-node-method="filterNode"
            :icon-class="'el-icon-arrow-right'"
            height="calc(100%)"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span class="ellipsis" :style="{ color: data.type=='people'? (data.yonghuzxbj == '1' ? '#67C23A':'#999'):'#01d3f9',flex:1,width:'146px'}" :title="data.UnitName">{{ data.UnitName }}</span>
              <span v-if="data.type=='people'">
                <i v-if="data.yonghuid!=userInfo.userName" class="el-icon-plus tree-btn" @click="addMeetingMember(data, node)" />
              </span>
            </span>
          </VueEasyTree>
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
              <span class="name ellipsis" :style="{ color: data.yonghuzxbj == '1' ||data.status||data.devId==='phone'? '#67C23A':'#999',flex:1,width:'146px'}" :title="data.UnitName"><i :class="data.type== 'dev'? 'el-icon-s-platform' :''" />{{ data.userName ||data.UnitName }}</span>
              <i class="tree-btn el-icon-minus" @click="munusMeetingMember(data)" />
            </span>
          </VueEasyTree>
          <!-- <ul class="add-member-list">
            <li v-for="(item,i) in addMeetingMemberListClone" :key="item.userId">
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
export default {
  name: 'OrganizePer',
  props: {
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
    }
  },
  data() {
    return {
      search,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      TONE_voip: sessionStorage.get('TONE_voip'),
      unitProps: {
        label: 'UnitName',
        children: 'children'
      },
      filterText: '',
      filterTextAddList: '',
      addMeetingMemberListClone: cloneDeep(this.addMeetingMemberList)
    }
  },
  computed: {
    ...mapGetters([
      'userTree',
      'checkResourcelist',
      'mqResponseData'
    ])
  },
  watch: {
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        const _this = this
        const json = JSON.parse(val)
        // 用户上下线状态 右侧列表更新
        if (json.MSG_KEY === 'POLICE_STATUS') {
          _this.addMeetingMemberListClone.forEach((item, index) => {
            if (Number(item.userId) === Number(json.POLICE_ID)) {
              _this.$set(_this.addMeetingMemberListClone[index], 'yonghuzxbj', Number(json.STATUS))
            }
          })
        }
      },
      immediate: true
    },
    filterText: {
      handler: function(val) {
        !val ? this.$refs.tree1.filter(val) : ''
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
    }
  },
  methods: {
    //
    filterNode2(value, data) {
      if (!value) return true
      return data.userName.indexOf(value) !== -1
    },
    // 添加会议成员
    addMeetingMember(data, node) {
      var obj = {
        userId: data.yonghuid,
        userName: data.UnitName,
        yonghuzxbj: data.yonghuzxbj
      }
      if (data.devId) {
        obj.devId = data.devId
      }
      if (data.type === 'dev') {
        obj.devId = data.UnitId || data.devId
      }
      for (let i = 0; i < this.addMeetingMemberList.length; i++) {
        if (String(this.addMeetingMemberList[i].userId) === String(obj.userId)) {
          this.$alert('该用户已添加', '提示', {
            type: 'warning'
          })
          return false
        }
      }
      if (this.dialogType === 'invite') {
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
    },
    filterNode(value, data) {
      if (!value) return true
      return data.UnitName.indexOf(value) !== -1
    },
    // 关键词搜索
    searchBtn() {
      this.$refs.tree1.filter(this.filterText)
    },
    // 已经添加的人员关键词搜索
    searchBtnAddList() {
      // 模糊搜索
      this.$refs.tree3.filter(this.filterTextAddList)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
