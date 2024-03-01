import request from '@/api/request'
// 获取通话记录列表
export function getTonghuaList(query) {
  return request({
    url: '/manager/call/call!pageQuery2.action',
    method: 'get',
    params: query
  })
}
// 获取对讲记录列表
export function getDuijiangList(query) {
  return request({
    url: '/manager/call/voice!pageQuery.action',
    method: 'get',
    params: query
  })
}
// 通话记录查询  type 区分 对讲:4,单聊:1,会议:2,广播:3
export function pageQueryRoom(query) {
  return request({
    url: '/manager/call/call!pageQueryRoom.action',
    method: 'get',
    params: query
  })
}
//  新增轮询历史记录
export function addSmsRecord(query) {
  return request({
    url: '/rstoneCmd/Service/addSmsRecord',
    method: 'post',
    data: query
  })
}

//  查询轮询历史记录
export function smsRecordList(query) {
  return request({
    url: '/rstoneCmd/Service/smsRecordList',
    method: 'post',
    data: query
  })
}
//  视频转换
export function mp4ToWebM(query) {
  return request({
    url: '/manager/call/call!mp4ToWebM.action',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: query,
    timeout: 60 * 60 * 10000
  })
}
