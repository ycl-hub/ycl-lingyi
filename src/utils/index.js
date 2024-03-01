/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import json from 'body-parser/lib/types/json'
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
// 根据id 查询对应节点
export function queryId(key, obj, result = false) {
  if (obj.length > 0 && Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (item['id'] === key) {
        result = item
      }
      if (item.children && Array.isArray(item.children)) {
        result = queryId(key, item.children, result)
      }
    })
  }
  return result
}
// 修改 浏览器页签logo
export function changeIco(url) {
  var link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = url || '/T01.ico'
  document.getElementsByTagName('head')[0].appendChild(link)
}
/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
  )
}
/**
 * @param {number} point
 * @returns {string}
 */
export function toPercent(point) {
  var str = Number(point * 100).toFixed(0)
  str += '%'
  return str
}
/**
 * @param {Array} arr
 * @returns {Array}
 */
// 转化穿梭框所要的数据
export function transferDataT(arr) {
  const data = []
  arr.forEach(ele => {
    data.push({
      key: ele.metadata.name,
      label: ele.metadata.name
    })
  })
  return data
}
// 递归添加path
export function addPath(arr, path) {
  const data = []
  arr.forEach(ele => {
    if (ele.children && ele.children.length > 0) {
      addPath(ele.children, path + '/' + ele.path)
    }
    ele.path = path + '/' + ele.path
    data.push(ele)
  })
  return data
}
// 递归根据 id查找对应的节点
// ---------------------------------------------------------------------------
// 格式化时间
export function numberFont(val, type) {
  // type,0=>对比匹配图片，1=>不对比匹配图片，2=>返回汉字星期几
  // 数字转换成字体
  var str
  if (type === 0 || type === 1) {
    if (val < 10) {
      // 如果传入值小于10，拼接成0+值
      val = '0' + val
    } else {
      // 否则转化成字符串
      val = val.toString()
    }
    if (type === 0) {
      // 将传入值拆分成数组
      var arr = val.split('')
      str = arr.map(v => {
        // 循环比对生成新的数组
        switch (v) {
          case '0':
            return '&#xe618;'
          case '1':
            return '&#xe60f;'
          case '2':
            return '&#xe610;'
          case '3':
            return '&#xe611;'
          case '4':
            return '&#xe612;'
          case '5':
            return '&#xe613;'
          case '6':
            return '&#xe614;'
          case '7':
            return '&#xe615;'
          case '8':
            return '&#xe616;'
          case '9':
            return '&#xe617;'
        }
      }).join('')// 将新的数组转换成字符串
      return str
    } else {
      str = val
      return str
    }
  } else {
    str = '星　期　'
    switch (val.toString()) {
      case '0':
        return str + '日'
      case '1':
        return str + '一'
      case '2':
        return str + '二'
      case '3':
        return str + '三'
      case '4':
        return str + '四'
      case '5':
        return str + '五'
      case '6':
        return str + '六'
    }
  }
}
function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}
export function isEqual(obj1, obj2) {
  // 如果其中没有对象
  if (!isObject(obj1) || !isObject(obj2)) {
    // 值类型
    return obj1 === obj2
  }
  // 如果特意传的就是两个指向同一地址的对象
  if (obj1 === obj2) {
    return true
  }
  // 两个都是对象或者数组，而且不相等
  // 拿到对象key
  const obj1Keys = Object.keys(obj1)
  const obj2Keys = Object.keys(obj2)
  // 先判断长度就可以过滤一些
  if (obj1Keys.length !== obj2Keys.length) {
    return false
  }
  // 以obj1为基准 和 obj2 一次递归比较
  for (const key in obj1) {
    // 递归比较当前每一项
    const res = isEqual(obj1[key], obj2[key])
    // 如果碰到一个不一样的就返回 false
    if (!res) {
      // 跳出for循环
      return false
    }
  }
  // 否则全相等
  return true
}
export function GetQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  var r = window.location.search.substring(1).match(reg)
  if (r != null) return encodeURIComponent(r[2]); return null
}
export function getNowTime() {
  var date = new Date()
  // 年 getFullYear()：四位数字返回年份
  var year = date.getFullYear() // getFullYear()代替getYear()
  // 月 getMonth()：0 ~ 11
  var month = date.getMonth() + 1
  // 日 getDate()：(1 ~ 31)
  var day = date.getDate()
  // 时 getHours()：(0 ~ 23)
  var hour = date.getHours()
  // 分 getMinutes()： (0 ~ 59)
  var minute = date.getMinutes()
  // 秒 getSeconds()：(0 ~ 59)
  var second = date.getSeconds()

  var time = year + '-' + addZero(month) + '-' + addZero(day) + ' ' + addZero(hour) + ':' + addZero(minute) + ':' + addZero(second)
  return time
}

// 小于10的拼接上0字符串
function addZero(s) {
  return s < 10 ? ('0' + s) : s
}
// 扁平人员数据转化为树结构
export function flatUserTransTree(list, idPara, pidPara, parentId) {
  const tree = []
  // 创建一个对象字典，以便使用idPara快速查找每个节点
  const nodes = {}
  for (let j = 0; j < list.length; j++) {
    nodes[list[j][idPara]] = list[j]
  }
  // 遍历列表并构建树形结构
  for (let i = 0; i < list.length; i++) {
    // 只处理isRoot为true的根节点
    const node = list[i]
    const parentId = node[pidPara]
    if (node.isRoot === true) {
      // eslint-disable-next-line eqeqeq
      // if (!parentId || parentId == '0') {
      tree.push(node)
      // }
    } else {
      // 否则查找父节点并将当前节点作为其子节点添加
      if (nodes[parentId]) {
        if (!nodes[parentId].children) {
          nodes[parentId].children = []
        }
        nodes[parentId].children.push(node)
      }
    }
  }
  return { tree, nodes }
}
// 扁平设备数据转化为树结构
export function flatDevTransTree(list, idPara, pidPara, ExtTypeList, unitList) {
  let tree = []// 最终组成的树
  const nodes = {}// 扁平化所有的节点
  const unitDevArray = {}// 所有 存在设备的单位
  const parentIds = {}// 所有的 单位上级单位
  unitList.forEach(obj => {
    parentIds[obj.UnitId] = obj.ParentIds.split(',').filter(item => item)
  })
  for (let j = 0; j < list.length; j++) {
    if (!list[j].countExt) {
      nodes[list[j][idPara]] = list[j]
    }
    if (!list[j].countExt && !('ico_file' in list[j])) {
      const str = list[j]['unitid'] + list[j]['dev_type'] + 'key'// 设备单位 id+设备类别+key
      unitDevArray[str] = list[j]
      if (parentIds[list[j]['unitid']]) { // 将单位下有设备的上级单位 都存起来
        const arr = parentIds[list[j]['unitid']]
        arr.forEach(obj => {
          unitDevArray[obj + list[j]['dev_type'] + 'key'] = list[j]
        })
      }
    }
  }
  ExtTypeList.forEach(objs => {
    unitList.forEach(obj => {
      // eslint-disable-next-line eqeqeq
      if (unitDevArray[obj['UnitId'] + objs[idPara] + 'key']) { // 判断该单位是否存在设备
        obj[pidPara] = objs[idPara]
        nodes[obj['UnitId'] + objs[idPara]] = { ...obj } // 多个设备类别下有多个单位 单位用单位id+设备类别存键值
      }
    })
  })
  const compare = (v, node, key) => {
    if (v && nodes[v]) {
      if (!nodes[v].children) {
        nodes[v].children = []
      }
      if (node['UnitId'] && !node['gpsid']) {
        node['UnitId'] = key// 将单位id设置为id加设备类别 以免重复
      }
      nodes[v].children.push(node)
    }
  }
  // 遍历列表并构建树形结构
  for (const key in nodes) {
    const node = nodes[key]// 当前节点
    const BelongUp = node['BelongUp']// 单位id
    const nodePidPara = node[pidPara]// 设备类别
    // console.log(`${key}: ${nodes[key]}`)
    if (node.ico_file) { // 只有设备类别存在图标地址
      tree.push(node)// 所有的 设备总类别 根节点
    } else if (node.isRoot) { // 将所有的根单位 加入到设备类别下面
      compare(nodePidPara, node, key)
    } else if (BelongUp && BelongUp != 0 && !node[idPara]) { //  将所有的单位 加入到设备类别下的单位下
      const keyID = BelongUp + nodePidPara
      compare(keyID, node, key)
    } else if (node['unitid'] && node['dev_type']) { // 将所有的设备加入到单位中
      const keyID = node['unitid'] + nodePidPara
      compare(keyID, node)
    }
  }
  tree = tree.filter(item => item.children && item.children.length > 0)
  return { tree, nodes }
}
export function getOnlyKey() {
  // 返回一个promise ycl

  return new Promise((resolve, reject) => {
    const fpPromise = FingerprintJS.load()
    fpPromise
      .then(fp => fp.get())
      .then(result => {
        window.visitorId = result.visitorId
        // console.log(result.visitorId)
        resolve(result.visitorId)
      })

    //   const fpPromise = new Promise((resolve, reject) => {

    //     const script = document.createElement('script')
    //     script.onload = resolve
    //     script.onerror = reject
    //     script.async = true
    //     script.src = 'https://cdn.jsdelivr.net/npm/' +
    //     '@fingerprintjs/fingerprintjs@3/dist/fp.min.js'
    //     document.head.appendChild(script)
    //   })
    //     // eslint-disable-next-line no-undef
    //     .then(() => FingerprintJS.load())

  //   fpPromise
  //     .then(fp => fp.get())
  //     .then(result => {
  //     // This is the visitor identifier:
  //       window.visitorId = result.visitorId
  //       resolve(result.visitorId)
  //     })
  })
}
export function queryPath(key, obj, result = false) {
  if (obj && obj.length > 0 && Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (item['PATH'] === key) {
        result = item
      }
      if (item.children && Array.isArray(item.children)) {
        result = queryPath(key, item.children, result)
      }
    })
  }
  return result
}
export function formatDuring(mss, type) {
  var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
  var seconds = Math.ceil((mss % (1000 * 60)) / 1000)
  if (type === 's') {
    return seconds
  } else {
    return +hours + '小时' + minutes + '分钟' + seconds + '秒'
  }
}
// 时间转换
export function getTime(value) {
  let theTime = parseInt(value)// 秒
  let theTime1 = 0// 分
  let theTime2 = 0// 小时
  if (value === 0) {
    return ''
  }
  if (theTime >= 60) {
    theTime1 = parseInt(theTime / 60)
    theTime = parseInt(theTime % 60)

    if (theTime1 >= 60) {
      theTime2 = parseInt(theTime1 / 60)
      theTime1 = parseInt(theTime1 % 60)
    }
  }
  if (theTime < 10 && theTime >= 0) {
    theTime = '0' + theTime
  }
  let result = '' + theTime
  if (theTime1 >= 0 && theTime1 < 10) {
    result = '0' + parseInt(theTime1) + ':' + result
  }
  if (theTime1 >= 10) {
    result = parseInt(theTime1) + ':' + result
  }
  if (theTime2 >= 0 && theTime2 < 10) {
    result = '0' + parseInt(theTime2) + ':' + result
  }
  if (theTime2 >= 10) {
    result = '0' + parseInt(theTime2) + ':' + result
  }
  return result
}
// 查找 音视频id号对应的名称
export function getName(userListInfo, to) {
  return userListInfo.find(item => String(item.yonghuid) === String(to) || String(item.id) === String(to))?.UnitName || to
}
export function combineIconAndLabel(url, label, size, cesium) {
  // 创建画布对象 自定义聚合图标
  const Cesium = cesium
  const canvas = document.createElement('canvas')
  // canvas.width = size
  // canvas.height = size
  canvas.width = size
  canvas.height = size
  canvas.style.width = size * 2 + 'px'
  canvas.style.height = size * 2 + 'px'
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  let width = 14; let offsetWidth = -40; let offsetLabel = 36
  const Bit = label.toString().length
  switch (Bit) {
    case 1:
      width = 14
      offsetWidth = 20
      offsetLabel = 36
      break
    case 2:
      width = 14
      offsetWidth = 20
      offsetLabel = 36
      break
    case 3:
      width = 20
      offsetWidth = 15
      offsetLabel = 38
      break
    case 4:
      width = 26
      offsetWidth = 8
      offsetLabel = 42
      break
    case 5:
      width = 36
      offsetWidth = 0
      offsetLabel = 45
      break
  }
  // eslint-disable-next-line new-cap
  const promise = new Cesium.Resource.fetchImage(url).then(image => {
    // 异常判断
    try {
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(image, 0, 0, 30, 30)
      // 渲染字体
      var borderRadius = 5
      var height = 18
      var offsetX = canvas.width - width - offsetWidth // 右上角原点的 x 坐标偏移量  两位数 -40，三位数-10  四位数 -28 五位数 -17
      var offsetY = 0 // 右上角原点的 y 坐标偏移量

      // 绘制矩形背景
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.moveTo(offsetX + borderRadius, offsetY)
      ctx.lineTo(offsetX + width - borderRadius, offsetY)
      ctx.quadraticCurveTo(offsetX + width, offsetY, offsetX + width, offsetY + borderRadius)
      ctx.lineTo(offsetX + width, offsetY + height - borderRadius)
      ctx.quadraticCurveTo(offsetX + width, offsetY + height, offsetX + width - borderRadius, offsetY + height)
      ctx.lineTo(offsetX + borderRadius, offsetY + height)
      ctx.quadraticCurveTo(offsetX, offsetY + height, offsetX, offsetY + height - borderRadius)
      ctx.lineTo(offsetX, offsetY + borderRadius)
      ctx.quadraticCurveTo(offsetX, offsetY, offsetX + borderRadius, offsetY)
      ctx.closePath()
      ctx.fill()

      // 设置文本样式为白色12px，并使用shadowBlur和shadowColor属性添加阴影效果
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, offsetLabel, 10)// 36  .. 38 .. 42 ..45
    } catch (e) {
      console.log(e)
    }
    return canvas
  })
  return promise
}
export function getCircleBoundary(center, radius, granularity) {
  var positions = [];
  var angle;
  var i;
  for (i = 0; i <= 360; i += granularity) {
      angle = Cesium.Math.toRadians(i);
      var x = center.x + radius * Math.cos(angle);
      var y = center.y + radius * Math.sin(angle);
      var position = new Cesium.Cartesian3(x, y, center.z); // 将 z 设置为 center.z 避免 'normalized result is not a number' 错误
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      positions.push(
          {
           lng: Cesium.Math.toDegrees(cartographic.longitude),
           lat:Cesium.Math.toDegrees(cartographic.latitude),
          }
      );
  }
  return positions;
}

