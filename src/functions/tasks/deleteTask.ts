import { HttpRequest, InvocationContext, HttpResponseInit } from "@azure/functions"
import { NotFoundError } from "../../models/common/Error"
import { taskRepository } from "../../repositories/taskRepository"
import { badRequest, ok } from "../../utils/response"

export const deleteTask = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  try {
    const id = request.params.id
    const organizationId = request.query.get('organizationId')
    if (!organizationId) {
      return badRequest('organizationId is required')
    }
    await taskRepository.delete(organizationId, id)
    return ok(null, 'Task deleted successfully')
  } catch (error) {
    context.log('Error deleting task:', error)
    if (error instanceof NotFoundError) {
      return badRequest('Task not found')
    }
    return badRequest('An error occurred while deleting the task')
  }
}