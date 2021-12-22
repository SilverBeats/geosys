<template>
  <!--三个模块；区块优选、甜点区、甜点段参数的输入,格式一致,进行提取形成此组件-->
  <!-- 显示历史记录参数输入、添加记录都需要显示dialog + table -->
  <section>
    <el-dialog
      :title="dialogTitle"
      top="15px"
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
        max-height="400"
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
          label="权重(weight)"
          width="120"
        />
        <el-table-column align="center" label="输入">
          <!-- 只有子参数才有选项 -->
          <template slot-scope="scope" v-if="scope.row.parent != -1">
            <el-select
              v-model="paramValue[scope.row['id']]"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in selectData[scope.row.id]"
                :key="item.id"
                :label="item.standard"
                :value="item.value"
              >
                <span style="float: left">
                  {{ item.standard }}
                </span>

                <el-slider
                  v-if="handlerSlider(item)"
                  class="slider"
                  v-model="sliderValue[scope.row['id']]"
                  :format-tooltip="
                    (value) => `当前x=${value}，公式：${item.value}`
                  "
                  :min="configSlider[scope.row['id']]['min']"
                  :max="configSlider[scope.row['id']]['max']"
                  :step="configSlider[scope.row['id']]['step']"
                />

                <span
                  style="float: right; color: #8492a6; font-size: 13px"
                  v-else
                >
                  {{ item.value }}
                </span>
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer">
        <el-button @click="handlerCancel">取 消</el-button>
        <el-button type="primary" @click="handlerConfirm">确 定</el-button>
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
  data() {
    return {
      // Slider的配置：{param_id: {min,max,step}}
      configSlider: {},
    }
  },
  methods: {
    /**
     * 处理slider
     * true: 显示slider
     * false：不显示slider
     */
    handlerSlider(option) {
      let show = false
      // 从option中的value中进行判断是否需要slider
      if (option.standard.includes('-') && option.value.includes('x')) {
        show = true
        const minMax = option.standard.split('-')
        const min = parseFloat(minMax[0])
        const max = parseFloat(minMax[1])
        let step = 1
        // 如果是小数,或者范围不超过10,step用0.1
        if (parseInt(minMax[0]) != min || max - min < 10) {
          step = 0.1
        }
        this.configSlider[option['param_id']] = {
          min,
          max,
          step,
        }
      }
      return show
    },
    /**
     * 根据选中值计算最后的得分
     */
    handlerConfirm() {
      // 遍历tabledata,计算子参数的权重,保存到obj中{param_id: true weight}
      const paramWeightObj = {}
      this.tableData.forEach((parent) => {
        const pw = parent.weight
        parent.children.forEach((ch) => {
          paramWeightObj[ch['id']] = pw * ch['weight']
        })
      })
      // 计算最终结果
      let result = 0
      Object.keys(this.paramValue).forEach((param_id) => {
        // 如果当前参数对应的是公式,那么需要通过sliderValue找到该param_id对应的真实取值,并带入公式计算
        let param_value = this.paramValue[param_id]
        if (param_value.includes('x')) {
          param_value = eval(
            param_value.replace(
              new RegExp('x', 'g'),
              `*${this.sliderValue[param_id]}`
            )
          )
        }
        result += parseFloat(param_value * paramWeightObj[param_id])
      })
      this.$emit('confirm', result)
    },
    handlerCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped>
.slider {
  float: right;
  width: 50px;
  font-size: 13px;
}
</style>