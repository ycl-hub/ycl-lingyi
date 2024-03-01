<template>
  <div class="map tone_sip">
    <div id="cesiumPlotMap" class="bm-view" />
      <!-- 左右 -->
      <PlottingList v-if="showPlotting" ref="plottingList" :b-map="BMap" :map="map" :viewer="viewer" />
  </div>
</template>

<script>
import { mapJson } from '@/assets/js/mapJson.js'
import { sessionStorage } from '@/utils/storage'
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import { BmView } from 'vue-baidu-map'
import { mapGetters } from 'vuex'
import PlottingList from './subComponents/plottingList'
import { queryId, queryPath } from '@/utils'
import cesium from '@/components/mixins/Cesium.js'
export default {
  name: 'MapPlotting',
  components: {
    BaiduMap, BmView, PlottingList
  },
  mixins: [cesium],
  data() {
    return {
      BMap: {}, // 核心类
      map: {}, // 地图实例
      // lng: 111.747176, lat: 40.845802 蒙古地图中心点
      // center: { lng: 116.401969, lat: 39.91405 },
      // zoom: 12,
      mapStyle: {
        styleJson: mapJson
      },
      lnglat: {}, // 经纬度及缩放等级
      drawingManager: null,
      showPlotting: false,
      startZoom: '',
      mapZoom: {}
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
  activated() {
    const _this = this
    _this.startZoom = _this.zoom
    const bhlb = queryId('bhlb', this.settings.FEATURE_SETTING)
    console.log(bhlb)
    if (bhlb && !bhlb.isOpen) {
      this.showPlotting = false
    } else if (bhlb.isOpen && queryPath('bhlb', sessionStorage.get('moduleInfo'))?.DISPLAY) {
      this.showPlotting = true
    }
    setTimeout(_ => {
      if (bhlb && bhlb.isOpen && bhlb.isSpread && _this.$refs.plottingList) {
        if (!_this.$refs.plottingList.isSelectAll && _this.$refs.plottingList) {
          _this.$refs.plottingList.getPlottingById()
        }
      } else if (bhlb && bhlb.isOpen && !bhlb.isSpread && _this.$refs.plottingList) {
        _this.$refs.plottingList.getPlottingById()
      }
    })
  },
  mounted() {
    this.init('cesiumPlotMap',(viewer, Cesium)=>{
      this.showPlotting = true
      this.$root.$on('rollback',()=>{
        if(this.$route.path==='/mapPlotting'){
          this.rollback()
        }
      })
    })
  },
  methods: {
    // 地图渲染完毕触发
    handler({ BMap, map }) {
      this.BMap = BMap
      this.map = map
      // this.map.setMapStyle({ style: 'light' }) // 2.0原生api
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
        // console.log(this.map.getZoom())
        // // 比初始化设置的地图等级小2级，隐藏绘制的label
        // if (this.map.getZoom() < Number(this.zoom) - 1) {
        // this.hideLabel()
        // } else {
        this.showLabel()
        // }
      })
    },
    mapClick(mapClick) {
      this.$refs.plottingList.mapClickHandle(mapClick)
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
    }
  }
}
</script>
<style lang="scss" scoped>
.map{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  .bm-view {
    position: absolute;
    width: 100%;
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
