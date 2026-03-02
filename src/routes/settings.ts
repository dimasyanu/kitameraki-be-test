import { app } from '@azure/functions'
import { getFormSettings } from '../functions/settings/getFormSettings'
import { saveFormSettings } from '../functions/settings/saveFormSettings'

app.http('GetFormSettings', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'v1/forms',
  handler: getFormSettings,
})

app.http('SaveFormSettings', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'v1/forms/{id}',
  handler: saveFormSettings,
})
