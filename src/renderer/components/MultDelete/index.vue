<template>
  <!-- 批量删除按钮 -->
  <el-popover placement="top" width="160" v-model="visible">
    <p>确定要删除选中的记录吗？</p>
    <div style="text-align: right; margin: 0">
      <el-button size="mini" type="text" @click="visible = false"
        >取消</el-button
      >
      <el-button type="primary" size="mini" @click="deleteSelected"
        >确定</el-button
      >
    </div>
    <el-button slot="reference" size="small" type="danger">删 除</el-button>
  </el-popover>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    deleteSelected() {
      this.$emit('confirm')
      this.visible = false
    },
  },
}
</script>