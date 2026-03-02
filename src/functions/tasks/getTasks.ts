import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { badRequest, ok } from '../../utils/response'
import { taskRepository } from '../../repositories/taskRepository'
import { TaskStatusSchema } from '../../models/task.model'
import { z } from 'zod'

export const getTasks = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  const organizationId = request.query.get('organizationId')
  if (!organizationId) {
    return badRequest('organizationId is required')
  }

  const startIndex: number = parseInt(request.query.get('startIndex') || '0')
  const pageSize: number = parseInt(request.query.get('pageSize') || '10')
  const search: string = request.query.get('search') || ''
  const priority: number | undefined = request.query.get('priority')
    ? parseInt(request.query.get('priority')!)
    : undefined

  const _tags: string = request.query.get('tags')
  const tags: string[] | undefined =
    _tags && _tags.length > 0 ? _tags.split(',') : undefined

  const _status: string | undefined = request.query.get('status') || undefined
  let status: z.infer<typeof TaskStatusSchema> | undefined = undefined
  if (_status) {
    try {
      status = TaskStatusSchema.parse(_status) // Validate status value
    } catch {
      return badRequest('Invalid status value')
    }
  }

  let _startDate: string | undefined =
    request.query.get('startDate') || undefined
  let startDate: Date | undefined = undefined
  if (_startDate) {
    try {
      startDate = new Date(_startDate)
    } catch (error) {
      return badRequest('Invalid startDate format')
    }
  }

  const _endDate: string | undefined = request.query.get('endDate') || undefined
  let endDate: Date | undefined = undefined
  if (_endDate) {
    try {
      endDate = new Date(_endDate)
    } catch (error) {
      return badRequest('Invalid endDate format')
    }
  }

  const { items, totalCount } = await taskRepository.getList({
    organizationId,
    startIndex,
    pageSize,
    search,
    status,
    priority,
    tags,
    startDueDate: startDate,
    endDueDate: endDate,
  })

  return ok(
    {
      items,
      totalCount,
    },
    'Tasks retrieved successfully',
  )
}
