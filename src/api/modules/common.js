import request from '@/api/request'
// 通过token获取用户名密码
export function getUserPass(query) {
  return request({
    url: '/sipForVue/token',
    method: 'get',
    params: query
  })
}
// 通过用户名密码获取额外的用户信息(sipIP、port)
export function getVoipForDDT(query) {
  return request({
    url: '/androidApi/getVoipForDDT.action',
    method: 'get',
    params: query
  })
}
// 单点登录的退出
export function logout(query) {
  return request({
    url: '/sipForVue/logout',
    method: 'get',
    params: query
  })
}
// 账号密码登录的退出
export function Logout(query) {
  return request({
    url: '/rstoneCmd/Service/LogOut',
    method: 'post',
    data: query
  })
}
// 修改密码
export function changePassword(query) {
  return request({
    url: '/manager/ddtInfo/ddtInfo!changePassword.action',
    method: 'get',
    params: query
  })
}
// 获取设备列表
export function getDevTypeList(query) {
  return request({
    url: '/manager/unit/extype!pageQuery.action?start=0&pageSize=200',
    method: 'get',
    params: query
  })
}
// 获取设备点位
export function getDevPoint(query) {
  return request({
    url: '/manager/gps/gps!loadExtUserGpsInfo.action',
    method: 'get',
    params: query
  })
}
// 获取app/警务通定位信息
export function getAppLocaltion(query) {
  return request({
    url: '/manager/gps/gps!loadGpsInfo.action',
    method: 'get',
    params: query
  })
}
// 1
export function getPowerById(query) {
  return request({
    url: '/manager/unit/yonghuPower!getPowerById.action',
    method: 'get',
    params: query
  })
}
// 根据设备类型及权限获取组织
export function loadUnitList(query) {
  return request({
    url: '/manager/unit/unitInfo!loadUnitList.action',
    method: 'get',
    params: query
  })
}
// 3
export function loadYonghuDDTByUnitid(query) {
  return request({
    url: '/manager/unit/yongHuInfo!loadYonghuDDTByUnitid.action',
    method: 'post',
    data: {
      zip: '1',
      ...query
    }
  })
}
// 如果没有树的节点获取设备类型，（前200个）
export function extype(query) {
  return request({
    url: '/manager/unit/extype!pageQuery.action?start=0&pageSize=200',
    method: 'get',
    params: query
  })
}
// 获取组织下的设备
export function getExtUserList(query) {
  return request({
    url: '/manager/unit/extuser!getExtUserList.action',
    method: 'post',
    data: {
      zip: '1',
      ...query
    }
  })
}
// 获取会议列表
export function getMeetingList(query) {
  return request({
    url: '/androidApi/voip/getMeetingList.action',
    method: 'get',
    params: query
  })
}
// 获取会议成员
export function getMeetingMember(query) {
  return request({
    url: '/androidApi/voip/getMeetingMember.action',
    method: 'get',
    params: query
  })
}
// 获取会议成员状态
export function conference_interactive(query) {
  return request({
    url: '/manager/call/call!conference_interactive.action',
    method: 'get',
    headers: {
      'Content-Type': 'application/xml'
    },
    params: query
  })
}
// 删除会议
export function delMeetingByConfId(query) {
  return request({
    url: '/androidApi/function/delMeetingByConfId.action',
    method: 'get',
    params: query
  })
}
// 创建会议
export function createMeetingRoom(query) {
  return request({
    url: '/androidApi/voip/createMeetingRoom.action',
    method: 'get',
    params: query
  })
}
// 会议邀请
export function invite_one_member(query) {
  return request({
    url: '/manager/call/call!invite_one_member.action',
    method: 'get',
    params: query
  })
}
// 分发视频
export function vdispatch(query) {
  return request({
    url: '/manager/call/call!vdispatch.action',
    method: 'get',
    params: query
  })
}
// 分发视频修改版
export function vdispatchBtn(query) {
  return request({
    url: '/manager/call/distributionInfo!videoDistribution.action',
    method: 'post',
    data: query
  })
}
// 拉起会议
export function launchMeeting(query) {
  return request({
    url: '/androidApi/voip/launchMeeting.action',
    method: 'get',
    params: query
  })
}
// 会议控制
export function meetControl(query) {
  return request({
    url: '/manager/call/call!conference_interactive.action',
    method: 'get',
    params: query
  })
}
// 查询历史位置
export function loadGpsHistory(query) {
  return request({
    url: '/manager/gps/gps!loadGpsHistory.action',
    method: 'get',
    params: query
  })
}
// 模糊查询指挥调度
export function muhuSearchZhiHui(query) {
  return request({
    url: '/manager/unit/yongHuInfo!loadOrgYonghu.action',
    method: 'post',
    data: query
  })
}
// 查询警情
export function getHisAlarm(query) {
  return request({
    url: '/rstoneCmd/Service/GetHisAlarm',
    method: 'get',
    params: query
  })
}
// 警情类别
export function getCategory(query) {
  return request({
    url: '/rstoneCmd/Service/Category',
    method: 'get',
    params: query
  })
}
// 二次定位
export function SecondLocate(query) {
  return request({
    url: '/rstoneCmd/Service/SecondLocate',
    method: 'post',
    data: query
  })
}
// 查询警力
export function police(query) {
  return request({
    url: '/rstoneCmd/Service/Police',
    method: 'post',
    data: query
  })
}
// 警情详情
export function GetAlarmDetail(query) {
  return request({
    url: '/rstoneCmd/Service/GetAlarmDetail',
    method: 'get',
    params: query
  })
}
// 派警
export function HandleAlarm(query) {
  return request({
    url: '/rstoneCmd/Service/HandleAlarm',
    method: 'post',
    data: query
  })
}
// 新建警情
export function ReportAlarm(query) {
  return request({
    url: '/rstoneCmd/Service/ReportAlarm',
    method: 'post',
    data: query
  })
}
// 新建警情, 警情升级
export function ImportantAlarm(query) {
  return request({
    url: '/rstoneCmd/Service/ImportantAlarm',
    method: 'post',
    data: query
  })
}
// 创建广播
export function createBroadcast(query) {
  return request({
    url: '/androidApi/voip/createBroadcast.action',
    method: 'get',
    params: query
  })
}
//  获取账号配置信息
export function getConfig(query) {
  return request({
    url: '/rstoneCmd/Service/getConfig' + query,
    method: 'get'
  })
}
//  获取账号配置信息1 manager管理配置
export function getConfig1(query) {
  return request({
    url: '/rstoneCmd/Service/getConfig1' + query,
    method: 'get'
  })
}
//  保存账号配置信息
export function updateConfig(query) {
  return request({
    url: '/rstoneCmd/Service/updateConfig',
    method: 'post',
    data: query,
    timeout: 10000
  })
}
//  重置账号配置信息
export function resetConfig(query) {
  return request({
    url: '/rstoneCmd/Service/resetConfig' + query,
    method: 'post'
  })
}
// 添加、删除广播人员
export function addDelBroadcastMem(query) {
  return request({
    url: '/manager/meeting/meetingInfo!saveYonghu.action',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: query
  })
}
// 编辑广播
export function editBroadcast(query) {
  return request({
    url: '/manager/meeting/meetingInfo!onSaveOrUpdate.action',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: query
  })
}
// 获取联动话机配置
export function GetTelPhoneSettingUrl(query) {
  return request({
    url: '/manager/telPhone/telPhoneInfo!getTelPhoneById.action' + query,
    method: 'get'
  })
}
// 保存联动话机配置
export function SaveTelPhoneSetting(query) {
  return request({
    url: '/manager/telPhone/telPhoneInfo!onSaveOrUpdate.action',
    method: 'post',
    data: query
  })
}
// 获取录制配置
export function getRecordingConfig(query) {
  return request({
    url: '/rstoneCmd/Service/getRecordingConfig',
    method: 'post',
    data: query
  })
}
// 修改录制配置
export function updateRecordingConfig(query) {
  return request({
    url: '/rstoneCmd/Service/updateRecordingConfig',
    method: 'post',
    data: query
  })
}
//  重置录制配置
export function resetRecordingConfig(query) {
  return request({
    url: '/rstoneCmd/Service/resetRecordingConfig',
    method: 'post',
    data: query
  })
}
//  查询权限配置
export function moduleInfoList(query) {
  return request({
    url: '/rstoneCmd/Service/moduleInfoList' + query,
    method: 'post'
  })
}

// 创建常用群组
export function addOrUpdateCommonDevs(query) {
  return request({
    url: '/rstoneCmd/Service/addOrUpdateCommonDevs',
    method: 'post',
    data: query
  })
}
//  查询常用群组
export function queryCommonByUnit(query) {
  return request({
    url: '/rstoneCmd/Service/queryCommonByUnit' + query,
    method: 'post'
  })
}
//  删除常用群组
export function deleteCommon(query) {
  return request({
    url: '/rstoneCmd/Service/deleteCommon',
    method: 'post',
    data: query
  })
}
//  同步常用群组到im群组
export function syncCommonToIm(query) {
  return request({
    url: '/rstoneCmd/Service/syncCommonToIm',
    method: 'post',
    data: query
  })
}
// 获取短信模板
export function getSmsTemplate(query) {
  return request({
    url: '/rstoneCmd/Service/getSmsTemplate',
    method: 'post',
    data: query
  })
}
// 申请强插呼叫
export function reqForceCall(query) {
  return request({
    url: '/rstoneCmd/Service/reqForceCall',
    method: 'post',
    data: query
  })
}
// 强插回信
export function forceCallBack(query) {
  return request({
    url: '/rstoneCmd/Service/forceCallBack',
    method: 'post',
    data: query
  })
}
// 动态设备上图历史信息
export function loadYongHuLastGps(query) {
  return request({
    url: '/manager/unit/yongHuInfo!loadYongHuLastGps.action',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: query
  })
}
