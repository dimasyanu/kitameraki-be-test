import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { badRequest, ok } from '../../utils/response'
import { taskRepository } from '../../repositories/taskRepository'

export const bulkDeleteTasks = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  const organizationId = request.query.get('organizationId')
  if (!organizationId) {
    return badRequest('organizationId is required')
  }

  try {
    const body = (await request.json()) as { taskIds: string[] }
    const { taskIds } = body
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return badRequest('taskIds must be a non-empty array')
    }

    await taskRepository.bulkDelete(organizationId, taskIds)
    return ok(null, 'Tasks deleted successfully')
  } catch (error) {
    context.error('An error occurred while deleting tasks', error)
    return badRequest('Invalid request body')
  }
}
