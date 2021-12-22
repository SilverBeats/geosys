<template>
  <!-- 用于paramSet 设置参数 -->
  <div>
    <div style="margin-bottom: 10px" v-if="!readOnly">
      <el-button type="success" size="mini" @click="insert"
        >添加一级项</el-button
      >
      <el-button v-if="cr" type="success" size="mini" @click="setLevel1Relative"
        >设置一级项重要性关系</el-button
      >
    </div>
    <el-tree
      highlight-current
      :expand-on-click-node="readOnly"
      :node-key="nodeKey"
      :data="treeData"
      :props="defaultProps"
      :key="treeKey"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <!-- 显示的内容 -->
        <span>{{ node.label }}</span>
        <span v-if="!readOnly">
          <el-button
            class="text-btn success"
            v-if="node.level == 1 && cr"
            type="text"
            size="mini"
            @click="() => setLevel2Relative(node, data)"
          >
            设置二级项重要性
          </el-button>
          <el-button
            class="text-btn success"
            v-if="node.level == 1"
            type="text"
            size="mini"
            @click="() => append(node, data)"
          >
            添加二级项
          </el-button>
          <el-button
            v-if="node.level == 3"
            class="text-btn success"
            type="text"
            size="mini"
            @click="() => insertSelect(node, data)"
          >
            添加选项
          </el-button>
          <el-button
            v-if="node.level != 3"
            class="text-btn warning"
            type="text"
            size="mini"
            @click="() => edit(node, data)"
          >
            编辑
          </el-button>
          <el-button
            v-if="node.level != 3"
            class="text-btn danger"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            删除
          </el-button>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
export default {
  props: {
    cr: {
      type: Boolean,
      default: false,
    },
    treeKey: {
      type: [Number, String],
      default: +new Date(),
    },
    treeData: {
      type: Array,
      default: function () {
        return []
      },
    },
    defaultProps: {
      type: Object,
      default: function () {
        return {}
      },
    },
    nodeKey: {
      type: String,
      default: 'id',
    },
    readOnly: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    setLevel1Relative() {
      this.$emit('setLevel1Relative')
    },
    insert() {
      this.$emit('insert')
    },
    append(node, data) {
      this.$emit('append', { node, data })
    },
    setLevel2Relative(node, data) {
      this.$emit('setLevel2Relative', { node, data })
    },
    insertSelect(node, data) {
      this.$emit('insertSelect', { node, data })
    },
    edit(node, data) {
      this.$emit('edit', { node, data })
    },
    remove(node, data) {
      this.$emit('remove', { node, data })
    },
  },
}
</script>

<style scoped>
.success {
  color: rgb(114, 194, 45);
}
.danger {
  color: rgb(236, 107, 106);
}
.warning {
  color: rgb(224, 161, 47);
}
.text-btn:hover {
  text-decoration: underline;
  color: rgba(147, 159, 255);
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>