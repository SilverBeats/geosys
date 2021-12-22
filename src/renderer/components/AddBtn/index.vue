<template>
  <!-- 诸多页面的右下角添加按钮 -->
  <el-button
    circle
    class="btn-area"
    type="success"
    :icon="icon"
    @click="handleClick"
  ></el-button>
</template>

<script>
export default {
  props: {
    icon: {
      default: "el-icon-plus",
      type: String
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.btn-area {
  position: fixed;
  z-index: 999;
  bottom: 50px;
  right: 50px;
  font-size: 20px;
}
</style>