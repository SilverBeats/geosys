<template>
  <!-- 导航页面 -->
  <div class="nav-box">
    <page-header content="导航页面" :showLeft="false" />
    <div v-for="(item, ti) in navList" :key="ti" class="nav-row">
      <el-divider content-position="left">{{ item['classify'] }}</el-divider>
      <template v-if="ti < 3">
        <nav-block
          :cardList="cardList"
          @changePage="handlerClick(ti, $event)"
        />
      </template>
      <template v-else>
        <nav-block
          :cardList="settingList"
          @changePage="handlerClick(ti, $event)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader/index.vue'
import NavBlock from '@/components/NavBlock/index.vue'
export default {
  data() {
    return {
      cardList: [
        {
          content: '区块优选',
          params: { which: 'bsp', title: '区块优选' },
        },
        {
          content: '甜点区优选',
          params: { which: 'dap', title: '甜点区优选' },
        },
        {
          content: '甜点段优选',
          params: { which: 'dsp', title: '甜点段优选' },
        },
      ],
      settingList: [
        { toName: 'param_set', content: '参数设置' },
        { toName: 'ri_set', content: 'ri设置' },
      ],
      navList: [
        {
          classify: '参数输入',
          toName: 'param_input_view',
        },
        {
          classify: '历史记录',
          toName: 'history_view',
        },
        {
          classify: '回收站',
          toName: 'garbage_view',
        },
        {
          classify: '设置',
        },
      ],
    }
  },
  components: {
    NavBlock,
    PageHeader,
  },
  methods: {
    handlerClick(ti, { index }) {
      if (ti == 3) {
        this.$router.push({
          name: this.settingList[index].toName,
        })
      } else {
        const { params } = this.cardList[index]
        this.$router.push({
          name: this.navList[ti].toName,
          params,
        })
      }
    },
  },
}
</script>

<style scoped>
.nav-row {
  width: 70%;
  margin: 0 auto;
}
</style>