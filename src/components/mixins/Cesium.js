
import { BaiduImageryProvider } from './BaiduImageryProvider'
import { mapGetters } from 'vuex'
export default {
  name: 'cesium',
  data() {
    return {
      viewer: {},
      Cesium: {},
      mapTypes: 'baidu', // 地图厂商
      baiduMapResource: {// 百度地图资源链接
        freshBlue: 'https://api.map.baidu.com/customimage/tile?=&x={x}&y={y}&z={z}&udt={udt}&scale={s}&ak=5ieMMexWmzB9jivTq6oCRX9j&customid=midnight', // 蓝
        Dark: 'https://api.map.baidu.com/customimage/tile?=&x={x}&y={y}&z={z}&udt={udt}&scale={s}&ak=5ieMMexWmzB9jivTq6oCRX9j&customid=dark', // 黑
        dianzi: 'https://maponline3.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler={s}&udt={udt}&from=jsapi2_0&showtext=1',
        default: 'https://api.map.baidu.com/customimage/tile?=&x={x}&y={y}&z={z}&udt={udt}&scale={s}&ak=5ieMMexWmzB9jivTq6oCRX9j&customid=light', // 默认样式
        offLine: '/common/tiles/{z}/{x}/{y}.png' // 离线瓦片
      },
      gaodeMapResource: {
        default: 'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale={s}&style=8&x={x}&y={y}&z={z}'
      },
      tiandituzhuji: 'https://t7.tianditu.gov.cn/cva_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix=5&layer=cva&style=default&tilerow=4&tilecol=23&tilematrixset=c&format=tiles&tk=436ce7e50d27eede2f2929307e6b33c0',
      lukuang: 'https://its.map.baidu.com/traffic/TrafficTileService?time={udt}&label=web2D&v=016&level={s}&x={x}&y={y}&scaler=2',
      xingzheng: '',
      zoomLevels: [
        75000000, 30000000, 15000000, 7500000, 3000000, 1500000,
        750000, 375000, 300000, 150000, 75000, 30000, 15000,
        7500, 3000, 1500, 750, 300
      ]
    }
  },
  computed: {
    ...mapGetters([
      'sceneType',
      'mapType',
      'mapState',
      'center',
      'zoom',
    ])
  },
  methods: {
    // 初始化地图
    init(id, funhander) {
      try {
        if (window.Cesium) {
          const _this = this
          this.Cesium = window.Cesium
          this.viewer = new this.Cesium.Viewer(id, {
            baseLayerPicker: false, // 如果设置为false，将不会创建右上角图层按钮。
            imageryProvider:  {},//imageryProvider占位 源码中初始化该字段有值 就不会请求cesium icon图标引发报错
            geocoder: false, // 如果设置为false，将不会创建右上角查询(放大镜)按钮。
            navigationHelpButton: false, // 如果设置为false，则不会创建右上角帮助(问号)按钮。
            homeButton: false, // 如果设置为false，将不会创建右上角主页(房子)按钮。
            sceneModePicker: false, // 如果设置为false，将不会创建右上角投影方式控件(显示二三维切换按钮)。
            animation: false, // 如果设置为false，将不会创建左下角动画小部件。
            timeline: false, // 如果设置为false，则不会创建正下方时间轴小部件。
            fullscreenButton: false, // 如果设置为false，将不会创建右下角全屏按钮。
            scene3DOnly: true, // 为 true 时，每个几何实例将仅以3D渲染以节省GPU内存。
            shouldAnimate: false, // 默认true ，否则为 false 。此选项优先于设置 Viewer＃clockViewModel 。
            infoBox: false, // 是否显示点击要素之后显示的信息
            sceneMode:this.sceneType==='ThreeScene'?Cesium.SceneMode.SCENE3D:Cesium.SceneMode.SCENE2D, // 初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
            requestRenderMode: false, // 启用请求渲染模式，不需要渲染，节约资源吧
            fullscreenElement: document.body, // 全屏时渲染的HTML元素 暂时没发现用处，虽然我关闭了全屏按钮，但是键盘按F11 浏览器也还是会进入全屏
            selectionIndicator: false, // Cesium 关闭点击绿色框
            // terrain: Cesium.Terrain.fromWorldTerrain({
            //   requestVertexNormals: true,  // 请求顶点法线
            //   requestWaterMask: true,       // 请求水体遮罩
            //   hasWaterMask: true,           // 设置存在水体遮罩
            //   hasVertexNormals: true,        // 设置存在顶点法线
            //   maximumLevel: 14 // 调整最大渲染错误的级别
            // }),
          })
          // this.viewer.scene.globe.enableLighting = false;
          // cesium token
          this.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYWRjYjEzOS1lYjU4LTQ1YTItYWU2Mi0xZDZhNDlhYzcyYmYiLCJpZCI6MTc1MjQzLCJpYXQiOjE2OTg4MDk2Mjl9.D7ScPRgpbF_7pLK6PUZMAbLP0jBEfnajpGClze3iNUg'
          this.viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权
          this.viewer.scene.debugShowFramesPerSecond = true;
          this.viewer.imageryLayers.removeAll()
          // 切换某个图层
          // viewer.imageryLayers.raiseToTop(Layer);
          switch (this.mapTypes) { // 根据地图厂商类型 加载不同地图
            case 'baidu':
              this.viewer.imageryLayers.addImageryProvider(
                new BaiduImageryProvider({
                  url: this.mapState === 'onLine' ? this.baiduMapResource.default : this.baiduMapResource.offLine, // 在线瓦片/离线瓦片
                }), 1
              )
              break
            case 'gaode':
              this.viewer.imageryLayers.addImageryProvider(
                new this.Cesium.UrlTemplateImageryProvider({
                  url: this.gaodeMapResource.default,
                  minimumLevel: 3,
                  maximumLevel: 18
                })
              )
              break
            default:
              break
          }
          // console.log(_this.zoomLevels[_this.zoom-2<0?0:_this.zoom-2], 9999)
          this.rollback()
          // this.viewer.scene.globe.depthTestAgainstTerrain = true;//开启地形化检测 实体开启贴地显示后 解决移动地图点位漂移问题
          this.viewer.scene.fxaa = false//改善实体文本图片清晰度
          this.viewer.scene.postProcessStages.fxaa.enabled = false
          if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) { //判断是否支持图像渲染像素化处理
            this.viewer.resolutionScale = window.devicePixelRatio;//渲染更清晰
          }
          funhander(this.viewer, this.Cesium)
        }
      } catch (e) {
        console.log(e)
      }
    },
    //回退至默认视角
    rollback(){
      let entity =null
      if(this.viewer&&this.viewer.entities.getById('origin')){
        entity=this.viewer.entities.getById('origin')
      }else{
        entity= this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(this.center.lng, this.center.lat),
          label: {
            text:'',
          },
          id:"origin"
        })
      }
      this.viewer.zoomTo(entity,{
          heading: 0.018,
          pitch: -0.7,
          range: this.zoomLevels[this.zoom-2<0?0:this.zoom-2]
        }
      )
    }
  }
}
