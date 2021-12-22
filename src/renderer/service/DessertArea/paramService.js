import BaseParamTable from '@/dao/base/base_param_table'
import finalUtil from '@/utils/finalUtil'
class ParamTable extends BaseParamTable {
  constructor() {
    super(finalUtil['da'])
  }
}
export default new ParamTable()