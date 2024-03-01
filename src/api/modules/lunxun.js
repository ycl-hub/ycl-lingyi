import request from '@/api/request'

// 查询轮询组
export function queryPollingByUnit(query) {
  return request({
    url: '/rstoneCmd/Service/queryPollingByUnit',
    method: 'get',
    params: query
  })
}
// 添加/编辑 轮询组
export function saveOrUpdatePolling(query) {
  return request({
    url: '/rstoneCmd/Service/saveOrUpdatePolling',
    method: 'post',
    data: query
  })
}
// 删除轮询组
export function deletePolling(query) {
  return request({
    url: '/rstoneCmd/Service/deletePolling',
    method: 'post',
    data: query
  })
}
//  新增轮询历史记录
export function addVideoPollingRecord(query) {
  return request({
    url: '/rstoneCmd/Service/addVideoPollingRecord',
    method: 'post',
    data: query
  })
}
//  查询轮询历史记录
export function videoPollingRecordList(query) {
  return request({
    url: '/rstoneCmd/Service/videoPollingRecordList',
    method: 'post',
    data: query
  })
}
