<template>
  <div class="yuan">
    <div class="yuan_bl1" :style="{backgroundImage:'url('+bgImgUrl+')'}">
      <!--小于等于180度-->
      <div v-if="number <= 50" class="yuan_bl3" :style="{transform:'rotate(' + rotatenum + 'deg)'}" />
    </div>
    <!--大于180度-->
    <div v-if="number > 50" class="yuan_bl2" :style="{backgroundImage:'url('+bgImgUrl+')'}">
      <div class="yuan_bl4" :style="{transform:'rotate(' + rotatenum + 'deg)'}" />
    </div>
    <div class="yuan_text">
      <span class="block font14" style="margin-top:0.15rem; line-height:0.24rem;">{{ name }}</span>
      <span class="block"><span style="font-size:0.24rem; padding-right:0.02rem">{{ number }}</span>%</span>
    </div>
  </div>
</template>

<script>
import cql from '@/views/situation/common/images/cql.png'
export default {
  props: {
    number: {
      default: function() {
        return 75
      }
    },
    name: {
      default: function() {
        return '有效率'
      }
    },
    bgImgUrl: {
      default: function() {
        return cql
      }
    }
  },
  computed: {
    rotatenum: function() {
      var num = this.number / 100 * 360
      if (this.number > 50) {
        num = (this.number - 50) / 100 * 360
      }

      return num
    }
  }
}
</script>
<style lang="scss" scoped>
.yuan{ width:100%; height:100%;  box-sizing:border-box;
    text-align:center;  border-radius:50%; position:relative; transform: rotate(90deg);
}
.yuan_bl1 , .yuan_bl2 , .yuan_bl3 , .yuan_bl4{ width:100%; height:100%; border-radius:50%; position:absolute; left:0; top:0;}
.yuan_bl1 , .yuan_bl2{
    background-size: cover; background-repeat: no-repeat;
}
.yuan_bl3 , .yuan_bl4{ background-color:#0b475d;}
.yuan_bl1 , .yuan_bl3{ clip:rect(0 1rem 0.5rem 0);}
.yuan_bl2 , .yuan_bl4{ clip:rect(0.5rem 1rem 1rem 0);}
.yuan_text{ width:0.8rem; height:0.8rem;  box-sizing:border-box;  color:#FFF;
    background-color:#0b475d; border-radius:50%; position: absolute; top: 50%; left: 50%;
    margin-left: -0.4rem; margin-top: -0.4rem; transform: rotate(-90deg);
}
</style>

