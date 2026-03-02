import { HttpResponseInit } from '@azure/functions'

export const badRequest = (message: string, data?: any): HttpResponseInit => ({
  status: 400,
  jsonBody: {
    message: message,
    data: data,
  },
})

export const internalServerError = (
  message: string = 'Internal Server Error',
  data?: any,
): HttpResponseInit => ({
  status: 500,
  jsonBody: {
    message: message,
    data: data,
  },
})

export const notFound = (message: string = 'Not Found'): HttpResponseInit => ({
  status: 404,
  jsonBody: {
    message: message,
    data: undefined,
  },
})

export const ok = (data: any, message: string = 'OK'): HttpResponseInit => ({
  status: 200,
  jsonBody: {
    message: message,
    data: data,
  },
})

export const created = (data: any, message: string = 'Created'): HttpResponseInit => ({
  status: 201,
  jsonBody: {
    message: message,
    data: data,
  },
})