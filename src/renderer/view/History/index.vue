<template>
  <!-- 历史记录页面 -->
  <section id="his-box">
    <div class="header-area">
      <page-header :content="'历史记录-' + title" />
    </div>
    <!-- 显示历史记录的表格 -->
    <div class="table-area">
      <history-table
        :tableData="tableData"
        @viewParam="showDialog"
        @selectChange="handleSelectionChange"
      />
    </div>
    <!-- 分页区域 -->
    <div class="pagin-area">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- button 按钮区域 -->
    <div class="btn-area">
      <mult-delete @confirm="deleteSelected" />
    </div>
    <!-- 数据展示的表格区域 -->
    <history-param-dialog
      v-if="dialogVisible"
      dialogTitle="参数显示"
      :visible="dialogVisible"
      :tableData="paramData[which]"
      :selectData="selectData[which][dialogType]"
      :paramValue="dialogData.paramValue"
      :sliderValue="dialogData.sliderValue"
      @close="handlerClose"
    />
  </section>
</template>

<script>
import PageHeader from '@/components/PageHeader/index.vue'
import MultDelete from '@/components/MultDelete/index.vue'
import HistoryTable from '@/components/HistoryTable/index.vue'
import HistoryParamDialog from '@/components/HistoryParamDialog/index.vue'

import { mapState } from 'vuex'

import history_bs from '@/service/BlockSelection/historyService'
import history_da from '@/service/DessertArea/historyService'
import history_ds from '@/service/DessertSelection/historyService'

import {
  successMsg,
  errorMsg,
  openLoading,
  closeLoading,
} from '@/utils/tipUtil'
export default {
  name: 'HistoryPage',
  data() {
    return {
      which: '',
      title: '',
      // 显示的历史记录的表格数据
      tableData: [],
      // 复选框选中项
      multipleSelection: [],
      // 总共的记录数量
      total: 0,
      // 当前页
      currentPage: 1,
      // 每页显示数据量
      pageSize: 10,
      // 查看参数dialog是否显示
      dialogVisible: false,
      // {paramValue:{}, sliderValue: {}}
      dialogData: {},
      dialogType: '',
      history: {
        bsp: history_bs,
        dap: history_da,
        dsp: history_ds,
      },
    }
  },
  components: {
    PageHeader,
    HistoryTable,
    MultDelete,
    HistoryParamDialog,
  },
  computed: {
    ...mapState(['paramData', 'selectData']),
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const { which, title } = this.$route.params
      this.which = which
      this.title = title

      this.initTotalNum()
      this.getPage()
    },
    /**
     * 初始化数据总量
     */
    initTotalNum() {
      this.history[this.which]
        .getTotalNum(1)
        .then((data) => {
          this.total = data
        })
        .catch((err) => {
          errorMsg(`查询历史总量失败：${err}`)
        })
    },
    /**
     * 获取数据
     */
    getPage() {
      openLoading()
      this.history[this.which]
        .getRecords(1, this.currentPage, this.pageSize)
        .then((data) => {
          this.tableData.length = 0
          this.tableData = data.map((row) => {
            row['param_list'] = JSON.parse(row['param_list'])
            return row
          })
          successMsg('查询成功')
        })
        .catch((err) => errorMsg(`查询历史记录失败：${err}`))
        .finally((_) => closeLoading())
    },
    /**
     * 复选框选项发生变化时触发
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 添加查看参数时,显示dialog的相关设置
     */
    showDialog({ index, row }) {
      this.dialogData = row['param_list']
      this.dialogType = row['type']
      this.dialogVisible = true
    },
    handlerClose() {
      this.dialogType = ''
      this.dialogData = {}
      this.dialogVisible = false
    },
    /**
     * 逻辑删除选中行
     */
    deleteSelected() {
      const arr = this.multipleSelection
      if (arr.length <= 0) return
      this.history[this.which]
        .deleteLogicByIds(arr.map((item) => item.id))
        .then((_) => {
          successMsg('删除成功')
          this.getPage()
          this.initTotalNum()
        })
        .catch((err) => {
          errorMsg(`存在数据删除失败：${err}`)
        })
    },
    /**
     * 切换页面时出触发
     */
    handleCurrentChange() {
      this.getPage()
    },
  },
}
</script>