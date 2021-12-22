<template>
  <div class="welcome-box">
    <div class="info">
      <el-tooltip placement="bottom-end">
        <div slot="content">
          <p>creator: silverbeats</p>
          <p>connect: silverbeats@qq.com</p>
        </div>
        <i class="el-icon-info"></i>
      </el-tooltip>
    </div>
    <p class="text">欢迎使用煤层气选区评价</p>
    <el-button @click="handlerInit">点击开始</el-button>
  </div>
</template>

<script>
import { openLoading, closeLoading } from '@/utils/tipUtil'
import { initVuex } from '@/service/initGPS'
import { init } from '@/service/initService'
import { accessSync, constants, writeFileSync } from 'fs'
export default {
  methods: {
    async handlerInit() {
      // 不需要初始化
      let flag = false
      try {
        // 检查是否需要初始化
        accessSync('a', constants.F_OK)
      } catch (err) {
        writeFileSync('a', '', { flag: 'w' })
        flag = true
      }
      if (flag) {
        openLoading('初始化数据……请稍后')
        await init()
        closeLoading()
      }
      openLoading('正在加载数据……')
      await initVuex()
      closeLoading()
      this.$router.push({
        name: 'nav',
      })
    },
  },
}
</script>

<style scoped>
.welcome-box {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.text {
  font-size: 26px;
}
.info {
  position: absolute;
  right: 20px;
  top: 20px;
  text-align: center;
}
</style>