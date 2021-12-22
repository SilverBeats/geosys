import BaseParamTable from '@/dao/base/base_param_table'
import finalUtil from '@/utils/finalUtil'
class ParamTable extends BaseParamTable {
  constructor() {
    super(finalUtil['ds'])
  }
}
export default new ParamTable()