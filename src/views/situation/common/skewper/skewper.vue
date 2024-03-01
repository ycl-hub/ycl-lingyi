<template>
  <div class="skew-percentage-box left">
    <div v-for="(item,index) in percentageData" :key="index" class="skew-percentage">
      <div class="skew-percentage-con" :style="{width:item,backgroundColor:color}" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    number: {
      default: function() {
        return 0
      }
    },
    color: {
      default: function() {
        return '#fef74d'
      }
    }
  },
  computed: {
    percentageData: function() {
      // 声明一个数组
      var arr = []
      for (let i = 0; i < 10; i++) {
        // 需要生成10个方格，故数组的长度为10
        // 获取传入数值减去索引*10
        var num = this.number - i * 10
        if (num >= 10) {
          arr.push('100%')
        } else if (num > 0) {
          arr.push(num * 10 + '%')
        } else {
          arr.push('0%')
        }
      }
      // 返回生成数组
      return arr
    }
  }
}
</script>
<style lang="scss" scoped>
.skew-percentage-box{width:1rem; height:0.12rem; transform:skewX(-30deg); -webkit-transform: skewX(-30deg); margin-top: 0.03rem;}
.skew-percentage{height:100%; width: 0.06rem; background-color: #020e1c; margin-left: 0.04rem; float: left;}
.skew-percentage-con{height: 100%;}
</style>
