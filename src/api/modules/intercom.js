import request from '@/api/request'
// 获取对讲列表
export function getIntercomList(query) {
  return request({
    url: '/manager/intercom/intercomInfo!getIntercomListByUId.action',
    method: 'get',
    params: query
  })
}
// 请求话权
export function requestTalk(query) {
  return request({
    url: '/manager/intercom/intercomInfo!requestTalk.action',
    method: 'get',
    params: query
  })
}
// 释放话权
export function relaceTalk(query) {
  return request({
    url: '/manager/intercom/intercomInfo!relaceTalk.action',
    method: 'get',
    params: query
  })
}
