import request from '@/api/request'
// 重大警情处置警力查询
export function ImportantAlarmPolice(query) {
  return request({
    url: '/rstoneCmd/Service/ImportantAlarmPolice',
    method: 'get',
    params: query
  })
}
// 重大警力派警
export function CmdPolice(query) {
  return request({
    url: '/rstoneCmd/Service/CmdPolice',
    method: 'post',
    data: query
  })
}
// 获取周围警力
export function getNearPolice(query) {
  return request({
    url: '/rstoneCmd/Service/getNearPolice',
    method: 'post',
    data: query
  })
}
// 重大警情时间轴
export function GetCmdPoliceHis(query) {
  return request({
    url: '/rstoneCmd/Service/GetCmdPoliceHis',
    method: 'post',
    data: query
  })
}
// 查询警力通讯人员
export function GetGroupMember(query) {
  return request({
    url: '/rstoneCmd/Service/GetGroupMember',
    method: 'post',
    data: query
  })
}
// 查询周边资源
export function getVideo(query) {
  return request({
    url: '/rstoneCmd/Service/getVideo',
    method: 'post',
    data: query
  })
}
// 重大警情完成
export function ImportantAlarmFinish(query) {
  return request({
    url: '/rstoneCmd/Service/ImportantAlarmFinish',
    method: 'post',
    data: query
  })
}
// 普通警情处置警力查询
export function getAlarmPolice(query) {
  return request({
    url: '/rstoneCmd/Service/getAlarmPolice',
    method: 'get',
    params: query
  })
}
