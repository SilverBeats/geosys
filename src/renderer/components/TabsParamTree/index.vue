<template>
  <el-tabs type="border-card" :value="activeTab" @tab-click="switchTab">
    <el-tab-pane
      v-for="(item, index) in labelData"
      :key="index"
      :label="item['label']"
      :name="item['name']"
      style="overflow-y: scroll;"
      :style="{height: paneHeight}"
    >
      <param-tree
        nodeKey="id"
        :treeKey="item['name'] + treeKey"
        :treeData="group[item['name']]"
        :defaultProps="defaultProps"
        :readOnly="readOnly"
        :cr="cr"
        @setLevel1Relative="handlerSetLevel1Relative"
        @insert="handlerInsert"
        @append="handlerAppend"
        @setLevel2Relative="handlerSetLevel2Relative"
        @insertSelect="handlerInsertSelect"
        @edit="handlerEdit"
        @remove="handlerRemove"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import ParamTree from '../ParamTree/index.vue'
export default {
  props: {
    // 当前展示的tab
    activeTab: {
      require: true,
      default: '',
      type: [String, Number],
    },
    flag: {
      default: '',
      type: String,
    },
    labelData: {
      type: Array,
      default: function () {
        return []
      },
    },
    group: {
      type: Object,
      default: function () {
        return {}
      },
    },
    treeKey: {
      type: [Number, String],
      default: +new Date(),
    },
    defaultProps: {
      type: Object,
      default: function () {
        return {}
      },
    },
    readOnly: {
      type: Boolean,
      default: true,
    },
    cr: {
      type: Boolean,
      default: false,
    },
    paneHeight: {
      type: String,
      default: '300px'
    }
  },
  components: {
    ParamTree,
  },
  methods: {
    /**
     * 切换tab
     */
    switchTab(tab) {
      this.$emit('tab-click', { flag:this.flag, tab })
    },
    handlerSetLevel1Relative() {
      this.$emit('setLevel1Relative')
    },
    handlerInsert() {
      this.$emit('insert')
    },
    handlerAppend(e) {
      this.$emit('append', e)
    },
    handlerSetLevel2Relative(e) {
      this.$emit('setLevel2Relative', e)
    },
    handlerInsertSelect(e) {
      this.$emit('insertSelect', e)
    },
    handlerEdit(e) {
      this.$emit('edit', e)
    },
    handlerRemove(e) {
      this.$emit('remove', e)
    }
  },
}
</script>