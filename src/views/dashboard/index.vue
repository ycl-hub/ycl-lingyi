<template>
  <div class="dashboard">
    <div class="dashboard-container clearfix">
      <Banner />
    </div>
  </div>
</template>

<script>
import Banner from '@/components/banner'
export default {
  name: 'Dashboard',
  components: {
    Banner
  },
  data() {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  background: url('../../assets/images/login/bg.png') center center no-repeat;
  background-size: 100% 100%;
  padding-top: 0.75rem;
  .dashboard-container {
    width: 100%;
    height: 100%;
    position: relative;
    ::v-deep .banner {
      position: absolute;
      top: calc(50% - 0.375rem);
      margin-top: -2.88rem;
    }
  }
}

</style>
