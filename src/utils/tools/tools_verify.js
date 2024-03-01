export default new class Verify {
  // 验证url是否正确，true/false
  isUrl(url) {
    return (/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/i).test(url)
  }

  // 判断是否是数组
  isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]'
  }

  // 判断是否是object对象
  isObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]'
  }
  // 去除空格
  isTrim(x) {
    return x.replace(/\s+/gm, '')
  }
  // 返回域名
  realmName(href) {
    const url = href.match(/^http(s)?:\/\/(.*?)\//)[0]
    return url.substring(0, url.length - 1)
  }
}()
