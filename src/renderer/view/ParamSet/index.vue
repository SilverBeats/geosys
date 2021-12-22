<template>
  <div id="param-set-box">
    <page-header content="参数设置"/>
    <!-- 右下角的增加组按钮 -->
    <add-btn @click="addGroup" />

    <div class="block" v-for="(item, index) in groupList" :key="item.id">
      <!-- 头部显示概述内容 -->
      <div class="source" :class="{ 'no-active': item['is_active'] != 1 }">
        <!-- 默认图标 -->
        <div class="default" v-if="item['is_default'] == 1">默认</div>
        <p>组名：{{ item['group_name'] }}</p>
        <p>创建时间：{{ item['create_time'] }}</p>
        <p v-if="item['is_active'] == 0">删除时间：{{ item['delete_time'] }}</p>
        <p>
          <!-- 如果当前未删除 -->
          <template v-if="item['is_active'] == 1">
            <el-button
              @click="setDefaultGroup(index, item)"
              size="small"
              v-if="item['is_default'] != 1"
              >设置为默认</el-button
            >
            <el-dropdown @command="handlerEditGroup(index, item, $event)">
              <el-button type="primary" size="small" icon="el-icon-edit">
                编辑<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1" :disabled="!item['is_new']"
                  >根据重要性
                </el-dropdown-item>
                <el-dropdown-item command="2">根据权重</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <el-button
              @click="handlerLogicDelete(index, item)"
              type="warning"
              size="small"
              icon="el-icon-delete"
              >删除</el-button
            >
          </template>
          <!-- 如果已经逻辑删除 -->
          <template v-else>
            <el-button
              @click="handlerRecover(index, item)"
              type="success"
              size="small"
              >恢复</el-button
            >
            <el-button
              @click="handlerDelete(index, item)"
              type="danger"
              size="small"
              icon="el-icon-delete"
              >彻底删除</el-button
            >
          </template>
        </p>
      </div>
      <!-- 中间显示参数 -->
      <div class="meta" :class="{ active: currentExpandGroupId == item.id }">
        <div style="padding: 10px">
          <tabs-param-tree
            @tab-click="switchTab"
            paneHeight="210px"
            :activeTab="activeTab"
            :treeKey="item.id"
            :readOnly="true"
            :cr="false"
            :defaultProps="defaultProps"
            :group="item"
            :labelData="labelData"
          />
        </div>
      </div>
      <!-- 底部显示按钮 -->
      <div class="control">
        <div @click="more(item)">
          <template v-if="currentExpandGroupId != item.id">
            <i class="el-icon-caret-bottom"></i>
            <span>显示更多</span>
          </template>
          <template v-else>
            <i class="el-icon-caret-top"></i>
            <span>点击收起</span>
          </template>
        </div>
      </div>
    </div>

    <el-dialog
      title="参数组编辑"
      top="10vh"
      width="60%"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false"
      :visible.sync="outerVisible"
    >
      <tabs-param-tree
        flag="dialog"
        :activeTab="dialogActiveTab"
        :treeKey="treeKey"
        :readOnly="false"
        :cr="needCheck"
        :defaultProps="defaultProps"
        :group="currentEditGroup"
        :labelData="labelData"
        @tab-click="switchTab"
        @setLevel1Relative="handlerSetLevel1Relative"
        @insert="handlerInsert"
        @append="handlerAppend"
        @setLevel2Relative="handlerSetLevel2Relative"
        @insertSelect="handlerInsertSelect"
        @edit="handlerEdit"
        @remove="handlerRemove"
      />
      <!-- 内部dialog -->
      <el-dialog
        title="编辑"
        top="10vh"
        append-to-body
        :close-on-press-escape="false"
        :close-on-click-modal="false"
        :show-close="false"
        :visible.sync="innerVisible"
      >
        <!-- form 或者matrix组件 -->
        <template v-if="flag < 6">
          <el-form
            ref="dialogEditFromRef"
            label-position="top"
            :model="innerDialogForm"
            :rules="innerDialogFormRules"
          >
            <el-form-item
              v-for="(item, index) in innerDialogFormItemList"
              :key="index"
              :label="item['label']"
              :prop="item['prop']"
            >
              <el-input
                v-model="innerDialogForm[item['prop']]"
                autocomplete="off"
                clearable
              />
            </el-form-item>
          </el-form>
        </template>
        <template v-else>
          <matrix :header="matrixHeader" @input="handlerMatrixInput" />
        </template>
        <div slot="footer">
          <el-button @click="clearInnerDialog">取 消</el-button>
          <el-button type="primary" @click="innerDialogConfirm"
            >确 定</el-button
          >
        </div>
      </el-dialog>
      <!-- 外部dialog的按钮 -->
      <div slot="footer">
        <el-button @click="clearOutDialog">取消编辑</el-button>
        <el-button @click="handlerSaveGroup" type="success">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import PageHeader from '../../components/PageHeader/index'
import TabsParamTree from '@/components/TabsParamTree/index.vue'
import AddBtn from '@/components/AddBtn/index.vue'
import Matrix from '@/components/Matrix/index.vue'
import { list1, list2, list3 } from './list'

import { openLoading, closeLoading, errorMsg } from '@/utils/tipUtil'
import { guid, getNow } from '@/utils/toolUtil'
import { initParamData } from '@/utils/initUtil'
import { calcEigne } from '@/utils/matrix'

import { initGPS } from '@/service/initGPS'
import groupService from '@/service/groupService'

import param_bsp from '@/service/BlockSelection/paramService'
import select_bsp_ac from '@/service/BlockSelection/selectServiceAC'
import select_bsp_bc from '@/service/BlockSelection/selectServiceBC'

import param_dap from '@/service/DessertArea/paramService'
import select_dap_ac from '@/service/DessertArea/selectServiceAC'
import select_dap_bc from '@/service/DessertArea/selectServiceBC'

import param_dsp from '@/service/DessertSelection/paramService'
import select_dsp_ac from '@/service/DessertSelection/selectServiceAC'
import select_dsp_bc from '@/service/DessertSelection/selectServiceBC'

export default {
  data() {
    return {
      // 参数组数组,tabsParamTree组件使用
      groupList: [],
      // 当前展开组的id,用来做手风琴效果
      currentExpandGroupId: null,
      // 每次只会展开一个组由currentExpandGroupId决定
      // 此变量决定是该组的哪个tab展开
      activeTab: 'bsp',
      // tabsParamTree的参数
      treeKey: +new Date(),
      defaultProps: {
        children: 'children',
        label: (data, node) => {
          const label = data['param_zh'] || data['standard'] || data['label']
          if (node.level === 3) {
            return label
          } else if (data.weight) {
            return `${label}【权重：${data.weight}】`
          } else {
            return `${label}【取值：${data.value}】`
          }
        },
      },
      labelData: [
        { label: '区块优选', name: 'bsp' },
        { label: '甜点区优选', name: 'dap' },
        { label: '甜点段优选', name: 'dsp' },
      ],
      // outDialog用于显示被编辑的组
      outerVisible: false, // 是否显示
      currentEditGroup: {}, // 正在被编辑的组
      currentEditGroupId: null, // 正在被编辑的组id
      dialogActiveTab: '', // 显示的tab-name
      needCheck: false, // 两种编辑,用此变量进行区分
      deleteData: [], // 保存被删除的各种节点
      fun: {
        bsp: [param_bsp, select_bsp_ac, select_bsp_bc],
        dap: [param_dap, select_dap_ac, select_dap_bc],
        dsp: [param_dsp, select_dsp_ac, select_dsp_bc],
      },
      // innerDialog参数
      innerVisible: false,
      innerDialogForm: {},
      innerDialogFormRules: {},
      innerDialogFormItemList: [],
      currentNode: null,
      // flag = 1 insert一级项
      // flag = 2 append添加二级项
      // flag = 3 insert select
      // flag = 4 edit一级项、二级项
      // flag = 5 edit select选项
      // flag = 6 设置一级项重要性关系
      // flag = 7 设置二级项重要性关系
      flag: -1,
      matrixHeader: [],
      matrix: null,
      total: {
        bsp: {
          // 计算一级参数权重时所得到的cr值
          cr2: -1,
          // 保存一级参数的权重
          w2: [],
          // 计算二级参数权重时得到的ci与ri,要求保证元素顺序
          ci2ri2: {
            // 一级参数id
            level1Id: {
              ci2: -1,
              ri2: -1,
            },
          },
        },
        dap: {},
        dsp: {},
      },
      currentLevel1Id: null,
      trans: {
        bsp: '区块优选',
        dap: '甜点区优选',
        dsp: '甜点段优选',
      },
    }
  },
  computed: { ...mapState(['ri']) },
  created() {
    this.initData()
  },
  components: {
    PageHeader,
    TabsParamTree,
    Matrix,
    AddBtn,
  },
  methods: {
    //——————————————————初始化相关——————————————————
    async initData() {
      openLoading('正在加载……')
      // 获取所有的组
      const groupArr = await groupService.get()
      // 排序,将逻辑删除的组排到后面
      this.sort(groupArr)
      await Promise.all(
        groupArr.map(async (group) => {
          // 初始化父子参数
          const res = await Promise.all([
            initParamData(group.id, param_bsp),
            initParamData(group.id, param_dap),
            initParamData(group.id, param_dsp),
          ])
          const paramListBsp = res[0]
          const paramListDap = res[1]
          const paramListDsp = res[2]
          group['bsp'] = paramListBsp || []
          group['dap'] = paramListDap || []
          group['dsp'] = paramListDsp || []
          // 给每个参数分配其select选项
          return Promise.all([
            this.helper1(paramListBsp, select_bsp_ac, select_bsp_bc),
            this.helper1(paramListDap, select_dap_ac, select_dap_bc),
            this.helper1(paramListDsp, select_dsp_ac, select_dsp_bc),
          ])
        })
      ).then(res=>{
        groupArr.forEach((group, index) => {
          // res[index]当前组的select数据
          // res[index][0] bsp的select数据
          this.helper2(group['bsp'], res[index][0])
          // res[index][1] dap的select数据
          this.helper2(group['dap'], res[index][1])
          // res[index][2] dsp的select数据
          this.helper2(group['dsp'], res[index][2])
        })
      })
      this.groupList = groupArr
      closeLoading()
    },
    helper1(paramList, select_ac, select_bc) {
      const p = []
      paramList.forEach((parentParam) => {
        parentParam.children.map(async (subParam) => {
          p.push(Promise.all([select_ac.getByPid(subParam.id), select_bc.getByPid(subParam.id)]))
        })
      })
      return Promise.all(p)
    },
    helper2(paramList, selectList) {
      let index = 0
      paramList.forEach((parentParam) => {
        parentParam.children.map(async subParam=> {
          subParam.children = [
            {
              label: '无烟煤',
              value: 'ac',
              children: [],
            },
            {
              label: '烟煤',
              value: 'bc',
              children: [],
            },
          ]
          if (selectList[index]) {
            subParam.children[0].children = selectList[index][0]
            subParam.children[1].children = selectList[index][1]
          }
          index++
        })
      })
    },
    sort(groupArr) {
      const activeArr = []
      const deleteArr = []
      let defaultGroup = null
      groupArr.forEach((group) => {
        if (group['is_default']) {
          defaultGroup = group
        } else if (group['is_active'] == 1) {
          activeArr.push(group)
        } else {
          deleteArr.push(group)
        }
      })
      groupArr.length = 0
      groupArr.push(defaultGroup, ...activeArr, ...deleteArr)
    },
    //——————————————————block组相关——————————————————
    addGroup() {
      this.$prompt('请输入组名', '提示', {
        showClose: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
        .then(({ value }) => {
          const id = guid()
          this.groupList.unshift({
            id,
            is_new: true,
            group_name: value,
            create_time: getNow(true),
            delete_time: null,
            is_default: 0,
            is_active: 1,
            bsp: [],
            dap: [],
            dsp: [],
          })
        })
        .catch((err) => {})
    },
    async setDefaultGroup(index, group) {
      try {
        openLoading('正在进行设置……请稍后')
        await groupService.setDefaultById(group.id).then((_) => initGPS())
        this.groupList.forEach((group) => (group['is_default'] = 0))
        group['is_default'] = 1
      } catch (err) {
        errorMsg(`设置失败，请重新尝试：${err}`)
      } finally {
        closeLoading()
      }
    },
    handlerLogicDelete(index, group) {
      if (this.groupList.length === 1) {
        this.$alert('当前只有一个组，不能删除', '错误', {
          type: 'error',
          callback: (action) => {},
        })
      } else if (group['is_default'] === 1) {
        this.$alert('请先设置其他组为默认组，再重新进行删除', '提示', {
          type: 'info',
          callback: (action) => {},
        })
      } else {
        groupService
          .deleteLogicByGid(group.id)
          .then((_) => {
            this.initData()
          })
          .catch((err) => {
            errorMsg(`删除失败，请重试：${err}`)
          })
      }
    },
    handlerRecover(index, group) {
      groupService
        .recover(group.id)
        .then((_) => this.initData())
        .catch((err) => errorMsg(`恢复失败，请重试：${err}`))
    },
    handlerDelete(index, group) {
      openLoading('正在处理……')
      const gid = group.id
      const pidArr = {
        bsp: [],
        dap: [],
        dsp: [],
      }
      // 找到所有需要被删除的param_id
      Object.keys(pidArr).forEach((key) => {
        group[key].forEach((parentParam) => {
          pidArr[key].push(parentParam.id)
          parentParam.children.forEach((subParam) => {
            pidArr[key].push(subParam.id)
          })
        })
      })
      // 删除组
      groupService
        .deleteByGid(gid)
        .then(() => {
          // 通过组id删除param
          return Promise.all(
            Object.keys(pidArr).map((key) => {
              return this.helperFun(key).deleteByGid(gid)
            })
          )
        })
        .then(() => {
          // 通过param_id删除其select选项
          return Promise.all(
            Object.keys(pidArr).map((key) => {
              return pidArr[key].map((pid) => {
                return Promise.all([
                  this.helperFun(key, 'ac').deleteByPid(pid),
                  this.helperFun(key, 'bc').deleteByPid(pid),
                ])
              })
            })
          )
        })
        .then(() => {
          this.groupList.splice(index, 1)
        })
        .catch((err) => {
          errorMsg(`删除失败，错误信息：${err}`)
        })
        .finally((_) => {
          closeLoading()
        })
    },
    switchTab({ flag, tab }) {
      if (flag) {
        this.dialogActiveTab = tab.name
      } else {
        this.activeTab = tab.name
      }
    },
    more({ id }) {
      this.currentExpandGroupId = this.currentExpandGroupId === id ? null : id
      this.activeTab = 'bsp'
    },
    handlerEditGroup(index, group, command) {
      if (command == 1) {
        this.needCheck = true
      }
      this.currentEditGroup = JSON.parse(JSON.stringify(group))
      this.dialogActiveTab = 'bsp'
      this.currentEditGroupId = group.id
      this.outerVisible = true
    },
    //——————————————————outdialog相关——————————————————
    /**
     * 移除项时
     */
    handlerRemove({ node, data }) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      const deleteOne = children.splice(index, 1)[0]
      // level记录被删除的节点是哪一级
      // which = []
      // which[0] 表示是哪个板块bsp还是dap还是dsp
      // which[1] 表示level4这个select是ac还是bc
      deleteOne['level'] = node.level
      deleteOne['which'] = [this.dialogActiveTab]
      if (node.level == 4) {
        deleteOne['which'].push(node.parent.label)
      }
      this.deleteData.push(deleteOne)
    },
    clearOutDialog() {
      this.outerVisible = false
      this.needCheck = false
      this.currentEditGroup = {}
      this.dialogActiveTab = ''
      this.currentEditGroupId = null

      this.deleteData = []
      this.treeKey = +new Date()
    },
    // 输入时进行单个检验，但是在保存的时候，需要进行总体一致性检测，并检查权重是否都齐全
    totalCheck() {
      const keys = ['bsp', 'dap', 'dsp']
      const temp = {}
      // 检查参数权重、子参数选项是否齐全
      keys.forEach((key) => {
        const tabLabel = this.trans[key]
        if (this.currentEditGroup[key].length == 0) {
          throw new Error(`${tabLabel}未设定参数`)
        }
        this.currentEditGroup[key].forEach((parentParam) => {
          const pzhname = parentParam['param_zh']
          const penname = parentParam['param_en']

          if (parentParam.weight == '') {
            throw new Error(
              `${tabLabel}的一级参数：<strong>${pzhname}（${penname}）</strong>的权重未设定`
            )
          } else if (parentParam.children.length == 0) {
            throw new Error(
              `${tabLabel}的一级参数：<strong>${pzhname}（${penname}）</strong>无子参数`
            )
          }
          parentParam.children.forEach((childParam) => {
            const czhname = childParam['param_zh']
            const cenname = childParam['param_en']
            if (childParam.weight == '') {
              throw new Error(
                `${tabLabel}的一级参数的子参数：<strong>${czhname}（${cenname}）</strong>的权重未设定`
              )
            } else if (childParam.children[0].children.length == 0) {
              throw new Error(
                `${tabLabel}的一级参数的子参数：<strong>${czhname}（${cenname}）</strong>的烟煤选项未设定`
              )
            } else if (childParam.children[1].children.length == 0) {
              throw new Error(
                `${tabLabel}的一级参数的子参数：<strong>${czhname}（${cenname}）</strong>的无烟煤选项未设定`
              )
            }
          })
        })
      })
      // 再次遍历,将temp中的数据进行补齐
      keys.forEach((key) => {
        temp[key]['cr2'] = this.total[key]['cr2']
        temp[key]['w2'] = this.total[key]['w2']
        temp[key]['ci2'] = []
        temp[key]['ri2'] = []
        this.currentEditGroup[key].forEach((parentParam) => {
          const pid = parentParam.id
          temp[key]['ci2'].push(this.total[key]['ci2ri2'][pid]['ci2'])
          temp[key]['ri2'].push(this.total[key]['ci2ri2'][pid]['ri2'])
        })
      })
      // 检查总体一致性
      keys.forEach((key) => {
        const tabLabel = this.trans[key]
        let CI2W2 = 0
        let RI2W2 = 0
        for (let i in temp[key]['w2']) {
          CI2W2 += temp[key]['w2'][i] * temp[key]['ci2'][i]
          RI2W2 += temp[key]['w2'][i] * temp[key]['ri2'][i]
        }
        const CR3 = temp[key]['cr2'] + CI2W2 / RI2W2
        if (CR3 > 0.1) {
          throw new Error(`${tabLabel}总体一致性不通过`)
        }
      })
    },
    async handlerSaveGroup() {
      try {
        // 说明是当前输入的权重都是相对重要性,将其转化成真正的权重
        // 转化结束后保存
        if (this.needCheck) {
          totalCheck()
        }
        // 遍历currentEditGroup
        // is_new = true 说明数据库中没有进行插入
        // is_new = false && hasChanged = true 说明数据库中存在数据需要进行更新
        openLoading('保存中……请稍后')
        const keys = ['bsp', 'dap', 'dsp']
        const p = this.currentEditGroup
        const d = this.deleteData
        const promiseList = []
        // 插入新组
        if (p['is_new']) {
          promiseList.push(groupService.insert(p))
        }
        keys.forEach((key) => {
          if (!p[key]) return
          // 遍历一级项
          p[key].forEach((level1) => {
            // 当前一级项是新的
            if (level1['is_new']) {
              promiseList.push(this.helperFun(key).insert(level1))
            } else if (level1['hasChanged']) {
              promiseList.push(this.helperFun(key).update(level1))
            }
            // 遍历一级项中的二级项进行相同的处理
            level1.children.forEach((level2) => {
              if (level2['is_new']) {
                promiseList.push(this.helperFun(key).insert(level2))
              } else if (level2['hasChanged']) {
                promiseList.push(this.helperFun(key).update(level2))
              }
              // 遍历二级项中的select选项
              level2.children[0].children.forEach((ac) => {
                if (ac['is_new']) {
                  promiseList.push(this.helperFun(key, 'ac').insert(ac))
                } else if (ac['hasChanged']) {
                  promiseList.push(this.helperFun(key, 'ac').update(ac))
                }
              })
              level2.children[1].children.forEach((bc) => {
                if (bc['is_new']) {
                  promiseList.push(this.helperFun(key, 'bc').insert(bc))
                } else if (bc['hasChanged']) {
                  promiseList.push(this.helperFun(key, 'bc').update(bc))
                }
              })
            })
          })
        })
        // 从数据库中删除数据
        d.forEach((item) => {
          const level = item['level']
          switch (level) {
            case 4:
              promiseList.push(this.helperDeleteLevel4(item))
              break
            case 2:
              promiseList.push(...this.helperDeleteLevel2(item))
              break
            case 1:
              promiseList.push(...this.helperDeleteLevel1(item))
              break
            default:
              break
          }
        })
        for (let p of promiseList) {
          await p
        }
        this.$alert('保存成功', '通知', {
          confirmButtonText: '确定',
          showClose: false,
          type: 'success',
          callback: () => {
            // 关闭dialog
            this.clearOutDialog()
            // 重新获取数据
            this.initData()
          },
        })
      } catch (err) {
        errorMsg(`保存失败。错误：${err}`)
      } finally {
        closeLoading()
      }
    },
    helperFun(block, which) {
      if (!which) {
        return this.fun[block][0]
      } else if (which == 'ac') {
        return this.fun[block][1]
      } else {
        return this.fun[block][2]
      }
    },
    helperDeleteLevel4(obj) {
      // which[0]表示是dsp、dap还是dsp
      // which[1]表示是ac还是bc
      const { which } = obj
      return this.helperFun(which[0], which[1]).deleteBySid(obj['id'])
    },
    helperDeleteLevel2(obj) {
      const p = []
      const block = obj['which'][0]
      if (!obj['is_new']) {
        p.push(this.helperFun(block).deleteByPid(obj['id']))
      }
      obj.children[0].children.forEach((ac) => {
        if (!ac['is_new']) {
          p.push(this.helperFun(block, 'ac').deleteBySid(ac['id']))
        }
      })
      obj.children[1].children.forEach((bc) => {
        if (!bc['is_new']) {
          p.push(this.helperFun(block, 'bc').deleteBySid(bc['id']))
        }
      })
      return p
    },
    helperDeleteLevel1(obj) {
      const p = []
      const block = obj['which'][0]
      if (!obj['is_new']) {
        p.push(this.helperFun(block).deleteByPid(obj['id']))
      }
      obj.children.forEach((level2) => {
        if (!level2['is_new']) {
          p.push(...this.helperDeleteLevel2(level2))
        }
      })
      return p
    },
    handlerEdit({ node, data }) {
      this.currentNode = data
      // 如果是编辑一级项、和二级项
      if (node.level <= 2) {
        this.flag = 4
        let a = list3['rules']
        let b = list3['itemList']
        const obj = {
          param_zh: data.param_zh,
          param_en: data.param_en,
        }
        if (!this.needCheck) {
          obj['weight'] = data.weight
          a = list1['rules']
          b = list1['itemList']
        }
        this.initInnerDialog(obj, a, b)
      } else if (node.level == 3) {
        this.flag = 5
        // 编辑的三级select选项
        this.initInnerDialog(
          {
            standard: data.standard,
            value: data.value,
          },
          list2['rules'],
          list2['itemList']
        )
      }
    },
    // 设置完重要性,满足要求后当场修改currentEditGroup的weight
    handlerSetLevel1Relative() {
      this.flag = 6
      // 初始化头部
      const header = []
      this.currentEditGroup[this.dialogActiveTab].forEach((p) =>
        header.push(`${p['param_zh']}`)
      )
      this.matrixHeader = header
      this.innerVisible = true
    },
    handlerSetLevel2Relative({ node, data }) {
      this.flag = 7
      const header = []
      data.children.forEach((p) => header.push(`${p['param_zh']}`))
      // 这是给哪个一级项添加二级项重要性关系
      this.currentLevel1Id = data.id
      this.matrixHeader = header
      this.innerVisible = true
      // 此时这个currentNode指向这个一级项,到时候可以通过currentNode进行子参数权重修改
      this.currentNode = data
    },
    // 插入一级项
    handlerInsert() {
      // 显示内部dialog,进行内容编辑
      this.flag = 1
      let a = list3['rules']
      let b = list3['itemList']
      if (!this.needCheck) {
        a = list1['rules']
        b = list1['itemList']
      }
      this.initInnerDialog(
        {
          // 表示这个一级项时数据库中没有的
          is_new: true,
          group_id: this.currentEditGroupId,
          id: guid(),
          param_zh: '',
          param_en: '',
          weight: '',
          parent: -1,
          children: [],
        },
        a,
        b
      )
    },
    // 插入二级项
    handlerAppend({ node, data }) {
      this.flag = 2
      this.currentNode = data
      let a = list3['rules']
      let b = list3['itemList']
      if (!this.needCheck) {
        a = list1['rules']
        b = list1['itemList']
      }
      this.initInnerDialog(
        {
          // 表示这个二级项是数据库中没有的
          is_new: true,
          group_id: this.currentEditGroupId,
          id: guid(),
          parent: node.key,
          param_zh: '',
          param_en: '',
          weight: '',
          children: [
            {
              label: '无烟煤',
              value: 'ac',
              children: [],
            },
            {
              label: '烟煤',
              value: 'bc',
              children: [],
            },
          ],
        },
        a,
        b
      )
    },
    // 插入四级项,select项
    handlerInsertSelect({ node, data }) {
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      this.currentNode = data
      this.flag = 3
      this.initInnerDialog(
        {
          // 表示这个select是数据库中没有的
          is_new: true,
          id: guid(),
          param_id: node.parent.key,
          standard: '',
          value: '',
        },
        list2.rules,
        list2.itemList
      )
    },

    //——————————————————innerdialog相关——————————————————
    initInnerDialog(dialogForm, rules, formList) {
      this.innerDialogForm = dialogForm
      this.innerDialogFormRules = rules
      this.innerDialogFormItemList = formList
      this.innerVisible = true
    },
    clearInnerDialog() {
      this.innerVisible = false
      // inner dialog form相关
      this.innerDialogForm = {}
      this.innerDialogFormItemList = []
      this.innerDialogFormRules = {}
      if (this.flag < 6) this.$refs.dialogEditFromRef.resetFields()
      this.currentNode = null
      // inner dialog matrix相关
      this.matrixHeader.length = 0
      this.matrix = null
      this.flag = -1
    },
    innerDialogConfirm() {
      try {
        if (this.flag < 6) {
          this.$refs.dialogEditFromRef.validate((value) => {
            if (!value) {
              errorMsg('输入内容不合法，请检查')
              return false
            }
            switch (this.flag) {
              case 1: // 插入的是一级父选项
                this.currentEditGroup[this.dialogActiveTab].push(
                  Object.assign({}, this.innerDialogForm)
                )
                break
              case 2: // 插入二级项
              case 3: // 插入select项,四级项
                this.currentNode.children.push(
                  Object.assign({}, this.innerDialogForm)
                )
                break
              case 4: // 修改一级、二级项
                this.currentNode.param_zh = this.innerDialogForm.param_zh
                this.currentNode.param_en = this.innerDialogForm.param_en
                this.currentNode.weight = this.innerDialogForm.weight
                this.currentNode['hasChanged'] = true
                break
              case 5: // 修改select项
                this.currentNode.standard = this.innerDialogForm.standard
                this.currentNode.value = this.innerDialogForm.value
                this.currentNode['hasChanged'] = true
                break
              default:
                break
            }
            return this.clearInnerDialog()
          })
        }
        if (this.matrixHeader.length == 0) {
          return this.clearInnerDialog()
        }
        if (this.flag == 6) {
          const { accept, data } = this.handlerMatrixCR()
          // 一级项的重要性设置完毕，检查一致性
          if (!accept) {
            return errorMsg(
              `一致性检测要求CR<=0.1，当前CR=${data.CR}，未通过一致性要求`
            )
          }
          this.total[this.dialogActiveTab]['w2'] = data['maxEigenVector']
          this.total[this.dialogActiveTab]['cr2'] = data['CR']
          // 修改currentEditGroup的一级参数权重
          this.currentEditGroup[this.dialogActiveTab].forEach((p, index) => {
            p['weight'] = data['maxEigenVector'][index]
          })
          this.treeKey = +new Date()
          // 关闭innerDialog
          return this.clearInnerDialog()
        }
        if (this.flag == 7) {
          const { accept, data } = this.handlerMatrixCR()
          const level1Id = this.currentLevel1Id
          // 二级项的重要性设置完毕，检查一致性
          if (!accept) {
            return errorMsg(
              `一致性检测要求CR<=0.1，当前CR=${data.CR}，未通过一致性要求`
            )
          }
          this.total[this.dialogActiveTab]['ci2ri2'][level1Id] = {
            ci2: data['CI'],
            ri2: data['RI'],
          }
          // 修改currentNode.children中的二级参数权重
          this.currentNode.children.forEach((p, index) => {
            p['weight'] = data['maxEigenVector'][index]
          })
          this.treeKey = +new Date()
          // 关闭innerDialog
          this.clearInnerDialog()
        }
      } catch (err) {
        errorMsg(err.message)
      }
    },
    handlerMatrixInput({ matrix }) {
      this.matrix = matrix
    },
    handlerMatrixCR() {
      this.checkMatrix()
      // 编辑的矩阵的维度
      const dim = this.matrixHeader.length
      // 得到该维度的矩阵的RI值
      const targetObj = this.ri.filter((item) => item.dim == dim)[0]
      if (targetObj == undefined) {
        throw new Error(`当前不存在矩阵维度为${dim}的RI取值`)
      }

      let maxEigenvalue, maxEigenVector
      if (dim == 1) {
        maxEigenvalue = 1
        maxEigenVector = [1]
      } else {
        const res = calcEigne(this.matrix)
        maxEigenvalue = res['maxEigenvalue']
        maxEigenVector = res['maxEigenVector']
      }
      let CR, CI, RI
      let accept
      // 如果是一维或者是二维矩阵
      if (dim <= 2) {
        CI = RI = CR = 0
      } else {
        // 二维以上
        RI = parseFloat(targetObj['ri'])
        CI = (maxEigenvalue - dim) / (dim - 1)
        CR = CI / RI
      }
      accept = CR <= 0.1
      return {
        accept,
        data: {
          maxEigenVector,
          CR,
          CI,
          RI,
        },
      }
    },
    // 检查矩阵是否输入完整
    checkMatrix() {
      const dim = this.matrixHeader.length
      for (let row = 0; row < dim; ++row) {
        for (let col = 0; col < dim; ++col) {
          if (parseFloat(this.matrix[row][col]) == 0.0) {
            throw new Error('矩阵中取值不能为0')
          }
        }
      }
    },
  },
}
</script>

<style scoped>
.active {
  height: 300px !important;
}

.block {
  margin-bottom: 24px;
  border: 1px solid #ebebeb;
  border-radius: 3px;
  transition: 0.2s;
}
.source {
  padding: 15px;
  font-size: 14px;
  position: relative;
}
.source:hover {
  background-color: WhiteSmoke;
}
.no-active {
  color: rgba(0, 0, 0, 0.3);
}
/* 右上角的默认brage */
.default {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  width: 40px;
  height: 40px;
  background-color: #ff6347;
  color: whitesmoke;
  top: 0;
  right: 0;
  transform: translate(30%, -30%);
  border-radius: 50%;
}
.meta {
  background-color: #fafafa;
  border-top: 1px solid #eaeefb;
  height: 0;
  overflow-y: scroll;
  transition: height 0.2s;
}
.control {
  border-top: 1px solid #eaeefb;
  height: 44px;
  line-height: 44px;
  box-sizing: border-box;
  background-color: #fff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  text-align: center;
  margin-top: -1px;
  color: #d3dce6;
  cursor: pointer;
  position: relative;
}
.control:hover {
  color: #409eff;
  background-color: #f9fafc;
}
</style>