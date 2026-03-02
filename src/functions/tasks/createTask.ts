import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions'
import { taskRepository } from '../../repositories/taskRepository'
import { Task } from '../../models/task.model'
import { badRequest, created, internalServerError } from '../../utils/response'
import { ZodError } from 'zod'

export const createTask = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> => {
  try {
    const taskData = (await request.json()) as Task
    const newTask = await taskRepository.create(taskData)
    return created(newTask, 'Task created successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Invalid task data', (error as ZodError).message)
    }
    context.log('Error creating task:', error)
    return internalServerError('An error occurred while creating the task')
  }
}
