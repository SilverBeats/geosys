import AppDao from '../AppDao'
import { writeLog } from '@/utils/logUtil'

export default class BaseSelectTable {
  constructor(dbPath, tableName) {
    this.dao = new AppDao(dbPath)
    this.tableName = tableName
  }

  // 表创建
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        "id" text NOT NULL,
        "param_id" TEXT NOT NULL,
        "standard" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        PRIMARY KEY ("id")
      );
    `
    return this.dao.run(sql)
  }

  // 给该参数增加一个选项
  insert(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, param_id, standard, value } = obj
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`insert into ${this.tableName}(id, param_id, standard, value) values(?,?,?,?);`, [id, param_id, standard, value])
          })
          .then(_ =>this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, this.tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 根据选项id给该参数剔除一个选项
  deleteBySid(sid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`delete from ${this.tableName} where id = '${sid}'`)
          })
          .then(_ =>this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteBySid', err, this.tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 根据参数id删除选项
  deleteByPid(pid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`delete from ${this.tableName} where param_id = '${pid}'`)
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteByPid', err, this.tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 改,不能修改该选项归属的参数
  update(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, standard, value } = obj
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`
              update ${this.tableName}
              set 
              standard = ?,
              value = ?
              where id = ?
            `, [standard, value, id])
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('update', err, this.tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 根据pid查出一堆选项
  getByPid(pid) {
    return new Promise((resolve, reject) => {
      this.dao.all(`select * from ${this.tableName} where param_id = ?`, [pid])
        .then(res => {
          resolve(res)
        }).catch(err => {
          writeLog('getByPid', err, this.tableName)
          reject(err)
        })
    })
  }
}