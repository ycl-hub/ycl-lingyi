<template>
  <div class="header">
    <div v-if="$route.path!=='/login'" class="sip_status">
      {{ connectStatus }}
    </div>
    <div class="center" :class="shouYeShow ? 'activeCenter' : ''">
      <span v-cloak class="title">{{ title }}</span>
    </div>
    <div v-if="shouYeShow" class="shouye" @click="$root.$emit('rollback')"  @mouseenter="outHoverRouterBoxShow=true" @mouseleave="outHoverRouterBoxShow=false">
      <img :src="shouye" alt="">
      <div v-if="outHoverRouterBoxShow" class="outHoverBox">
        <ul>
          <li v-for="(item) in routerList" :key="item.id" class="ellipsis" :class="{active:$route.path==item.path}" @click.self.stop="routerPush(item)">{{ item.text }}</li>
        </ul>
      </div>
    </div>
    <div v-if="loginOutShow" class="loginOut" @mouseenter="enter" @mouseleave="leave">
      <img :src="loginOutImg" alt="">
      <div v-if="outHoverBoxShow" class="outHoverBox">
        <ul>
          <li class="ellipsis" @click="loginInfoHandle">{{ TONE_voip.cmd.POLICE_NAME }}</li>
          <li @click="modifyPwdHandle">修改密码</li>
          <li @click="loginOut">退出登录</li>
        </ul>
      </div>
    </div>
    <!-- 修改密码 -->
    <el-dialog
      v-el-drag-dialog
      title="修改密码"
      :visible.sync="modifyPwd"
      width="300px"
      :close-on-click-modal="false"
      custom-class="modifyPwd bevel"
      append-to-body
      @close="closeModifyPwd"
    >
      <el-form ref="ruleForm" label-position="left" :model="listQuery" :rules="rules" label-width="80px" class="listQuery" size="mini" @submit.native.prevent>
        <!-- <el-form-item label="原始密码：" prop="originPwd">
          <el-input v-model.trim="listQuery.originPwd" class="filter" type="text" placeholder="请输入原始密码" show-password />
        </el-form-item> -->
        <el-form-item label="新密码：" prop="newPwd">
          <el-input v-model.trim="listQuery.newPwd" class="filter" type="text" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码：" prop="checkNewPwd">
          <el-input v-model.trim="listQuery.checkNewPwd" class="filter" type="text" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item label="密码格式：" prop="checkNewPwd" class="pwdFormat">
          <span>
            密码支持数字、英文大小写、特殊字符，可包含其中一种或多种组合，长度4到20位
          </span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <div class="btn fl" @click="closeModifyPwd">
          <span class="">取消</span>
        </div>
        <div class="btn fr" @click="sureModifyPwd">
          <span class="">确定</span>
        </div>
      </div>
    </el-dialog>
    <!-- 登录信息 -->
    <el-dialog
      v-el-drag-dialog
      title="登录信息"
      :visible.sync="loginInfo"
      width="300px"
      :close-on-click-modal="false"
      custom-class="loginInfo bevel"
      append-to-body
      @close="closeLoginInfo"
    >
      <div class="tone_sip_con_c">
        <div class="name clearfix">
          <span class="left">登录账号：</span>
          <span class="right">{{ TONE_voip?TONE_voip.cmd.POLICE_ID:'' }}</span>
        </div>
        <div class="name clearfix">
          <span class="left">调度台名称：</span>
          <span class="right">{{ TONE_voip?TONE_voip.cmd.POLICE_NAME:'' }}</span>
        </div>
        <div class="name clearfix">
          <span class="left">所属单位：</span>
          <span class="right">{{ TONE_voip?TONE_voip.cmd.UNIT_NAME:'' }}</span>
        </div>
      </div>
      <div slot="footer">
        <div class="btn" @click="closeLoginInfo">
          <span class="">确定</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import shouye from '@/assets/images/dashboard/shouye.png'
import btc_tca from '@/assets/images/dashboard/tuichu.png'
import btn_tc from '@/assets/images/dashboard/tuichu.png'
import { api } from '@/api/env'
import { sessionStorage } from '@/utils/storage'
import { changeIco } from '@/utils'
import axios from 'axios'
import { validatePassword } from '@/utils/validate'
import { mapGetters } from 'vuex'
export default {
  name: 'Header',
  data() {
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.listQuery.newPwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      isLoginOut: false,
      userInfo: sessionStorage.get('TONE_sipUserInfo'),
      loginOutImg: btc_tca,
      shouye: shouye,
      shouYeShow: false,
      loginOutShow: false,
      title: '',
      outHoverBoxShow: false,
      TONE_voip: sessionStorage.get('TONE_voip'),
      modifyPwd: false,
      listQuery: {
        // originPwd: '',
        newPwd: '',
        checkNewPwd: ''
      },
      rules: {
        originPwd: [
          { required: true, message: '请输入原始密码', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        checkNewPwd: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      loginInfo: false,
      outHoverRouterBoxShow: false
    }
  },
  computed: {
    ...mapGetters([
      'settings',
      'callList',
      'connectStatus',
      'userRouteInfo'
    ]),
    routerList() {
      var token = this.$route.query.token || this.GetQueryString('token')
      if (token) {
        window.location.href = 'http://82.157.100.82:29014/cas-server-web/door.html'
        return [{text:"首页"}]
      }
      let routers = this.$router.options.routes.find(item=>item.name==='Layout')
      if(routers&&Array.isArray(routers.children)){
        return routers.children.map(item=>item)
      }else{
        return []
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const path = route.path
        if (path === '/login') {
          this.shouYeShow = false
          this.loginOutShow = false
          this.$store.commit('sip/SET_UA_CONNECT', '')
        } else if (path === '/dashboard') {
          this.shouYeShow = false
          this.loginOutShow = true
          // 登陆后切换到自己配置的标题
          setTimeout(_ => {
            if (sessionStorage.get('TONE_ConfigUserInfo') && sessionStorage.get('TONE_ConfigUserInfo').TITLE) {
              this.title = sessionStorage.get('TONE_ConfigUserInfo').TITLE || '融合通信指挥平台'
              document.title = sessionStorage.get('TONE_ConfigUserInfo').TITLE || '融合通信指挥平台'
            }
          }, 500)
        } else {
          this.shouYeShow = true
          this.loginOutShow = true
        }
      },
      immediate: true
    },
    'settings.TITLE': {
      immediate: true,
      handler(val) {
        this.title = val || '融合通信指挥调度平台'
        document.title = val || '融合通信指挥调度平台'
      },
      deep: true
    }
  },
  created() {
    // const defaultSettingsUrl = window.location.pathname + 'common/setting.json'
    // axios.get(defaultSettingsUrl).then((res) => {
    //   if (res.data.title) {
    //     if (sessionStorage.get('TONE_ConfigUserInfo') && sessionStorage.get('TONE_ConfigUserInfo').TITLE) {
    //       this.title = sessionStorage.get('TONE_ConfigUserInfo').TITLE || '凌智一体化指挥调度实战平台'
    //       document.title = sessionStorage.get('TONE_ConfigUserInfo').TITLE || '凌智一体化指挥调度实战平台'
    //     } else {
    //       this.title = res.data.title || '凌智一体化指挥调度实战平台'
    //       document.title = res.data.title || '凌智一体化指挥调度实战平台'
    //     }
    //     this.$store.commit('settings/SET_BANNERTEXTS', res.data.bannerTexts)
    //     this.$store.commit('settings/SET_VERSION', res.data.version)
    //   }
    // })
    // console.log(this.TONE_voip)

  },
  methods: {
    routerPush(item){
      if(item.text==='首页'){
        this.goshouye()
      }else{
        this.$router.push(item.path)
      }
    },
    disconnected() {
      const _this = this
      window.thisVueRoot.$on('disconnected', () => {
        console.log('sip已断开')
        if (_this.isLoginOut) {
          _this.loginOutSuccess()
        }
      })
    },
    loginOutSuccess() {
      this.$router.push({ path: '/login' })
      // 退出成功后 进行的操作
      this.$store.commit('sip/SET_UA_CONNECT', '')
      sessionStorage.remove('TONE_sipUserInfo')
      sessionStorage.remove('TONE_voip')
      this.$store.commit('app/SET_IM_LIST', [])
      sessionStorage.remove('imList')
      this.$store.commit('app/SET_IM_LIST_ACTIVE_ID', '')
      sessionStorage.remove('imListActiveId')
      sessionStorage.remove('TONE_ConfigUserInfo')
      changeIco('')
      // 解决退出后已有的被缓存的通话窗口未关闭
      this.$store.commit('sip/SET_CALL_LIST', [])
      window.thisVueRoot.$off('disconnected')
      this.loading.close()
    },
    enter() {
      this.loginOutImg = btn_tc
      this.outHoverBoxShow = true
    },
    leave() {
      this.loginOutImg = btc_tca
      this.outHoverBoxShow = false
    },
    goshouye() {
      // 带有token为单点登录过来的
      var token = this.$route.query.token || this.GetQueryString('token')
      if (token) {
        window.location.href = 'http://82.157.100.82:29014/cas-server-web/door.html'
        return false
      }
      this.$router.push({ path: '/dashboard' })
    },
    GetQueryString(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      var r = window.location.search.substring(1).match(reg)
      if (r != null) return encodeURIComponent(r[2]); return null
    },
    loginOut() {
      console.log(this.callList)
      const police_id = this.TONE_voip.cmd.POLICE_ID
      let arr = this.callList.map(item => {
        if (item.from !== police_id) {
          item.id = item.from
        }
        if (item.to !== police_id) { item.id = item.to }
        return item
      })
      console.log(arr)
      arr = arr.reduce((pre, ind) => {
        // eslint-disable-next-line no-return-assign
        return pre += ind.id + ','
      }, '')
      this.$confirm(`${this.callList.length > 0 ? '当前正与' + arr + '用户通话中,此操作将会退出并挂断所有通话,是否继续？' : '此操作将会退出登录，是否继续？'}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loginOutFunc()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出登录'
        })
      })
    },
    loginOutFunc() {
      const _this = this
      this.disconnected()
      this.isLoginOut = true
      this.loading = this.$loading({
        lock: true,
        text: '',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      // var token = this.$route.query.token || this.GetQueryString('token')
      // if (token) {
      //   var dlform = document.createElement('form')
      //   dlform.style = 'display:none;'
      //   dlform.method = 'get'
      //   dlform.action = `${api}/sipForVue/logout`
      //   // dlform.target = 'callBackTarget'
      //   var hdnFilePath = document.createElement('input')
      //   hdnFilePath.type = 'hidden'
      //   hdnFilePath.name = 'filePath'
      //   // hdnFilePath.value = filePath
      //   dlform.appendChild(hdnFilePath)
      //   document.body.appendChild(dlform)
      //   dlform.submit()
      //   document.body.removeChild(dlform)
      //   this.$store.commit('sip/UA_STOP')
      //   return false
      // }
      // 账号密码登退出
      this.$api.common.Logout({
        PoliceNo: this.TONE_voip.cmd.POLICE_ID,
        Token: this.TONE_voip.cmd.TOKEN,
        Imei: this.TONE_voip.cmd.IMEI
      }).then(res => {
        if (res.data.result === 1) {
          this.$store.commit('sip/UA_STOP')
          // 断开所有通话  清空通话队列
          this.$store.commit('sip/SET_callListStates', [])
          this.$store.commit('sip/SET_CALL_LIST', [])
          this.$store.commit('sip/SET_isPolling', false)
        } else {
          this.loading.close()
        }
      })
      setTimeout(() => {
        // 十秒后 不管什么情况都关闭loading
        _this.loading.close()
      }, 10000)
    },
    // 修改密码弹层
    modifyPwdHandle() {
      this.modifyPwd = true
    },
    // 关闭修改密码弹层
    closeModifyPwd() {
      this.$refs['ruleForm'].resetFields()
      this.modifyPwd = false
    },
    // 缺额万修改密码
    sureModifyPwd() {
      const TONE_voip = sessionStorage.get('TONE_voip')
      if (this.userInfo.userPwd === this.listQuery.newPwd) {
        this.$message.warning('新旧密码相同')
        return
      }
      if (this.listQuery.newPwd.length === 0) {
        this.$message.warning('新密码不能为空')
        return
      }
      if (this.listQuery.checkNewPwd.length === 0) {
        this.$message.warning('确定密码不能为空')
        return
      }
      if (this.listQuery.checkNewPwd !== this.listQuery.newPwd) {
        this.$message.warning('确认密码与新密码不一致')
        return
      }
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          this.$api.common.changePassword({
            ddtId: TONE_voip.ddtinfo.ddtid + '',
            pwd: this.listQuery.newPwd
          }).then(res => {
            if (res.data.result !== '0') {
              // this.$message({
              //   message: '修改密码成功！',
              //   type: 'success'
              // })
              this.loginOutFunc()
            }
          }).catch((err) => {
            this.$message.error('修改密码失败！')
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
      this.closeModifyPwd()
    },
    // 修改密码弹层
    loginInfoHandle() {
      this.loginInfo = true
    },
    closeLoginInfo() {
      this.loginInfo = false
    }
  }
}
</script>
<style lang="scss" scoped>
.header {
  user-select: none;
  width: 100%;
  height: 0.75rem;
  position: relative;
  .sip_status{
    position: absolute;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 5px;
    text-align: right;
    color: #07C4E9;
    font-size: 12px;
    right: 80px;
  }
  [v-cloak ]{
    display: none;
  }
  .center {
    width: 100%;
    height: 0.75rem;
    background: url('../../assets/images/login/header.png') no-repeat;
    background-size: 100% 0.75rem;
    padding-top:0.23rem;
    text-align: center;
    .title {
      // letter-spacing: 0.08rem;
      color: #fff;
      font-size: 0.42rem;
      font-family: YouSheBiaoTiHei;
      font-weight: 400;
      background: linear-gradient(180deg, #FFFFFF 20%, #7cfdff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  .activeCenter {
    background: url('../../assets/images/login/headerDeep.png') no-repeat;
    background-size: 100% 0.75rem;
  }
  .shouye {
    position: absolute;
    cursor: pointer;
    top: 0.34rem;
    left: 17.7rem;
    width: 37px;
    height: 37px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .loginOut {
    position: absolute;
    cursor: pointer;
    top: 0.34rem;
    left: 18.4rem;
    img {
      width: 37px;
      height: 37px;
    }
  }
  .outHoverBox {
    position: absolute;
    padding: 5px 0px;
    left: calc(18.5px - 0.45rem);
    cursor: pointer;
    width: 0.9rem;
    text-align: center;
    background: radial-gradient(circle, rgba(0, 39, 60, 0.8), rgba(0, 79, 120, 0.8));
    color: rgb(1, 211, 249);
    border-radius: 4px;
    ul {
      li {
        padding: 8px 0.05rem;
        &:hover {
          background: rgba(0, 39, 60, 0.8);
        }
      }
      .active{
          background: rgba(0, 39, 60, 0.8);
      }
    }
  }
}
::v-deep .modifyPwd {
  height: 360px;
  .el-dialog__header {
    padding: 10px;
    border-bottom: 1px solid #497a7a;
    .el-dialog__title,.el-dialog__close {
      font-size: 14px;
      font-family: PingFang SC;
      color: rgba(250, 253, 255, 1);
    }
    .el-dialog__headerbtn {
      top: 14px;
      right: 14px;
    }
  }
  .el-dialog__body {
    padding: 10px !important;
    height: calc(100% - 90px);
    .listQuery {
      .el-form-item {
        margin-bottom: 30px;
        .el-form-item__label {
          color:#00d8ff;
          font-size: 12px;
          font-weight: 500 !important;
          padding-right: 5px;
        }
        .el-form-item__content {
          p {
            font-size: 12px;
            width: 100%;
          }
        }
        &:nth-child(1) {
          .el-form-item__label {
            letter-spacing: 3px;
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
            // color:#0fabd4;
            font-size: 12px;
          }
          &:-moz-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
          &::-moz-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
          &:-ms-input-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
        }
        .el-input__prefix {
          .el-input__icon {
            line-height: 30px;
            // color:#0fabd4;
          }
        }
      }
      .pwdFormat {
        .el-form-item__label {
          &::before {
            visibility: hidden;
          }
        }
        .el-form-item__content {
          color: #F56C6C;
          font-size: 13px;
        }
      }
    }
  }
  .el-dialog__footer {
    border-top: 1px solid #497a7a;
    .btn{
      cursor: pointer;
      background: url('../../assets/images/equipment/btnBg.png') no-repeat;
      background-size: 100% 100%;
      width: 80px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      display: inline-block;
      color: #01cfff;
      text-align: center;
    }
  }
}
::v-deep .loginInfo {
  height: 360px;
  .el-dialog__header {
    padding: 10px;
    border-bottom: 1px solid #497a7a;
    .el-dialog__title,.el-dialog__close {
      font-size: 14px;
      font-family: PingFang SC;
      color: rgba(250, 253, 255, 1);
    }
    .el-dialog__headerbtn {
      top: 14px;
      right: 14px;
    }
  }
  .el-dialog__body {
    padding: 10px !important;
    height: calc(100% - 90px);
    .tone_sip_con_c{
      height: calc(100%);
      overflow: auto;
      .name {
        font-family: PingFang SC;
        font-size: 12px;
        margin-top: 5px;
        .left {
          color: #becad2;
          width: 80px;
          margin-top: 4px;
        }
        .right {
          color: #fff;
          width: calc(100% - 80px);
          line-height: 20px;
        }
      }
    }
  }
  .el-dialog__footer {
    border-top: 1px solid #497a7a;
    .btn{
      cursor: pointer;
      background: url('../../assets/images/equipment/btnBg.png') no-repeat;
      background-size: 100% 100%;
      width: 80px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      display: inline-block;
      color: #01cfff;
      text-align: center;
    }
  }
}
</style>
