import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('balloon_colors_enum').asEnum(['blue', 'green', 'red']).execute()

  await db.schema
    .createTable('balloons')
    .addColumn('id', 'bigserial', col => col.primaryKey())
    .addColumn('user_id', 'bigint', col =>
      col.references('users.id').onDelete('restrict').notNull()
    )
    .addColumn('color', sql`balloon_colors_enum`, col => col.notNull())
    .addColumn('created_at', 'timestamp', col => col.notNull())
    .addColumn('updated_at', 'timestamp', col => col.notNull())
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('balloons').execute()

  await db.schema.dropType('balloon_colors_enum').execute()
}
