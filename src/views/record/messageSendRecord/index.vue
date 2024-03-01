<template>
  <div class="duijiangRecord">
    <!-- 搜索区 -->
    <div class="searchArea clearfix">
      <el-form ref="ruleForm" :model="listQuery" :rules="rules" label-width="74px" class="listQuery fr" :inline="true" size="mini" @submit.native.prevent>
        <el-form-item label="发送方式：">
          <el-select v-model="listQuery.SEND_METHOD" :popper-append-to-body="false" placeholder="请输入" @change="is_videoChange">
            <el-option
              v-for="item in sendOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="KEYWORD  " class="plottingName">
          <el-input v-model.trim="listQuery.KEYWORD " class="filter" type="text" placeholder="关键字搜索">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </el-form-item>
        <el-form-item class="time">
          <el-date-picker
            v-model="time"
            type="datetimerange"
            align="right"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
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
            <span>{{ (listQuery.PAGE_INDEX - 1) * listQuery.ROWS + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发起人" min-width="180" align="center">
          <template slot-scope="{row}">
            {{ row.SENDER || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="收信人" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.RECEIVER || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="发送方式" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.SEND_METHOD?'单发':"群发" }}
          </template>
        </el-table-column>
        <el-table-column label="发送时间" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.SEND_TIME || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="发送结果" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.SEND_RESULT?'成功':'失败' || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="operateCol" min-width="140" align="center">
          <template slot-scope="{row}">
            <div class="btnWrap">
              <button class="btn" @click="detail(row)">查看</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div v-show="total>0" class="pagination">
      <pagination :total="total" :page.sync="listQuery.PAGE_INDEX" :limit.sync="listQuery.ROWS" @pagination="getList" />
    </div>
    <el-dialog
      v-el-drag-dialog
      title="短信发送记录"
      :visible.sync="isShow"
      width="580px"
      :close-on-click-modal="false"
      custom-class="messageRecord bevel"
      append-to-body
      style="text-align: center;"
      @close="isShow=false"
    >
      <div v-show="detailData.RECEIVER" class="flex"><span>收信人:</span> <span> {{ detailData.RECEIVER }}</span></div>
      <div v-show="detailData.CONTENT" class="flex"><span>短信内容:</span><span>{{ detailData.CONTENT }}</span></div>
      <div slot="footer" class="dialog-footer btnWrap">
        <div class="btn" @click="isShow=false"><span>取 消</span></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import play from '@/assets/images/record/play.png'
import down from '@/assets/images/record/down.png'
import { debounce, throttle } from 'lodash'
import { formatDuring } from '@/utils/index'
import { sessionStorage } from '@/utils/storage'
export default {
  name: 'DuijiangRecord',
  components: {
    Pagination
  },
  data() {
    const number = /^[0-9]*$/
    var validateMinNumber = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!number.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else if (this.listQuery.min_seconds && value < this.listQuery.min_seconds) {
        callback(new Error('不小于最小时长'))
      } else {
        callback()
      }
    }
    var validateMaxNumber = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!number.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else if (this.listQuery.max_seconds && value > this.listQuery.max_seconds) {
        callback(new Error('不大于最大时长'))
      } else {
        callback()
      }
    }
    return {
      formatDuring,
      play, down,
      rules: {
        KEYWORD: [
          { required: false, message: '请输入正确的关键字', trigger: 'blur' }
        ],
        min_seconds: [
          { validator: validateMaxNumber, trigger: 'blur' }
        ],
        max_seconds: [
          { validator: validateMinNumber, trigger: 'blur' }
        ]
      },
      time: [],
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        SEND_METHOD: '', // 短信发送方式
        POLICENO: sessionStorage.get('TONE_voip').cmd.POLICE_ID,
        token: sessionStorage.get('TONE_voip').cmd.TOKEN,
        PAGE_INDEX: 1,
        ROWS: 20,
        KEYWORD: '',
        START_TIME: '',
        END_TIME: ''
      },
      isShow: false,
      detailData: {
        RECEIVER: '',
        CONTENT: ''
      },
      sendOptions: [
        {
          value: '',
          label: '全部'
        },
        {
          value: '0',
          label: '群发'
        },
        {
          value: '1',
          label: '单发'
        }
      ]
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
    detail(row) {
      this.detailData = {}
      this.isShow = true
      this.detailData = {
        RECEIVER: row.RECEIVER,
        CONTENT: row.CONTENT
      }
      // console.log(row)
      // 查看短信详情
    },
    is_videoChange(val) {
      this.listQuery.SEND_METHOD = val
    },
    // 关键词搜索
    searchBtn: debounce(function() {
      this.getList()
    }, 500),
    searchTime() {
      if (this.time && this.time.length > 1) {
        this.listQuery.START_TIME = this.time[0]
        this.listQuery.END_TIME = this.time[1]
      } else {
        this.listQuery.START_TIME = ''
        this.listQuery.END_TIME = ''
      }
    },
    // 查询按钮
    searchForm: throttle(function(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.listQuery.PAGE_INDEX = 1
          this.getList()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }, 500, { 'trailing': false }),
    // 查询重置按钮
    searchFormReset: throttle(function(formName) {
      this.listQuery.PAGE_INDEX = 1
      this.$refs[formName].resetFields()
      this.listQuery.START_TIME = ''
      this.listQuery.END_TIME = ''
      this.listQuery.SEND_METHOD = ''
      this.time = []
      this.getList()
    }, 500, { 'trailing': false }),
    // 列表
    getList() {
      this.listLoading = true
      this.$api.record.smsRecordList(this.listQuery).then(res => {
        this.listLoading = false
        this.total = res.data.COUNT
        this.list = res.data.smsRecordList
      }).catch(error => {
        console.log(error)
        this.listLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.duijiangRecord {
  height: 100%;
  #preview_audio {
    display: none;
  }
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
          width: 150px;
        }
        &.time {
          width: 330px;
        }
      }
      .shichang {
        .el-form-item__content {
          width: 115px;
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
      .el-input {
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
        &.append {
          .el-input__inner {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
          }
          .el-input-group__append {
            color:#0fabd4;
            font-size: 12px;
            background-color: rgba(0, 85, 128, 0.6);
            border: 1px solid #01cfff;
            border-left: none;
            padding: 0 12px;
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
          }
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
        .el-form-item__content {
          width: 170px;
        }
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
