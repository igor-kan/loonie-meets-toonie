import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db');
export const db = drizzle(client); 