// import router from './router'
import router, { patchRouter } from '@/router'
import Router from 'vue-router'
import store from './store'
import { Message } from 'element-ui'
import NProgress, { set } from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// import getPageTitle from '@/utils/get-page-title'
// var pn = window.location.pathname
// const defaultSettingsUrl = process.env.NODE_ENV === 'development' ? '/common/setting.json' : pn + 'common/setting.json'
window.count = 0
import { sessionStorage, localStorage } from '@/utils/storage'
import { GetQueryString } from '@/utils/index'
import { getUserPass, getVoipForDDT } from '@/api/modules/common'
import md5 from 'js-md5'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
// import axios from 'axios'
import { changeIco, getOnlyKey, queryPath } from '@/utils'
import { api } from '@/api/env'
import $api from '@/api/api'
let settingsDefault = {
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
          'isSpread': true,
          'show': true,
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
// 将后台返回的通信图层组合到一起
const commitObj = (obj1, obj2) => {
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
}
const deepChange = (key, obj, result = false) => {
  if (obj && obj.length > 0 && Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (item['id'] === key) {
        result = item
      } else if (item.children && Array.isArray(item.children) && !result) {
        result = deepChange(key, item.children, result)
      }
    })
  }
  return result
}
const getConfig = async(POLICE_ID, TOKEN) => {
  // 获取配置信息
  const res = await $api.common.getConfig(`?POLICENO=${POLICE_ID}&token=${TOKEN}&project=${0}`)
  const res2 = await $api.common.moduleInfoList(`?type=0`)
  // console.log(res2, '快捷菜单信息')
  if (res2 && res2.data) {
    const moduleInfoList = res2.data.moduleInfoList
    sessionStorage.set('moduleInfo', moduleInfoList)
    var kjcd = queryPath('kjcd', moduleInfoList).children.filter(item => { return item.DISPLAY === 1 })
    sessionStorage.set('kjcd', kjcd)
    var pzgl = queryPath('pzgl', moduleInfoList).children.filter(item => { return item.DISPLAY === 1 })
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
      settings.FEATURE_SETTING[0].children[2].children[0].children = commitObj(
        settings.EXT_USER_TYPE_INFO_LIST,
        copys
      )
      sessionStorage.set('TONE_ConfigUserInfo', settings)
      // 将配置信息 保存在 sessionStorage中
      const state = deepChange('csdt', settings.FEATURE_SETTING).active === '在线地图' ? 'onLine' : 'offLine'
      store.commit('settings/SET_MAPSTATE', state)
      const jwd = deepChange('centetPoint', settings.FEATURE_SETTING)
      store.commit('settings/SET_CENTER', { 'lng': Number(jwd.longitude), 'lat': Number(jwd.latitude) })
      store.commit('settings/SET_ZOOM', Number(deepChange('mapScale', settings.FEATURE_SETTING).value))
      store.commit('settings/SET_SETTINGS', settings)
      changeIco(api + settings.LOGO_URL)
      settingsDefault = settings
    } catch (error) {
      console.log(error)
      sessionStorage.set('TONE_ConfigUserInfo', settingsDefault)
      store.commit('settings/SET_SETTINGS', settingsDefault)
    }
  } else {
    sessionStorage.set('TONE_ConfigUserInfo', settingsDefault)
    store.commit('settings/SET_SETTINGS', settingsDefault)
  }
}
// const whiteList = ['/login'] // no redirect whitelist
// 跳转拦截
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  // document.title = getPageTitle(to.meta.title)
  // document.title = getPageTitle()
  // axios.get(defaultSettingsUrl).then((res) => {
  //   if (res.data.title) {
  //     document.title = res.data.title
  //   } else {
  //     document.title = '凌智一体化指挥调度实战平台'
  //   }
  // })
  // 导航守卫
  if (to.path === '/login') {
    next()
    NProgress.done()
    return
  } else if (sessionStorage.get('TONE_sipUserInfo')) {
    if (to.path === '/') {
      router.push({ path: '/dashboard' })
      return
    }
    const settings = sessionStorage.get('TONE_ConfigUserInfo')
    const routes = patchRouter(settings?.FEATURE_SETTING)
    // 如果路由发生变化 重新动态添加路由 否则不变
    if (JSON.stringify(store.getters.userRouteInfo) === JSON.stringify(settings?.FEATURE_SETTING)) {
      next()
    } else {
      router.matcher = new Router().matcher
      store.commit('user/SET_USER_ROUTE', JSON.parse(JSON.stringify(settings?.FEATURE_SETTING)))
      router.addRoutes(routes)
      next({ ...to })
      // hack
    }
  } else {
    await getOnlyKey()
    if (GetQueryString('token')) {
      getUserPass({
        token: GetQueryString('token')
      }).then(response => {
        getVoipForDDT({
          userId: response.data.ddtid,
          userPwd: md5(response.data.ddtmm),
          userType: 2,
          devType: 'WEB',
          imei: window.visitorId
        }).then(async res => {
          const data = res.data
          sessionStorage.set('TONE_voip', data)
          if (data.result) {
            Message.closeAll()
            Message({
              message: data.result,
              duration: 3000,
              type: 'error'
            })
            return false
          }
          var TONE_sipUserInfo = {
            voipIP: data.voipIP,
            voipPort: data.voipPort,
            userName: response.data.ddtid,
            userPwd: response.data.ddtmm
          }
          sessionStorage.set('TONE_sipUserInfo', TONE_sipUserInfo)
          await getConfig(data.cmd.POLICE_ID, data.cmd.TOKEN)
          let CallListStorage = localStorage.get('listenCallList')
          CallListStorage = CallListStorage ? CallListStorage[sessionStorage.get('TONE_sipUserInfo') ? sessionStorage.get('TONE_sipUserInfo').userName : ''] : []
          store.commit('sip/SET_CALL_LISTEN', CallListStorage || [])
          const settings = sessionStorage.get('TONE_ConfigUserInfo')
          const routes = patchRouter(settings?.FEATURE_SETTING)
          // 如果路由发生变化 重新动态添加路由
          if (JSON.stringify(store.getters.userRouteInfo) === JSON.stringify(settings?.FEATURE_SETTING)) {
            next()
          } else {
            router.matcher = new Router().matcher
            store.commit('user/SET_USER_ROUTE', JSON.parse(JSON.stringify(settings?.FEATURE_SETTING)))
            router.addRoutes(routes)
            next({ ...to })
            // hack
          }
          // const h = window.location.hash.substring(1)
          // if (h) {
          //   router.push({ path: h })
          //   return
          // }
          // router.push({ path: '/dashboard' })
        }).catch(() => {
        })
      })
      return
    }
    if (GetQueryString('userId') && GetQueryString('userPwd')) {
      getVoipForDDT({
        userId: GetQueryString('userId'),
        userPwd: md5(GetQueryString('userPwd')),
        userType: 2,
        imei: window.visitorId,
        devType: 'WEB'
      }).then(async res => {
        const data = res.data
        sessionStorage.set('TONE_voip', data)
        if (data.result) {
          Message.closeAll()
          Message({
            message: data.result,
            duration: 3000,
            type: 'error'
          })
          return false
        }
        var TONE_sipUserInfo = {
          voipIP: data.voipIP,
          voipPort: data.voipPort,
          userName: GetQueryString('userId'),
          userPwd: GetQueryString('userPwd')
        }
        sessionStorage.set('TONE_sipUserInfo', TONE_sipUserInfo)
        await getConfig(data.cmd.POLICE_ID, data.cmd.TOKEN)
        let CallListStorage = localStorage.get('listenCallList')
        CallListStorage = CallListStorage ? CallListStorage[sessionStorage.get('TONE_sipUserInfo') ? sessionStorage.get('TONE_sipUserInfo').userName : ''] : []
        store.commit('sip/SET_CALL_LISTEN', CallListStorage || [])
        const settings = sessionStorage.get('TONE_ConfigUserInfo')
        const routes = patchRouter(settings?.FEATURE_SETTING)
        // 如果路由发生变化 重新动态添加路由
        if (JSON.stringify(store.getters.userRouteInfo) === JSON.stringify(settings?.FEATURE_SETTING)) {
          next()
        } else {
          router.matcher = new Router().matcher
          store.commit('user/SET_USER_ROUTE', JSON.parse(JSON.stringify(settings?.FEATURE_SETTING)))
          router.addRoutes(routes)
          next({ ...to })
          // hack
        }
      }).catch(() => {
      })
      return
    }
    router.push({ path: '/login' })
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
