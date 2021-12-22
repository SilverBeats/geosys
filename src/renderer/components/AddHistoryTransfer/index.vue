<template>
  <!-- 输入参数时,可以选择添加一些历史记录到table中 -->
  <div>
    <el-dialog
      :title="title"
      :visible="visible"
      :top="top"
      :width="width"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <!-- 穿梭框,将选中的数据移动到右边,点击确定后将右边的数据进行添加到table中 -->
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="描述/创建时间进行过滤"
        v-model="keys"
        :data="transferData"
        :titles="['历史记录', '添加到列表中']"
        :button-texts="['到左边', '到右边']"
      >
        <el-button
          class="transfer-footer"
          slot="left-footer"
          size="small"
          @click="more"
          >加载更多</el-button
        >
      </el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    top: {
      type: [Number, String],
      default: '10vh',
    },
    width: {
      default: '80%',
    },
    transferData: {
      type: Array,
      default: function () {
        return []
      },
    },
    filterMethod: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      keys: [],
    }
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm', this.keys)
    },
    more() {
      this.$emit('loadMore')
    },
  },
}
</script>
<style scoped>
.el-transfer-panel__footer {
  text-align: center !important;
}
.transfer-footer {
  padding: 5px;
}
.el-transfer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>