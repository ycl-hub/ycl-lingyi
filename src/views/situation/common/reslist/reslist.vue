<template>
  <ul class="reslist">
    <li v-for="(item,index) in data" :key="index">
      <div class="left left-tit">
        <span class="block">{{ item.name }}</span>
      </div>
      <div class="left right-con">
        <div class="top">
          <div class="left percentage-box">
            <div class="percentage" :style="{backgroundColor:settings.colors[index],width:parseInt(item.resAll/getDataMaxNumber()*100)+'%'}" />
          </div>
          <div class="left">
            <span>{{ item.resAll }}</span>
          </div>
        </div>
        <div class="bot">
          <span class="left" style="margin-right:0.05rem;">{{ item.percentageName }}</span>
          <skew-per style="margin-right:0.1rem" :number="item.percentage" :color="settings.colors[index]" />
          <span class="left">{{ item.percentage + '%' }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
import skewPer from '../skewper/skewper'
export default {
  components: {
    skewPer
  },
  props: {
    data: {
      default: function() {
        return [
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
        ]
      }
    },
    settings: {
      default: function() {
        return {
          colors: ['#d72862', '#fef74d', '#3f3ac7', '#00f7ae']
        }
      }
    }
  },
  data() {
    return {
    }
  },
  created() {
    this.getDataMaxNumber()
  },
  methods: {
    getDataMaxNumber() {
      // 获取数据中最大的资源
      var arr = this.data.map(v => {
        return v.resAll
      })// 遍历数据并返回资源数组
      var maxNumber = Math.max(...arr)// 获取数组中最大值
      return maxNumber
    }
  }
}
</script>
<style lang="scss" scoped>
.reslist{overflow: hidden;}
.reslist li{width: 100%; height: 0.65rem; background: url('./model5bg.png') left center no-repeat;
    background-size: 100% 100%; box-sizing: border-box;
    margin-top: 0.03rem;
}
.reslist .left-tit{ width: 0.75rem; text-align: center; font-size: 0.14rem; height: 100%; overflow: hidden;}
.reslist .left-tit span.block{line-height: 1; margin-top: 0.3rem; overflow: hidden; white-space: nowrap; box-sizing: border-box;}
.reslist .right-con{ height: 100%; padding-top: 0.08rem; padding-left: 0.05rem; box-sizing: border-box;}
.reslist .right-con .top,.reslist .right-con .bot{height: 0.2rem; line-height: 0.2rem; font-size: 0.12rem;}
.reslist .right-con .top{ margin-top: 0.1rem;}
.percentage-box{width: 1.54rem; height: 0.1rem; background-color: #020e1c; border-radius: 0.05rem;
    margin-top: 0.05rem; margin-right: 0.05rem;
}
.percentage{border-radius: 0.05rem; height: 100%; transition: all .3s linear; width: 0%;}
</style>
