import request from '@/api/request'
// 获取人员列表和组成员列表
export function GetGroupList(query) {
  return request({
    url: '/rstoneCmd/Service/GetGroupList',
    method: 'get',
    params: query
  })
}
// 创建IM组
export function CreateGroup(query) {
  return request({
    url: '/rstoneCmd/Service/CreateGroup',
    method: 'post',
    data: query
  })
}
// 获取聊天历史记录
export function GetChatMsgHis(query) {
  return request({
    url: '/rstoneCmd/Service/GetChatMsgHis',
    method: 'post',
    data: query
  })
}
// 获取聊天历史记录
export function SendMessage(query) {
  return request({
    url: '/rstoneCmd/Service/SendMessage',
    method: 'post',
    data: query
  })
}
// IM相关的上传
export function UpLoad(query) {
  return request({
    url: '/rstoneCmd/Service/UpLoad',
    method: 'post',
    data: query
  })
}
// 查询群组成员列表
export function GetGroupMember(query) {
  return request({
    url: '/rstoneCmd/Service/GetGroupMember',
    method: 'get',
    params: query
  })
}
// 添加成员
export function AddMember(query) {
  return request({
    url: '/rstoneCmd/Service/AddMember',
    method: 'post',
    data: query
  })
}
// 移除成员
export function RemoveMember(query) {
  return request({
    url: '/rstoneCmd/Service/RemoveMember',
    method: 'post',
    data: query
  })
}
// 删除IM组
export function DelGroup(query) {
  return request({
    url: '/rstoneCmd/Service/DelGroup',
    method: 'post',
    data: query
  })
}
// IM组重命名
export function RenameGroup(query) {
  return request({
    url: '/rstoneCmd/Service/RenameGroup',
    method: 'post',
    data: query
  })
}
