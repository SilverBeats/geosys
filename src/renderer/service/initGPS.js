// 初始化默认组gid、paramData、selectData
import MyError from '../pojo/MyError'
import { initParamData, initSelectOption } from '../utils/initUtil'

import groupService from './groupService'
import riService from './riService'
// 区块优选
import param_bs from './BlockSelection/paramService'
import select_bs_ac from './BlockSelection/selectServiceAC'
import select_bs_bc from './BlockSelection/selectServiceBC'
// 甜点区优选
import param_da from './DessertArea/paramService'
import select_da_ac from './DessertArea/selectServiceAC'
import select_da_bc from './DessertArea/selectServiceBC'
// 甜点段优选
import param_ds from './DessertSelection/paramService'
import select_ds_ac from './DessertSelection/selectServiceAC'
import select_ds_bc from './DessertSelection/selectServiceBC'

import store from '../store'

export function initVuex() {
  return new Promise((resolve, reject) => {
    initRi()
      .then(ri => {
        store.commit('setRi', { ri })
        return initGPS()
      }).then(res => resolve(res))
      .catch(err => reject(err))
  })
}

export function initGPS() {
  return new Promise((resolve, reject) => {
    initDefaultGroup()
      .then(gid => {
        store.commit('setGid', { gid })
        return Promise.all(
          [
            baseInit(gid, param_bs, select_bs_ac, select_bs_bc, 'bsp'),
            baseInit(gid, param_da, select_da_ac, select_da_bc, 'dap'),
            baseInit(gid, param_ds, select_ds_ac, select_ds_bc, 'dsp')
          ]
        )
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
  })
}

/**
 * 公共的初始化数据的函数
 * @param {*} gid 
 * @param {*} param 
 * @param {*} select_ac 
 * @param {*} select_bc 
 * @param {*} which 
 * @returns 
 */
function baseInit(gid, param, select_ac, select_bc, which) {
  return new Promise((resolve, reject) => {
    initParamData(gid, param).then(paramData => {
      store.commit('setParamData', { paramData, which })
      return initSelectOption(store.state.paramData[which], select_ac)
    }).then(selectData => {
      store.commit('setSelectData', { selectData, type: 'ac', which })
      return initSelectOption(store.state.paramData[which], select_bc)
    }).then(selectData => {
      store.commit('setSelectData', { selectData, type: 'bc', which })
      resolve()
    }).catch(err => {
      reject(new MyError(err, 'baseInit发生错误'))
    })
  })
}

/**
 * 获取默认组id
 * @returns 
 */
function initDefaultGroup() {
  return new Promise((resolve, reject) => {
    groupService.getDefault()
      .then(res => resolve(res.id))
      .catch(err => reject(new MyError(err, '获取默认分组失败，请刷新重试')))
  })
}

/**
 * 初始化RI
 */
function initRi() {
  return new Promise((resolve, reject) => {
    riService.get()
      .then(res => resolve(res))
      .catch(err => reject(new MyError(err, '获取RI失败')))
  })
}