<template>
  <!--自定义的pageheader-->
  <div class="my-page-header">
    <div class="my-page-header__left" @click="handlerClick" v-if="showLeft">
      <!-- 返回图标 -->
      <i class="el-icon-back"></i>
      <!-- 返回的文字 -->
      <div class="my-page-header__title">
        {{ title }}
      </div>
    </div>
    <div class="my-page-header__content">{{ content }}</div>
  </div>
</template>

<script>
export default {
  props: {
    showLeft: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '返回',
    },
    content: {
      type: String,
      default: '页面头部',
    },
  },
  methods: {
    handlerClick() {
      this.$router.go(-1)
    },
  },
}
</script>

<style scoped lang="less">
.my-page-header {
  display: flex;
  line-height: 24px;
  margin-bottom: 20px;
}

.my-page-header__left {
  display: flex;
  cursor: pointer;
  margin-right: 40px;
  position: relative;

  .el-icon-back {
    font-size: 18px;
    margin-right: 6px;
    align-self: center;
  }
}
.my-page-header__title {
  font-size: 14px;
  font-weight: 500;
}
.my-page-header__left::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 16px;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #dcdfe6;
}
.my-page-header__content {
  font-size: 18px;
  color: #303133;
}
</style>