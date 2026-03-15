import { BulkOperationType, Container, PatchOperationType } from '@azure/cosmos'
import { Task, TaskFilter, TaskSchema } from '../models/task.model'
import { getTasksContainer } from '../infra/cosmosClient'
import { Paginated } from '../models/common/Paginated'
import { v4 as uuid } from 'uuid'
import { NotFoundError } from '../models/common/Error'

export class TaskRepository {
  private container: Container
  constructor() {
    getTasksContainer()
      .then((c) => {
        this.container = c
      })
      .catch((error) => {
        console.error('[TaskRepository] Failed to initialize container:', error)
        throw error
      })
  }

  /**
   * Fetches a paginated list of tasks based on the provided filter criteria.
   * @param filter - An object containing filtering and pagination options.
   * @returns A promise that resolves to a paginated list of tasks.
   */
  async getList(filter: TaskFilter): Promise<Paginated<Task>> {
    let baseQuery = `SELECT <selections> FROM Tasks c WHERE c.organizationId = @organizationId`
    const parameters = [
      { name: '@organizationId', value: filter.organizationId },
    ]

    if (filter.search) {
      baseQuery += ` AND CONTAINS(c.title, @search)`
      parameters.push({ name: '@search', value: filter.search })
    }
    if (filter.status) {
      baseQuery += ` AND c.status = @status`
      parameters.push({ name: '@status', value: filter.status })
    }
    if (filter.priority) {
      baseQuery += ` AND c.priority = @priority`
      parameters.push({ name: '@priority', value: filter.priority.toString() })
    }
    if (filter.tags && filter.tags.length > 0) {
      const tags: string[] = []
      for (let i = 0; i < filter.tags.length; i++) {
        tags.push(`@tag${i}`)
        parameters.push({ name: `@tag${i}`, value: filter.tags[i] })
      }
      baseQuery += ` AND ARRAY_CONTAINS_ANY(c.tags, ${tags.join(', ')})`
    }
    if (filter.startDueDate) {
      baseQuery += ` AND c.dueDate >= @startDueDate`
      parameters.push({
        name: '@startDueDate',
        value: filter.startDueDate.toISOString(),
      })
    }
    if (filter.endDueDate) {
      baseQuery += ` AND c.dueDate <= @endDueDate`
      parameters.push({
        name: '@endDueDate',
        value: filter.endDueDate.toISOString(),
      })
    }

    let query = baseQuery.replace('<selections>', '*')
    query += ` OFFSET @startIndex LIMIT @pageSize`
    parameters.push({
      name: '@startIndex',
      value: filter.startIndex.toString(),
    })
    parameters.push({ name: '@pageSize', value: filter.pageSize.toString() })

    // Fetch items
    const res: any[] = []
    try {
      const { resources } = await this.container.items
        .query({ query, parameters })
        .fetchAll()
      res.push(...resources)
    } catch (error) {
      console.error('[TaskRepository] Failed to fetch tasks:', error)
      throw error
    }

    // Fetch total count
    const totalCountQuery = baseQuery.replace('<selections>', 'VALUE COUNT(1)')
    const { resources: countResources } = await this.container.items
      .query({ query: totalCountQuery, parameters })
      .fetchAll()

    const totalCount = countResources[0] || 0

    return {
      items: res,
      totalCount,
      startIndex: filter.startIndex,
      pageSize: filter.pageSize,
    }
  }

  /**
   * Fetches a single task by its ID and organization ID.
   * @param organizationId - The ID of the organization to which the task belongs.
   * @param id - The ID of the task to fetch.
   * @returns A promise that resolves to the task if found, or null if not found.
   */
  async getById(organizationId: string, id: string): Promise<Task | null> {
    const query = `SELECT * FROM c WHERE c.organizationId = @organizationId AND c.id = @id`
    const parameters = [
      { name: '@organizationId', value: organizationId },
      { name: '@id', value: id },
    ]
    const { resources } = await this.container.items
      .query({ query, parameters })
      .fetchAll()
    return resources[0] || null
  }

  /**
   * Creates a new task in the database.
   * @param task - The task object to create. The ID and timestamps will be generated automatically.
   * @returns A promise that resolves to the created task with its assigned ID and timestamps.
   */
  async create(task: Task): Promise<Task> {
    const now = new Date()
    task.id = uuid()
    task.createdAt = now
    task.updatedAt = now
    const newTask = TaskSchema.parse(task) // Validate task data
    const { resource } = await this.container.items.create(newTask)
    return resource
  }

  /**
   * Updates an existing task in the database.
   * @param task - The task object with updated data. The ID must be provided.
   * @returns A promise that resolves to the updated task.
   * @throws An error if the task is not found.
   */
  async update(task: Task): Promise<Task> {
    const existingTask = await this.getById(task.organizationId, task.id)
    if (!existingTask) {
      throw new NotFoundError('Task not found')
    }
    const updatedTask = {
      ...existingTask,
      ...task,
      updatedAt: new Date(),
    }
    const validatedTask = TaskSchema.parse(updatedTask) // Validate task data
    const patchBody = Object.entries(validatedTask).map(([key, value]) => ({
      op: PatchOperationType.set,
      path: `/${key}`,
      value,
    }))
    const { resource } = await this.container
      .item(task.organizationId, task.id)
      .patch<Task>(patchBody)
    return resource
  }

  /**
   * Deletes a task by its ID and organization ID.
   * @param organizationId - The ID of the organization to which the task belongs.
   * @param id - The ID of the task to delete.
   * @returns A promise that resolves when the task is deleted.
   * @throws An error if the task is not found.
   */
  async delete(organizationId: string, id: string): Promise<void> {
    const existingTask = await this.getById(organizationId, id)
    if (!existingTask) {
      throw new NotFoundError('Task not found')
    }
    await this.container.item(id, id).delete()
  }

  /**
   * Deletes multiple tasks by their IDs and organization ID.
   * @param organizationId - The ID of the organization to which the tasks belong.
   * @param taskIds - An array of task IDs to delete.
   * @returns A promise that resolves when the tasks are deleted.
   */
  async bulkDelete(organizationId: string, taskIds: string[]): Promise<void> {
    const deleteOps = taskIds.map((id) => ({
      operationType: BulkOperationType.Delete,
      id,
      partitionKey: organizationId,
    }))
    await this.container.items.bulk(deleteOps)
  }
}

export const taskRepository = new TaskRepository()
