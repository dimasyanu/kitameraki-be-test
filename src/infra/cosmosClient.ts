import { ConnectionMode, CosmosClient, DatabaseResponse } from '@azure/cosmos'

const endpoint = process.env.COSMOSDB_ENDPOINT
if (!endpoint) {
  throw new Error('COSMOSDB_ENDPOINT is not defined.')
}
const key = process.env.COSMOSDB_KEY
if (!key) {
  throw new Error('COSMOSDB_KEY is not defined.')
}
const databaseId = process.env.COSMOSDB_DATABASE
if (!databaseId) {
  throw new Error('COSMOSDB_DATABASE is not defined.')
}
const containerId = process.env.COSMOSDB_CONTAINER
if (!containerId) {
  throw new Error('COSMOSDB_CONTAINER is not defined.')
}

console.log(
  '[CosmosDB] Establishing Azure Cosmos DB connection:',
  endpoint,
  'Database:',
  databaseId,
  'Container:',
  containerId,
)
const client = new CosmosClient({ endpoint, key })

let database: DatabaseResponse;
async function initializeCosmosDB() {
  database = await client.databases.createIfNotExists({ id: databaseId })
}

initializeCosmosDB().catch((error) => {
  console.error('[CosmosDB] Initialization failed:', error)
  process.exit(1)
})

export const container = client.database(databaseId).container(containerId)

client.databases
  .createIfNotExists({ id: databaseId })
  .then(() => {
    console.log(`[CosmosDB] Database '${databaseId}' is ready.`)
    return client
      .database(databaseId)
      .containers.createIfNotExists({ id: containerId })
  })
  .then(() => {
    console.log(`[CosmosDB] Container '${containerId}' is ready.`)
  })
  .catch((error) => {
    console.error('[CosmosDB] Error setting up database and container:', error)
  })
