<template>
  <div class="mars3d">
    <iframe src="https://mars3d.cn/project/zhts/theme/index.html" scrolling="no" frameborder="0" style="width:100%;overflow:hidden;" class="mars" />
  </div>
</template>

<script>
export default {
  name: 'Mars3d',
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.mars3d {
  position: absolute;
  width: 100%;
  height: calc(100%);
  top: 0px;
  background: url('../../assets/images/login/bg.png') center center no-repeat;
  background-size: 100% 100%;
  .mars {
    width:100%;
    height:calc(100% - 72px);
    overflow:hidden;
    margin-top: 67px;
  }
}
</style>
