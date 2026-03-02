import { app } from '@azure/functions'
import { getTasks } from '../functions/tasks/getTasks'
import { createTask } from '../functions/tasks/createTask'
import { updateTask } from '../functions/tasks/updateTask'
import { deleteTask } from '../functions/tasks/deleteTask'
import { bulkDeleteTasks } from '../functions/tasks/bulkDeleteTask'

app.http('GetTasks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'v1/tasks',
  handler: getTasks,
})

app.http('CreateTask', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/tasks',
  handler: createTask,
})

app.http('UpdateTask', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'v1/tasks/{id}',
  handler: updateTask,
})

app.http('DeleteTask', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'v1/tasks/{id}',
  handler: deleteTask,
})

app.http('DeleteManyTasks', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/tasks/delete-many',
  handler: bulkDeleteTasks,
})
