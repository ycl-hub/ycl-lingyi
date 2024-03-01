<template>
  <div class="tonghuaRecord">
    <!-- 搜索区 -->
    <div class="searchArea clearfix">
      <el-form ref="ruleForm" :model="listQuery" :rules="rules" label-width="74px" class="listQuery fr" :inline="true" size="mini" @submit.native.prevent>
        <el-form-item label="轮询规则：" prop="is_video">
          <el-select v-model="listQuery.RULE_STATE" :popper-append-to-body="false" placeholder="请输入" @change="is_videoChange">
            <el-option
              v-for="item in is_videoOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="NAME" class="plottingName">
          <el-input v-model.trim="listQuery.NAME" class="filter" type="text" placeholder="关键字搜索">
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
        <el-table-column label="轮询组名称" min-width="180" align="center">
          <template slot-scope="{row}">
            {{ row.NAME || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="轮询规则" min-width="180" align="center">
          <template slot-scope="{row}">
            {{ row.RULE || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="轮询间隔" min-width="140" align="center">
          <template slot-scope="{row}">
            {{ row.INTERVALS|| '-' }}
          </template>
        </el-table-column>
        <el-table-column label="轮询成员" min-width="140" align="center">
          <template slot-scope="{row}">
            {{ row.MEMBER|| '-' }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.START_TIME|| '-' }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.END_TIME|| '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实际执行时长" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.EXECUTION_DURATION || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实际执行轮次" min-width="200" align="center">
          <template slot-scope="{row}">
            {{ row.EXECUTION_ROUND+'轮'|| '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" class-name="operateCol" min-width="140" align="center">
          <template slot-scope="{row}">
            <div class="btnWrap">
              <button class="btn" @click="detail(row)">查看</button>
              <button class="btn" @click="downloadExcel(row)">下载</button>
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
      :title="detailData.NAME+' '+detailData.START_TIME+' 轮询记录'"
      :visible.sync="isShow"
      width="980px"
      :close-on-click-modal="false"
      custom-class="meetWrap bevel"
      append-to-body
      style="text-align: center;"
      @close="isShow=false"
    >
      <div class="el-tab-pane-con spacingTable pollingTable">
        <el-table
          ref="detailTable"
          :data="detailData.VIDEO_POLLING_RECORD_DETAIL_LIST"
          tooltip-effect="dark"
          style="width: 100%;padding:8px"
          height="440px"
        >
          <el-table-column
            label="序号"
            type="index"
            width="50"
            style="text-align: center;"
          />
          <el-table-column
            prop="MEMBER_NAME"
            label="成员"
            width="auto"
          />
          <el-table-column
            prop="NUMBER"
            label="轮询次数"
            width="auto"
          /><el-table-column
            prop="MEMBER_TYPE"
            label="成员类型"
            width="auto"
          />
          <el-table-column
            prop="START_TIME"
            label="开始时间"
            width="auto"
          />
          <el-table-column
            prop="END_TIME"
            label="结束时间"
            width="auto"
          />
          <el-table-column
            prop="STATE"
            label="状态"
            width="auto"
          />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import play from '@/assets/images/record/play.png'
import down from '@/assets/images/record/down.png'
import { debounce, throttle } from 'lodash'
import { sessionStorage } from '@/utils/storage'
import * as XLSX from 'xlsx'
export default {
  name: 'TonghuaRecord',
  components: {
    Pagination
  },
  data() {
    return {
      play, down,
      rules: {
        NAME: [
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
          label: '轮询时长'
        },
        {
          value: '1',
          label: '轮询次数'
        }
      ],
      time: [],
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        POLICENO: sessionStorage.get('TONE_voip').cmd.POLICE_ID,
        token: sessionStorage.get('TONE_voip').cmd.TOKEN,
        NAME: '',
        RULE_STATE: '',
        PAGE_INDEX: 1,
        ROWS: 20,
        START_TIME: '',
        END_TIME: ''
      },
      isShow: false,
      detailData: [],
      myAudio: null
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
    // 查看 轮询记录详情
    detail(data) {
      this.isShow = true
      this.detailData = data
    },
    // 下载轮询记录 导出成 excel表格
    downloadExcel(data) {
      if (!data || !data.VIDEO_POLLING_RECORD_DETAIL_LIST) return
      const excelData = data.VIDEO_POLLING_RECORD_DETAIL_LIST.map((item, index) => {
        return {
          index: index + 1,
          MEMBER_NAME: item.MEMBER_NAME,
          NUMBER: item.NUMBER,
          MEMBER_TYPE: item.MEMBER_TYPE,
          START_TIME: item.START_TIME,
          END_TIME: item.END_TIME,
          STATE: item.STATE
        }
      })
      const WorkSheet = XLSX.utils.json_to_sheet(excelData)
      // console.log(excelData)
      const new_workbook = XLSX.utils.book_new()
      WorkSheet['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 10 }] // 一次往后是每一列的宽度
      XLSX.utils.book_append_sheet(new_workbook, WorkSheet, `${data.NAME}轮询记录.xlsx`)
      XLSX.utils.sheet_add_aoa(WorkSheet, [['序号', '成员', '轮询次数', '成员类型', '开始时间', '结束时间', '轮询状态']], { origin: 'A1' })
      XLSX.writeFile(new_workbook, `${data.NAME}轮询记录.xlsx`)
    },
    // 关键词搜索
    searchBtn: debounce(function() {
      this.getList()
    }, 500),
    // 呼叫类型
    is_videoChange(val) {
      this.listQuery.RULE_STATE = val
    },
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
    searchForm: throttle(function() {
      this.listQuery.PAGE_INDEX = 1
      this.getList()
    }, 500, { 'trailing': false }),
    // 查询重置按钮
    searchFormReset: throttle(function(formName) {
      this.listQuery.PAGE_INDEX = 1
      this.$refs[formName].resetFields()
      this.listQuery.START_TIME = ''
      this.listQuery.END_TIME = ''
      this.time = []
      this.getList()
    }, 500, { 'trailing': false }),
    // 列表
    getList() {
      this.listLoading = true
      this.$api.lunxun.videoPollingRecordList(this.listQuery).then(res => {
        this.total = res.data.COUNT
        this.listLoading = false
        this.list = res.data.videoPollingRecordList
        // console.log(res)
      }).catch(err => {
        console.log(err)
        this.listLoading = false
      })
      // this.$api.record.getTonghuaList(this.listQuery).then(res => {
      //   // console.log(res)
      //   this.listLoading = false
      //   this.total = res.data.total
      //   if (res.data.records && Array.isArray(res.data.records)) {
      //     const arr = res.data.records
      //     // 如果未挂断则不进入历史记录  解决Bug编号620
      //     // arr.forEach((item, i) => {
      //     //   if (!('destory_timel' in item)) {
      //     //     arr.splice(i, 1)
      //     //   }
      //     // })
      //     this.list = arr
      //   }
      // }).catch(error => {
      //   console.log(error)
      //   this.listLoading = false
      // })
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
