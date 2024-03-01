import request from '@/api/request'
// 获取图标列表
export function getPlottingImgs(query) {
  return request({
    url: '/manager/plotting/plottinginfo!getPlottingIco.action',
    method: 'get',
    params: query
  })
}
// 增加或修改标绘信息
export function addEditPlottinginfo(query) {
  return request({
    url: '/manager/plotting/plottinginfo!onSaveOrUpdate.action',
    method: 'post',
    data: query
  })
}
// 获取标绘列表
export function getPlottingById(query) {
  return request({
    url: '/manager/plotting/plottinginfo!getPlottingById.action',
    method: 'get',
    params: query
  })
}
// 获取json图层
export function getJSON(url, query) {
  return request({
    url: url,
    method: 'get',
    params: query
  })
}
// 删除标绘信息
export function toDeleteMany(query) {
  return request({
    url: '/manager/plotting/plottinginfo!toDeleteMany.action',
    method: 'get',
    params: query
  })
}
