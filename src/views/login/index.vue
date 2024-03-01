<template>
  <div class="login-all">
    <div class="login-layout">
      <Header />
      <div class="login-bg">
        <div class="login">
          <el-form ref="form" :model="userForm" :rules="loginRules">
            <el-form-item prop="userName">
              <el-input
                v-model.trim="userForm.userName"
                type="text"
                placeholder="输入你的用户名"
                clearable
                @input="changeUser"
              >
                <img slot="prefix" :src="userIcon" alt="" class="img">
              </el-input>
            </el-form-item>
            <el-form-item prop="pwd">
              <el-input
                v-model.trim="userForm.pwd"
                type="password"
                placeholder="输入你的密码"
                clearable
                @keyup.enter.native="onSubmit"
              >
                <img slot="prefix" :src="pwdIcon" alt="" class="img">
              </el-input>
            </el-form-item>
            <el-form-item class="remember">
              <el-checkbox v-model="rememberPwd">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item style="text-align: center">
              <el-button
                :loading="loading"
                style="width: 100%"
                type="primary"
                @click.enter="onSubmit"
              >安全登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userIcon from '@/assets/images/login/user.png'
import pwdIcon from '@/assets/images/login/pwd.png'
import { validateUserName, validatePasswordLoginTip } from '@/utils/validate'
import Header from '@/components/header/index'
import { sessionStorage, localStorage } from '@/utils/storage'
import { changeIco, getOnlyKey } from '@/utils'
import { api } from '@/api/env'
export default {
  name: 'Login',
  components: {
    Header
  },
  data() {
    return {
      userIcon: userIcon,
      pwdIcon: pwdIcon,
      userForm: {
        userName: '',
        pwd: ''
      },
      loginRules: {
        // eslint-disable-next-line no-undef
        userName: [
          { required: true, trigger: 'blur', validator: validateUserName }
        ],
        pwd: [{ required: true, trigger: 'blur', validator: validatePasswordLoginTip }]
      },
      loading: false,
      rememberPwd: false,
      settings: {
        'FEATURE_SETTING': [
          {
            'isOpen': true,
            'children': [
              {
                'isOpen': true,
                'isSpread': true,
                'children': [
                  {
                    'children': [
                      {
                        'isEdit': true,
                        'checked': true,
                        'id': 'cgjq',
                        'text': '常规警情'
                      },
                      {
                        'isEdit': true,
                        'checked': false,
                        'id': 'zdjq',
                        'text': '重大警情'
                      },
                      {
                        'isEdit': true,
                        'checked': false,
                        'id': 'yujing',
                        'text': '预警'
                      }
                    ],
                    'isEdit': false,
                    'active': '常规警情',
                    'id': 'csjz',
                    'text': '初始加载',
                    'isRadio': true
                  }
                ],
                'isEdit': true,
                'id': 'jingqing',
                'text': '警情'
              },
              {
                'isOpen': true,
                'isSpread': true,
                'children': [
                  {
                    'children': [
                      {
                        'isEdit': true,
                        'checked': true,
                        'id': 'person',
                        'text': '人员'
                      },
                      {
                        'isEdit': true,
                        'checked': false,
                        'id': 'txzy',
                        'text': '通信资源'
                      },
                      {
                        'isEdit': true,
                        'checked': false,
                        'id': 'jqdj',
                        'text': '集群对讲'
                      }
                    ],
                    'isEdit': false,
                    'active': '人员',
                    'id': 'resource-csjz',
                    'text': '初始加载',
                    'isRadio': true
                  }
                ],
                'isEdit': true,
                'id': 'resource',
                'text': '资源'
              },
              {
                'isOpen': true,
                'children': [
                  {
                    'children': [
                      {
                        'IS_APP': 1,
                        'ICO_FILE': '/manager/upload/extioc/b3fa7f132372439e95fcf053521dd3fb',
                        'IS_DYNA': 'true',
                        'POWER': '1,2',
                        'ID': '100',
                        'NAME': 'APP',
                        'text': 'APP',
                        'checked': true
                      },
                      {
                        'IS_APP': 0,
                        'ICO_FILE': '/manager/upload/extioc/7572636b0216411a86e2e577d775fe1f',
                        'IS_DYNA': 'false',
                        'POWER': '2',
                        'ID': '101',
                        'NAME': '监控',
                        'text': '监控',
                        'checked': true
                      },
                      {
                        'IS_APP': 0,
                        'ICO_FILE': '/manager/upload/extioc/85f8951601954ab1ac248bc0602b48ba',
                        'IS_DYNA': 'false',
                        'POWER': '1,2',
                        'ID': '102',
                        'NAME': '值班电话',
                        'text': '值班电话',
                        'checked': true
                      },
                      {
                        'IS_APP': 0,
                        'ICO_FILE': '/manager/upload/extioc/d4b5d925c9b4447ab0d2beb9eb892740',
                        'IS_DYNA': 'true',
                        'POWER': '1',
                        'ID': '103',
                        'NAME': '对讲',
                        'text': '对讲',
                        'checked': true
                      }
                    ],
                    'isEdit': false,
                    'id': 'txtc-csjz',
                    'text': '初始加载',
                    'isRadio': false
                  }
                ],
                'isEdit': false,
                'id': 'txtc',
                'text': '通信图层'
              },
              {
                'children': [
                  {
                    'isInput': true,
                    'latitude': '39.91405',
                    'id': 'centetPoint',
                    'text': '初始中心点',
                    'placeholder': '经纬度',
                    'isLon': true,
                    'longitude': '116.401969'
                  },
                  {
                    'children': [
                      {
                        'checked': true,
                        'text': '在线地图'
                      },
                      {
                        'checked': false,
                        'text': '离线地图'
                      }
                    ],
                    'active': '在线地图',
                    'id': 'csdt',
                    'text': '初始地图',
                    'isRadio': true
                  },
                  {
                    'isInput': true,
                    'id': 'mapScale',
                    'text': '地图缩放倍数',
                    'value': 12
                  }
                ],
                'isEdit': false,
                'id': 'map',
                'text': '地图'
              }
            ],
            'isEdit': true,
            'show': true,
            'id': 'zhdd',
            'text': '指挥调度'
          },
          {
            'isOpen': true,
            'isEdit': true,
            'show': true,
            'id': 'spdd',
            'text': '视频调度'
          },
          {
            'isOpen': true,
            'children': [
              {
                'isOpen': true,
                'isSpread': false,
                'isEdit': true,
                'id': 'bhlb',
                'text': '标绘列表'
              }
            ],
            'isEdit': true,
            'show': true,
            'id': 'dtbh',
            'text': '地图标绘'
          },
          {
            'isOpen': true,
            'isEdit': true,
            'show': true,
            'id': 'lsjl',
            'text': '历史记录'
          },
          {
            'show': true,
            'id': 'pzgl',
            'text': '配置管理'
          }
        ],
        'EQUIP_CONFIG': [
          {
            'children': [
              {
                'children': [
                  {
                    'checked': true,
                    'text': '扬声器1'
                  },
                  {
                    'checked': false,
                    'text': '扬声器2'
                  }
                ],
                'text': '扬声器',
                'value': '扬声器1'
              },
              {
                'children': [
                  {
                    'checked': true,
                    'text': '麦克风1'
                  },
                  {
                    'checked': false,
                    'text': '麦克风2'
                  }
                ],
                'text': '麦克风',
                'value': '麦克风2'
              }
            ],
            'text': '声音通道选择'
          },
          {
            'children': [
              {
                'children': [
                  {
                    'checked': true,
                    'text': '摄像头1'
                  },
                  {
                    'checked': false,
                    'text': '摄像头2'
                  }
                ],
                'text': '摄像头',
                'value': '摄像头1'
              },
              {
                'children': [
                  {
                    'checked': true,
                    'text': '1920x1080'
                  },
                  {
                    'checked': false,
                    'text': '3080x1440'
                  }
                ],
                'text': '摄像头分辨率',
                'value': '3080x1440'
              }
            ],
            'text': '本地摄像头'
          },
          {
            'children': [
              {
                'children': [
                  {
                    'checked': true,
                    'text': '15fps'
                  },
                  {
                    'checked': false,
                    'text': '30fps'
                  }
                ],
                'text': '视频帧率',
                'value': '15fps'
              },
              {
                'children': [
                  {
                    'checked': true,
                    'text': '128kbps'
                  },
                  {
                    'checked': false,
                    'text': '256kbps'
                  }
                ],
                'text': '视频速率',
                'value': '128kbps'
              }
            ],
            'text': '本地视频'
          }
        ],
        'PHONE_SETTING': {
          'phoneType': {
            'children': [
              {
                'checked': true,
                'text': '振铃组'
              },
              {
                'checked': false,
                'text': '轮询组'
              }
            ],
            'text': '联动类型',
            'value': '振铃组'
          },
          'isOpen': true,
          'phoneGroup': [
            {
              'text': '号码1',
              'value': '70001001'
            },
            {
              'text': '号码2',
              'value': '70001002'
            },
            {
              'text': '号码3',
              'value': '70001003'
            },
            {
              'text': '号码4',
              'value': '70001004'
            }
          ]
        },
        'POLICE_ID': '70000001',
        'LOGO_URL': '/sipForVue/T01.ico',
        'VERSION': 'v14.8.15.1',
        'TITLE': '融合通信指挥调度平台',
        'EXT_USER_TYPE_INFO_LIST': [
          {
            'IS_APP': 1,
            'ICO_FILE': '/manager/upload/extioc/b3fa7f132372439e95fcf053521dd3fb',
            'IS_DYNA': 'true',
            'POWER': '1,2',
            'ID': '100',
            'NAME': 'APP',
            'text': 'APP',
            'checked': true
          },
          {
            'IS_APP': 0,
            'ICO_FILE': '/manager/upload/extioc/7572636b0216411a86e2e577d775fe1f',
            'IS_DYNA': 'false',
            'POWER': '2',
            'ID': '101',
            'NAME': '监控',
            'text': '监控',
            'checked': true
          },
          {
            'IS_APP': 0,
            'ICO_FILE': '/manager/upload/extioc/85f8951601954ab1ac248bc0602b48ba',
            'IS_DYNA': 'false',
            'POWER': '1,2',
            'ID': '102',
            'NAME': '值班电话',
            'text': '值班电话',
            'checked': true
          },
          {
            'IS_APP': 0,
            'ICO_FILE': '/manager/upload/extioc/d4b5d925c9b4447ab0d2beb9eb892740',
            'IS_DYNA': 'true',
            'POWER': '1',
            'ID': '103',
            'NAME': '对讲',
            'text': '对讲',
            'checked': true
          }
        ]
      }
    }
  },
  async created() {
    await getOnlyKey()
    // this.autoLogin()
    const globalConfig = await this.$api.common.getConfig1(`?police_id=00000001&project=${0}`)
    if (globalConfig?.data?.data[0]) {
      const settings = globalConfig?.data?.data[0]
      if (settings.GLOBAL_PROJECT_CONFIG === 1) { // 全局配置的 logo 和名称
        document.title = settings.TITLE
        this.$store.commit('settings/SET_SETTINGS', {
          TITLE: settings.TITLE
        })
        changeIco(api + settings.LOGO_URL)
      } else {
        changeIco('')
      }
    }
    const remember = localStorage.get('remember')
    // 记住密码
    if (remember && remember.rememberPwd) {
      this.userForm.userName = remember.userName
      this.userForm.pwd = remember.userPwd
      this.rememberPwd = remember.rememberPwd
    }
    // console.log(getMacAddr(), 666)
  },
  methods: {
    changeUser() {
      // 账户发生变化 清空密码本 和记住密码状态
      this.$set(this.userForm, 'pwd', '')
      this.rememberPwd = false
    },
    GetQueryString(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
      var r = window.location.search.substring(1).match(reg)
      if (r != null) return encodeURIComponent(r[2]); return null
    },
    // 自动登录（通过地址栏传参分别对应2中模式。1、xxx?user="xxx"&pass="xxx"/login 2 xxx/login?user="xxx"&pass="xxx"）
    autoLogin() {
      // 单点登录，获取token值
      var token = this.$route.query.token || this.GetQueryString('token')
      if (token) {
        this.$api.common
          .getUserPass({
            token: token
          })
          .then((response) => {
            this.$api.common
              .getVoipForDDT({
                userId: response.data.ddtid,
                userPwd: this.$md5(response.data.ddtmm),
                userType: 2,
                devType: 'WEB',
                imei: window.visitorId
              })
              .then((res) => {
                const data = res.data
                if (data.result) {
                  this.$message.closeAll()
                  this.$message({
                    message: data.result,
                    duration: 3000,
                    type: 'error'
                  })
                  return false
                }
                if (!data.cmd.result) {
                  this.$message({
                    message: data.cmd.msg,
                    duration: 3000,
                    type: 'error'
                  })
                } else {
                  sessionStorage.set('TONE_voip', data)
                  // 新增15日内过期提醒
                  if(data.cmd.LICENSE) {
                    this.$message.closeAll()
                    this.$message({
                      message: data.cmd.LICENSE,
                      duration: 3000,
                      type: 'error'
                    })
                  }
                  var TONE_sipUserInfo = {
                    voipIP: data.voipIP,
                    voipPort: data.voipPort,
                    userName: response.data.ddtid,
                    userPwd: response.data.ddtmm
                  }
                  sessionStorage.set('TONE_sipUserInfo', TONE_sipUserInfo)
                  const h = window.location.hash.substring(1)
                  if (h) {
                    this.$router.push({ path: h })
                    return
                  }
                  this.getConfig()
                  this.$router.push({ path: '/dashboard' })
                }
              })
              .catch(() => {})
          })
      }
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$api.common
            .getVoipForDDT({
              userId: this.userForm.userName,
              userPwd: this.$md5(this.userForm.pwd),
              userType: 2,
              devType: 'WEB',
              imei: window.visitorId
            })
            .then(async(res) => {
              this.loading = false
              const data = res.data
              if (data.result) {
                this.$message.closeAll()
                this.$message({
                  message: data.result,
                  duration: 3000,
                  type: 'error'
                })
                return false
              }
              if (!data.cmd.result) {
                this.$message({
                  message: data.cmd.msg,
                  duration: 3000,
                  type: 'error'
                })
              } else {
                sessionStorage.set('TONE_voip', data)
                // 新增15日内过期提醒
                if(data.cmd.LICENSE) {
                  this.$message.closeAll()
                  this.$message({
                    message: data.cmd.LICENSE,
                    duration: 3000,
                    type: 'error'
                  })
                }
                var TONE_sipUserInfo = {
                  voipIP: data.voipIP,
                  voipPort: data.voipPort,
                  userName: this.userForm.userName,
                  userPwd: this.userForm.pwd
                }
                sessionStorage.set('TONE_sipUserInfo', TONE_sipUserInfo)
                // 记住密码或者自动登录
                if (this.rememberPwd) {
                  localStorage.set('remember', {
                    userName: this.userForm.userName,
                    userPwd: this.userForm.pwd,
                    rememberPwd: this.rememberPwd
                  })
                }
                if (!this.rememberPwd) {
                  localStorage.remove('remember')
                }
                await this.getConfig(data.cmd.POLICE_ID, data.cmd.TOKEN)
                let CallListStorage = localStorage.get('listenCallList')
                CallListStorage = CallListStorage ? CallListStorage[sessionStorage.get('TONE_sipUserInfo') ? sessionStorage.get('TONE_sipUserInfo').userName : ''] : []
                this.$store.commit('sip/SET_CALL_LISTEN', CallListStorage || [])
                this.$router.push({ path: '/dashboard' })
              }
            })
            .catch(() => {
              this.loading = false
              this.$message.error('网络异常，请稍后重试')
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async getConfig(POLICE_ID, TOKEN) {
      // 获取配置信息
      const that = this
      const res = await this.$api.common.getConfig(`?POLICENO=${POLICE_ID}&token=${TOKEN}&project=${0}`)
      const res2 = await this.$api.common.moduleInfoList(`?type=0`)
      // console.log(res2, '快捷菜单信息')
      if (res2 && res2.data) {
        const moduleInfoList = res2.data.moduleInfoList
        sessionStorage.set('moduleInfo', moduleInfoList)
        var kjcd = this.queryPath('kjcd', moduleInfoList).children.filter(item => { return item.DISPLAY === 1 })
        sessionStorage.set('kjcd', kjcd)
        var pzgl = this.queryPath('pzgl', moduleInfoList).children.filter(item => { return item.DISPLAY === 1 })
        sessionStorage.set('pzgl', pzgl)
      }
      if (res.data.data && res.data.data.length > 0) {
        try {
          const settings = res.data.data[0]
          for (const k in settings) {
            settings[k] = JSON.stringify(settings[k])
            if (settings[k].indexOf('[') === -1) {
              settings[k] = settings[k].replace(/['" ]/g, '')
            } else {
              if (Array.isArray(JSON.parse(settings[k]))) {
                settings[k] = JSON.parse(settings[k])
              } else {
                settings[k] = JSON.parse(JSON.parse(settings[k]))
              }
            }
          }
          const copys = settings.FEATURE_SETTING[0].children[2].children[0].children || settings.FEATURE_SETTING[0].children[2].children[0].list
          settings.FEATURE_SETTING[0].children[2].children[0].children = that.commitObj(
            settings.EXT_USER_TYPE_INFO_LIST,
            copys
          )
          sessionStorage.set('TONE_ConfigUserInfo', settings)
          // 将配置信息 保存在 sessionStorage中
          const state = this.deepChange('csdt', settings.FEATURE_SETTING).active === '在线地图' ? 'onLine' : 'offLine'
          this.$store.commit('settings/SET_MAPSTATE', state)
          const jwd = this.deepChange('centetPoint', settings.FEATURE_SETTING)
          this.$store.commit('settings/SET_CENTER', { 'lng': Number(jwd.longitude), 'lat': Number(jwd.latitude) })
          this.$store.commit('settings/SET_ZOOM', Number(this.deepChange('mapScale', settings.FEATURE_SETTING).value))
          this.$store.commit('settings/SET_SETTINGS', settings)
          changeIco(api + settings.LOGO_URL)
        } catch (error) {
          console.log(error)
          sessionStorage.set('TONE_ConfigUserInfo', this.settings)
          this.$store.commit('settings/SET_SETTINGS', this.settings)
        }
      } else {
        sessionStorage.set('TONE_ConfigUserInfo', this.settings)
        this.$store.commit('settings/SET_SETTINGS', this.settings)
      }
    },
    // 将后台返回的通信图层组合到一起
    commitObj(obj1, obj2) {
      obj1.forEach((item, i) => {
        item.text = item.NAME
        if (obj2[i]) {
          item.checked = obj2[i].checked
        } else {
          item.checked = true
        }
      })
      return obj1.sort((a, b) => {
        return b.IS_APP - a.IS_APP
      })
    },
    deepChange(key, obj, result = false) {
      // 递归查看 id对应项
      const that = this
      if (obj && obj.length > 0 && Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item['id'] === key) {
            result = item
          } else if (item.children && Array.isArray(item.children) && !result) {
            result = that.deepChange(key, item.children, result)
          }
        })
      }
      return result
    },
    queryPath(key, obj, result = false) {
      if (obj.length > 0 && Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item['PATH'] === key) {
            result = item
          }
          if (item.children && Array.isArray(item.children)) {
            result = this.queryPath(key, item.children, result)
          }
        })
      }
      return result
    }
  }
}
</script>
<style lang="scss" scoped>
.login-all {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.login-layout {
  width: 100%;
  height: 100%;
  background: url("../../assets/images/login/bg.png") center center no-repeat;
  background-size: 100% 100%;
  min-width: 1200px;
  min-height: 700px;
  position: relative;
}
.login-bg {
  width: 7.74rem;
  height: 4.5rem;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -3.87rem;
  margin-top: -2.25rem;
  background: url("../../assets/images/login/login_bg.png") center center
    no-repeat;
  background-size: 7.74rem 4.5rem;
  .login {
    width: 3.04rem;
    margin-left: 4.2rem;
    margin-top: 1.14rem;
    ::v-deep .el-form-item {
      margin-bottom: 0.24rem;
      .el-input {
        .el-input__prefix {
          width: 0.38rem;
          left: 0.02rem;
          height: 0.42rem;
          line-height: 0.42rem;
          top: calc((100% - 0.42rem) / 2);
          background-color: #125671;
          .img {
            width: 0.22rem;
            height: 0.24rem;
            margin-top: 0.06rem;
          }
        }
        .el-input__inner {
          background: #05375f !important;
          border: 1px solid #135c7e;
          color: #6effe7;
          padding-left: 0.5rem;
          border-radius: 0px;
          height: 0.42rem;
          line-height: 0.42rem;
          &:-webkit-autofill {
            box-shadow: 0 0 0 1000px #135c7e inset !important;
            -webkit-text-fill-color: #6effe7 !important;
          }
          &::-webkit-input-placeholder {
            color: #a4e2ef;
          }
          &:-moz-placeholder {
            color: #a4e2ef;
          }
          &::-moz-placeholder {
            color: #a4e2ef;
          }
          &:-ms-input-placeholder {
            color: #a4e2ef;
          }
        }
      }
      .el-button--primary {
        font-size: 16px;
        font-family: PingFang SC;
        font-weight: 600;
        color: #001c34;
        border-radius: 0px;
        letter-spacing: 4px;
        background-color: #00ffd4;
        border-color: #00ffd4;
        padding: 0.1rem 20px;
        &:hover {
          background-color: #6effe7;
          border-color: #6effe7;
        }
      }
    }
  }
}
.remember {
  margin-bottom: 0.2rem !important;
  ::v-deep .el-form-item__content {
    display: flex;
    // justify-content: space-between;
    justify-content: flex-end;
    line-height: 20px;
  }
  ::v-deep .el-checkbox {
    .el-checkbox__inner {
      border: 1px solid #6effe7;
      background-color: transparent;
      &::after {
        border: 1px solid #6effe7;
        border-left: 0;
        border-top: 0;
      }
    }
    .el-checkbox__label {
      color: #6effe7;
    }
    .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
      background-color: #6effe7;
    }
  }
}
</style>
