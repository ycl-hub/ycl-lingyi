<template>
  <div class="modelbox">
    <div class="over-hidden">
      <div ref="model1" class="model" />
      <div ref="model2" class="model" />
      <div ref="model3" class="model" />
    </div>
  </div>
</template>

<style scoped>
    *{margin: 0; padding: 0;}
    html,body{width: 100%; height: 100%;}
    .modelbox{width:1020px; margin:  0 auto; }
    .model{width:500px; height: 300px; background-color:#000; float: left; margin: 10px 10px 0 0;}
</style>

<script>
import echarts from 'echarts'
export default {
  data() {
    return {

    }
  },
  mounted() {
    this.chartOne()
    this.chartTwo()
    this.chartThree()
  },
  methods: {
    chartOne(data) {
      var dataSource = data
      if (!data || !data.name) {
        dataSource = {
          name: ['示例1', '示例2', '示例3', '示例4', '示例5', '示例6'],
          value: [10, 15, 30, 20, 25, 20]
        }
      }
      var container = this.$refs.model1
      var chart = echarts.init(container)
      var options = {
        title: {
          text: '渐变线形',
          textStyle: {
            color: '#FFF',
            fontWeight: 'normal',
            fontSize: 14,
            lineHeight: 40
          }
        },
        // 3a4267
        xAxis: {
          type: 'category',
          data: dataSource.name,
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#7da7f1'
            }
          }
        },
        grid: {
          left: 40,
          top: 50,
          right: 20,
          bottom: 30
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // type: 'cross',
            label: {
              backgroundColor: '#84bfeb'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#7da7f1'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#315070'],
              width: 1,
              type: 'solid'
            }
          }
        },
        series: [
          {
            name: '测试数据',
            data: dataSource.value,
            type: 'line',
            smooth: true,
            lineStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#3fc0f9' // 0% 处的颜色
                }, {
                  offset: 1, color: '#6af7cd' // 100% 处的颜色
                }]
              }
            }
          }
        ]

      }
      chart.setOption(options)
      window.addEventListener('resize', () => {
        chart.resize()
      }, false)
    },
    chartTwo(data) {
      var dataSource = data
      if (!data || data.length == 0) {
        dataSource = [
          { value: 10, name: '类别1' },
          { value: 10, name: '类别2' },
          { value: 10, name: '类别3' },
          { value: 10, name: '类别4' },
          { value: 10, name: '类别5' }
        ]
      }
      var container = this.$refs.model2
      var chart = echarts.init(container)
      var options = {
        title: {
          text: '圆环图例',
          textStyle: {
            color: '#FFF',
            fontWeight: 'normal',
            fontSize: 14,
            lineHeight: 40
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          x: 10,
          y: 45,
          textStyle: {
            color: '#FFF'
          },
          formatter: function(name) {
            for (var i = 0; i < dataSource.length; i++) {
              if (dataSource[i].name == name) {
                return name + '   ' + dataSource[i].value
              }
            }
          }
        },
        color: ['#8894f6', '#a78af8', '#7da7f1', '#64b4f9', '#ed9b85'],
        series: [
          {
            name: '类别比',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: dataSource
          }
        ]
      }
      chart.setOption(options)
      window.addEventListener('resize', () => {
        chart.resize()
      }, false)
    },
    chartThree(data) {
      var dataSource = data
      if (!data || !data.name) {
        dataSource = {
          name: ['类别1', '类别2', '类别3', '类别4', '类别5', '类别6', '类别7', '类别8'],
          value: [10, 3, 5, 7, 6, 7, 9, 5],
          max: 0
        }
      }
      var container = this.$refs.model3
      var chart = echarts.init(container)
      var dataAxis = dataSource.name
      var data = dataSource.value
      var yMax = dataSource.max
      var dataShadow = []

      for (var i = 0; i < data.length; i++) {
        dataShadow.push(yMax)
      }

      var options = {
        title: {
          text: '渐变柱形图',
          textStyle: {
            color: '#FFF',
            fontWeight: 'normal',
            fontSize: 14,
            lineHeight: 40
          }
        },
        xAxis: {
          data: dataAxis,
          // boundaryGap:false,
          axisLine: {
            lineStyle: {
              color: '#7da7f1'
            }
          },
          axisLabel: {
            interval: 0,
            formatter: function(value) {
              var ret = ''// 拼接加\n返回的类目项
              var maxLength = 3// 每项显示文字个数
              var valLength = value.length// X轴类目项的文字个数
              var rowN = Math.ceil(valLength / maxLength) // 类目项需要换行的行数
              if (rowN > 1)// 如果类目项的文字大于4,
              {
                for (var i = 0; i < rowN; i++) {
                  var temp = ''// 每次截取的字符串
                  var start = i * maxLength// 开始截取的位置
                  var end = start + maxLength// 结束截取的位置
                  // 这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧
                  temp = value.substring(start, end) + '\n'
                  ret += temp // 拼接最终的字符串
                }
                return ret
              } else {
                return value
              }
            }
          },
          z: 10
        },
        tooltip: {
          trigger: 'axis',
          // showContent:false
          formatter: '{b0}:{c1}'

        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: '#7da7f1'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#315070'],
              width: 1,
              type: 'solid'
            }
          }
        },
        grid: {
          left: 55,
          top: 50,
          right: 20,
          bottom: 50
        },

        series: [
          { // For shadow
            type: 'bar',

            itemStyle: {
              normal: { color: 'rgba(0,0,0,0.0)' }
            },
            barGap: '-100%',
            barCategoryGap: '40%',
            data: dataShadow,
            animation: false
          },
          {
            type: 'bar',
            barWidth: 8,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    { offset: 0, color: '#3cb5e4' },
                    { offset: 0.5, color: '#3698e3' },
                    { offset: 1, color: '#2d75e4' }
                  ]
                )
              },
              emphasis: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    { offset: 0, color: '#2d75e4' },
                    { offset: 0.5, color: '#3698e3' },
                    { offset: 1, color: '#3cb5e4' }
                  ]
                )
              }
            },
            data: data
          }
        ]
      }
      chart.setOption(options)
      window.addEventListener('resize', () => {
        chart.resize()
      }, false)
    }
  }

}
</>

