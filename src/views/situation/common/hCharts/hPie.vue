<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
// 引入 ECharts 主模块
var echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/pie')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
import resize from '@/components/mixins/resize'
export default {
  name: 'HPie',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.id))
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      var scale = 1
      var echartData = [{
        value: 109,
        name: '刑事'
      }, {
        value: 1297,
        name: '民事'
      }, {
        value: 321,
        name: '求助'
      }, {
        value: 1876,
        name: '其他'
      }]
      var rich = {
        yellow: {
          color: '#a9ecfa',
          fontSize: 14 * scale,
          padding: [3, 0],
          align: 'center'
        },
        total: {
          color: '#a9ecfa',
          fontSize: 30 * scale,
          align: 'center'
        },
        white: {
          color: '#fff',
          align: 'center',
          fontSize: 12 * scale,
          padding: [3, 0]
        }
      }
      const option = {
        title: {
          text: '今日警情',
          left: 'center',
          top: '50%',
          padding: [18, 0],
          textStyle: {
            color: '#fff',
            fontSize: 12 * scale,
            align: 'center'
          }
        },
        legend: {
          selectedMode: false,
          formatter: function(name) {
            var total = 0
            echartData.forEach(function(value, index, array) {
              total += value.value
            })
            return '{total|' + total + '}'
          },
          data: [echartData[0].name],
          left: 'center',
          top: '40%',
          icon: 'none',
          align: 'center',
          textStyle: {
            color: '#fff',
            fontSize: 14 * scale,
            rich: rich
          }
        },
        series: [{
          name: '',
          type: 'pie',
          radius: ['50%', '60%'],
          hoverAnimation: false,
          color: ['#3f3ac7', '#fef74d', '#00f7ae', '#d72862'],
          label: {
            normal: {
              formatter: function(params, ticket, callback) {
                var total = 0 // 考生总数量
                echartData.forEach(function(value, index, array) {
                  total += value.value
                })
                return '{white|' + params.name + '}\n{yellow|' + params.value + '}'
              },
              rich: rich
            }
          },
          labelLine: {
            normal: {
              length: 10,
              length2: 10
            }
          },
          data: echartData
        }]
      }
      this.chart.setOption(
        option, true
      )
    }
  }
}
</script>
