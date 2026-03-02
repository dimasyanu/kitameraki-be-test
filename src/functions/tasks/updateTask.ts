import { HttpRequest, InvocationContext, HttpResponseInit } from "@azure/functions"
import { Task } from "../../models/task.model"
import { taskRepository } from "../../repositories/taskRepository"
import { badRequest, ok } from "../../utils/response"
import { NotFoundError } from "../../models/common/Error"

export const updateTask = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  try {
    const id = request.params.id
    const taskData = (await request.json()) as Task
    taskData.id = id // Ensure the ID from the URL is used
    const updatedTask = await taskRepository.update(taskData)
    return ok(updatedTask, 'Task updated successfully')
  } catch (error) {
    context.log('Error updating task:', error)
    if (error instanceof NotFoundError) {
      return badRequest('Task not found')
    }
    return badRequest('An error occurred while updating the task')
  }
}
