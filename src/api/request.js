import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
// import router, { resetRouter } from '@/router'
import router from '@/router'
import { api } from '@/api/env'
// import { localStorage } from '@/utils/storage'
// create an axios instance
import { sessionStorage } from '@/utils/storage'
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: api, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (config.url.search('/manager') !== -1) {
      // console.log(config.url, 777)
      if (sessionStorage.get('TONE_voip')) {
        const TOKEN = sessionStorage.get('TONE_voip').cmd.TOKEN
        const policeNo = sessionStorage.get('TONE_voip').cmd.POLICE_ID
        // 修复漏洞
        config.headers['token'] = TOKEN
        config.headers['policeNo'] = policeNo
        // 增加get请求参数
      }
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
// response interceptor
// 由于此项目很多地方加ws及轮训，Message会受到他们的影响，所以不再此处统一处理了，需要特定位置特定处理
service.interceptors.response.use(
  response => {
    const res = response
    // if the custom code is not 20000, it is judged as an error.
    if (res.status === 200 || res.status === 201 || res.status === 204) {
      // Message.closeAll()
      if (response && response.data && response.data.msg === '无效的令牌!') {
        Message({
          message: '登录超时，请重新登录！' || 'Error',
          type: 'error',
          duration: 5 * 1000
        })
        router.push('/login')
      }
      return response
    } else {
      // Message.closeAll()
      // Message({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  error => {
    // console.log(error, 7)
    // console.log(error.response, 8) // for debug
    // Message({
    //   message: error.response,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
