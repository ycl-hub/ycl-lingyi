<template>
  <div class="uploadFile">
    <el-upload
      ref="uploadFile"
      :action="upFile()"
      name="Upfile"
      :data="dataFile"
      :before-upload="beforeUpload"
      :auto-upload="true"
      :limit="limit"
      :on-exceed="handleExceed"
      :file-list="fileList"
      :on-change="onChange"
      :on-success="handleFileSuccess"
      :on-progress="progress"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
    >
      <el-button size="mini" type="primary">点击选择文件</el-button>
    </el-upload>
    <template>
      <div v-show="uploadTips" class="error">请选择附件</div>
    </template>
  </div>
</template>

<script>
import { api } from '@/api/env'
export default {
  name: 'UploadFile',
  props: {
    // 上传文件的附带参数，由后端来定
    dataFile: {
      type: Object,
      default: function() {
        return {
          ddtId: '',
          name: ''
        }
      }
    },
    // 上传文件个数限制
    limit: {
      type: Number,
      default: 1
    },
    // 用于回显的文件地址
    url: {
      type: Array,
      default: function() {
        return []
      }
    },
    // 必填项时需传verify：true ,uploadTips：false,并在父组件保存按钮加个判断，非必填这些不写
    // 是否必填验证
    verify: {
      type: Boolean,
      default: false
    },
    // 提示信息
    uploadTips: {
      type: Boolean,
      default: false
    },
    // 只能上传wai
    isWai: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 上传的文件列表,文件编辑回显的时候用到
      fileList: [],
      // 接口返回的文件信息
      fileInfo: {
        filePath: [],
        keys: []
      },
      delKey: ''
    }
  },
  watch: {
    url(val) {
      if (val) {
        this.fileList = []
        this.fileInfo.keys = []
        val.forEach(ele => {
          this.fileList.push({ url: ele.url, key: ele.key, name: ele.fileName })
          this.fileInfo.keys.push(ele.key)
        })
      }
    }
  },
  created() {

  },
  mounted() {
    // 文件回显
    if (this.url) {
      this.fileList = []
      this.fileInfo.keys = []
      this.url.forEach(ele => {
        this.fileList.push({ url: ele.url, key: ele.key, name: ele.fileName })
        this.fileInfo.keys.push(ele.key)
      })
    }
  },
  methods: {
    // 上传文件的接口地址
    upFile() {
      return `${api}/manager/plotting/plottinginfo!uploadIco.action`
    },
    // 上传之前文件验证
    beforeUpload(file) {
      // const userInfo = sessionStorage.get('TONE_sipUserInfo')
      // this.dataFile.ddtId = userInfo.userName
      // this.dataFile.name = this.ruleForm.tubiaoName
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isPdf = testmsg === 'pdf'
      const isZip = testmsg === 'zip'
      const isDoc = testmsg === 'doc'
      const isPpt = testmsg === 'ppt'
      const isRar = testmsg === 'rar'
      const isWai = testmsg === 'wai'
      const isLt200M = file.size / 1024 / 1024 < 200
      // 只能上传wai
      if (this.isWai === true) {
        if (!isWai) {
          this.$message({
            message: '上传文件只能是wai格式!',
            type: 'error'
          })
          return false
        }
      }
      if (!isPdf && !isZip && !isDoc && !isPpt && !isRar) {
        this.$message({
          message: '上传文件只能是 pdf、zip、doc、ppt、rar格式!',
          type: 'error'
        })
        return false
      }
      if (!isLt200M) {
        this.$message({
          message: '上传文件大小不能超过 200MB!',
          type: 'error'
        })
        return false
      }
      return (isPdf || isZip || isDoc || isPpt || isRar) && isLt200M
    },
    // 改变文件的钩子
    onChange(file, fileList) {
      if (this.verify) {
        this.$emit('update:uploadTips', false)
      }
    },
    // 上传成功的钩子
    handleFileSuccess(response, file, fileList) {
      // this.fileInfo.filePath.push(response.data.fileUrl)
      // this.fileInfo.addKey = response.data.ossPathKey
      this.fileInfo.keys.push(response.data.ossPathKey)
      this.$emit('handleFileInfo', this.fileInfo)
      // this.$message({
      // 	message: "恭喜你，上传成功",
      // 	type: "success"
      // });
    },
    // 移除的钩子
    handleRemove(file, fileList) {
      // 由于elemenUI上传文件之间的校验返回false就会触发删除事件
      if (this.isPDF === true) {
        if (file.name.substring(file.name.lastIndexOf('.') + 1) === 'pdf') {
          // 回显的，后台没返回size，，，刚上传的点击删除，或者验证小于8兆也会触发，
          if (!file.size || (file.size && file.size / 1024 / 1024 < 8)) {
            for (let index = 0; index < this.fileInfo.keys.length; index++) {
              const ele = this.fileInfo.keys[index]
              if (ele === this.delKey) {
                this.fileInfo.keys.splice(index, 1)
                break
              }
            }
            // 后台删除文件并且更新关联
            this.$api.common.del({ key: this.delKey }).then(res => {
              // 编辑回显中的图片也需要考虑在内
              this.$emit('handleFileInfo', this.fileInfo)
              if (this.verify && fileList.length === 0) {
                this.$emit('update:uploadTips', true)
              }
              if (this.verify && fileList.length !== 0) {
                this.$emit('update:uploadTips', false)
              }
            })
          }
        }
      } else {
        if (this.fileFormat(file)) {
          for (let index = 0; index < this.fileInfo.keys.length; index++) {
            const ele = this.fileInfo.keys[index]
            if (ele === this.delKey) {
              this.fileInfo.keys.splice(index, 1)
              break
            }
          }
          // 后台删除文件并且更新关联
          this.$api.common.del({ key: this.delKey }).then(res => {
            // 编辑回显中的图片也需要考虑在内
            this.$emit('handleFileInfo', this.fileInfo)
            if (this.verify && fileList.length === 0) {
              this.$emit('update:uploadTips', true)
            }
            if (this.verify && fileList.length !== 0) {
              this.$emit('update:uploadTips', false)
            }
          })
        }
      }
    },
    // 移除前的钩子
    beforeRemove(file, fileList) {
      console.log(file, 555)
      // 由于elemenUI上传文件之间的校验返回false就会触发删除事件
      if (this.isPDF === true) {
        if (file.name.substring(file.name.lastIndexOf('.') + 1) === 'pdf') {
          // 回显的，后台没返回size，，，刚上传的点击删除，或者验证小于8兆也会触发，
          if (!file.size || (file.size && file.size / 1024 / 1024 < 200)) {
            // 获取回显的key
            if (file.key) {
              this.delKey = file.key
            }
            // 获取上传的key
            if (file.response) {
              this.delKey = file.response.data.ossPathKey
            }
            // 删除提示
            return this.$confirm(`确定永久移除 ${file.name}？`, '提示')
          }
        }
      } else {
        if (this.fileFormat(file)) {
          // 获取回显的key
          if (file.key) {
            this.delKey = file.key
          }
          // 获取上传的key
          if (file.response) {
            this.delKey = file.response.data.ossPathKey
          }
          // 删除提示
          return this.$confirm(`确定永久移除 ${file.name}？`, '提示')
        }
      }
    },
    // 验证调删除事件时的文件规则
    fileFormat(file) {
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      // const extension = testmsg === 'xls'
      // const extension2 = testmsg === 'xlsx'
      const isPdf = testmsg === 'pdf'
      const isZip = testmsg === 'zip'
      const isDoc = testmsg === 'doc'
      const isPpt = testmsg === 'ppt'
      const isRar = testmsg === 'rar'
      let isLt8M = false
      // 回显的，后台没返回size，，，刚上传的点击删除，或者验证小于8兆也会触发，
      if (!file.size || (file.size && file.size / 1024 / 1024 < 200)) {
        isLt8M = true
      } else {
        isLt8M = false
      }
      return (isPdf || isZip || isDoc || isPpt || isRar) && isLt8M
    },
    // 和进度条有关的事件，可以添加进度，但是这个接口后台必须实时返回进度progressEvent
    progress(event, file, fileList) {
      // console.log(event.loaded / event.total)
    },
    // 文件超出个数限制时的钩子
    handleExceed(files, fileList) {
      this.$message.error(`当前限制选择 ${this.limit} 个文件`)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.uploadFile {
  .error {
    font-size: 12px;
  }
}
</style>
