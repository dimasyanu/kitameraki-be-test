import { Filter } from './common/Filter'
import z from 'zod'

export enum TaskStatus {
  Open = 'open',
  Completed = 'completed',
  InProgress = 'in_progress',
  Pending = 'pending',
}

export const TaskStatusSchema = z.enum([
  TaskStatus.Open,
  TaskStatus.InProgress,
  TaskStatus.Completed,
  TaskStatus.Pending,
])

export const TaskSchema = z.object({
  id: z.string(),
  organizationId: z.string().min(1, 'Organization ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: TaskStatusSchema.default(TaskStatus.Open),
  priority: z
    .number()
    .default(3)
    .refine((val) => val >= 1 && val <= 10, {
      message: 'Priority must be between 1 and 10',
    }),
  tags: z.array(z.string()).optional(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Task = z.infer<typeof TaskSchema>

export interface TaskFilter extends Filter {
  organizationId: string
  status?: z.infer<typeof TaskStatusSchema>
  priority?: number
  tags?: string[]
  startDueDate?: Date
  endDueDate?: Date
}
