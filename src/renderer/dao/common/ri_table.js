import AppDao from '../AppDao'

import { writeLog } from '@/utils/logUtil'

const tableName = `ri_table`

export default class RiTable {
  constructor(dbPath) {
    this.dao = new AppDao(dbPath)
  }
  // 创建ri_table表
  createTable() {
    const sql = `
    CREATE TABLE "main"."ri_table" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "dim" integer NOT NULL ON CONFLICT REPLACE,
      "ri" real NOT NULL
    );
    `
    return this.dao.run(sql)
  }

  // 增加一组
  insert(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { dim, ri } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`insert into ${tableName}(dim,ri) values(?,?)`, [dim, ri]))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 物理删除一个组
  delete(id) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => this.dao.run(`delete from ${tableName} where id = ?`, [id]))
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteByGid', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 修改,只能修改该矩阵阶的ri取值
  update(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, ri } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`update ${tableName} set 'ri' = ? where id = ?`, [ri, id])
          )
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('update', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }
  // 获取全部
  get() {
    return new Promise((resolve, reject) => {
      this.dao.all(`select * from ${tableName} order by dim`)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          writeLog('get', err, tableName)
          reject(err)
        })
    })
  }
}