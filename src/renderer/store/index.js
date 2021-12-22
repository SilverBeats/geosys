import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)


const state = {
  gid: '',
  paramData: {
    'bsp': [],
    'dap': [],
    'dsp': []
  },
  selectData: {
    'bsp': {
      'ac': {},
      'bc': {}
    },
    'dap': {
      'ac': {},
      'bc': {}
    },
    'dsp': {
      'ac': {},
      'bc': {}
    }
  },
  ri: [],
  paramList: {
    'bsp': [], // 存储的是{pname:,pid: , children: [{cname, cid}] }
    'dap': [],
    'dsp': []
  }
}
const mutations = {
  setGid(state, { gid }) {
    state.gid = gid
  },
  setParamData(state, { paramData, which }) {
    state.paramData[which] = paramData
  },
  setSelectData(state, { selectData, which, type }) {
    state.selectData[which][type] = selectData
  },
  setRi(state, { ri }) {
    state.ri = ri
  },
  setParamList(state, { which, paramList }) {
    state.paramList[which] = paramList
  },
  resetParamList(state) {
    state.paramList = {
      'bsp': [],
      'dap': [],
      'dsp': []
    }
  }
}

export default new Vuex.Store({
  namespaced: true,
  state,
  mutations
})

/**
 * 第二种使用方式
 * import {mapState, mapMutations} from 'vuex'
 * computed: {
 *    ...mapState(['count'])
 * },
 * methods: {
 *  ...mapMutations(['add', 'addN']),
 *  add() {
 *     this.addN(3)
 *  },
 *  addAsync() {
 *    this.$store.dispatch('addAsync')
 *  }
 * }
 *
 */
 // /**
  //  * this.$store.state.数据
  //  */
  // state: { // 相当于data
  //   count: 0
  // },
  // // 必须都是同步函数
  // mutations: { // 修改state中的数据
  //   add(state) {
  //     // 变更状态
  //     // this.$store.commit('add')
  //     state.count++
  //   },
  //   addN(state, step) {
  //     state.count += step
  //     // this.$store.commit('add', 3)
  //   }
  // },
  // actions: { // 异步函数在这里
  //   addAsync(context) {
  //     setTimeout(()=>{
  //       context.commit('add')
  //     }, 1000)
  //   }
  // }