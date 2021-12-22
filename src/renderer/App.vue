<template>
  <el-container id="app">
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'geosys',
}
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
