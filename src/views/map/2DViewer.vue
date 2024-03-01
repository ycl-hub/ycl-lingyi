<template>
    <div id="cesiumMap2D" class="bm-view"  @mouseleave="is2DEnter = false;" style="width:50%;right:0">
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import cesium from '@/components/mixins/Cesium.js'

export default {
  name: 'Map2D',
  mixins: [cesium],
  components:{},
  data() {
    return {
      viewer2D:null,
      is2DEnter:false,is3DEnter:false,Handler2D:{},Handler3D:{}
    }
  },
  props:{
    viewer3D:{
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'mapType',
    ])
  },
  methods:{
    sync2D() {
    // console.log(this.is3DEnter,'2to3');
      if (!this.is3DEnter) return;
      // 三维地图中心点
      let center = new Cesium.Cartesian2(
        Math.floor(this.viewer3D.canvas.clientWidth / 2),
        Math.floor(this.viewer3D.canvas.clientHeight / 2)
      );


      // 转为世界坐标系
      let position = this.viewer3D.scene.camera.pickEllipsoid(center);

      // 判断中心点是否在椭球体上
      if (Cesium.defined(position)) {
        // 获取三维地图中心点与相机之间的距离
        let distance = Cesium.Cartesian3.distance(
          position,
          this.viewer3D.scene.camera.positionWC
        );

        // 更新二维地图
        this.viewer2D.scene.camera.lookAt(
          position,
          new Cesium.Cartesian3(0.0, 0.0,distance)
        );
        this.viewer2D.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); //解除相机锁定
      }
    },
    sync3D() {
    // console.log(this.is2DEnter,'3to2');
      if (!this.is2DEnter) return;
      const destination = Cesium.Cartographic.toCartesian(
        this.viewer2D.camera.positionCartographic
      );

      this.viewer3D.camera.setView({
        destination: new Cesium.Cartesian3(
          destination.x,
          destination.y,
          destination.z
        ),
      });

    },
  },
  watch: {
    mapType:{
      handler(val){
        const _this = this
        if(val==='TwoThreeLink'&&!this.viewer2D){
          _this.$nextTick(_=>{
            _this.init('cesiumMap2D', function(viewer, Cesium) {
                _this.viewer2D=viewer
                _this.viewer2D.scene.mode = Cesium.SceneMode.SCENE2D;
                _this.viewer3D.camera.percentageChanged = 0.01;
                // 监听三维地图变化
                _this.viewer3D.camera.changed.addEventListener(_this.sync2D);
                _this.viewer2D.camera.percentageChanged = 0.01;
                // 监听三维地图变化
                _this.viewer2D.camera.changed.addEventListener(_this.sync3D);
                _this.Handler2D = new Cesium.ScreenSpaceEventHandler(_this.viewer2D.scene.canvas)
                _this.Handler3D = new Cesium.ScreenSpaceEventHandler(_this.viewer3D.scene.canvas)
                _this.Handler2D.setInputAction( ()=>{_this.is2DEnter=true;_this.is3DEnter=false}, Cesium.ScreenSpaceEventType.LEFT_DOWN)
                _this.Handler2D.setInputAction( ()=>{_this.is2DEnter=true;_this.is3DEnter=false}, Cesium.ScreenSpaceEventType.WHEEL)
                _this.Handler3D.setInputAction( ()=>{_this.is3DEnter=true;_this.is2DEnter=false}, Cesium.ScreenSpaceEventType.LEFT_DOWN)
                _this.Handler3D.setInputAction( ()=>{_this.is3DEnter=true;_this.is2DEnter=false}, Cesium.ScreenSpaceEventType.WHEEL)
            })
          })
        }else if(_this.viewer2D&&val!=='TwoThreeLink'){
          this.viewer3D.camera.changed.removeEventListener(_this.sync2D);
          this.viewer3D.camera.percentageChanged = 0.5;
          this.viewer2D.camera.changed.removeEventListener(_this.sync3D);
          this.viewer2D.camera.percentageChanged = 0.5;
          this.Handler2D.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)
          this.Handler2D.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
          this.Handler3D.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN)
          this.Handler3D.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)
          this.viewer2D.destroy()
          this.viewer2D=null
        }
      },
      immediate:true
    }
  },
  beforeDestroy() {
    this.$root.$emit('rollback')
  },
}
</script>
<style lang="scss" scoped>
.bm -view {
    position: absolute;
    height: 100%;
}
</style>
