export default new class Uri {
  // URI 解码
  decode(value) {
    return decodeURIComponent(value)
  }

  // URI 编码
  encode(value) {
    return encodeURIComponent(value)
  }

  // 对象转为url
  jointUrl(obj) {
    const paramArr = []
    let param = ''
    if (obj && typeof obj === 'object') {
      for (const i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (obj[i] !== '' && obj[i] !== null && typeof obj[i] !== 'undefined') {
            paramArr.push(encodeURIComponent(i))
            paramArr.push('=')
            paramArr.push(encodeURIComponent(obj[i]))
            paramArr.push('&')
          }
        }
      }
    }
    param = paramArr.join('').replace(/&$/, '')
    return param
  }

  // url转为对象
  queryURL(url) {
    const newurl = url || window.location.href
    const arr = newurl.split('?')
    const params = arr[1].split('&')
    const obj = {}
    for (var i = 0; i < params.length; i++) {
      const param = params[i].split('=')
      obj[param[0]] = decodeURIComponent(param[1])
    }
    return obj
  }

  isUrl(str) {
    const durl = /https?:\/\/([^\/]+)/i
    return durl.test(str)
  }
  // 相对路径
  domainURI(str) {
    let path = ''
    let domain = ''
    const durl = /https?:\/\/([^\/]+)/i
    if (!durl.test(str)) {
      return str
    }

    domain = str.match(durl)
    path = str.split(domain[0])[1]

    return path
  }
}()
