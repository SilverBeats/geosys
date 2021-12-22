<template>
  <!-- 回收站页面 -->
  <section id="garbage-box">
    <div class="header-area">
      <page-header :content="'回收站-' + title" />
    </div>
    <!-- 显示历史记录的表格 -->
    <section class="table-area">
      <history-table
        :tableData="tableData"
        :createOrDelete="0"
        @viewParam="showDialog"
        @selectChange="handleSelectionChange"
      />
    </section>
    <!-- 分页区域 -->
    <section class="pagin-area">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </section>
    <!-- button 按钮区域 -->
    <section class="btn-area">
      <mult-delete @confirm="deleteSelected" />
      <el-button type="primary" size="small" @click="recoverSelected"
        >恢复选中</el-button
      >
    </section>
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
import HistoryTable from '@/components/HistoryTable/index.vue'
import MultDelete from '@/components/MultDelete/index.vue'
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
  name: 'DHistoryPage',
  data() {
    return {
      which: '',
      title: '',
      // 显示已经删除的历史记录表格数据
      tableData: [],
      // 复选框选中项
      multipleSelection: [],
      // 总共的记录数量
      total: 0,
      // 当前页
      currentPage: 1,
      // 每页显示数据量
      pageSize: 10,
      // 控制btn-area的popover
      visible: false,
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
  computed: {
    ...mapState(['paramData', 'selectData']),
  },
  components: {
    PageHeader,
    HistoryTable,
    MultDelete,
    HistoryParamDialog,
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
        .getTotalNum(0)
        .then((data) => {
          this.total = data
        })
        .catch((err) => {
          errorMsg(`查询数据总量失败：${err}`)
        })
    },
    /**
     * 获取数据
     */
    getPage() {
      openLoading()
      this.history[this.which]
        .getRecords(0, this.currentPage, this.pageSize)
        .then((data) => {
          this.tableData.length = 0
          this.tableData = data.map((row) => {
            row['param_list'] = JSON.parse(row['param_list'])
            return row
          })
          successMsg('查询成功')
        })
        .catch((err) => {
          errorMsg(`查询数据失败：${err}`)
        })
        .finally((_) => {
          closeLoading()
        })
    },
    /**
     * 复选框选项发生变化时触发
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 物理删除选中行
     */
    deleteSelected() {
      const arr = this.multipleSelection
      if (arr.length <= 0) return
      this.history[this.which]
        .deleteByIds(arr.map((item) => item.id))
        .then((_) => {
          this.getPage()
          this.initTotalNum()
          successMsg('删除成功')
        })
        .catch((err) => {
          errorMsg(`存在数据删除失败：${err}`)
        }).finally(_=>{
          this.visible = false
        })
    },
    /**
     * 切换页面时出触发
     */
    handleCurrentChange() {
      this.getPage()
    },
    /**
     * 数据恢复
     */
    recoverSelected() {
      const arr = this.multipleSelection
      if (arr.length == 0) return
      this.history[this.which]
        .recover(arr.map((item) => item.id))
        .then((_) => {
          this.currentPage = 1
          this.initTotalNum()
          this.getPage()
          successMsg('记录恢复成功')
        })
        .catch((err) => {
          errorMsg(`存在数据恢复失败，请重试：${err}`)
        })
    },
    /**
     * 添加查看参数时,显示dialog的相关设置
     */
    showDialog({ row }) {
      this.dialogData = row['param_list']
      this.dialogType = row['type']
      this.dialogVisible = true
    },
    /**
     * 显示参数的dialog关闭时触发
     */
    handlerClose() {
      this.dialogType = ''
      this.dialogData = {}
      this.dialogVisible = false
    },
  },
}
</script>