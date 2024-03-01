<template>
  <div class="tonghuaRecord">
    <!-- 搜索区 -->
    <div class="searchArea clearfix">
      <el-form ref="ruleForm" :model="listQuery" :rules="rules" label-width="74px" class="listQuery fr" :inline="true" size="mini" @submit.native.prevent>
        <el-form-item label="呼叫类型：" prop="is_video">
          <el-select v-model="listQuery.is_video" :popper-append-to-body="false" placeholder="请输入" @change="is_videoChange">
            <el-option
              v-for="item in is_videoOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="user_name" class="plottingName">
          <!-- <el-input v-model.trim="listQuery.user_name" class="filter" type="text" placeholder="关键字搜索" @keyup.native="searchBtn">
              <i slot="prefix" class="el-input__icon el-icon-search" />
            </el-input> -->
          <el-input v-model.trim="listQuery.user_name" class="filter" type="text" placeholder="关键字搜索">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </el-form-item>
        <el-form-item class="time">
          <el-date-picker
            v-model="time"
            type="datetimerange"
            align="right"
            start-placeholder="开始时间"
            end-placeholder="挂断时间"
            :default-time="['00:00:00', '23:59:59']"
            :clearable="false"
            unlink-panels
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="searchTime"
          />
        </el-form-item>
        <el-form-item class="btnWrap">
          <button class="searchBtn" @click="searchForm('ruleForm')">查询</button>
          <button class="cancelBtn" @click="searchFormReset('ruleForm')">重置</button>
        </el-form-item>
      </el-form>
    </div>
    <!-- table -->
    <div class="table noSpacingTable">
      <el-table
        ref="multipleTable"
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        fit
        empty-text="暂无数据"
      >
        <el-table-column label="序号" type="index" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ (listQuery.pageIndex - 1) * listQuery.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发起人" min-width="180" align="center">
          <template slot-scope="{row}">
            {{ row.caller_username || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="被叫人" min-width="180" align="center">
          <template slot-scope="{row}">
            {{ row.variable_dialed_user || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="呼叫类型" min-width="140" align="center">
          <template slot-scope="{row}">
            {{ row.is_video? '视频': '音频' }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.call_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="挂断时间" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.destory_timel || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="operateCol" min-width="140" align="center">
          <template slot-scope="{row}">
            <img v-if="row.file_path" :src="play" alt="" @click="playHandle(row)">
            <img v-if="row.file_path" :src="down" alt="" @click="downHandle(row)">
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div v-show="total>0" class="pagination">
      <pagination :total="total" :page.sync="listQuery.pageIndex" :limit.sync="listQuery.pageSize" @pagination="getList" />
    </div>
    <!-- 预览视频 -->
    <el-dialog
      v-el-drag-dialog
      :visible.sync="preview"
      append-to-body
      :close-on-click-modal="true"
      custom-class="preview"
      @close="closePreview"
    >
      <div :class="'preview_content'">
        <video id="preview_video" :src="previewVideoUrl" controls="controls" />
      </div>
    </el-dialog>
    <!-- 播放音频 -->
    <el-dialog
      v-el-drag-dialog
      :visible.sync="previewAudio"
      append-to-body
      :close-on-click-modal="false"
      custom-class="preview"
      @close="closeAudioPreview"
    >
      <div :class="'preview_content'">
        <audio id="preview_audio" ref="preview_audio" :src="previewAudioUrl" controls="controls" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import play from '@/assets/images/record/play.png'
import down from '@/assets/images/record/down.png'
import { debounce, throttle } from 'lodash'
import { api } from '@/api/env'
import { sessionStorage } from '@/utils/storage'
export default {
  name: 'TonghuaRecord',
  components: {
    Pagination
  },
  data() {
    return {
      play, down,
      rules: {
        user_name: [
          { required: false, message: '请输入正确的关键字', trigger: 'blur' }
        ]
      },
      is_videoOptions: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '0',
          label: '音频'
        },
        {
          value: '1',
          label: '视频'
        }
      ],
      time: [],
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        is_video: '',
        user_name: '',
        beginTime: '',
        endTime: '',
        type: '1'
      },
      // 预览视频
      preview: false,
      previewVideoUrl: '',
      // 预览音频
      previewAudioUrl: '',
      myAudio: null,
      previewAudio: false,
      TOKEN: sessionStorage.get('TONE_voip').cmd.TOKEN,
      policeNo: sessionStorage.get('TONE_voip').cmd.POLICE_ID
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  activated() {
    this.getList()
  },
  deactivated() {
  },
  methods: {
    // 关键词搜索
    searchBtn: debounce(function() {
      this.getList()
    }, 500),
    // 呼叫类型
    is_videoChange(val) {
      this.listQuery.is_video = val
    },
    searchTime() {
      if (this.time && this.time.length > 1) {
        this.listQuery.beginTime = this.time[0]
        this.listQuery.endTime = this.time[1]
      } else {
        this.listQuery.beginTime = ''
        this.listQuery.endTime = ''
      }
    },
    // 查询按钮
    searchForm: throttle(function() {
      this.listQuery.pageIndex = 1
      this.getList()
    }, 500, { 'trailing': false }),
    // 查询重置按钮
    searchFormReset: throttle(function(formName) {
      this.listQuery.pageIndex = 1
      this.$refs[formName].resetFields()
      this.listQuery.beginTime = ''
      this.listQuery.endTime = ''
      this.time = []
      this.getList()
    }, 500, { 'trailing': false }),
    // 列表
    getList() {
      this.listLoading = true
      this.$api.record.pageQueryRoom(this.listQuery).then(res => {
        // console.log(res)
        this.listLoading = false
        this.total = res.data.total
        if (res.data.records && Array.isArray(res.data.records)) {
          const arr = res.data.records
          // 如果未挂断则不进入历史记录  解决Bug编号620
          // arr.forEach((item, i) => {
          //   if (!('destory_timel' in item)) {
          //     arr.splice(i, 1)
          //   }
          // })
          this.list = arr
        }
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    },
    // 播放按钮
    async playHandle(row) {
      const managerIndex = row.file_path.search('/manager')
      const managerPath = row.file_path.slice(managerIndex)
      if (row.is_video) {
        // 播放视频
        const isWebm = row.file_path.indexOf('webm')
        if (isWebm !== -1) {
          this.videoPreview(managerPath)
        } else {
          this.listLoading = true
          const toVideoPreview = (res) => {
            const managerIndex = res.data.url.search('/manager')
            const managerPath = res.data.url.slice(managerIndex)
            row.file_path = res.data.url// 转换过后 保存结果 防止重复转换
            this.videoPreview(managerPath)
            this.listLoading = false
          }
          const res = await this.mp4ToWebM(row, 0)
          console.log(res)
          if (res && res.data && res.data.result) {
            toVideoPreview(res)
          } else {
            this.$confirm(res.data.msg, '提示', {
              confirmButtonText: '继续转换',
              cancelButtonText: '返回下载',
              type: 'warning'
            }).then(async() => {
              const res = await this.mp4ToWebM(row, 1)
              if (res && res.data && res.data.result) {
                toVideoPreview(res)
              }
            }).finally(_ => {
              this.listLoading = false
            })
          }
        }
      } else {
        // 播放音频
        this.audioPreview(managerPath)
      }
    },
    mp4ToWebM(row, decode = 0) { // 0 大于20m不转换  1 仍然转换但时间可能过长
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('autoPlayer', decode)
      return this.$api.record.mp4ToWebM(formData)
    },
    // 播放视频
    videoPreview(url) {
      this.preview = true
      this.previewVideoUrl = api + url + '?TOKEN=' + this.TOKEN + '&policeNo=' + this.policeNo
      this.$nextTick(() => {
        const myVideo = document.getElementById('preview_video')
        myVideo.play()
      })
    },
    // 关闭正在播放的视频
    closePreview() {
      this.$nextTick(() => {
        const myVideo = document.getElementById('preview_video')
        myVideo.pause()
      })
    },
    // 关闭正在播放的音频
    closeAudioPreview() {
      this.previewAudio = false
    },
    // 音频播放
    endedFunc() {
      console.log('ended')
      this.previewAudioUrl = ''
      this.previewAudio = false
      this.myAudio = null
    },
    audioPreview(url) {
      this.previewAudio = true
      if (!this.previewAudioUrl) { // 不在在音频
        this.previewAudioUrl = api + url + '?TOKEN=' + this.TOKEN + '&policeNo=' + this.policeNo
        this.$nextTick(() => {
          this.myAudio = this.$refs.preview_audio
          this.myAudio.play()
          this.myAudio.addEventListener('ended', this.endedFunc)
        })
      } else if (this.previewAudioUrl && this.previewAudioUrl === api + url + '?TOKEN=' + this.TOKEN + '&policeNo=' + this.policeNo) { // 存在但是还是自己(点击了正在播放或者暂停的语音)
        if (this.myAudio.paused) { // 暂停状态
          this.myAudio.play()
        } else { // 播放状态
          this.myAudio.pause()
          // 如果想要暂停完成后再次重新播放，添加一下代码，如果暂停完成后想接着播放，将下面一行代码删除即可，这样即不会出现暂停状态的情况
          this.previewAudioUrl = ''
        }
      } else if (this.previewAudioUrl && this.previewAudioUrl !== api + url + '?TOKEN=' + this.TOKEN + '&policeNo=' + this.policeNo) { // 存在但是是别的语音(点击了正在播放以外的语音)
        // 先暂停上一条语音并且移除监听事件ended，并手动清空此对象
        this.myAudio.pause()
        this.myAudio.removeEventListener('ended', this.endedFunc)
        this.myAudio = null
        // 播放点击的语音
        this.previewAudioUrl = api + url + '?TOKEN=' + this.TOKEN + '&policeNo=' + this.policeNo
        this.$nextTick(() => {
          this.myAudio = this.$refs.preview_audio
          this.myAudio.play()
          this.myAudio.addEventListener('ended', this.endedFunc)
        })
      }
    },
    // 下载按钮
    downHandle(row) {
      const managerIndex = row.file_path.search('/manager')
      const managerPath = row.file_path.slice(managerIndex)
      this.download('', `${api}${managerPath}?TOKEN=${this.TOKEN}&policeNo=${this.policeNo}`)
    },
    // 下载音视频函数
    download(filename, link) {
      const DownloadLink = document.createElement('a')
      DownloadLink.style = 'display: none' // 创建一个隐藏的a标签
      DownloadLink.download = filename
      DownloadLink.href = link
      document.body.appendChild(DownloadLink)
      DownloadLink.click() // 触发a标签的click事件
      document.body.removeChild(DownloadLink)
    }
  }
}
</script>
<style lang="scss" scoped>
.tonghuaRecord {
  #preview_audio {
    display: none;
  }
  height: 100%;
  .searchArea {
    margin-bottom: 15px;
    ::v-deep .listQuery  {
      // padding-left: 100px;
      // width: calc(100% - 162px);
      .el-form-item {
        margin-bottom: 0;
        .el-form-item__label {
          color:#00d8ff;
          font-size: 12px;
          font-weight: 500 !important;
          padding-right: 5px;
        }
        .el-form-item__content {
          width: 170px;
        }
        &.time {
          width: 330px;
        }
      }
      .filter {
        width: 100%;
        // height: 30px;
        .el-input__inner {
          // height: 30px;
          border: 1px solid #01cfff;
          background-color: rgba(0, 85, 128, 0.6);
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
        .el-input__prefix {
          .el-input__icon {
            line-height: 30px;
            color:#0fabd4;
          }
        }
      }
      .el-select {
        width: 100%;
        .el-input__inner {
          width: 100%;
          // height: 30px;
          // line-height: 30px;
          background-color: rgba(0, 85, 128, 0.6);
          border: 1px solid #01cfff;
          color: rgba(250, 253, 255, 1);
          font-size: 12px;
          padding: 0 7px;
          &::-webkit-input-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
          &:-moz-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
          &::-moz-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
          &:-ms-input-placeholder {
            // color:#0fabd4;
            font-size: 12px;
          }
        }
        .el-select-dropdown {
          left: 0px !important;
        }
      }
      .el-date-editor {
        width: 330px;
        background-color: rgba(0, 85, 128, 0.6);
        border: 1px solid #01cfff;
        .el-input__icon {
          color:#0fabd4;
        }
        .el-range-separator {
          color:#0fabd4;
        }
        .el-range-input {
          width: 100%;
          background-color: transparent;
          color: rgba(250, 253, 255, 1);
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
      }
      .btnWrap {
        padding: 0px 10px;
        width: 170px;
        height: 28px;
        margin-top: -1px;
        .searchBtn, .cancelBtn {
          width: calc((100% - 5px)/2);
          height: 28px;
          font-size: 12px;
          background: linear-gradient(0deg, #2A7AA2, #055984);
          border: 1px solid #01CFFF;
          border-radius: 4px;
          color: #00d8ff;
          cursor: pointer;
          span {
            &:first-child {
              margin-right: 2px;
              font-size: 16px;
            }
            &:last-child {
              display: inline-block;
              transform: translateY(-1px);
            }
          }
        }
        .cancelBtn {
          margin-left: 5px;
        }
      }
    }
  }
  .table {
    // height: calc(100% - 300px);
    height: calc(100% - 97px);
  }
}
</style>
