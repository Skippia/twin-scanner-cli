import process from 'node:process'

import { z } from 'zod'

const envValitatorSchema = z.object({
  TORRENT_URL: z.string(),
})

export const environments = envValitatorSchema.parse({

  TORRENT_URL: process.env.VITE_APP_TORRENT_URL,
})
