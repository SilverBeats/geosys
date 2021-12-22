<template>
  <!-- 显示历史记录、回收站的表格 -->
  <el-table
    class="his-table"
    stripe
    :data="tableData"
    highlight-current-row
    style="width: 100%"
    :height="height"
    @selection-change="handlerSelect"
  >
    <!--复选框列-->
    <el-table-column type="selection" width="50" align="center" />
    <!-- 描述列 -->
    <el-table-column label="名称" prop="des" align="center" width="150" />
    <!-- 类型列 -->
    <el-table-column label="类型" align="center" width="100" prop="type">
      <template slot-scope="scope">
        <span v-if="scope.row.type === 'bc'">烟煤</span>
        <span v-else-if="scope.row.type === 'ac'">无烟煤</span>
        <span v-else>未选择类型</span>
      </template>
    </el-table-column>
    <!-- 参数列 -->
    <el-table-column label="参数" align="center" width="100">
      <template slot-scope="scope">
        <el-link
          icon="el-icon-view"
          type="primary"
          @click="handlerClick(scope.$index, scope.row)"
          >查看参数</el-link
        >
      </template>
    </el-table-column>
    <!-- 结果列 -->
    <el-table-column
      label="计算结果"
      prop="result"
      align="center"
      width="100"
      sortable
    />
    <!-- 时间列 -->
    <el-table-column
      align="center"
      :label="createOrDelete === 1 ? '创建时间' : '删除时间'"
    >
      <template slot-scope="scope">
        <span v-if="createOrDelete === 1">{{ scope.row['create_time'] }}</span>
        <span v-else>{{ scope.row['delete_time'] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  props: {
    height: {
      default: 450,
      type: Number
    },
    // 表格数据
    tableData: {
      type: Array,
      default: function () {
        return []
      },
    },
    // 1:创建，0：删除
    createOrDelete: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    handlerSelect(val) {
      this.$emit('selectChange', val)
    },
    handlerClick(index, row) {
      this.$emit('viewParam', { index, row })
    },
  },
}
</script>
<style lang="less" scoped>
.his-table {
  height: 420px;
  // .ellipsis {
  //   text-overflow: -o-ellipsis-lastline;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   display: -webkit-box;
  //   -webkit-line-clamp: 2;
  //   line-clamp: 2;
  //   -webkit-box-orient: vertical;
  // }
}
.el-table::before {
  height: 0 !important;
}
</style>