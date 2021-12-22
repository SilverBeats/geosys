<template>
  <!-- 参数选择dialog -->
  <el-dialog
    title="自定义图表"
    top="5vh"
    width="50%"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :show-close="false"
    :visible="visible"
  >
    <p><strong>请选择参数：</strong></p>
    <div v-for="(item, index) in paramList" :key="item.pid">
      <el-divider content-position="left">{{ item['pname'] }}</el-divider>
      <div>
        <el-row :gutter="20">
          <el-checkbox-group v-model="checkList[index]">
            <el-col :span="8" v-for="c in item['children']" :key="c.cid">
              <el-checkbox :label="c.cid">{{ c.cname }}</el-checkbox>
            </el-col>
          </el-checkbox-group>
        </el-row>
      </div>
    </div>
    <p><strong>生成的图表类型？</strong></p>
    <el-radio-group v-model="type">
      <el-radio v-for="(value, key) in typeList" :key="key" :label="key">{{
        value
      }}</el-radio>
    </el-radio-group>
    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    paramList: {
      default: function () {
        return []
      },
      type: Array,
    },
  },
  data() {
    return {
      checkList: [],
      typeList: {
        line: '折线图',
        bar: '柱状图',
      },
      type: 'line',
    }
  },
  created() {
    // 初始化
    this.paramList.forEach((_) => this.checkList.push([]))
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    },
    handleConfirm() {
      this.$emit('confirm', {
        checkList: this.checkList,
        type: this.type
      })
    },
  },
}
</script>