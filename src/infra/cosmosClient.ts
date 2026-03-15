import {
  ConnectionMode,
  Container,
  CosmosClient,
  DatabaseResponse,
  PartitionKeyKind,
} from '@azure/cosmos'

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
const tasksContainerId = process.env.COSMOSDB_TASKS_CONTAINER
if (!tasksContainerId) {
  throw new Error('COSMOSDB_TASKS_CONTAINER is not defined.')
}
const settingsContainerId = process.env.COSMOSDB_SETTINGS_CONTAINER
if (!settingsContainerId) {
  throw new Error('COSMOSDB_SETTINGS_CONTAINER is not defined.')
}

console.log('[CosmosDB] Establishing Azure Cosmos DB connection..')
const client = new CosmosClient({
  endpoint,
  key,
  connectionPolicy: {
    connectionMode: ConnectionMode.Gateway,
  },
})

console.debug('[CosmosDB] Connection established successfully.')

const createContainerIfNotExists = async (
  containerId: string,
): Promise<Container> => {
  try {
    const dbResponse = await client.databases.createIfNotExists({
      id: databaseId,
    })
    const response = await dbResponse.database.containers.createIfNotExists({
      id: containerId,
      partitionKey: {
        kind: PartitionKeyKind.Hash,
        paths: ['/organizationId'],
      },
    })
    console.debug(
      '[CosmosDB] Container initialized successfully:',
      databaseId,
      '>',
      containerId,
    )
    return response.container
  } catch (error) {
    console.error(
      `[CosmosDB] Failed to initialize container '${containerId}':`,
      error,
    )
    throw error
  }
}

export const getTasksContainer = async (): Promise<Container> =>
  await createContainerIfNotExists(tasksContainerId)

export const getSettingsContainer = async (): Promise<Container> =>
  await createContainerIfNotExists(settingsContainerId)
