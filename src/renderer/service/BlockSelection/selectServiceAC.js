import BaseSelectTable from '@/dao/base/base_select_table'
import finalUtil from '@/utils/finalUtil'
class SelectTableAC extends BaseSelectTable {
  constructor() {
    super(finalUtil['bs'], 'select_table_ac')
  }
}
export default new SelectTableAC()