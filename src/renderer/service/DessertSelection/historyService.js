import BaseHistoryTable from "@/dao/base/base_history_table";
import finalUtil from '@/utils/finalUtil'
class HistoryTable extends BaseHistoryTable {
  constructor() {
    super(finalUtil['ds'])
  }
}
export default new HistoryTable()
