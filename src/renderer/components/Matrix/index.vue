<template>
  <div class="matrix-box">
    <template v-if="header.length == 0">
      <p style="text-align: center">无参数……</p>
    </template>
    <template v-else>
      <div v-for="row in dim" :key="'row' + row" class="row">
        <div
          v-for="col in dim"
          :key="'col' + col"
          class="col"
          :style="{ width: 100 / dim + '%' }"
        >
          <!--第一行和第一列显示表头-->
          <span v-if="row == 1 || col == 1">
            {{ list[row - 1][col - 1] }}
          </span>
          <span v-else-if="row >= col">
            {{ list[row - 1][col - 1] }}
          </span>
          <el-input
            v-else
            v-model="list[row - 1][col - 1]"
            suffix-icon="el-icon-edit"
            type="number"
            @input="handlerInput(row, col, $event)"
          ></el-input>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    // 表头
    header: {
      type: Array,
      default: function () {
        return ['参数1', '参数2', '参数3']
      },
      require: true,
    },
    'btn-size': {
      type: String,
      default: 'small',
    },
  },
  data() {
    return {
      // 展示的数据表
      list: null,
      // 二维数组维度
      dim: -1,
      // 用来返回给父组件的矩阵
      matrix: null,
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const dim = this.header.length
      // 初始化一个二维数组
      const a = this.init2Dim(dim + 1, '')
      const b = this.init2Dim(dim, 0.0)
      // 给a添加第一行和第一列
      for (let i = 1; i < dim + 1; ++i) {
        a[0][i] = this.header[i - 1]
        a[i][0] = this.header[i - 1]
      }
      // 给a的对角线位置添加数据
      for (let row = 1; row < dim + 1; ++row) {
        a[row][row] = 1
      }
      for (let row = 0; row < dim; ++row) {
        b[row][row] = 1
      }
      this.dim = dim + 1
      this.list = a
      this.matrix = b
    },
    handlerInput(row, col, value) {
      let t = value == 0 ? '' : parseFloat(1.0 / value)
      this.matrix[row - 2][col - 2] = parseFloat(value)
      this.list[col - 1][row - 1] = this.matrix[col - 2][row - 2] =
        parseFloat(t)
      this.$emit('input', { matrix: this.matrix })
    },
    init2Dim(dim, initValue) {
      const matrix = new Array(dim)
      for (let row = 0; row < dim; ++row) {
        matrix[row] = new Array(dim).fill(initValue)
      }
      return matrix
    },
  },
}
</script>

<style scoped lang="less">
.matrix-box {
  max-height: 360px;
  overflow: scroll;
}
.btn-area {
  margin-top: 10px;
  text-align: right;
}
.row {
  display: flex;
  flex-wrap: nowrap;
  max-width: 600px;
  &:last-child {
    .col {
      border-bottom: 1px solid black;
    }
  }
}
.col {
  min-height: 50px;
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;

  border-left: 1px solid black;
  border-top: 1px solid black;
  &:last-child {
    border-right: 1px solid black;
  }
  .el-input {
    max-width: 90%;
    /deep/.el-input__inner {
      border: none;
      text-align: center;
      background-color: ghostwhite;
    }
  }
}
</style>