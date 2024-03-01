<template>
  <div class="map tone_sip">
    <baidu-map
      class="bm-view"
      ak="klj6ikA7um96cu50PD52Wqb7WKo2Z5ji"
      map-state="onLine"
      :center="center"
      :zoom="zoom"
      :scroll-wheel-zoom="true"
      :map-style="mapStyle"
      :map-type="mapType"
      @ready="handler"
    >
      <bm-view v-show="activeTab=='erwei'" class="map" />
      <!-- <iframe v-show="activeTab=='sanwei'" style="width:100%; height:100vh;position: absolute; z-index:1; left:0; top:0;" :src="iconServer" /> -->
      <iframe v-if="activeTab=='qianxiTime'" width="100%" height="100%" src="https://mapv.baidu.com/examples/qianxi-time.html" />
      <keep-alive>
        <iframe v-if="activeTab=='forceEdgeBundling'" style="width:100%; height:100vh;position: absolute; z-index:1; left:0; top:0;" src="https://mapv.baidu.com/examples/baidu-map-forceEdgeBundling.html" />
      </keep-alive>
      <keep-alive>
        <iframe v-if="activeTab=='pointTime1'" style="width:100%; height:100vh;position: absolute; z-index:1; left:0; top:0;" src="https://mapv.baidu.com/examples/baidu-map-point-time1.html" />
      </keep-alive>
      <keep-alive>
        <iframe v-if="activeTab=='pointWeibo'" style="width:100%; height:100vh;position: absolute; z-index:1; left:0; top:0;" src="https://mapv.baidu.com/examples/baidu-map-point-weibo.html" />
      </keep-alive>
      <keep-alive>
        <iframe v-if="activeTab=='qianxi'" style="width:100%; height:100vh;position: absolute; z-index:1; left:0; top:0;" src="https://mapv.baidu.com/examples/qianxi.html" />
      </keep-alive>
      <!-- 顶部二维三维按钮 -->
      <div class="map-tab">
        <span v-for="(item, i) in tabs" :key="i" :class="{'active' : item.key == activeTab}" @click="tabClick(item)">{{ item.val }}</span>
      </div>
      <!-- 左侧 -->
      <!--值班领导-->
      <div class="model model-one">
        <div class="tit">
          <span class="inline-block">值班领导</span>
        </div>
        <div class="model-con">
          <div class="model-top">
            <div class="model-top-model left">
              <div class="m_c">
                <div class="m_c-img left">
                  <img src="./common/images/per_icon.png">
                </div>
                <div class="m_c-text left">
                  <span class="block font14">
                    值班领导：
                  </span>
                  <span class="block font16">
                    {{ zhiban.topName }}
                  </span>
                </div>
              </div>
            </div>
            <div class="model-top-model right">
              <div class="m_c">
                <div class="m_c-img left">
                  <img src="./common/images/flag_icon.png">
                </div>
                <div class="m_c-text left">
                  <span class="block font14">
                    指挥中心：
                  </span>
                  <span class="block font16">
                    {{ zhiban.topCenter }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="model-bottom">
            <div class="m_c">
              <div class="m_c-img left">
                <img src="./common/images/phone_icon.png">
              </div>
              <div class="m_c-text">
                <span class="font14">联系电话：</span><span class="font16">{{ zhiban.telPhone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--当日接处警-->
      <div class="model model-two">
        <div class="tit">
          <span class="inline-block">当日接处警</span>
        </div>
        <div class="model-con m_c-police">
          <div class="valid">
            <yuan :bg-img-url="yxl" :number="youxiaolv" name="有效率" />
          </div>
          <div class="dispose">
            <yuan :bg-img-url="cql" :number="chujinglv" name="处警率" />
          </div>
          <div class="war-count">
            <h-pie :id="'pie1'" :width="'100%'" :height="'100%'" />
          </div>
        </div>
      </div>
      <!--要情待办-->
      <div class="model model-three border-bottom-none">
        <div class="tit">
          <span class="inline-block">要情待办</span>
        </div>
        <div class="model-con">
          <div class="tb-tit">
            <span class="left">要情</span>
            <span class="left">上报时间</span>
            <span class="left">重要程度</span>
            <span class="left">当前状态</span>
          </div>
          <div class="tb-list over-hidden">
            <v-scroll :data="yqData" :class-option="tbOption">
              <ul>
                <li v-for="item in yqData" :key="item.id">
                  <span class="left">{{ item.name }}</span>
                  <span class="left">{{ item.time }}</span>
                  <span class="left" v-html="cdToString(item.cd)" />
                  <span class="left">{{ item.state|stateToString }}</span>
                </li>
              </ul>
            </v-scroll>
          </div>
        </div>
      </div>
      <!--右侧-->
      <!--警力资源-->
      <div class="model model-four">
        <div class="tit">
          <span class="inline-block">警力资源</span>
        </div>
        <div class="model-con">
          <reslist :data="ziyuan" />
        </div>
      </div>
      <!--关键节点-->
      <div class="model model-five">
        <div class="tit">
          <span class="inline-block">关键节点</span>
        </div>
        <div class="model-con node-con">
          <v-scroll :data="nodeData" :class-option="tbOption">
            <ul>
              <li v-for="(item,index) in nodeData" :key="index">
                <span class=" t">{{ item.time }}</span>
                <span>{{ item.title }}</span>
              </li>
            </ul>
          </v-scroll>
        </div>
      </div>
      <!--勤务报备-->
      <div class="model model-six">
        <div class="tit">
          <span class="inline-block">勤务报备</span>
        </div>
        <div class="model-con">
          <ul class="qwbb-ul">
            <li v-for="(item,index) in qwbbData" :key="index">
              <span class="text-center block" style="height:0.62rem; line-height:0.62rem; white-space: nowrap; overflow:hidden;">{{ item.name }}</span>
              <span class="text-center num">{{ item.num }}</span>
            </li>
          </ul>
        </div>
      </div>
      <!--底部-->
      <div class="bottom">
        <DColum :id="'dColum1'" :key="dColumId" :data="dColum1Data" style="width:100%; height:100%" />
        <div class="tab">
          <span :class="act==1 ? 'active' : ''" @click="columnDataChange(1)">日</span><span :class="act==2 ? 'active' : ''" @click="columnDataChange(2)">月</span>
        </div>
      </div>
      <div class="left-bg" />
      <div class="right-bg" />
    </baidu-map>

  </div>
</template>

<script>
// import { api } from '@/api/env'
import { mapJson2 } from '@/assets/js/mapJson.js'
import BaiduMap from 'vue-baidu-map/components/map/Map.vue'
import { BmView } from 'vue-baidu-map'
import { mapGetters } from 'vuex'
import yuan from './common/yuan/yuan'
import reslist from './common/reslist/reslist'
import hPie from './common/hCharts/hPie'
import DColum from './common/hCharts/dColum'
import vScroll from 'vue-seamless-scroll'
import yxl from '@/views/situation/common/images/yxl.png'
import cql from '@/views/situation/common/images/cql.png'
export default {
  name: 'Situation',
  components: {
    BaiduMap,
    BmView,
    reslist,
    yuan,
    hPie,
    vScroll,
    DColum
  },
  data() {
    return {
      BMap: {}, // 核心类
      map: {}, // 地图实例
      center: { lng: 108.001969, lat: 36.51405 },
      zoom: 6,
      mapStyle: {
        styleJson: mapJson2
      },
      lnglat: {}, // 经纬度及缩放等级
      youxiaolv: 55,
      chujinglv: 75,
      zhiban: {
        'topName': '张枫飞',
        'topCenter': '欧阳顽',
        'telPhone': '12345678900'
      },
      yxl,
      cql,
      yqData: [
        {
          id: '001',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 1
        }, {
          id: '002',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 2
        }, {
          id: '003',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 2
        }, {
          id: '004',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 3
        }, {
          id: '005',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 4
        }, {
          id: '006',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 4
        }, {
          id: '007',
          name: 'xxxxxxxxxxxx',
          time: '09:00',
          state: 1,
          cd: 4
        }

      ],
      ziyuan: [
        {
          name: '民警资源',
          resAll: 1008,
          percentageName: '出勤率',
          percentage: 80
        }, {
          name: '辅警资源',
          resAll: 324,
          percentageName: '出勤率',
          percentage: 76
        }, {
          name: '警车资源',
          resAll: 243,
          percentageName: '出车率',
          percentage: 89
        }, {
          name: '视频资源',
          resAll: 8654,
          percentageName: '在线率',
          percentage: 92
        }
      ],
      nodeData: [
        {
          time: '08-19', title: '全球互联网大会全球互联网大会全球互联网大会全球互联网大会全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }, {
          time: '08-19', title: '全球互联网大会'
        }
      ],
      qwbbData: [
        { name: '双井派出所', num: 300 }, { name: '大屯派出所', num: 400 }, { name: '金盏派出所', num: 350 }
      ],
      act: 1,
      columData: [
        {
          time: '00:00',
          jq: 500,
          ck: 300
        },
        {
          time: '01:00',
          jq: 400,
          ck: 300
        }, {
          time: '02:00',
          jq: 350,
          ck: 150
        }, {
          time: '03:00',
          jq: 250,
          ck: 111
        }, {
          time: '04:00',
          jq: 230,
          ck: 150
        }, {
          time: '05:00',
          jq: 300,
          ck: 180
        }, {
          time: '06:00',
          jq: 380,
          ck: 400
        }, {
          time: '07:00',
          jq: 500,
          ck: 120
        }, {
          time: '08:00',
          jq: 500,
          ck: 130
        }, {
          time: '09:00',
          jq: 340,
          ck: 140
        }, {
          time: '10:00',
          jq: 500,
          ck: 110
        }, {
          time: '11:00',
          jq: 450,
          ck: 90
        }, {
          time: '12:00',
          jq: 500,
          ck: 89
        }, {
          time: '13:00',
          jq: 333,
          ck: 50
        }, {
          time: '14:00',
          jq: 500,
          ck: 130
        }, {
          time: '15:00',
          jq: 452,
          ck: 340
        }, {
          time: '16:00',
          jq: 500,
          ck: 43
        }, {
          time: '17:00',
          jq: 234,
          ck: 55
        }, {
          time: '18:00',
          jq: 500,
          ck: 80
        }, {
          time: '19:00',
          jq: 179,
          ck: 99
        }, {
          time: '20:00',
          jq: 120,
          ck: 105
        }, {
          time: '21:00',
          jq: 146,
          ck: 187
        }, {
          time: '22:00',
          jq: 321,
          ck: 188
        }, {
          time: '23:00',
          jq: 500,
          ck: 360
        }
      ],
      isGdMap: false, // 地图切换true为高德地图
      dColum1Data: {
        xData: [],
        yData1: [],
        yData2: []
      },
      dColumId: 'dColum1',
      tabs: [
        {
          key: 'erwei',
          val: '二维地图'
        },
        // {
        //   key: 'sanwei',
        //   val: '三维地图'
        // },
        {
          key: 'qianxiTime',
          val: '人口流动'
        },
        {
          key: 'forceEdgeBundling',
          val: '基准调度'
        },
        {
          key: 'pointTime1',
          val: '事件分布'
        },
        {
          key: 'pointWeibo',
          val: '人员密度'
        },
        {
          key: 'qianxi',
          val: '进京流量'
        }
      ],
      activeTab: 'erwei'
    }
  },
  computed: {
    ...mapGetters([
      'mapType'
    ]),
    tbOption: function() {
      return {
        step: 0.5
      }
    }
  },
  created() {
  },
  mounted() {
    this.columnDataChange(1)
  },
  filters: {
    stateToString: function(val) {
      switch (val) {
        case 1:
          return '领导批示'
      }
    }
  },
  methods: {
    // 地图渲染完毕触发
    handler({ BMap, map }) {
      this.BMap = BMap
      this.map = map
      // this.map.setMapStyle({ style: 'midnight' })
      const mapv = require('mapv')
      var randomCount = 5000

      var data = []

      var citys = ['北京', '天津', '上海', '重庆', '石家庄', '太原', '呼和浩特', '哈尔滨', '长春', '沈阳', '济南', '南京', '合肥', '杭州', '南昌', '福州', '郑州', '武汉', '长沙', '广州', '南宁', '西安', '银川', '兰州', '西宁', '乌鲁木齐', '成都', '贵阳', '昆明', '拉萨', '海口']

      // 构造数据
      while (randomCount--) {
        var cityCenter = mapv.utilCityCenter.getCenterByCityName(citys[parseInt(Math.random() * citys.length)])
        data.push({
          geometry: {
            type: 'Point',
            coordinates: [cityCenter.lng - 2 + Math.random() * 4, cityCenter.lat - 2 + Math.random() * 4]
          },
          count: 30 * Math.random(),
          time: 100 * Math.random()
        })
      }

      var dataSet = new mapv.DataSet(data)

      var options = {
        size: 20,
        gradient: { 0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)' },
        max: 60,
        animation: {
          type: 'time',
          stepsRange: {
            start: 0,
            end: 100
          },
          trails: 10,
          duration: 4
        },
        draw: 'heatmap'
      }
      new mapv.baiduMapLayer(map, dataSet, options)
    },
    cdToString(val) {
      switch (val) {
        case 1:
          return '<span style=" color:#ff2d3f;">非常重要</span>'
        case 2:
          return '<span style="color:#d72862;">较重要</span>'
        case 3:
          return '<span style="color:#f6ef4d;">重要</span>'
        case 4:
          return '<span style="color:#7dc0cd;">一般</span>'
      }
    },
    columnDataChange(type) {
      this.act = type
      if (type === 1) {
        this.dColumId = 'dColum1'
        this.$set(this.dColum1Data, 'xData', [
          '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
        ])
        this.$set(this.dColum1Data, 'yData1', [
          '500', '400', '350', '250', '230', '300', '380', '500', '500', '340', '500', '450', '500', '333', '500', '452', '500', '234', '500', '179', '120', '146', '321', '500'
        ])
        this.$set(this.dColum1Data, 'yData2', [
          '300', '300', '150', '111', '150', '180', '400', '120', '130', '140', '110', '90', '89', '50', '130', '340', '43', '55', '80', '99', '105', '187', '188', '360'
        ])
      } else {
        this.dColumId = 'dColum2'
        this.$set(this.dColum1Data, 'xData', [
          '05/01', '05/02', '05/03', '05/04', '05/05', '05/06', '05/07', '05/08', '05/09', '05/10', '05/11', '05/12', '05/13', '05/14', '05/15', '05/16', '05/17', '05/18', '05/19', '05/20', '05/21', '05/22', '05/23', '05/24', '05/25', '05/26', '05/27', '05/28', '05/29', '05/30', '05/31'
        ])
        this.$set(this.dColum1Data, 'yData1', [
          '500', '400', '350', '250', '230', '300', '380', '500', '500', '340', '500', '450', '500', '333', '500', '452', '500', '234', '500', '179', '120', '146', '321', '500', '234', '500', '179', '120', '146', '321', '500'
        ])
        this.$set(this.dColum1Data, 'yData2', [
          '300', '300', '150', '111', '150', '180', '400', '120', '130', '140', '110', '90', '89', '50', '130', '340', '43', '55', '80', '99', '105', '187', '288', '160', '434', '300', '479', '220', '246', '321', '400'
        ])
      }
    },
    tabClick(item) {
      this.activeTab = item.key
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

.pos-icon{width: 25px; height: 25px; position: absolute; background-position: center center; background-repeat: no-repeat;
    background-size: cover;
}

.over-hidden{ overflow: hidden;}
img{user-select: none; vertical-align: middle;}
.inline-block{ display: inline-block; vertical-align: middle;}
.tit{ background: url(./common/images/tittlebg.png) left center no-repeat; background-size: cover;
    width: 3.09rem; height:0.58rem; overflow: hidden;
}
.tit span{line-height: 1; margin-top: 0.27rem; margin-left: 0.32rem;}
.map-img{max-width: 13.09rem; height:-webkit-calc(100% - 0.14rem);  height:calc(100% - 0.14rem); margin-left: 2.8rem; margin-top: 0.14rem;}
.header{ width: 100%; height: 1.04rem; position: absolute; left: 0; top: 0; z-index: 2; background-color:rgba(4,16,29,0.85); }
.logo-img{height: 0.88rem; margin-left: 0.1rem; margin-top: 0.1rem;}
.left{float: left;}
.right{float: right;}
.block{display: block;}
.logo-text {height: 100%; white-space: nowrap; width: 4.42rem; overflow: hidden;
    margin-left: 0.1rem; padding-left: 0.1rem; position: relative;
}
.text-center{text-align: center;}
.logo-text:after,.logo-text:before{position: absolute; content: ""; width: 0.01rem; background-color: #a9ecfa;
    height: 0.43rem; left: 0;
}
.logo-text:after{bottom: 0;}
.logo-text:before{top: 0.02rem;}
.logo-text-ch{font-size: 0.24rem; letter-spacing: 2px; line-height: 1; margin-top:0.28rem; }
.logo-text-ch::first-letter{margin-left: -2px;}
.logo-text-en{font-size: 0.12rem; color: #147ca6; line-height: 1; margin-top: 0.12rem;}
.map-oper{height: 0.5rem; border-top: 1px solid #2c4551; border-bottom: 1px solid #2c4551; width: 10rem;
    margin-top: 0.28rem; background-color: rgba(2,14,28,.5);
}
.border-bottom-none{ border-bottom: none !important;}
.model{ border-bottom: 1px solid #a9ecfa; box-sizing: border-box; padding-bottom: 0.07rem; position: relative;color: #a9ecfa;}
.model::after,.model::before{content: ""; position: absolute; width: 0.1rem; height: 0.1rem; box-sizing: border-box;
    border-left: 2px solid #a9ecfa; border-bottom: 2px solid #a9ecfa; bottom: 0.07rem; z-index: 3;
}
.model::before{left: -1px; }
.model::after{right: -1px; transform: rotateY(180deg);}
.model-con{position: absolute; top:0.6rem; bottom: 0.07rem;width: 100%;}
.page-left,.page-right{width: 3.09rem;}
.model-one,.model-two,.model-three{position: absolute; left: 0.1rem; z-index: 3;}
.model-four,.model-five,.model-six{position: absolute; right: 0.1rem; z-index: 3;}
.model-four{top: 0.8rem; height: 3.4rem;}
.model-five{bottom:2.96rem; top:4.29rem;}
.model-six{bottom: 0; height: 2.86rem;}
.model-one{top: 0.8rem; height: 1.98rem;}
.model-two{ top:2.9rem; height: 3.07rem; }
.model-three{ top: 6.1rem; bottom: 0;}

.model-top-model,.model-bottom{height: 0.62rem; box-sizing: border-box; border: 1px solid #466775;}
.model-top-model{width: 1.5rem; }
.model-top{ height: 0.62rem;}
.model-bottom{ width: 100%; margin-top: 0.05rem;}
.m_c{ margin: 0.04rem; background-color: rgba(3,59,81,.8); height: 0.52rem;}
.m_c-img{width: 0.52rem;}
.m_c-img img{ width: 0.22rem; height: 0.22rem; margin: 0.15rem;}
.font14{ font-size: 0.14rem;}
.font16{font-size: 0.16rem;}
.m_c-text .font14{ line-height: 1; margin-top: 0.07rem;}
.m_c-text .font16{line-height: 1; margin-top: 0.09rem;}
.model-bottom .m_c{background-color: rgba(20,38,63,.8);}
.model-bottom .m_c-text{ line-height: 0.52rem;}
.m_c-police{ background: url(./common/images/model2bg.png) left center no-repeat; background-size:auto 100%; }
.tb-tit,.tb-list li{width: 100%; height: 0.45rem;line-height: 0.45rem; text-align: center;}
.tb-tit,.tb-list li{ background-color: rgba(6,63,84,.6);}
.tb-tit span:first-child,.tb-list li span:first-child{width: 1.04rem; }
.tb-tit span:nth-child(2),.tb-list li span:nth-child(2){width: 0.6rem;}
.tb-tit span:nth-child(3),.tb-list li span:nth-child(3){width: 0.66rem;}
.tb-tit span:nth-child(4),.tb-list li span:nth-child(4){width: 0.77rem;}
.tb-list ul{overflow: hidden; transition: .3s linear;}
.tb-list ul:nth-child(2){transform: translate3d(0,100%,0);}
.tb-list li{margin-top: 0.04rem;}
.tb-list li:nth-child(odd){ background-color: rgba(17,33,52,.6);}
.tb-list li:nth-child(even){ background-color: rgba(6,63,84,.6);}
.tb-list{height: -webkit-calc(100% - 0.48rem);height: calc(100% - 0.48rem);}
.tb-tit span,.tb-list li span{ overflow: hidden; white-space: nowrap; text-overflow: ellipsis; box-sizing: border-box;}

.node-con{background-color: rgba(6,63,84,.6); overflow: hidden;}
.node-con::before{content: ""; position: absolute; z-index: -1; width: 1px; top: 0.05rem; bottom: 0.05rem;
    border-left: 1px dashed #a9ecfa; left: 0.61rem;
}
.node-con ul{ margin-left: 0.25rem;}
.node-con li{height: 0.3rem; overflow: hidden; line-height: 0.3rem; font-size: 0.12rem;white-space: nowrap;
    text-overflow: ellipsis;padding-left: 0.2rem; padding-right: 0.1rem;
    background:url(./common/images/model6icon.png) left center no-repeat; background-size: 0.14rem 0.16rem;
}
.node-con li span.t{margin-right: 0.1rem;}

.bottom{height: 2rem; background-color: rgba(2,14,28,.5); position: absolute;
    left: 3.3rem; right: 3.3rem; bottom: 0; z-index: 3; border-top: 1px solid #017ca0;
    .tab {
      position: absolute;
      z-index: 2;
      top: 5px;
      right: 10px;
      width: 120px; height: 20px;
      span {
        float: left; width: 50%; background-color: #017ca0; cursor: pointer;height:20px;
        line-height: 20px;
        text-align: center;
        color: #a9ecfa;
      }
      .active {
        background-color: #00d4fc;
      }
    }
}
.qwbb-ul{height: 100%; overflow: hidden;}
.qwbb-ul li{ background: url(./common/images/model7bg.png) left top no-repeat; background-size: 100% auto ;
    width: 0.99rem; height: 100%; float: left; margin-left: 0.06rem;
    position: relative; box-sizing: border-box; overflow: hidden;
}
.qwbb-ul li .num{position: absolute; width: 0.48rem; height: 0.32rem; line-height: 0.32rem; left: 0.26rem; top: 1.14rem;
    font-size: 0.2rem; text-shadow: 0 0  7px #0695fc;
}
.qwbb-ul li:first-child{margin-left: 0;}
.highcharts-point{margin-bottom: 2px;}
.visua-checkbox{
    position: relative; display: inline-block; vertical-align: middle; white-space: nowrap;
    min-height: 0.24rem; user-select: none;
}
.visua-checkbox input[type="checkbox"]{opacity: 0; width: 0.3rem; height: 0.24rem; vertical-align: middle;}
.visua-checkbox .checkbox-img{ width: 0.26rem; height: 0.24rem; position: absolute; left: 0; top: 50%; margin-top: -0.12rem;
    background-repeat: no-repeat; background-size: auto 0.24rem;
}
.visua-checkbox input[type="checkbox"]+span.checkbox-img{ background-image: url(./common/images/no_icon.png);}
.visua-checkbox input[type="checkbox"]:checked+span.checkbox-img{ background-image: url(./common/images/yes_icon.png);}
.map-oper .visua-checkbox{vertical-align: middle; margin-top: 0.12rem; margin-right: 0.5rem;}
.map-oper .visua-checkbox img{vertical-align: middle; margin-right: 0.05rem; width: 0.28rem; height: 0.28rem;}
.map-oper .visua-checkbox span{font-size: 0.2rem; vertical-align:middle;}

.valid,.dispose{width: 1rem; height: 1rem; position: absolute; left: 0.05rem;}
.valid{top:0.05rem;}
.dispose{top: 1.3rem;}

.war-count{position: absolute; width: 2.9rem; height: 100%; top: 0 ; right: -0.84rem; }
.left-bg,.right-bg{ position: absolute; top: 0; z-index: 1; width: 3.99rem; background-position: left center; background-repeat: no-repeat;
    background-size: cover;
}
.left-bg{top:0; bottom: 0; left: 0; background-image: url(./common/images/l_b.png);}
.right-bg{right: 0; top: 0; bottom: 0; background-image: url(./common/images/r_b.png); }
.map-tab{ position: absolute;
    top: 1.17rem;
    z-index: 2;
    left: 3.3rem;width: 560px;height: 25px; white-space: nowrap;}
.map-tab span{display: inline-block; vertical-align: middle; height: 25px; background-color: #017ca0; line-height: 25px; font-size: 12px; cursor: pointer;
    color: #a9ecfa;
    width: 70px;
    text-align: center;
}
.map-tab span.active{background-color: #00d4fc;}
.login{ width: 5rem; height: 3rem; border-radius: 0.05rem; background-color: rgba(255,255,255,.8);
    position: absolute; left: 50%; top: 50%; margin-top: -1.5rem; margin-left: -2.5rem; overflow: hidden;
}
input{outline: none; border-radius: 0.05rem; border: none;font-size: 0.14rem;}
.btn{ display: inline-block; background-color: #0695fc; height: 0.4rem; line-height: 0.4rem; padding:0 0.5rem; border-radius: 0.05rem; cursor: pointer;}

}
</style>

