<template>
  <div class="map tone_sip">
    <Viewer2D :viewer3D="viewer" v-if="mapType==='TwoThreeLink'" />
    <div id="cesiumMap" class="bm-view" :style="{width:mapType==='TwoThreeLink'?'50%':'100%'}"/>

    <!-- 左侧 -->
    <Left v-if="leftShow" />
    <!-- 底部设备 -->
    <Equipment v-if="bmapShow" ref="equipment" :b-map="BMap" :viewer="viewer"  :map="map" :lnglat="lnglat" />
    <!-- 单个视频窗口 -->
    <VideoWindow />
  </div>
</template>

<script>
import { mapJson } from '@/assets/js/mapJson.js'
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import Equipment from './subComponents/equipment'
import Left from './subComponents/left'
import { BmView } from 'vue-baidu-map'
import { mapGetters } from 'vuex'
import { queryId, queryPath } from '@/utils'
import VideoWindow from '@/components/videoWindow'
import { sessionStorage } from '@/utils/storage'
import cesium from '@/components/mixins/Cesium.js'
import Viewer2D from './2DViewer.vue'
export default {
  name: 'Map',
  components: {
    BaiduMap, Equipment, Left, BmView, VideoWindow,Viewer2D
  },
  mixins: [cesium],
  data() {
    return {
      BMap: {}, // 核心类
      map: {}, // 地图实例
      // lng: 111.747176, lat: 40.845802 蒙古地图中心点
      // center: { lng: 116.401969, lat: 39.91405 }, // 北京地图中心点
      // zoom: 12,
      lnglat: {}, // 经纬度及缩放等级
      drawingManager: null,
      bmapShow: false,
      leftShow: true,
      startZoom: '',
      mapZoom: {},
      sessionStorage, queryPath, viewer: {},
    }
  },
  computed: {
    ...mapGetters([
      'mapType',
      'mapState',
      'center',
      'zoom',
      'settings'
    ])
  },
  watch: {

  },
  provide: function() {
    return {
      mapClick: this.mapClick
    }
  },
  created() {
  },
  activated() {
    const res = queryId('resource', this.settings.FEATURE_SETTING)
    // console.log(sessionStorage.get('moduleInfo')) 权限分配
    const res2 = queryPath('resource', sessionStorage.get('moduleInfo'))
    if (res.isOpen && res.show && res2 && res2.DISPLAY) {
      this.leftShow = true
    } else {
      this.leftShow = false
    }
    // if (this.bmapShow && this.$refs.equipment && this.$refs.equipment.loadShow) {
    //   this.$nextTick(_ => {
    //     this.$refs.equipment.loadShow()
    //   })
    //   // 必须在地图加载完成后再去加载警情设备上图等
    // }
  },
  mounted() {
    const _this = this
    this.init('cesiumMap', function(viewer, Cesium) {
      _this.bmapShow = true
      _this.$root.$on('rollback',()=>{
        if(_this.$route.path==='/map'){
          _this.rollback()
        }
      })
      viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
        var pickedFeature = viewer.scene.pick(movement.endPosition)
        if (pickedFeature?.id||pickedFeature?.primitive) { // 移动到实体或者模型
          viewer.canvas.style.cursor = 'pointer' // 将鼠标指针设置为手的形状
          return
        } else {
          viewer.canvas.style.cursor = 'default'
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    })

  },
  methods: {
    query() {
      return queryId
    },
    // 地图渲染完毕触发
    handler({ BMap, map }) {
      // console.log(this.BMap, BMap)
      this.BMap = BMap
      this.map = map
      this.bmapShow = true
      // this.map.setMapStyle({ style: 'light' }) // 2.0原生api
      console.log(this.mapState)
      // 主题json需要修改
      if (this.mapState === 'onLine') {
        // 3.0自定义地图样式
        this.map.setMapStyleV2({
          styleJson: mapJson
        })
      } else {
        this.map.setMapStyle({ style: 'light' }) // 2.0原生api
      }
    },
    // 地图开始拖拽时触发的事件
    drangedOrStart(e) {
      this.startZoom = this.map.getZoom()
    },
    // 地图拖拽或者缩放触发的事件
    drangedOrZoomend(e) {
      this.$nextTick(() => {
        this.lnglat = this.maxAndMinLngLet()

        // console.log(this.map.getZoom())
        // // 比初始化设置的地图等级小2级，隐藏绘制的label
        // if (this.map.getZoom() < Number(this.zoom) - 1) {
        // this.hideLabel()
        // } else {
        this.showLabel()
        // }
      })
    },
    // label显示
    showLabel() {
      var overlays = this.map.getOverlays()
      let rate = 0
      for (var i = 0; i < overlays.length; i++) {
        if (overlays[i].tab && overlays[i].tab === '标注') {
          if (overlays[i].time in this.mapZoom) {
            rate = this.map.getZoom() / this.mapZoom[overlays[i].time] // 往后的缩放根据第一次的缩放计算比例
          } else {
            rate = this.map.getZoom() / this.startZoom // 第一次缩放等级
          }
          if (!(overlays[i].time in this.mapZoom)) {
            this.mapZoom[overlays[i].time] = this.startZoom
          }
          rate > 1 ? rate += 0.45 : rate < 1 ? rate -= 0.45 : ''// 无法准确和百度地图的缩放等级一致 只能人为调校 在原有的计算比例上加上0.45左右和百度地图相近
          overlays[i].setStyle({ // 设置label的样式 等比例基于左上角原点缩放
            transformOrigin: '10px 10px',
            transform: `scale(${rate})`
          })
        }
      }
    },
    // label隐藏
    hideLabel() {
      var overlays = this.map.getOverlays()
      for (var i = 0; i < overlays.length; i++) {
        if (overlays[i].tab && overlays[i].tab === '标注') {
          overlays[i].hide()
        }
      }
    },
    // 获取地图可视区域最大和最小经纬度
    maxAndMinLngLet() {
      if (!this.map || !this.map.getBounds) {
        return
      }
      const bounds = this.map.getBounds()
      const max = bounds.getNorthEast()
      const min = bounds.getSouthWest()
      const zoomNum = this.map.getZoom()
      return {
        max: max,
        min: min,
        zoomNum: zoomNum
      }
    },
    mapClick(mapClick) {
      if (this.$refs.equipment.$refs.yujing) {
        this.$refs.equipment.$refs.yujing.mapClickHandle(mapClick)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.map {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  .bm-view {
    position: absolute;
    height: 100%;
    ::v-deep .BMap_cpyCtrl {
      display: none !important;
    }
    ::v-deep .anchorBL {
      display: none !important;
    }
  }
}
</style>
