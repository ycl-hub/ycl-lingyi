<template>
  <div class="box clearfix">
    <div class="left_k">
      <img src="../../assets/images/dashboard/left_k.png">
      <div v-show="btnShow" class="btnMain">
        <div class="left" @click="leftClick">
          <img src="../../assets/images/dashboard/jt_l.png">
        </div>
      </div>
    </div>
    <div class="main clearfix" @mouseover="btnOpen" @mouseout="btnHide">
      <div class="minMain">
        <div v-for="(item,index) in list" :key="index" class="item">
          <img v-if="item.imgUrl" :src="item.imgUrl">
        </div>
      </div>
    </div>
    <div class="right_k">
      <img src="../../assets/images/dashboard/right_k.png">
      <div v-show="btnShow" class="btnMain">
        <div class="right" @click="rightClick">
          <img src="../../assets/images/dashboard/jt_r.png">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Bannerdemo',
  props: {
  },
  data() {
    return {
      list: [
        // { imgUrl: require('@/assets/images/dashboard/img_yztzh.png') },
        // { imgUrl: require('@/assets/images/dashboard/img_spdd.png') },
        // { imgUrl: require('@/assets/images/dashboard/img_dtbh.png') },
        // { imgUrl: require('@/assets/images/dashboard/img_yyjs.png') },
        // { imgUrl: require('@/assets/images/dashboard/img_zhts.png') },
        // { imgUrl: require('@/assets/images/dashboard/img_lsjl.png') }
        { imgUrl: '' },
        { imgUrl: '' },
        { imgUrl: '' },
        { imgUrl: '' },
        { imgUrl: '' },
        { imgUrl: '' }
      ],
      numList: ['p0', 'p1', 'p2', 'p3', 'p4', 'p5'],
      imgIndex: 0,
      imgTimer: null,
      btnShow: true
    }
  },
  computed: {
  },
  mounted() {
    var Item = document.getElementsByClassName('item')
    for (var i = 0; i < Item.length; i++) {
      Item[i].className = 'item ' + this.numList[i]
    }
    this.imgMove()
  },
  beforeDestroy() {
    clearInterval(this.imgTimer)
  },
  methods: {
    imgMove() {
      var Item = document.getElementsByClassName('item')
      this.imgTimer = setInterval(() => {
        this.numList.push(this.numList[0])
        this.numList.shift()
        this.imgIndex++
        for (var i = 0; i < Item.length; i++) {
          Item[i].className = 'item ' + this.numList[i]
        }
        for (const i in this.pressList) {
          this.pressList[i].isShow = false
        }
        if (this.imgIndex > 5) {
          this.imgIndex = 0
        }
      }, 200000)
    },
    btnOpen() {
      this.btnShow = true
      clearInterval(this.imgTimer)
    },
    btnHide() {
      // this.btnShow = false
      this.btnShow = true
      this.imgMove()
    },
    leftClick() {
      var Item = document.getElementsByClassName('item')
      this.numList.unshift(this.numList[5])
      this.numList.pop()
      for (var i = 0; i < Item.length; i++) {
        Item[i].className = 'item ' + this.numList[i]
      }
      this.imgIndex--
      if (this.imgIndex < 0) {
        this.imgIndex = 5
      }
    },
    rightClick() {
      var Item = document.getElementsByClassName('item')
      this.numList.push(this.numList[0])
      this.numList.shift()
      for (var i = 0; i < Item.length; i++) {
        Item[i].className = 'item ' + this.numList[i]
      }
      this.imgIndex++
      if (this.imgIndex > 5) {
        this.imgIndex = 0
      }
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
    .left_k,.right_k {
      width: 5.06rem;
      height: 5.76rem;
      position: relative;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .left_k {
      float: left;
    }
    .right_k {
      float: right;
    }
  }
  .main {
    width: 14.54rem;
    height: 4.8rem;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -2.4rem;
    margin-left: -7.27rem;
    overflow: hidden;
    .item {
      cursor: pointer;
      list-style: none;
      width: 2.37rem;
      height: 4.8rem;
      position: absolute;
      left: 0px;
      top: 0px;
      transition: all 0.3s ease;
      img {
        width: 100%;
        height: 100%;
      }
      border: 1px solid #0773bb;
      background: rgba(2,29,53,0.3);
      border-radius: 4px;
      border-top: 1px solid #034882;
      border-bottom: 1px solid rgba(0,37,68,0.3);
      &::before {
        content: "";
        position: absolute;
        width: 1px;
        height: 100%;
        top: 0px;
        left: -1px;
        background-image: linear-gradient(to bottom, #034882, #0b8fde,#034882);
      }
      &:after {
        content: "";
        position: absolute;
        width: 1px;
        height: 100%;
        top: 0px;
        right: -1px;
        background-image: linear-gradient(to bottom, #034882, #0b8fde,#034882);
      }
    }
  }
  .p0 {
    transform: translate3d(0px, 0, -100px) rotateX(18deg) rotateY(6deg) scale(1);
    opacity: 1;
    z-index: 1;
  }
  .p1 {
    transform: translate3d(2.436rem, 0, 0) rotateX(24deg) rotateY(6deg) scale(1);
    opacity: 1;
    z-index: 2;
  }
  .p2 {
    transform: translate3d(4.872rem, 0, 0) rotateX(28deg) rotateY(2deg) scale(1);
    opacity: 1;
    z-index: 3;
  }
  .p3 {
    transform: translate3d(7.308rem, 0, 0) rotateX(27deg) rotateY(-4deg) scale(1);
    opacity: 1;
    z-index: 4;
  }
  .p4 {
    transform: translate3d(9.744rem, 0, 0) rotateX(21deg) rotateY(-7deg) scale(1);
    opacity: 1;
    z-index: 5;
  }
  .p5 {
    transform: translate3d(12.19rem, 0, 0) rotateX(13deg) rotateY(-11deg) scale(1);
    opacity: 1;
    z-index: 6;
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
