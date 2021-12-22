import AppDao from '../AppDao'

import { writeLog } from '@/utils/logUtil'
const tableName = `param_table`

export default class BaseParamTable {
  constructor(dbPath) {
    this.dao = new AppDao(dbPath)
  }
  // 表的创建
  createTable() {
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        "id" text NOT NULL,
        "param_en" text NOT NULL ON CONFLICT ROLLBACK,
        "param_zh" text NOT NULL,
        "weight" real DEFAULT 0,
        "parent" text,
        "group_id" text
      );
    `
    return this.dao.run(createSql)
  }

  // 增加参数
  insert(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, param_en, param_zh, weight, parent, group_id } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`
        insert into ${tableName}(id,param_en,param_zh,weight,parent,group_id) values(?,?,?,?,?,?)
      `, [id, param_en, param_zh, weight, parent, group_id]))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 删除一组参数
  deleteByGid(gid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => this.dao.run(`delete from ${tableName} where group_id = '${gid}' `))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteByGid', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 删除一行参数
  deleteByPid(pid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => this.dao.run(`delete from ${tableName} where id = '${pid}'`))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteByPid', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 修改,组id和parent不能修改
  update(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, param_en, param_zh, weight } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`
            update ${tableName} 
            set 
            'param_en' = ?,
            'param_zh' = ?,
            'weight' = ?
            where id = ?
          `, [param_en, param_zh, weight, id]))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('update', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 获取一组参数
  getByGid(gid) {
    return new Promise((resolve, reject) => {
      this.dao.all(`select * from ${tableName} where group_id = '${gid}'`)
        .then(res => {
          resolve(res)
        }).catch(err => {
          writeLog('getByGid', err, tableName)
          reject(err)
        })
    })
  }

  // 获取一个参数
  getByPid(pid) {
    return new Promise((resolve, reject) => {
      this.dao.all(`select * from ${tableName} where id = '${pid}'`)
        .then(res => {
          resolve(res)
        }).catch(err => {
          writeLog('getByPid', err, tableName)
          reject(err)
        })
    })
  }
}