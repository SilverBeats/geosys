<template>
  <!--三个模块；区块优选、甜点区、甜点段参数的输入,格式一致,进行提取形成此组件-->
  <!-- 显示历史记录参数输入 -->
  <section>
    <el-dialog
      :title="dialogTitle"
      top="25px"
      width="75%"
      :visible="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <!-- 数据展示的表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        highlight-current-row
        height="400"
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column header-align="center" label="参数（param）">
          <template slot-scope="scope">
            <span>{{ scope.row['param_zh'] }}</span>
            <br />
            <span
              v-if="scope.row.parent != -1"
              class="el-table__placeholder"
            ></span>
            <span style="font-size: 12px; color: #8492a6">{{
              scope.row['param_en']
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="weight"
          label="权重（weight）"
          width="150"
        />
        <el-table-column align="center" label="输入（input）">
          <!-- 只有子参数才有选项 -->
          <template slot-scope="scope" v-if="scope.row.parent != -1">
            {{ handlerInputValue(scope.row) }}
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="handlerClick">关 闭</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
export default {
  name: 'ParamInputComponent',
  props: {
    // dialog是否显示
    visible: {
      type: Boolean,
      default: false,
    },
    dialogTitle: {
      type: String,
      default: '',
    },
    // 表格显示的数据
    tableData: {
      type: Array,
      default: function () {
        return []
      },
    },
    // 每个param的待选项
    selectData: {
      type: Object,
      default: function () {
        return {}
      },
    },
    // 输入的参数的值
    // {param_id: value}
    paramValue: {
      type: Object,
      default: function () {
        return {}
      },
    },
    // slider设置的值：{param_id: value}
    sliderValue: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  methods: {
    handlerInputValue(row) {
      // 获取到这一行的参数的id
      const pid = row.id
      if (this.paramValue[pid] === undefined) return ''

      // 获取该参数当初赋予的值
      const value1 = this.paramValue[pid] + ''
      let standard = '',
        x = ''
      for (let option of this.selectData[pid]) {
        if (option['value'] == value1) {
          standard = option['standard']
        }
      }
      // 如果选中的是公式,那么从silderValue中获取选中的值
      if (value1.includes('x')) {
        x = this.sliderValue[pid]
        return `标准：${standard}；取值：${value1}；x=${x}`
      }
      return `标准：${standard}；取值：${value1}`
    },
    /**
     * 点击关闭是触发
     */
    handlerClick() {
      this.$emit('close')
    },
  },
}
</script>
