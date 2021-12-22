<template>
  <!-- 参数输入页面 -->
  <el-row type="flex" :gutter="20">
    <el-col v-for="(item, index) in cardList" :key="index" :span="8">
      <el-card
        class="box"
        shadow="hover"
        :body-style="cardStyle"
        @click.native="handlerClick(index)"
      >
        {{ item['content'] }}
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    cardList: {
      type: Array,
      default: function () {
        return []
      },
    },
    cardStyle: {
      type: Object,
      default: function () {
        return { padding: '0', textAlign: 'center', lineHeight: '200px' }
      },
    },
  },
  methods: {
    handlerClick(index) {
      this.$emit('changePage', { index })
    },
  },
}
</script>

<style scoped>
.box {
  height: 150px;
  background-color: GhostWhite;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.box:hover {
  margin-top: -5px;
}
</style>