import { app } from '@azure/functions'

app.setup({
  enableHttpStream: true,
})

import './routes/settings'
import './routes/tasks'
