import { Polybase } from '@polybase/client'

const POLYBASE = new Polybase({
  baseURL: `${process.env.REACT_APP_API_URL}/v0`,
})

export const SCHEMA_VERSION_CHUNK : string = `${process.env.POLYBASE_SCHEMA_TOP_LEVEL_NAME + '/' + process.env.POLYBASE_SCHEMA_VERSION}`

export const POLYBASE_SCHEMA_COLLECTION_URL : string = `${process.env.POLYBASE_SCHEMA_COLLECTIONS_BASE_URL + '/' + SCHEMA_VERSION_CHUNK}`
export const POLYBASE_SCHEMA_COLLECTION_EXPLORER_URL : string = `${process.env.POLYBASE_SCHEMA_COLLECTION_EXPLORER_BASE_URL + '/' + SCHEMA_VERSION_CHUNK}`

export default POLYBASE
