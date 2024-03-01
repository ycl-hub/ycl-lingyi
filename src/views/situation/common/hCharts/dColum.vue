<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
// 引入 ECharts 主模块
// var echarts = require('echarts/lib/echarts')
// require('echarts/lib/chart/bar')
// require('echarts/lib/component/tooltip')
// require('echarts/lib/component/title')
// require('echarts/lib/component/legend')
// require('echarts/lib/component/grid')
var echarts = require('echarts')
import resize from '@/components/mixins/resize'
export default {
  name: 'DColum',
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
    },
    data: {
      type: Object,
      default: function() {
        return {
          xData: [],
          yData1: [],
          yData2: []
        }
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      handler() {
        this.initChart()
      },
      deep: true
    }
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
      const xData = this.data.xData
      const yData1 = this.data.yData1
      const yData2 = this.data.yData2
      var option = {
        tooltip: { // 提示框组件
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          textStyle: {
            color: '#fff',
            fontStyle: 'normal',
            fontFamily: '微软雅黑',
            fontSize: 12
          },
          formatter: function(params) {
            let html = params[0].name + '<br>'
            params.forEach((item) => {
              if (item.componentSubType === 'bar') {
                html += `<span style="display:inline-block;margin-right:5px;border-radius:2px;width:10px;height:8px;background-color:${item.color};"></span>`
                html += item.seriesName + '：' + item.value + ' 个<br>'
              }
            })
            return html
          }
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '6%',
          top: 50,
          padding: '0 0 10 0',
          containLabel: true
        },
        legend: {// 图例组件，颜色和名字
          right: 150,
          top: 5,
          itemGap: 16,
          itemWidth: 18,
          itemHeight: 10,
          selectedMode: false,
          data: [{
            name: '警情'
          },
          {
            name: '参考值'
          }],
          textStyle: {
            color: '#a9ecfa',
            fontStyle: 'normal',
            fontFamily: '微软雅黑',
            fontSize: 12
          }
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true, // 坐标轴两边留白
            data: xData,
            axisLabel: { // 坐标轴刻度标签的相关设置。
              interval: 0, // 设置为 1，表示『隔一个标签显示一个标签』
              margin: 15,
              textStyle: {
                color: '#fff',
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 12
              }
            },
            axisTick: {// 坐标轴刻度相关设置。
              show: false
            },
            axisLine: {// 坐标轴轴线相关设置
              lineStyle: {
                color: '#fff',
                opacity: 0.2
              }
            },
            splitLine: { // 坐标轴在 grid 区域中的分隔线。
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量 （个）',
            nameGap: 30,
            nameTextStyle: {
              color: '#a9ecfa'
            },
            splitNumber: 5,
            axisLabel: {
              textStyle: {
                color: '#a8aab0',
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 12
              }
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: ['#fff'],
                opacity: 0.06
              }
            }

          }
        ],
        series: [
          {
            name: '警情',
            type: 'bar',
            data: yData1,
            barWidth: 10,
            barGap: 0, // 柱间距离
            label: {// 图形上的文本标签
              normal: {
                show: false,
                position: 'top',
                textStyle: {
                  color: '#a8aab0',
                  fontStyle: 'normal',
                  fontFamily: '微软雅黑',
                  fontSize: 12
                }
              }
            },
            itemStyle: {// 图形样式
              normal: {
                color: '#01d2fa'
              }
            }
          },
          {
            name: '参考值',
            type: 'bar',
            data: yData2,
            barWidth: 10,
            barGap: 0.2, // 柱间距离
            label: {// 图形上的文本标签
              normal: {
                show: false,
                position: 'top',
                textStyle: {
                  color: '#a8aab0',
                  fontStyle: 'normal',
                  fontFamily: '微软雅黑',
                  fontSize: 12
                }
              }
            },
            itemStyle: {// 图形样式
              normal: {
                color: '#e8d02d'
              }
            }
          },
          {
            // 分隔
            type: 'pictorialBar',
            itemStyle: {
              normal: {
                color: 'rgba(2,14,28,.5)'
              }
            },
            hoverAnimation: false,
            symbolRepeat: 'fixed',
            symbolMargin: 5,
            symbol: 'rect',
            symbolClip: true,
            symbolSize: [10, 2],
            symbolPosition: 'start',
            symbolOffset: ['-60%', 1],
            data: yData1,
            z: 0,
            zlevel: 1
          },
          {
            // 分隔
            type: 'pictorialBar',
            itemStyle: {
              normal: {
                color: 'rgba(2,14,28,.5)'
              }
            },
            symbolRepeat: 'fixed',
            symbolMargin: 5,
            symbol: 'rect',
            symbolClip: true,
            symbolSize: [10, 2],
            symbolPosition: 'start',
            symbolOffset: ['60%', 1],
            data: yData2,
            z: 0,
            zlevel: 1
          }
        ]
      }
      this.chart.setOption(
        option, true
      )
    }
  }
}
</script>
