<template>
  <div :class="isEdit ? 'isedit' : ''" class="box" :style="styleObj">
    <span v-show="!isEdit" title="编辑" class="input-span">{{ value }}</span>
    <i
      v-show="!isEdit&&should"
      title="编辑"
      class="el-icon-edit-outline"
      @click="changeEdit(true)"
    />
    <el-input
      v-show="isEdit"
      ref="input"
      v-model.trim="defalutValue"
      class="filter"
      type="text"
      :maxlength="6"
      @keyup.enter.native="save"
    />
    <div class="right">
      <i v-show="isEdit" title="保存" class="el-icon-check" @click="save" />
      <i v-show="isEdit" title="取消" class="el-icon-close" @click="changeEdit(false)" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      default: '',
      type: String || Number || Boolean
    },
    keyName: {
      default: '',
      type: String || Number || Boolean
    },
    should: {
      default: true,
      type: Boolean
    },
    styleObj: {
      type: Object,
      default() {
        return {
          minWidth: '110px'
        }
      }
    }
  },
  data() {
    return {
      isEdit: false,
      defalutValue: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal, oldVal) {
        this.defalutValue = newVal
      }
    }
  },
  methods: {
    changeEdit(k) {
      if (!this.should) {
        return
      }
      this.isEdit = k
      if (!k) {
        this.defalutValue = this.value
        this.$forceUpdate()
      } else {
        this.$nextTick((_) => {
          this.$refs['input'].focus()
        })
      }
    },
    save() {
      console.log(111)
      const { keyName, defalutValue } = this
      if (defalutValue.length > 20) {
        this.$message.warning('文字过长')
      }
      this.$emit('change', { key: keyName, value: defalutValue })
      this.isEdit = false
    }
  }
}
</script>
<style lang="scss" scoped>
.isedit {
  // background-color: #265872;
  background: linear-gradient(219deg, #2a7aa2, #055984);
  // border: 1px solid #01cfff;
}
.box {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  border-radius: 3px;
  position: relative;
  padding: 0;
  z-index: 2;
  height: 20px;
  .el-icon-edit-outline {
    cursor: pointer;
    padding-left: 10px;
  }
  .filter {
    position: absolute;
    left: 0;
    // height: 20px !important;
    width: auto !important;
  }
  .input-span {
    cursor: pointer;
    font-size: 14px;
  }
  input {
    outline: none;
    border: none;
  }
  ::v-deep .el-input__inner {
    padding: 0 5px;
    height: 20px;
    color: #00d8ff;
    font-size: 13px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    outline: none;
    background: #05375f !important;
    border: 1px solid #135c7e;
    color: #6effe7;
    padding-right: 30px !important;
  }
  .right {
    display: flex;
    padding-right: 3px;
    position: absolute;
    right: 0;
    z-index: 2;
    color: white;
    i {
      cursor: pointer;
      color:  #01d3f9;
    }
  }
}
</style>
