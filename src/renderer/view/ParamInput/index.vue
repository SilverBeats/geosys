<template>
  <!-- 区块选优模块 -->
  <div id="block-selection">
    <div class="header-area">
      <page-header :content="'参数输入-' + title"/>
    </div>
    <!-- 添加按钮 -->
    <add-btn @click="addBlock"/>
    <!-- 输入大量的区块信息-table列表 -->
    <div class="table-area">
      <param-input-table
          :tableData="blockList"
          :typeList="typeList"
          @handlerSelect="handlerMultSelect"
          @selectChange="handlerSelectChange"
          @inputParam="showParamInputDialog"
          @showParam="showDialog"
      />
    </div>
    <div style="margin-top: 10px">
      <mult-delete @confirm="deleteSelected"/>
      <el-button
          v-show="multipleSelection.length != 0"
          type="primary"
          size="small"
          icon="el-icon-right"
          @click="createEchart"
      >生成图表
      </el-button
      >
    </div>
    <!--将历史记录进行添加的dialog-->
    <add-history-transfer
        title="选择历史记录进行添加"
        :filterMethod="filterMethod"
        :visible="transferVisible"
        :transferData="transferData"
        @cancel="handleTransferCancel"
        @confirm="handleTransferConfirm"
        @loadMore="handleTransferMore"
    />
    <!-- 参数输入的dialog -->
    <param-dialog
        v-if="dialogVisible"
        dialogTitle="参数输入"
        :visible="dialogVisible"
        :selectData="selectData[which][dialogType]"
        :tableData="paramData[which]"
        :sliderValue="dialogData.sliderValue"
        :paramValue="dialogData.paramValue"
        @confirm="handlerCalc"
        @cancel="handlerClose"
    />
    <!-- 历史数据展示的dialog -->
    <history-param-dialog
        v-if="dialogVisibleHis"
        dialogTitle="参数显示"
        :visible="dialogVisibleHis"
        :tableData="paramData[which]"
        :selectData="selectData[which][dialogType]"
        :paramValue="dialogData.paramValue"
        :sliderValue="dialogData.sliderValue"
        @close="handlerClose"
    />
    <!-- 显示参数选择的dialog -->
    <param-select-dialog
        v-if="paramSelectDialog"
        :visible="paramSelectDialog"
        :paramList="paramList[which]"
        @cancel="paramSelectCancel"
        @confirm="paramSelectConfirm"
    />
    <!-- 显示图表的drawer -->
    <el-drawer
        title="参数图表"
        direction="rtl"
        size="80%"
        :close-on-press-escape="false"
        :append-to-body="true"
        :destroy-on-close="true"
        :wrapperClosable="false"
        :visible.sync="drawer"
        :before-close="handleClose"
    >
      <div class="drawer__content">
        <!-- 图表区域 -->
        <my-echart
            v-for="(option, index) in echartOption"
            :key="option.id"
            :selectOptions="option.selectOptions"
            :index="index"
            :legendData="option.legendData"
            :series="option.series"
            :xAxisData="option.xAxisData"
            :eChartTitle="option.title"
            :selectId="selectIdSet"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import ParamInputTable from '@/components/ParamInputTable/index.vue'
import ParamDialog from '@/components/ParamDialog/index.vue'
import HistoryParamDialog from '@/components/HistoryParamDialog/index.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import MultDelete from '@/components/MultDelete/index.vue'
import AddBtn from '@/components/AddBtn/index.vue'
import MyEchart from '@/components/Echarts/index.vue'
import AddHistoryTransfer from '@/components/AddHistoryTransfer/index.vue'
import ParamSelectDialog from '../../components/ParamSelectDialog/index.vue'

import {mapState, mapMutations} from 'vuex'

import history_bs from '@/service/BlockSelection/historyService'
import history_da from '@/service/DessertArea/historyService'
import history_ds from '@/service/DessertSelection/historyService'

import {errorMsg} from '@/utils/tipUtil'
import {guid, toFixed} from '@/utils/toolUtil'

export default {
  name: 'BlockSelection',
  data() {
    return {
      // 区块优选、甜点区、甜点段公用同一个页面,通过ParamView跳转路由携带的param参数来进行区分
      which: '',
      title: '',
      // transfer相关
      hisData: [],
      currentPage: 1,
      pageSize: 20,
      transferData: [],
      transferVisible: false,
      filterMethod(query, item) {
        return item.field.indexOf(query) > -1
      },

      // 参数输入相关
      optionChanged: false,
      // 煤的类型
      typeList: [
        {label: '烟煤', value: 'bc'},
        {label: '无烟煤', value: 'ac'},
      ],
      blockList: [],
      multipleSelection: [],
      // 用来记录当前打开的dialog显示的数据在blockList中的下标
      curIndex: -1,
      // dialog显示需要用到的数据
      // 是否显示dialog
      dialogVisible: false,
      dialogVisibleHis: false,
      dialogData: {},
      dialogType: '',
      history: {
        bsp: history_bs,
        dap: history_da,
        dsp: history_ds,
      },

      // echart相关
      paramSelectDialog: false,
      drawer: false,
      checkBoxData: [],
      echartOption: [],
      selectIdSet: null,
      timeKey: +new Date(),
    }
  },
  components: {
    ParamDialog,
    HistoryParamDialog,
    PageHeader,
    MultDelete,
    ParamInputTable,
    AddBtn,
    MyEchart,
    AddHistoryTransfer,
    ParamSelectDialog,
  },
  created() {
    this.init()
  },
  computed: {
    ...mapState(['paramData', 'selectData', 'paramList']),
  },
  methods: {
    ...mapMutations(['setParamList']),
    async init() {
      // 从导航页跳转过来,获取title和哪个板块
      const {which, title} = this.$route.params
      this.which = which
      this.title = title
      const total = await this.history[this.which].getTotalNum(1)
      if (total == 0) return
      this.$confirm('是否需要从历史记录中选择数据进行添加？', '提示', {
        confirmButtonText: '需要',
        cancelButtonText: '不需要',
        type: 'warning',
      })
          .then(() => {
            return this.initHistory()
          })
          .then((_) => {
            this.handleTransfer()
          })
          .catch(() => {
          })
    },
    /**
     * 获取历史记录,为transfer做准备
     */
    async initHistory() {
      try {
        this.hisData = await this.history[this.which].getRecords(
            1,
            this.currentPage,
            this.pageSize
        )
      } catch (err) {
        errorMsg(`查询历史记录失败：${err}`)
      }
    },
    /**
     * 将历史记录进行处理,并显示transfer的dialog
     */
    handleTransfer() {
      this.hisData.forEach((item) => {
        this.transferData.push({
          label: item['des'],
          key: item['id'],
          field: `${item['des']}${item['create_time']}`,
        })
      })
      this.transferVisible = true
    },
    handleTransferCancel() {
      this.transferVisible = false
      this.hisData.length = 0
      this.transferData.length = 0
    },
    /**
     * 将选中的数据添加到blockList
     */
    handleTransferConfirm(keys) {
      const set = new Set()
      keys.forEach((key) => set.add(key))
      this.hisData.forEach((item) => {
        if (set.has(item['id'])) {
          item['param_list'] = JSON.parse(item['param_list'])
          // 标记它是从历史记录中来的
          item['his'] = true
          this.blockList.push(item)
        }
      })
      this.handleTransferCancel()
    },
    async handleTransferMore() {
      this.currentPage++
      const data = await this.history[this.which].getRecords(
          1,
          this.currentPage,
          this.pageSize
      )
      data.forEach((item) => {
        this.transferData.push({
          label: item['des'],
          key: item['id'],
          field: `${item['des']}${item['create_time']}`,
        })
      })
      this.hisData.push(...data)
    },
    /**
     * 点击添加区块
     */
    addBlock() {
      this.blockList.push({
        id: guid(),
        type: 'bc',
        des: '',
        param_list: {
          paramValue: {},
          sliderValue: {},
        },
        result: '',
      })
    },
    /**
     * 添加添加参数时,显示dialog的相关设置
     */
    initShowDialog(index, row) {
      this.dialogData = row['param_list']
      this.dialogType = row.type
      this.curIndex = index
    },
    async showParamInputDialog({index, row}) {
      // 如果是烟煤和无烟煤之间存在切换变动
      // 将之前计算的结果、选中的选项统统清除
      if (this.optionChanged) {
        row['param_list'] = {
          paramValue: {},
          sliderValue: {},
        }
        row['result'] = ''
        row['id'] = guid()
        this.optionChanged = false
        await this.history[this.which].deleteLogicByIds([row.id])
      }
      this.initShowDialog(index, row)
      this.dialogVisible = true
    },
    /**
     * 添加显示参数时,显示dialog的相关设置
     */
    showDialog({index, row}) {
      this.initShowDialog(index, row)
      this.dialogVisibleHis = true
    },
    /**
     * 选择参数点击取消时
     */
    handlerClose() {
      this.dialogType = ''
      this.dialogVisible = false
      this.dialogVisibleHis = false
      this.dialogData = {}
    },
    /**
     * 点击dialog的确定后执行计算功能
     */
    async handlerCalc(val) {
      const _this = this
      const obj = this.blockList[this.curIndex]
      // 如果命名为空,提醒输入
      if (obj['des'] === '') {
        await this.$prompt('请给该组数据命名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: (val) => {
            if (!val) return '禁止为空'
            else if (val.length > 10) return '命名不要超过10个字符'
            else return true
          },
        }).then(({value}) => {
          obj['des'] = value
        })
      }
      obj['result'] = toFixed(val, 4)
      this.history[this.which]
          .insert(obj)
          .catch((err) => {
            errorMsg(`历史记录插入失败，err:${err}`)
          })
          .finally((_) => {
            _this.curIndex = -1
            _this.handlerClose()
          })
    },
    /**
     * 多行删除,只是从列表中删除,仍然可以从历史记录中看到
     */
    deleteSelected() {
      const set = new Set()
      this.multipleSelection.map((row) => set.add(row.id))
      this.blockList = this.blockList.filter((item) => !set.has(item.id))
    },
    /**
     * 多选事件,用于批量删除
     */
    handlerMultSelect(val) {
      this.multipleSelection = val
    },
    /**
     * 当进行烟煤和无烟煤切换时触发
     */
    handlerSelectChange() {
      this.optionChanged = true
    },
    //---------------------------echart相关--------------------
    paramSelectCancel() {
      // 关闭参数选择的dialog
      this.paramSelectDialog = false
    },
    /**
     * @param checkList 选中的参数
     * @param type 折线图还是柱状图
     */
    paramSelectConfirm({checkList, type}) {
      // 保存二级参数id
      const selectIdSet = new Set()
      // checkList是[[选中的二级参数id],[],[],[]]
      checkList.forEach((row) => row.forEach((id) => selectIdSet.add(id)))

      if (selectIdSet.size == 0) {
        this.$alert('请选择至少选中一个参数', '警告', {
          confirmButtonText: '知道了',
          type: 'warning',
          showClose: false,
          callback: (action) => {
          },
        })
        return
      }
      // 关闭参数选择dialog
      this.paramSelectCancel()
      this.timeKey = +new Date()
      // key: 参数id, value: [选中行该参数的数据1,2]
      const seriesMap = new Map()
      // key: 参数id, value: 中文名
      const transMap = new Map()
      // key: 参数id, value: {type: '', select_options: []}
      const helpMap = new Map()
      this.paramList[this.which].forEach((p) => {
        p.children.forEach((c) => {
          if (selectIdSet.has(c.cid)) transMap.set(c.cid, c.cname)
        })
      })

      // 保存x轴的数据
      const xAxisData = []
      // 遍历选中行,得到选中参数的数据
      this.multipleSelection.forEach((targetLine) => {
        // 以选中行的des作为x轴
        xAxisData.push(targetLine.des)
        // 这一行的参数数据、slider数据
        const paramValue = targetLine['param_list']['paramValue']
        const sliderValue = targetLine['param_list']['sliderValue']
        const t = targetLine['type']

        this.paramData[this.which].forEach((p) => {
          // p 是父参数，一级参数；c是子参数，二级参数
          p.children.forEach((c) => {
            // 不是要呈现的参数,进行跳过
            if (!selectIdSet.has(c.id)) return
            const cid = c.id
            const val = paramValue[cid]
            if (!seriesMap.has(cid)) {
              seriesMap.set(cid, [])
            }
            // 当前参数值是中间值（带x）则使用sliderValue
            if (val && val.includes('x')) {
              seriesMap.get(cid).push(sliderValue[cid])
            } else { // 不是中间值
              const arr = this.selectData[this.which][t][cid]
              let mode1 = true
              for (let {standard, value} of arr) {
                if (standard.includes('-') && value.includes('x')) {
                  mode1 = false
                  break
                }
              }
              for (let {standard, value} of arr) {
                // mode1
                if (standard.includes('-') && !value.includes('x')
                    || /^[\u4E00-\u9FA5A-Za-z_]+$/.test(standard) && eval(`${val} == ${value}`)) {
                  seriesMap.get(cid).push(val)
                  break
                } else if (/^(>|>=|<|<=|≥|≤)/.test(standard) && eval(`${val} == ${value}`)) {
                  // mode2 当前selectOption是边界 比如>=200之类
                  let input = mode1 ? val : eval(standard.replace(/^(>|>=|<|<=|≥|≤)/gi, ''))
                  seriesMap.get(cid).push(input)
                  break
                }
              }
            }
            const selectOptions = []
            this.selectData[this.which][t][cid].forEach((option) => {
              selectOptions.push({
                standard: option.standard,
                value: option.value,
              })
            })
            helpMap.set(c.id, selectOptions)
          })
        })
      })

      selectIdSet.forEach((cid) => {
        this.echartOption.push({
          id: `echart${this.timeKey}${cid}`,
          selectOptions: helpMap.get(cid),
          title: transMap.get(cid),
          xAxisData,
          series: [
            {
              name: transMap.get(cid),
              type,
              data: seriesMap.get(cid),
            },
          ],
        })
      })
      this.selectIdSet = selectIdSet
      this.drawer = true
    },
    /**
     * 初始化并创建echart
     */
    createEchart() {
      // 初始化参数，供用户选择
      if (Object.keys(this.paramList[this.which]).length === 0) {
        this.getAllParam()
      }
      // 显示参数选择的dialog
      this.paramSelectDialog = true
    },

    /**
     * 获取所有的参数,设置vuex的paramList
     */
    getAllParam() {
      // 存储的是{pname, pid, children:[{cname, pid}] }
      const paramList = []
      this.paramData[this.which].forEach((p) => {
        const pid = p.id
        const pname = p.param_zh
        // 存储该父参数的子参数
        const children = []
        p.children.forEach((c) => {
          const cname = c.param_zh
          const cid = c.id
          children.push({cname, cid})
        })
        paramList.push({
          pid,
          pname,
          children,
        })
      })
      this.setParamList({
        which: this.which,
        paramList,
      })
    },
    /**
     * 关闭drawer之前
     */
    handleClose() {
      this.drawer = false
      this.echartOption = []
      this.selectIdSet = null
    },
  },
}
</script>
<style scoped>
.drawer__content {
  width: 100%;
  height: 100%;
}

.drawer__content > div {
  margin-bottom: 20px;
}
</style>