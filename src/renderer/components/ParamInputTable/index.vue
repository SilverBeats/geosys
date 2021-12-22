<template>
  <!--区块输入、甜点区、甜点段公用-->
  <el-table
    :data="tableData"
    @selection-change="handlerSelect"
    tooltip-effect="dark"
    :height="maxHeight"
    :max-height="maxHeight"
  >
    <el-table-column
      v-if="selection"
      align="center"
      type="selection"
      width="55"
    />
    <el-table-column align="center" label="名称" width="250">
      <template slot-scope="scope">
        <el-input
          :disabled="scope.row.his"
          resize="none"
          clearable
          show-word-limit
          maxlength="10"
          v-model="scope.row.des"
          placeholder="请给区块命名"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="类型" width="150">
      <template slot-scope="scope">
        <el-select
          v-model="scope.row.type"
          placeholder="请选择类型"
          :disabled="scope.row.his"
          @change="handlerChange"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </template>
    </el-table-column>
    <el-table-column align="center" label="参数输入">
      <template slot-scope="scope">
        <el-link
          v-if="scope.row.his"
          icon="el-icon-view"
          type="primary"
          @click="handlerClick2(scope.$index, scope.row)"
          >显示参数</el-link
        >
        <el-link
          v-else
          icon="el-icon-edit"
          type="primary"
          @click="handlerClick1(scope.$index, scope.row)"
          >输入参数</el-link
        >
      </template>
    </el-table-column>
    <el-table-column align="center" sortable label="计算结果" prop="result" />
  </el-table>
</template>
<script>
export default {
  props: {
    tableData: {
      // 表格数据
      type: Array,
      default: function () {
        return []
      },
    },
    maxHeight: {
      // 表格最大高度
      type: Number,
      default: 420,
    },
    selection: {
      // 是否需要复选框
      type: Boolean,
      default: true,
    },
    typeList: {
      // 类型数据
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data() {
    return {}
  },
  methods: {
    /**
     * 复选框多选事件
     */
    handlerSelect(val) {
      this.$emit('handlerSelect', val)
    },
    /**
     * 显示参数进行输入
     */
    handlerClick1(index, row) {
      this.$emit('inputParam', { index, row })
    },
    handlerClick2(index, row) {
      this.$emit('showParam', { index, row })
    },
    handlerChange() {
      this.$emit('selectChange')
    },
  },
}
</script>