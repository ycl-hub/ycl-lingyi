<template>
  <div class="layout">
    <div class="layout-container">
      <Header />
      <keep-alive>
        <router-view />
      </keep-alive>
      <Sector v-if="isShowSector" />
      <!-- <transition name="fade-transform" mode="out-in">
        <router-view :key="key" class="app-content" />
      </transition> -->
    </div>
  </div>
</template>

<script>
import Header from '@/components/header/index'
import Sector from '@/components/sector'
import sip from '@/components/mixins/sip.js'
import mq from '@/components/mixins/mq.js'
import { sessionStorage } from '@/utils/storage'
import { flatUserTransTree, flatDevTransTree, queryPath, parseTime, getName } from '@/utils'
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash'
export default {
  name: 'Layout',
  components: {
    Header,
    Sector
  },
  mixins: [sip, mq],
  data() {
    return {
      isShowSector: true,
      TONE_voip: sessionStorage.get('TONE_voip'),
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      pid: 0,
      DictionaryTree: {} // 组织架构树字典
    }
  },
  computed: {
    ...mapGetters([
      'mqResponseData',
      'userTree',
      'devTree',
      'callList'
    ])
  },
  watch: {
    $route: {
      handler: function(route) {
        const path = route.path
        if (path === '/dashboard') {
          this.isShowSector = false
        } else if (queryPath('kjcd', sessionStorage.get('moduleInfo'))?.DISPLAY) {
          this.isShowSector = true
        }
      },
      immediate: true
    },
    mqResponseData: {
      handler: function(val) {
        if (!val) return false
        // const _this = this
        const json = JSON.parse(val)
        // 用户上下线状态 设备新增在线状态
        if (json.MSG_KEY === 'POLICE_STATUS' || json.MSG_KEY === 'DEV_ONLINE_STATUS') {
          const getUserLineStatus = (field = 'yonghuzxbj', mqKey = 'POLICE_ID') => {
            const obj = this.DictionaryTree[json[mqKey]]
            if (obj && obj[field] !== Number(json.STATUS)) { // 如果找到该对象 并且在线状态不相等
              this.$set(obj, field, Number(json.STATUS))
            }
          }
          if (json.MSG_KEY === 'POLICE_STATUS') {
            getUserLineStatus()
          } else {
            getUserLineStatus('status', 'GPSID')
          }
        }
      },
      immediate: true
    }
  },
  async created() {
    // 减少重复请求
    const allData = await this.$api.common.getPowerById({
      yonghuid: this.userInfo.userName,
      all: 1
    })
    const RootData = await this.$api.common.getPowerById({
      yonghuid: this.userInfo.userName,
      all: 0
    })
    const ListInfo = []
    if (RootData.data && Array.isArray(RootData.data)) {
      this.$store.commit('user/SET_USER_AUTH', cloneDeep(RootData.data))
      RootData.data.forEach(obj => {
        const find = allData.data.findIndex(item => item.UnitId === obj.UnitId)
        if (find !== -1) {
          const data = allData.data.splice(find, 1)[0]
          obj.countExt = data.countExt
          obj.countGroup = data.countGroup
          obj.countYh = data.countYh
          obj.countArea = data.countArea
          obj.ParentIds = data.ParentIds
          // 去重 筛选出根节点
        }
        obj.isRoot = true
      })
    }
    // console.log(RootData.data, allData.data)
    allData.data = allData.data.filter(item => item.countYh !== 0).concat(RootData.data)
    // 人员树组合数据
    const auth = cloneDeep(RootData.data).map(v => {
      return v.UnitId
    }).join(',')
    // type: 2:本级及下级 1:查下级单位
    Promise.all([
      // 人员
      this.$api.common.loadYonghuDDTByUnitid({
        unitid: auth,
        type: '2'
      })
    ]).then(([a]) => {
      const dataPeople = a.data.map(v => {
        return {
          BelongUp: v.UnitId,
          UnitName: v.yonghuname,
          uName: v.UnitName,
          UnitId: v.yonghuid,
          yonghuid: v.yonghuid,
          yonghuyxj: v.yonghuyxj,
          yonghuzxbj: parseInt(this.userInfo.userName) === parseInt(v.yonghuid) ? 1 : v.yonghuzxbj,
          leaf: true,
          type: 'people',
          login_pc: v.login_pc,
          hsUser: v.hsUser,
          mobile: v.mobile ? v.mobile : '',
          terminallx: v.terminallx,
          wkid: v.wkid, // 工号
          yhssbm: v.yhssbm, // 部门
          yhtx: v.yhtx, // 头像
          yhzw: v.yhzw // 职务
        }
      })
      ListInfo.push(...dataPeople)
      this.$store.commit('user/SET_USER_LIST_INFO', ListInfo)
      const result = flatUserTransTree(cloneDeep(allData.data).concat(dataPeople), 'UnitId', 'BelongUp', this.pid)
      const userTreeObj = result.tree
      this.DictionaryTree = { ...result.nodes, ...this.DictionaryTree }
      this.$store.commit('app/SET_userTree', userTreeObj)
    }).catch((error) => {
      console.log(error)
    })
    // 设备树组合数据
    Promise.all([
      // 设备类型
      this.$api.common.extype(),
      // 设备所属单位
      // this.$api.common.loadUnitList({
      //   unitid: this.TONE_voip.cmd.UNIT_ID,
      //   all: 1,
      //   type: 2
      // }),
      // 单位
      this.$api.common.getExtUserList({
        unitid: auth,
        type: '2'
      }),
      this.$api.common.getPowerById({
        yonghuid: this.userInfo.userName,
        all: 1
      })
      // 设备
      // this.$api.common.getPowerById({
      //   yonghuid: this.userInfo.userName,
      //   all: 0
      // })
    ]).then(([a, b, c, d]) => {
      const aResult = []
      a.data.records.forEach((v) => {
        if (v.is_app === 0) {
          v.UnitName = v.name
          // v.devType = v.id
          v.isType = true
          v.UnitId = v.id
          v.label = v.name
          v.devType = v.name
          v.devPower = v.power
          aResult.push(v)
        }
      })
      const cResult = b.data.map((v) => {
        v.BelongUp = v.unitid
        v.UnitName = v.name
        v.UnitId = v.id
        v.devType = v.dev_type
        v.devPower = v.power
        v.type = 'dev'
        v.devId = v.id
        v.label = v.name
        v.leaf = true
        v.devId = v.id
        v.status = v.status || 0
        return v
      })
      ListInfo.push(...cResult)
      this.$store.commit('user/SET_USER_LIST_INFO', ListInfo)
      const bResult = c.data.concat(RootData.data)
      // 先将设备和单位强关联
      const result = flatDevTransTree(aResult.concat(cResult, bResult.filter((item) => { return item.countExt > 0 })), 'id', 'dev_type', aResult, bResult)
      const bcResult = result.tree
      this.DictionaryTree = { ...result.nodes, ...this.DictionaryTree }
      this.$store.commit('app/SET_devTree', bcResult)
    }).catch((error) => {
      console.log(error)
    })
    // 是否显示快捷菜单
    if (queryPath('kjcd', sessionStorage.get('moduleInfo'))?.DISPLAY) {
      this.isShowSector = true
    }
  },
  mounted() {
    const _this = this
    window.addEventListener('beforeunload', this.beforeunloadHandler)
    window.addEventListener('offline', function(e) {
      _this.$message.warning('当前网络连接异常!')
    })
  },
  destroyed() {
    window.removeEventListener('beforeunload', this.beforeunloadHandler)
  },
  methods: {
    // 监听浏览器刷新事件，刷新前断开所有通话
    beforeunloadHandler(e) {
      this.$store.commit('sip/UA_STOP')
    }
  }
}
</script>
<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
  overflow: auto;
  .layout-container {
    width: 100%;
    min-width: 1200px;
    min-height: 700px;
    height: 100%;
    position: relative;
    overflow: hidden;
    ::v-deep .header {
      position: sticky;
      top: 0px;
      z-index: 30;
    }
  }
}

</style>
