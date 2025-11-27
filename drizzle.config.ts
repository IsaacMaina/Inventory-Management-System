import { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_L4HiSpzFC3lv@ep-snowy-fire-a459v17o-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
} satisfies Config;