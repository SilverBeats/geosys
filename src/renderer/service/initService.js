// 首次启动，建库建表

import { guid } from '../utils/toolUtil'
// common数据库
import groupService from './groupService'
import riService from './riService'
// 导入区块优选的param、select数据
import bsid from '../assets/db/blockSelectionInitData.json'
import history_bs from './BlockSelection/historyService'
import param_bs from './BlockSelection/paramService'
import selectAC_bs from './BlockSelection/selectServiceAC'
import selectBC_bs from './BlockSelection/selectServiceBC'
// 导入甜点区的param、select数据
import daid from '@/assets/db/dessertAreaInitData.json'
import history_da from './DessertArea/historyService'
import param_da from './DessertArea/paramService'
import selectAC_da from './DessertArea/selectServiceAC'
import selectBC_da from './DessertArea/selectServiceBC'
// 导入甜点段的param、select数据
import dsid from '@/assets/db/dessertSectionInitData.json'
import history_ds from './DessertSelection/historyService'
import param_ds from './DessertSelection/paramService'
import selectAC_ds from './DessertSelection/selectServiceAC'
import selectBC_ds from './DessertSelection/selectServiceBC'

let gid = ''

export function init() {
  return new Promise(async (resolve, reject) => {
    try {
      // 创建表
      // 插入默认组
      const list = [createTableCommon, createTableBS, createTableDA, createTableDS, insertDefaultGroup, insertDefaultRi]
      for (let f of list) {
        await f()
      }
      await groupService.setDefaultById(gid)
      // 表创建结束后,进行初始数据插入
      await insertData(bsid, param_bs, selectAC_bs, selectBC_bs)
      await insertData(daid, param_da, selectAC_da, selectBC_da)
      await insertData(dsid, param_ds, selectAC_ds, selectBC_ds)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * 创建common数据库中的表
 */
function createTableCommon() {
  return Promise.all([
    groupService.createTable(),
    riService.createTable()
  ])
}
/**
 * 创建区块优选的数据库中表
 */
function createTableBS() {
  return Promise.all([
    history_bs.createTable(),
    param_bs.createTable(),
    selectAC_bs.createTable(),
    selectBC_bs.createTable()
  ])
}
/**
 * 创建甜点区的数据库中表
 */
function createTableDA() {
  return Promise.all([
    history_da.createTable(),
    param_da.createTable(),
    selectAC_da.createTable(),
    selectBC_da.createTable()
  ])
}
/**
 * 创建甜点段的数据库中表
 */
function createTableDS() {
  return Promise.all([
    history_ds.createTable(),
    param_ds.createTable(),
    selectAC_ds.createTable(),
    selectBC_ds.createTable()
  ])
}
/**
 * 插入默认组数据
 */
function insertDefaultGroup() {
  gid = guid()
  return groupService.insert({ group_name: '默认参数组', id: gid })
}
function insertDefaultRi() {
  const arr = [0, 0, 0.52, 0.89, 1.12, 1.26, 1.36]
  return Promise.all(arr.map((ri, index) => riService.insert({ dim: index + 1, ri })))
}

/**
 * 进行数据的插入
 */
function insertData(parentParamList, paramService, selectACService, selectBCService) {
  return new Promise(async (resolve, reject) => {
    try {
      // 遍历父参数
      for (let parentParam of parentParamList) {
        let pid = guid()
        parentParam['id'] = pid
        parentParam['group_id'] = gid
        // 插入父参数
        await paramService.insert(parentParam)
        for (let childrenParam of parentParam['children']) {
          let cpid = guid()
          childrenParam['id'] = cpid
          childrenParam['parent'] = pid
          childrenParam['group_id'] = gid
          // 插入子参数
          await paramService.insert(childrenParam)
          // 插入选项
          await Promise.all(
            childrenParam['select_table_ac'].map(option => {
              option['id'] = guid()
              option['param_id'] = cpid
              return selectACService.insert(option)
            })
          )
          await Promise.all(
            childrenParam['select_table_bc'].map(option => {
              option['id'] = guid()
              option['param_id'] = cpid
              return selectBCService.insert(option)
            })
          )
        }
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}