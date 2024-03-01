<template>
  <div class="pageBanner bigBoxShadow">
    <div class="left">
      <svg-icon class="icon" :icon-class="icon" />
    </div>
    <div class="right">
      <p>{{ name }}</p>
      <p>{{ dec }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageBanner',
  props: {
    icon: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    dec: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    }
  },
  computed: {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.pageBanner {
  width: 100%;
  height: 100px;
  padding: 24px 20px;
  .left {
    float: left;
    width: 52px;
    height: 52px;
    .icon {
      width: 52px;
      height: 52px;
    }
  }
  .right {
    float: left;
    margin-left: 20px;
    p {
      color: #79879c;
      font-size: 12px;
      line-height: 20px;
      &:first-child {
        color: #0b0b0c;
        line-height: 32px;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
}
</style>
