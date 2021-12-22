import BaseSelectTable from '@/dao/base/base_select_table'
import finalUtil from '@/utils/finalUtil'
class SelectTableBC extends BaseSelectTable {
  constructor() {
    super(finalUtil['da'], 'select_table_bc')
  }
}
export default new SelectTableBC()