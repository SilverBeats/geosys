import AppDao from '../AppDao'

import { writeLog } from '@/utils/logUtil'
import { getNow } from '@/utils/toolUtil'

const tableName = `group_table`

export default class GroupTable {
  constructor(dbPath) {
    this.dao = new AppDao(dbPath)
  }
  // 创建group_table表
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      "id" TEXT NOT NULL,
      "group_name" TEXT NOT NULL,
      "create_time" date,
      "delete_time" date,
      "is_active" INTEGER NOT NULL DEFAULT 1,
      "is_default" INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY ("id")
    );
    `
    return this.dao.run(sql)
  }

  // 增加一组
  insert(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, group_name } = obj
        const create_time = obj['create_time'] || getNow(true)
        this.dao.run('begin;')
          .then(_ => this.dao.run(`insert into ${tableName}(id,group_name,create_time) values(?,?,?)`, [id, group_name, create_time])
          )
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 逻辑删除一组
  deleteLogicByGid(gid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`
              update ${tableName}
              set 
              delete_time = ?,
              is_active = 0
              where id = ?
             `, [getNow(true), gid])
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteLogicByGid', err, tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 物理删除一个组
  deleteByGid(gid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => this.dao.run(`delete from ${tableName} where id = ?`, [gid])
          )
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteByGid', err, tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 修改,只能修改组名
  update(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, group_name } = obj
        this.dao.run('begin;')
          .then(_ => {
            return this.dao.run(`
              update ${tableName} 
              set 
              'group_name' = ?
              where id = ?
            `, [group_name, id])
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('update', err, tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }
    })
  }

  // 设置某个组为默认
  setDefaultById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => this.dao.get(`select id from ${tableName} where is_default = 1`))
          .then(async res => {
            // 说明当前没有默认组
            if (res !== undefined && res.id !== id) {
              // 将之前的公式修改为非默认
              await this.dao.run(`update ${tableName} set is_default = 0 where id = ?`, [res.id])
            }
            // 将该id代表的组设置为默认
            return this.dao.run(`update ${tableName} set is_default = 1 where id = ?`, [id])
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('setDefaultById', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }

  // 获取默认组
  getDefault() {
    return new Promise((resolve, reject) => {
      this.dao.get(`select * from ${tableName} where is_default = 1`)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          writeLog('getDefault', err, tableName)
          reject(err)
        })
    })
  }

  // 获取全部组
  get() {
    return new Promise((resolve, reject) => {
      this.dao.all(`select * from ${tableName}`)
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          writeLog('get', err, tableName)
          reject(err)
        })
    })
  }

  // 获取一个组
  getByGid(gid) {
    return new Promise((resolve, reject) => {
      this.dao.get(`select * from ${tableName} where id = ?`, [gid])
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          writeLog('getByGid', err, tableName)
          reject(err)
        })
    })
  }

  // 恢复一个组
  recover(gid) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run(`begin;`)
          .then(_ => {
            return this.dao.run(`
          update ${tableName}
          set 
            is_active = 1,
            delete_time=''
          where id = ?
        `, [gid])
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('recover', err, tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }

    })
  }
}