
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

// 只能包含字母及数字
const userName = /^[A-Za-z0-9]+$/
// 密码
// const password = /^[0-9]{4,20}$/
const password = /^[\da-zA-Z~!@#$%^&*]{4,20}$/
// 最长63个字符，只能包含小写字母，数字以及分隔符（“-”），且必须以小写字母开头，数字或者小写字母结尾
const name = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]{1,1}$/
// 邮箱
const email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
// 数字
const number = /^[0-9]*$/
// 中文、英文、数字
const zhEngNumber = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/
// 7、8或者11位
const ee = /^(\d{7}|\d{8}|\d{11})$/
// 手机号
const phone = /^[0+]|[1][3,4,5,7,8,9][0-9]{9}$/

export function validateUserName(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else if (!userName.test(value)) {
    callback(new Error('用户名只能包含字母或数字'))
  } else {
    callback()
  }
}
export function validatePassword(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (!password.test(value)) {
    // callback(new Error('密码支持数字、英文大小写、特殊字符，可包含其中一种或多种组合，长度4到20位'))
    callback(new Error('密码格式不合法'))
  } else {
    callback()
  }
}
export function validatePasswordLoginTip(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (!password.test(value)) {
    callback(new Error('密码格式不合法'))
  } else {
    callback()
  }
}
export function validateName(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入名称'))
  } else if (!name.test(value)) {
    callback(new Error('名称格式不合法'))
  } else {
    callback()
  }
}
export function validateEmail(rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else if (!email.test(value)) {
    callback(new Error('邮箱格式不合法'))
  } else {
    callback()
  }
}
export function validateNumber(rule, value, callback) {
  if (value === '') {
    callback()
  } else if (!number.test(value)) {
    callback(new Error('请输入正确的数字'))
  } else {
    callback()
  }
}
// 报警人名称
export function validateReporterName(rule, value, callback) {
  if (value === '') {
    callback()
  } else if (!zhEngNumber.test(value)) {
    callback(new Error('请输入中文英文或数字组合'))
  } else {
    callback()
  }
}
// 8或者11位数字
export function validateNumber811(rule, value, callback) {
  if (value === '') {
    callback()
  } else if (!ee.test(value)) {
    callback(new Error('请输入7、8或者11位数字'))
  } else {
    callback()
  }
}
// 验证是否是手机号提示信息
export function validatePhoneTip(rule, value, callback) {
  if (value === '') {
    callback()
  } else if (!phone.test(value)) {
    callback(new Error('请输入手机号'))
  } else {
    callback()
  }
}
// 校验手机号是否正确
export function validatePhoneBol(num) {
  return phone.test(num)
}
