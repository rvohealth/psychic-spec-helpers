import { Dream } from '@rvoh/dream'
import { DBClass } from '../../types/db.js'
import { connectionTypeConfig, schema } from '../../types/dream.js'
import { globalTypeConfig } from '../../types/dream.globals.js'

export default class ApplicationModel extends Dream {
  declare public DB: DBClass

  public get schema() {
    return schema
  }

  public override get connectionTypeConfig() {
    return connectionTypeConfig
  }

  public override get globalTypeConfig() {
    return globalTypeConfig
  }
}
