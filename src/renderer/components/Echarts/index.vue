<template>
  <!-- 图表组件 -->
  <div :id="echartsId" class="echarts" ref="echarts"></div>
</template>

<script>
export default {
  props: {
    selectId: {
      type: Object,
      default: () => {
      },
    },
    selectOptions: {
      type: Array,
      default: () => [],
    },
    legendData: {
      // 图例数据
      type: Array,
      default: () => [],
    },
    xAxisData: {
      // x轴数据
      type: Array,
      default: () => [],
    },
    series: {
      type: Array,
      default: () => [],
    },
    eChartTitle: {
      default: '',
      type: String,
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    echartsId() {
      return 'echarts' + +new Date() * Math.random()
    },
  },
  data() {
    return {
      options: {
        title: {
          text: this.eChartTitle,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: [],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {
              pixelRatio: 3,
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: [],
          axisLabel: {
            interval: 0,
            formatter: function (value) {
              let ret = ''
              // 每行文字的最大长度
              let maxLength = 3
              // 当前标签的长度
              let valLength = value.length
              // 可以有几行
              let rowN = Math.ceil(valLength / maxLength)
              if (rowN > 1) {
                for (var i = 0; i < rowN; i++) {
                  //每次截取的字符串
                  let temp = ''
                  //开始截取的位置
                  let start = i * maxLength
                  let end = start + maxLength //结束截取的位置
                  //这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧
                  temp = value.substring(start, end) + '\n'
                  ret += temp //凭借最终的字符串
                }
                return ret
              }
              return value
            },
          },
        },
        yAxis: {
          // type: 'value',
          axisLabel: {},
        },
        series: [],
      },
    }
  },
  mounted() {
    const vm = this
    vm.$nextTick(() => {
      vm.createEcharts()
    })
  },
  methods: {
    createEcharts() {
      const chartDom = document.getElementById(this.echartsId)
      const myChart = this.$echarts.init(chartDom)
      this.config()
      myChart.setOption(this.options)
    },
    config() {
      this.options.legend.data = this.legendData
      this.options.xAxis.data = this.xAxisData
      this.options.series = this.series
      let marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#98F5FF;"></span>`
      const selectOptions = this.selectOptions
      // 如下情况为mode1
      // [{standard: '简单', value: 1.0}, {standard: '中等', value: 0.6},{standard: '复杂', value: 0.2}]
      // [{standard: '>=5', value: 1.0}, {standard: '2-5', value: 0.6},{standard: '<=2', value: 0.2}]
      // mode1: 传递的series=[1.0, 0.6, 0.2, 1.0, 0.6] value值
      // 如下情况为mode2
      // [{standard: '>=200', value: 1.0}, {standard: '100-200', value: kx+b},{standard: '<=100', value: 0.2}]
      // mode2: 传递的series=[200, 134, 100,...] standard值
      let mode1 = true
      for (let {standard, value} of selectOptions) {
        if (standard.includes('-') && value.includes('x')) {
          mode1 = false
          break
        }
      }
      // mode1需要处理y轴
      // mode1的tooltip: standard, value
      if (mode1) {
        const v2s = new Map()
        for (let {standard, value} of selectOptions)
          v2s.set(value, standard)
        // 根据成图的参数id，配置y轴
        this.options.yAxis.axisLabel.formatter = (v) => {
          for (const {standard, value} of selectOptions) {
            if (v == value) return [standard]
          }
          return ['']
        }
        this.options.tooltip.formatter = (params) => {
          let str = ''
          params.forEach((p, idx, arr) => {
            let x = p.data
            str += `${p.name}<br/>`
            str += `${marker}标准：${v2s.get(x)}<br/>${marker}权重值：${x}`
            if (idx !== arr.length - 1) str += '<br/>'
          })
          return str
        }
      } else {
        // mode2的tooltip: standard,curVal, value
        this.options.tooltip.formatter = (params) => {
          let str = ''
          params.forEach((p, idx, arr) => {
            const res = this.help(p.data, selectOptions)
            const kl = Object.keys(res).length
            str += `${p.name}<br/>`
            if (kl === 2) {
              str += `${marker}标准：${res.standard}<br/>`
              str += `${marker}权重值：${res.weight}<br/>`
            } else if (kl === 3) {
              str += `${marker}标准：${res.standard}<br/>`
              str += `${marker}当前值：${res.curVal}<br/>`
              str += `${marker}权重值：${res.weight}`
            } else str += ''
            if (idx !== arr.length - 1) str += '<br/>'
          })
          return str
        }
      }
    },
    help(x, selectOptions) {
      let obj = {}
      for (let {standard, value} of selectOptions) {
        standard = standard.replace(/≤/g, '<=')
        standard = standard.replace(/≥/g, '>=')
        // 当前遍历到的selectOption是边界
        if (/^(>=|<=|>|<)/.test(standard) && eval(x + standard)) {
          obj = {
            standard, // 标准
            weight: value, // 权重取值
          }
          break
        } else if (standard.includes('-')) {
          let range = standard.split('-')
          if (eval(`${range[0]} < ${x}`) && eval(`${x} < ${range[1]}`)) {
            let weight = value.includes('x') ? Math.round(parseFloat(eval(value.replace(/x/ig, `*${x}`)) * 1000)) / 1000 : value
            obj = {
              standard,
              curVal: x,
              weight
            }
            break
          }
        }
      }
      return obj
    }
  },
}

</script>

<style scoped>
.echarts {
  width: 100%;
  height: 300px;
}
</style>