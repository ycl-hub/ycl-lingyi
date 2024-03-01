<template>
  <div v-move="{parent: '.pj_dialog', childrenHeader: '.pj_dialog_tit'}" class="pj_dialog bevel">
    <div class="pj_dialog_tit">
      <span class="tit">周边资源</span>
      <span class="el-icon-close close" @click="close" />
    </div>
    <div class="pj_con">
      <div class="pj_con_c">
        <el-tabs v-model="activeTab">
          <!-- <el-tab-pane label="111" name="second">
            <JWT :b-map="BMap" :map="map" :detail="detail" />
          </el-tab-pane>
          <el-tab-pane label="222" name="third">
            <JIANKONG :b-map="BMap" :map="map" :detail="detail" />
          </el-tab-pane> -->
          <el-tab-pane v-for="type in typeList" :key="type.id" :label="type.name" :name="type.id" lazy>
            <components :is="type.comp" :ref="type.comp" :b-map="BMap" :map="map" :detail="detail" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { sessionStorage } from '@/utils/storage'
import search from '@/assets/images/equipment/search.png'
import JWT from './JWT'
import JIANKONG from './JIANKONG'
import { mapGetters } from 'vuex'
export default {
  name: 'ZDZhoubian',
  components: {
    JWT, JIANKONG
  },
  props: {
    bMap: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    map: {
      required: true,
      type: Object,
      default: function() {
        return {}
      }
    },
    isShowZhoubian: {
      required: true,
      type: Boolean,
      default: false
    },
    detail: {
      required: false,
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      search,
      TONE_voip: sessionStorage.get('TONE_voip'),
      activeTab: 'JWT',
      typeList: []
    }
  },
  computed: {
    // 仅读取
    BMap: function() {
      return this.bMap
    },
    ...mapGetters([
      'callList'
    ]),
    jwtCallList: function() {
      const temp = this.callList.filter((item) => {
        return item.belong === 'jwt'
      })
      return temp
    }
  },
  provide: function() {
    return {
    }
  },
  watch: {
    isShowZhoubian: {
      handler: function(val) {
        !val ? this.close() : ''
      },
      deep: false
    }
  },
  created() {
    this.getDevTypeList()
  },
  mounted() {
  },
  methods: {
    // 获取设备列表
    getDevTypeList() {
      // this.$api.common.getDevTypeList().then(res => {
      //   var data = res.data.records
      //   var obj = {
      //     name: '警务通',
      //     id: '警务通',
      //     is_dyna: 'true',
      //     power: '1,2',
      //     comp: 'JWT'
      //   }
      //   data.unshift(obj)
      //   this.typeList = data
      //   console.log(this.typeList)
      // })
      this.typeList = [
        {
          name: '警务通',
          id: 'JWT',
          is_dyna: 'true',
          power: '1,2',
          comp: 'JWT'
        },
        {
          name: '监控',
          id: 'JIANKONG',
          is_dyna: 'false',
          power: '2',
          comp: 'JIANKONG'
        }
      ]
    },
    // 关闭派警弹窗
    close() {
      if (this.jwtCallList && this.jwtCallList.length > 0) {
        this.$message({
          message: '请先关闭正在进行的视频通话',
          type: 'info'
        })
        return false
      }
      if (this.$refs[this.activeTab][0].isShowTongxun) {
        this.$message({
          message: '请先关闭正在进行的视频会商',
          type: 'info'
        })
        return false
      }
      if (this.$refs[this.activeTab][0].isShowIM) {
        this.$message({
          message: '请先关闭正在进行的聊天',
          type: 'info'
        })
        return false
      }
      if (this.$refs[this.activeTab][0].videoGroupCallDialog) {
        this.$message({
          message: '请先关闭正在进行的视频群呼',
          type: 'info'
        })
        return false
      }
      this.isShowZhoubian && this.$emit('update:isShowZhoubian', false)
      this.checkedPolices = []
    }
  }
}
</script>
<style lang="scss" scoped>
.pj_dialog{
  width: 480px;
  height: 600px;
  color: #fff;
  position: absolute;
  top: calc(50% - 300px);
  left: calc(50% + 22px);
  .pj_dialog_tit{
    box-sizing: content-box;
    padding: 5px 10px;
    height: 30px; line-height: 30px;
    border-bottom: 1px solid #497a7a;
    font-size: 14px;
    font-family: PingFang SC;
    .tit{float: left;}
    .close{
      float: right;
      font-size: 16px;
      cursor: pointer;
      line-height: 30px;
      width: 30px;
      height: 30px;
      text-align: right;
    }
  }
  .pj_con{
    width: 100%;
    height: calc(100% - 50px);
    .pj_h {
      .title {
        padding-top: 10px;
        &.title2 {
          margin-top: 10px;
        }
      }
    }
    .pj_con_c{
      height: calc(100%);
      margin-top: 10px;
      // background: rgba(5, 78, 117, 0.4);
      // padding: 10px 10px 5px;
      ::v-deep .filter {
        width: 100%;
        height: 30px;
        .el-input__inner {
          height: 30px;
          border: 1px solid #197491;
          background-color: #265872;
          color: #fff;
          font-size: 12px;
          &::-webkit-input-placeholder {
            color:#0fabd4;
            font-size: 12px;
          }
          &:-moz-placeholder {
            color:#0fabd4;
            font-size: 12px;
          }
          &::-moz-placeholder {
            color:#0fabd4;
            font-size: 12px;
          }
          &:-ms-input-placeholder {
            color:#0fabd4;
            font-size: 12px;
          }
        }
        .el-input__suffix {
          right: 2px;
          .img {
            margin-top: 2px;
            cursor: pointer;
          }
        }
      }
      ::v-deep .el-checkbox-group {
        .checkboxItem {
          padding: 5px 0;
          .el-checkbox {
            .el-checkbox__inner {
              border: 1px solid #01d3f9;
              background-color: transparent;
              &::after {
                border: 1px solid #01d3f9;
                border-left: 0;
                border-top: 0;
              }
            }
            .el-checkbox__label {
              color: #01d3f9;
            }
          }
        }
      }
      ::v-deep .el-tabs {
        height: 100%;
        .el-tabs__header {
          padding: 0 10px;
          margin: 0 0 10px;
          .el-tabs__nav-wrap::after {
            height: 1px;
            background-color: #02A7FD;
          }
          .el-tabs__item {
            padding: 0 10px;
            font-size: 12px;
            height: 30px;
            line-height: 30px;
            color: #ccc;
            &.is-active {
              color: #fff;
            }
          }
          .el-tabs__active-bar {
            height: 2px;
            background-color: #FF6A00;
          }
          .el-tabs__nav-prev, .el-tabs__nav-next {
            line-height: 30px;
          }
        }
        .el-tabs__content {
          height: calc(100% - 45px);
          .el-tab-pane {
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
