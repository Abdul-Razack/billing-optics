import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import * as schema from '../db/schema';

export type DbType = NodePgDatabase<typeof schema>;
export type TxType = PgTransaction<any, typeof schema, ExtractTablesWithRelations<typeof schema>>;
export type DbOrTx = DbType | TxType;
