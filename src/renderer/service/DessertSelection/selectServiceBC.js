import BaseSelectTable from '@/dao/base/base_select_table'
import finalUtil from '@/utils/finalUtil'
class SelectTableBC extends BaseSelectTable {
  constructor() {
    super(finalUtil['ds'], 'select_table_bc')
  }
}
export default new SelectTableBC()