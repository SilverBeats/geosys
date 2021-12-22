<template>
  <div id="ri-set-box">
    <page-header content="参数设置"/>
    <!-- 右下角的增加组按钮 -->
    <add-btn @click="addRi" />
    <el-table :data="riTableData" border stripe height="520px">
      <el-table-column align="center" label="矩阵维度" prop="dim" />
      <el-table-column align="center" label="RI取值" prop="ri" />
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            icon="el-icon-edit"
            @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="RI添加"
      top="15vh"
      width="50%"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false"
      :visible.sync="dialogVisible"
    >
      <el-form
        :model="newRiForm"
        ref="newRiValidateForm"
        label-width="100px"
        :rules="formRules"
      >
        <el-form-item label="判断矩阵维度" prop="dim">
          <el-input v-model.number="newRiForm.dim" autocomplete="off" />
        </el-form-item>
        <el-form-item label="RI" prop="ri">
          <el-input v-model.number="newRiForm.ri" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="clearInnerDialog">取 消</el-button>
        <el-button type="primary" @click="innerDialogConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import PageHeader from '@/components/PageHeader/index.vue'
import AddBtn from '@/components/AddBtn/index.vue'
import riService from '@/service/riService'
import {
  openLoading,
  closeLoading,
  successMsg,
  errorMsg,
} from '@/utils/tipUtil'
export default {
  data() {
    const validDim = (rules, value, callback) => {
      var Regx = /^[1-9]*$/
      if (!value) {
        callback(new Error('矩阵维度不能为空'))
      } else if (!Regx.test(value)) {
        callback(new Error('矩阵维度是1-9的整数'))
      } else {
        callback()
      }
    }
    const validRi = (rules, value, callback) => {
      var Regx = /^\d+(\.\d{1,})?$/
      if (value === '') {
        callback(new Error('RI不能为空'))
      } else if (!Regx.test(value)) {
        callback(new Error('当前输入值非数字，格式不正确'))
      } else {
        callback()
      }
    }
    return {
      riTableData: [],
      dialogVisible: false,
      newRiForm: {},
      formRules: {
        dim: [{ validator: validDim, trigger: 'blur' }],
        ri: [{ validator: validRi, message: 'RI不能为空', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.initRiData()
  },
  components: {
    PageHeader,
    AddBtn,
  },
  methods: {
    ...mapMutations(['setRi']),
    initRiData() {
      openLoading('加载数据……')
      riService
        .get()
        .then((res) => {
          this.riTableData = res
        })
        .catch((err) => errorMsg(`加载数据失败，错误：${err}`))
        .finally(() => closeLoading())
    },
    // 点击添加新的dim-ri，初始化dialog
    addRi() {
      // 显示dialog
      this.dialogVisible = true
    },
    // dialog取消新增
    clearInnerDialog() {
      this.dialogVisible = false
      this.newRiForm = {}
      this.$refs.newRiValidateForm.resetFields()
    },
    // dialog确认新增
    innerDialogConfirm() {
      this.$refs.newRiValidateForm.validate((value) => {
        if (!value) {
          errorMsg('输入内容不合法，请检查')
          return false
        }
        riService
          .insert(Object.assign({}, this.newRiForm))
          .then((_) => {
            this.clearInnerDialog()
            this.initRiData()
            this.updateVuex()
          })
          .catch((err) => {
            errorMsg(`添加失败！错误：${err}`)
          })
      })
    },
    async handleEdit(index, row) {
      try {
        let ri
        await this.$prompt('请输入新的RI值', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^\d+(\.\d{1,})?$/,
          inputErrorMessage: '当前输入值非数字，格式不正确',
        })
          .then(({ value }) => {
            ri = value
            riService.update({ id: row.id, ri })
          })
          .then(() => (row.ri = ri))
        this.updateVuex()
      } catch (err) {
        if (err != 'cancel') errorMsg(`更新失败，错误：${err}`)
      }
    },
    async handleDelete(index, row) {
      try {
        await this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: false,
          type: 'warning',
        }).then(() => {
          riService.delete(row.id)
        })
        this.riTableData.splice(index, 1)
        // 更新vuex
        this.updateVuex()
        successMsg('删除成功')
      } catch (err) {
        if (err != 'cancel') errorMsg(`删除失败，错误：${err}`)
      }
    },
    updateVuex() {
      this.setRi(this.riTableData)
    },
  },
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