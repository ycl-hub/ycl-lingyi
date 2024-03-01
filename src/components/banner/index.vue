<template>
  <div class="banner">
    <div class="box clearfix" @mouseenter.stop="btnOpen" @mouseleave.stop="btnHide">
      <div class="left_k">
        <div v-show="btnShow" class="btnMain">
          <div class="left" @click="leftClick">
            <img src="../../assets/images/dashboard/jt_l.png">
          </div>
        </div>
      </div>
      <div class="main clearfix">
        <div v-if="cList.length>0" class="minMain">
          <div v-for="(item, index) in cList" :key="index" class="item" :class="'p'+index" @click="go(item.path)">
            <img v-if="item.imgUrl" :src="item.imgUrl">
            <span class="itemText">{{ item.text }}</span>
          </div>
        </div>
      </div>
      <div class="right_k">
        <div v-show="btnShow" class="btnMain">
          <div class="right" @click="rightClick">
            <img src="../../assets/images/dashboard/jt_r.png">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 6张图片，展示6张，做无缝滚动轮播图
// 1、无缝，前后至少有各一张空位才能左右滑动有无缝效果
// 2、若数据驱动视图，尽量少控制dom，最好css控制过度，
// 从第一个或者最后一个过度到最后一个或者第一个，那么还至少需要一个隐藏的空位用于他们过度
// 3、那么再做展示6张的无缝轮播至少需要9个dom，所以当图片数量<9,应当复制原来的n张去做
// 4、优化:节流、浏览器页签切换及最小化
// 5、visibilitychange解绑，他的第二个参数需要绑定到this上
import { throttle } from 'lodash'
import { sessionStorage } from '@/utils/storage'
import yztzh from '@/assets/images/dashboard/yztzh.png'
import spdd from '@/assets/images/dashboard/spdd.png'
import dtbh from '@/assets/images/dashboard/dtbh.png'
import yjjs from '@/assets/images/dashboard/yjjs.png'
import zhzt from '@/assets/images/dashboard/zhzt.png'
import lsjl from '@/assets/images/dashboard/lsjl.png'
import { mapGetters } from 'vuex'
import { queryPath } from '@/utils/index'
export default {
  name: 'Banner',
  props: {},
  data() {
    return {
      // list: [
      //   { imgUrl: yztzh, text: '', path: '/map', id: 'yztzh' },
      //   { imgUrl: spdd, text: '', path: '/videoScheduling', id: 'spdd' },
      //   { imgUrl: dtbh, text: '', path: '/mapPlotting', id: 'dtbh' },
      //   { imgUrl: yjjs, text: '', path: '/dashboard', id: 'yjjs' },
      //   { imgUrl: zhzt, text: '', path: '/situation', id: 'zhts' },
      //   { imgUrl: lsjl, text: '', path: '/record', id: 'lsjl' },
      //   { imgUrl: yjjs, text: '', path: '/mars3d', id: 'mars3d' }
      // ],
      // numList: ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'],
      list: [],
      numList: [],
      imgTimer: null,
      btnShow: true,
      cList: [],
      showBanner: []
    }
  },
  computed: {
    ...mapGetters([
      'bannerTexts',
      'settings'
    ])
  },
  watch: {
    'settings.FEATURE_SETTING': {
      immediate: true,
      deep: true,
      handler(val) {
        if (Array.isArray(val) && val.length > 0) {
          this.list = []
          this.numList = []
          this.numList = []
          const _this = this
          val.forEach((v) => {
            const show = 'isOpen' in v ? v.isOpen : true
            // 判断是否开启该模块
            if (v.id === 'yztzh' && show) {
              this.list.push({ imgUrl: zhzt, show: show, text: v.text, path: '/map', id: 'yztzh' })
            }
            if (v.id === 'spdd' && show && queryPath('spdd', sessionStorage.get('moduleInfo'))?.DISPLAY) {
              this.list.push({ imgUrl: spdd, show: show, text: Number(_this.settings.GLOBAL_FUNCTION_CONFIG) === 1 ? queryPath('spdd', sessionStorage.get('moduleInfo'))?.NAME : v.text, path: '/videoScheduling', id: 'spdd' })
            }
            if (v.id === 'dtbh' && show && queryPath('dtbh', sessionStorage.get('moduleInfo'))?.DISPLAY) {
              this.list.push({ imgUrl: dtbh, show: show, text: Number(_this.settings.GLOBAL_FUNCTION_CONFIG) === 1 ? queryPath('dtbh', sessionStorage.get('moduleInfo'))?.NAME : v.text, path: '/mapPlotting', id: 'dtbh' })
            }
            if (v.id === 'yjjs' && show) {
              this.list.push({ imgUrl: yjjs, show: show, text: v.text, path: '/dashboard', id: 'yjjs' })
            }
            if (v.id === 'zhdd' && show && queryPath('zhdd', sessionStorage.get('moduleInfo'))?.DISPLAY) {
              this.list.push({ imgUrl: yztzh, show: show, text: Number(_this.settings.GLOBAL_FUNCTION_CONFIG) === 1 ? queryPath('zhdd', sessionStorage.get('moduleInfo'))?.NAME : v.text, path: '/map', id: 'zhdd' })
            }
            if (v.id === 'lsjl' && show && queryPath('lsjl', sessionStorage.get('moduleInfo'))?.DISPLAY) {
              this.list.push({ imgUrl: lsjl, show: show, text: Number(_this.settings.GLOBAL_FUNCTION_CONFIG) === 1 ? queryPath('lsjl', sessionStorage.get('moduleInfo'))?.NAME : v.text, path: '/record', id: 'lsjl' })
            }
            if (v.id === 'mars3d' && show) {
              this.list.push({ imgUrl: yjjs, show: show, text: v.text, path: '/mars3d', id: 'mars3d' })
            }
            if (v.id === 'pzgl' && show && queryPath('pzgl', sessionStorage.get('moduleInfo'))?.DISPLAY) {
              this.list.push({ imgUrl: yjjs, show: show, text: Number(_this.settings.GLOBAL_FUNCTION_CONFIG) === 1 ? queryPath('pzgl', sessionStorage.get('moduleInfo'))?.NAME : v.text, path: '/setting', id: 'setting' })
            }
          })
        }

        // 目前list有已知7个, 这里css的样式只写到了p15，如果真有超多16张图轮播，需要添加css
        if (this.list.length >= 9) {
          this.cList = [this.list[this.list.length - 1], ...this.list.slice(0, this.list.length - 1)]
          this.cList.forEach((c, i) => {
            this.numList.push('p' + i)
          })
        } else if (this.list.length > 4 && this.list.length < 9) {
          this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list.slice(0, this.list.length - 1)]
          this.cList.forEach((c, i) => {
            this.numList.push('p' + i)
          })
        } else if (this.list.length === 3 || this.list.length === 4) {
          this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list, ...this.list.slice(0, this.list.length - 1)]
          this.cList.forEach((c, i) => {
            this.numList.push('p' + i)
          })
        } else if (this.list.length === 2) {
          this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list, ...this.list, ...this.list, ...this.list.slice(0, this.list.length - 1)]
          this.cList.forEach((c, i) => {
            this.numList.push('p' + i)
          })
        } else if (this.list.length === 1) {
          for (let i = 0; i < 9; i++) {
            this.cList.push(this.list[0])
            this.numList.push('p' + i)
          }
        }
      }
    },
    bannerTexts: {
      handler: function(val) {
        // console.log(val, '我是setting')
        // val.forEach((v) => {
        //   this.list.forEach((l) => {
        //     if (v.id === l.id) {
        //       l.text = v.text
        //     }
        //   })
        // })
        // val.forEach((v) => {
        //   if (v.id === 'yztzh' && v.show) {
        //     this.list.push({ imgUrl: yztzh, text: v.text, path: '/map', id: 'yztzh' })
        //   }
        //   if (v.id === 'spdd' && v.show) {
        //     this.list.push({ imgUrl: spdd, text: v.text, path: '/videoScheduling', id: 'spdd' })
        //   }
        //   if (v.id === 'dtbh' && v.show) {
        //     this.list.push({ imgUrl: dtbh, text: v.text, path: '/mapPlotting', id: 'dtbh' })
        //   }
        //   if (v.id === 'yjjs' && v.show) {
        //     this.list.push({ imgUrl: yjjs, text: v.text, path: '/dashboard', id: 'yjjs' })
        //   }
        //   if (v.id === 'zhts' && v.show) {
        //     this.list.push({ imgUrl: zhzt, text: v.text, path: '/situation', id: 'zhts' })
        //   }
        //   if (v.id === 'lsjl' && v.show) {
        //     this.list.push({ imgUrl: lsjl, text: v.text, path: '/record', id: 'lsjl' })
        //   }
        //   if (v.id === 'mars3d' && v.show) {
        //     this.list.push({ imgUrl: yjjs, text: v.text, path: '/mars3d', id: 'mars3d' })
        //   }
        //   if (v.id === 'setting' && v.show) {
        //     this.list.push({ imgUrl: yjjs, text: v.text, path: '/setting', id: 'setting' })
        //   }
        // })
        // // 目前list有已知7个, 这里css的样式只写到了p15，如果真有超多16张图轮播，需要添加css
        // if (this.list.length >= 9) {
        //   this.cList = [this.list[this.list.length - 1], ...this.list.slice(0, this.list.length - 1)]
        //   this.cList.forEach((c, i) => {
        //     this.numList.push('p' + i)
        //   })
        // } else if (this.list.length > 4 && this.list.length < 9) {
        //   this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list.slice(0, this.list.length - 1)]
        //   this.cList.forEach((c, i) => {
        //     this.numList.push('p' + i)
        //   })
        // } else if (this.list.length === 3 || this.list.length === 4) {
        //   this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list, ...this.list.slice(0, this.list.length - 1)]
        //   this.cList.forEach((c, i) => {
        //     this.numList.push('p' + i)
        //   })
        // } else if (this.list.length === 2) {
        //   this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list, ...this.list, ...this.list, ...this.list.slice(0, this.list.length - 1)]
        //   this.cList.forEach((c, i) => {
        //     this.numList.push('p' + i)
        //   })
        // } else if (this.list.length === 1) {
        //   for (let i = 0; i < 9; i++) {
        //     this.cList.push(this.list[0])
        //     this.numList.push('p' + i)
        //   }
        // }
      },
      immediate: true
    }
  },
  created() {
    // this.cList = [this.list[this.list.length - 1], ...this.list, ...this.list.slice(0, this.list.length - 1)]
  },
  mounted() {
    // this.showBanner = this.bannerTexts.filter((item) => {
    //   return item.show
    // })
    // if (this.showBanner.length > 6) {
    this.imgMove()
    document.addEventListener('visibilitychange', this.eventHandler)
    // }
  },
  activated() {
    // if (this.showBanner.length > 6) {
    this.startTimer()
    // }
  },
  deactivated() {
    // if (this.showBanner.length > 6) {
    this.pauseTimer()
    // }
  },
  beforeDestroy() {
    // if (this.showBanner.length > 6) {
    document.removeEventListener('visibilitychange', this.eventHandler)
    this.pauseTimer()
    // }
  },
  methods: {
    imgMove() {
      this.imgTimer = setInterval(() => {
        var Item = document.getElementsByClassName('item')
        this.numList.unshift(this.numList[this.numList.length - 1])
        this.numList.pop()
        for (var i = 0; i < Item.length; i++) {
          Item[i].className = 'item ' + this.numList[i]
        }
      }, 3000)
    },
    pauseTimer() {
      if (this.imgTimer) {
        clearInterval(this.imgTimer)
        this.imgTimer = null
      }
    },
    startTimer() {
      if (this.imgTimer) return
      this.imgMove()
    },
    btnOpen() {
      this.btnShow = true
      // if (this.showBanner.length > 6) {
      this.pauseTimer()
      // }
    },
    btnHide() {
      // this.btnShow = false
      this.btnShow = true
      // if (this.showBanner.length > 6) {
      this.startTimer()
      // }
    },
    eventHandler() {
      if (document.hidden) {
        this.pauseTimer()
      } else {
        this.startTimer()
      }
    },
    leftClick: throttle(function() {
      var Item = document.getElementsByClassName('item')
      this.numList.push(this.numList[0])
      this.numList.shift()
      for (var i = 0; i < Item.length; i++) {
        Item[i].className = 'item ' + this.numList[i]
      }
    }, 500, { 'trailing': false }),
    rightClick: throttle(function() {
      var Item = document.getElementsByClassName('item')
      this.numList.unshift(this.numList[this.numList.length - 1])
      this.numList.pop()
      for (var i = 0; i < Item.length; i++) {
        Item[i].className = 'item ' + this.numList[i]
      }
    }, 500, { 'trailing': false }),
    go(path) {
      this.$router.push({ path: path })
    }
  }
}
</script>
<style lang="scss" scoped>
.banner {
  .box {
    position: relative;
    width: 18.7rem;
    height: 5.76rem;
    margin: 0px auto;
    .left_k,
    .right_k {
      width: 5.06rem;
      height: 5.76rem;
      position: relative;
    }
    .left_k {
      float: left;
      background: url('../../assets/images/dashboard/left_k.png') no-repeat;
      background-size: 5.06rem 5.76rem;
    }
    .right_k {
      float: right;
      background: url('../../assets/images/dashboard/right_k.png') no-repeat;
      background-size: 5.06rem 5.76rem;
    }
  }
  .main {
    width: 14.54rem;
    height: 5rem;
    position: absolute;
    z-index: 20;
    top: 50%;
    left: 50%;
    margin-top: -2.6rem;
    margin-left: -7.27rem;
    overflow: hidden;
    padding-top: 0.1rem;
    .minMain {
      height: 4.8rem;
      perspective:1000px;
    }
    .item {
      cursor: pointer;
      list-style: none;
      width: 2.37rem;
      height: 4.8rem;
      position: absolute;
      left: 0px;
      top: 0px;
      // transition: all 500ms ease;
      background-size: 2.37rem 4.8rem;
      box-shadow: 0px 0px 10px 10px rgba(0,17,37,.3);
      z-index: 1;
      img {
        width: 100%;
        height: 100%;
        transition: all 1s ease;
      }
      // border: 1px solid #046b93;
      background: rgba(2,29,53,0.3);
      border-radius: 4px;
      border-top: 1px solid #024461;
      border-left: 1px solid #024461;
      border-right: 1px solid #024461;
      border-bottom: 1px solid rgba(0,41,59,0.5);
      &::before {
        content: "";
        position: absolute;
        width: 1px;
        height: 100%;
        top: 0px;
        left: -1px;
        transition: all 1s ease;
        background-image: linear-gradient(to bottom, #024461, #0bafdd,#024461);
      }
      &::after {
        content: "";
        position: absolute;
        width: 1px;
        height: 100%;
        top: 0px;
        right: -1px;
        transition: all 1s ease;
        background-image: linear-gradient(to bottom, #024461, #0bafdd,#024461);
      }
      .itemText {
        transition: all 1s ease;
        position: absolute;
        text-align: center;
        width: 100%;
        top: 2.94rem;
        left: 0;
        letter-spacing: 0.06rem;
        font-size: 0.2rem;
        color: #fff;
        font-weight: 700;
        background-image: linear-gradient(to bottom, rgb(255, 255, 255) 30%, rgb(124, 253, 255));
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      &:first-child {
        .itemText {
          width: 2.24rem;
        }
      }
      &:hover {
        &::before, &::after{
          display: none;
        }
        border: 1px solid #0bafdd;
        box-shadow: 0px 0px 10px 10px rgba(0,0,0,.5);
        img {
          transform: scale(1.1);
        }
        .itemText {
          transform: scale(1.1);
        }
      }
    }
  }
  .p0 {
    transition: all 800ms ease-out;
    transform: translate3d(-2.37rem, 0, 50px) rotateY(23deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p1 {
    transition: all 800ms ease-out;
    transform: translate3d(0, 0, -20px) rotateY(16deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p2 {
    transition: all 800ms ease-out;
    transform: translate3d(2.436rem, 0, -70px) rotateY(10deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p3 {
    transition: all 800ms ease-out;
    transform: translate3d(4.872rem, 0, -100px) rotateY(5deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p4 {
    transition: all 800ms ease-out;
    transform: translate3d(7.308rem, 0, -100px) rotateY(-5deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p5 {
    transition: all 800ms ease-out;
    transform: translate3d(9.744rem, 0, -70px) rotateY(-10deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p6 {
    transition: all 800ms ease-out;
    transform: translate3d(12.19rem, 0, -23px) rotateY(-16deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p7 {
    transition: all 800ms ease-out;
    transform: translate3d(14.54rem, 0, 50px) rotateY(-23deg) scale(1);
    opacity: 1;
    visibility: visible;
  }
  .p8, .p9, .p10, .p11, .p12, .p13, .p14, .p15 {
    display: none;
  }
  .btnMain {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    .left {
      cursor: pointer;
      position: absolute;
      left: 0.8rem;
      top: 2.5rem;
      z-index: 10;
    }
    .right {
      cursor: pointer;
      position: absolute;
      right: 0.8rem;
      top: 2.5rem;
      z-index: 10;
    }
    .left img,
    .right img {
      width: 0.46rem;
      height: 0.46rem;
    }
  }
}
</style>
