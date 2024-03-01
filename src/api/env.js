/**
 * 配置开发环境、线上环境...之间的切换
 */

let api = ''
let ws = ''
let sr = ''
if (process.env.NODE_ENV === 'development') {
  api = '/api'
  ws = ''
  sr = '/devSr'
}
if (process.env.NODE_ENV === 'production') {
  // 线上
  // api = '/prod-api'
  api = ''
  ws = ''
  sr = ''
  if (process.env.VUE_APP_ENV && process.env.VUE_APP_ENV === 'staging') {
    api = '/staging-api'
    ws = ''
  }
}

export {
  api,
  ws,
  sr
}
