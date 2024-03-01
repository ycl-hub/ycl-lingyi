import { api } from '@/api/env'
import jqPos from '@/assets/images/equipment/jqPos.png'
// 回显图层
export function rend(viewer, newOverlays) {
  const o = []
  newOverlays.forEach((item) => {
    if (item.tab === '绘制' && item.name.search('点') !== -1) {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(item.pot.lng, item.pot.lat, item.pot.h),
        id: item.id,
        billboard: {
          image: item.img,
          width: 30, // 如果不设置宽高 初始化无法正常显示聚合数量
          height: 30
        }
      });
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.pot = item.pot
      entity.img = item.img
      entity.show = false;
      o.push(entity)
    }
    if (item.tab === '绘制' && item.name.search('折线') !== -1) {
      const entity = this.viewer.entities.add({
        id: item.id,
        polyline: {
          positions: item.pointArr,
          material: Cesium.Color.fromCssColorString(item.matColor),
          width: item.w,
        }
      })
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.matColor = item.matColor
      entity.h = item.h
      entity.pointArr = item.pointArr
      entity.w = item.w
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '绘制' && item.name.search('多边形') !== -1) {
      const entity = this.viewer.entities.add({
        id: item.id,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(item.pointArr),
          material: Cesium.Color.fromCssColorString(item.matColor),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(item.outColor),
          height: item.h
        }
      })
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.matColor = item.matColor
      entity.outColor = item.outColor
      entity.h = item.h
      entity.pointArr = item.pointArr
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '绘制' && item.name.search('椭圆形') !== -1) {
      const entity = viewer.entities.add({
        id: item.id,
        position: Cesium.Cartesian3.fromDegrees(item.pot.lng, item.pot.lat),
        ellipse: {
          semiMinorAxis: item.min,
          semiMajorAxis: item.max,
          material: Cesium.Color.fromCssColorString(item.matColor),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(item.outColor),
          height: item.h
        }
      })
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.pot = item.pot
      entity.max = item.max
      entity.min = item.min
      entity.matColor = item.matColor
      entity.outColor = item.outColor
      entity.h = item.h
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '绘制' && item.name.search('矩形') !== -1) {
      const entity = this.viewer.entities.add({
        id: item.id,
        rectangle: {
          coordinates: Cesium.Rectangle.fromCartesianArray([
            item.sPoint,
            item.ePoint
          ]),
          material: Cesium.Color.fromCssColorString(item.matColor),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(item.outColor),
          height: item.h
        }
      })
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.matColor = item.matColor
      entity.outColor = item.outColor
      entity.h = item.h
      entity.sPoint = item.sPoint
      entity.ePoint = item.ePoint
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '绘制' && item.name.search('圆 ') !== -1) {
      const entity = viewer.entities.add({
        id: item.id,
        position: Cesium.Cartesian3.fromDegrees(item.pot.lng, item.pot.lat),
        ellipse: {
          semiMinorAxis: item.rad,
          semiMajorAxis: item.rad,
          material: Cesium.Color.fromCssColorString(item.matColor),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(item.outColor),
          height: item.h
        }
      })
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.pot = item.pot
      entity.rad = item.rad
      entity.matColor = item.matColor
      entity.outColor = item.outColor
      entity.h = item.h
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '标注' && item.name.search('文字') !== -1) {
      const entity = viewer.entities.add(
        new Cesium.Entity({
          position: Cesium.Cartesian3.fromDegrees(item.pot.lng, item.pot.lat, item.pot.h),
          id: item.id,
          label: {
            text: item.text,
            font: item.ft,
            fillColor: Cesium.Color.fromCssColorString(item.fc),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            backgroundColor: Cesium.Color.fromCssColorString(item.bg),
            showBackground: item.showBg
          },
        })
      );
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.pot = item.pot
      entity.text = item.text
      entity.ft = item.ft
      entity.fc = item.fc
      entity.bg = item.bg
      entity.showBg = item.showBg
      entity.show = false
      o.push(entity)
    }
    if (item.tab === '图标') {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(item.pot.lng, item.pot.lat, item.pot.h),
        id: item.id,
        billboard: {
          image: item.img,
          width: item.sz, // 如果不设置宽高 初始化无法正常显示聚合数量
          height: item.sz
        }
      });
      entity.name = item.name
      entity.time = item.time
      entity.tab = item.tab
      entity.pot = item.pot
      entity.img = item.img
      entity.sz = item.sz
      entity.show = false;
      o.push(entity)
    }
  })
  return o
}
