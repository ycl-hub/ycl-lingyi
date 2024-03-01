<template>
  <footer :style="styleObj">
    <div class="btnWrap">
      <button class="searchBtn btn" :class="{'stop-apply':disable}" @click="updateConfig">保存</button>
      <button class="cancelBtn btn" :class="{'stop-apply':disable}" @click="resetConfig">重置</button>
    </div>
  </footer>
</template>
<script>
export default {
  props: {
    styleObj: {
      // eslint-disable-next-line no-undef
      type: Object,
      default() {
        return {
          height: '200px',
          position: 'relative'
        }
      }
    },
    disable: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  methods: {
    updateConfig() {
      if (this.disable) {
        this.$message.closeAll()
        this.$message.warning('该配置已全局生效,由管理后台统一修改！')
        return
      }
      this.$emit('update')
    },
    resetConfig() {
      if (this.disable) {
        this.$message.closeAll()
        this.$message.warning('该配置已全局生效,不可修改！')
        return
      }
      this.$emit('reset')
    }
  }
}
</script>
<style lang="scss" scoped>
 .btnWrap {
      padding: 0px 10px;
      width: 170px;
      height: 28px;
      display: flex;
    .btn{
      cursor: pointer;
      background: url('../../../assets/images/equipment/btnBg.png') no-repeat;
      background-size: 100% 100%;
      width: 80px;
      height: 24px;
      line-height: 22px;
      font-size: 12px;
      display: inline-block;
      color: #01cfff;
      text-align: center;
    }
    .stop-apply{
      cursor:not-allowed;
      color:grey;
    }
      .el-form-item__content {
        width: 170px;
      }
      // .searchBtn,
      // .cancelBtn {
      //   width: calc((100% - 5px) / 2);
      //   height: 28px;
      //   font-size: 12px;
      //   background: linear-gradient(0deg, #2a7aa2, #055984);
      //   border: 1px solid #01cfff;
      //   border-radius: 4px;
      //   color: #00d8ff;
      //   cursor: pointer;
      //   span {
      //     &:first-child {
      //       margin-right: 2px;
      //       font-size: 16px;
      //     }
      //     &:last-child {
      //       display: inline-block;
      //       transform: translateY(-1px);
      //     }
      //   }
      // }
      .cancelBtn {
        margin-left: 5px;
      }
    }
</style>
