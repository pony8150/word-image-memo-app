import {
  createPool as createMysqlPool,
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket
} from "mysql2/promise";

export interface DatabaseQueryResult<Row extends object = RowDataPacket> {
  rows: Row[];
  insertId: number;
  affectedRows: number;
}

export interface DatabaseClient {
  query<Row extends object = RowDataPacket>(
    text: string,
    params?: readonly unknown[]
  ): Promise<DatabaseQueryResult<Row>>;
}

type DatabaseExecutor = Pool | PoolConnection;

interface MysqlErrorLike {
  code?: string;
  sqlMessage?: string;
  sqlState?: string;
  message?: string;
}

export class DatabaseQueryError extends Error {
  readonly code: string | null;
  readonly sqlState: string | null;
  readonly query: string;
  readonly isSchemaMismatch: boolean;
  readonly cause?: unknown;

  constructor(input: {
    message: string;
    code?: string | null;
    sqlState?: string | null;
    query: string;
    isSchemaMismatch: boolean;
    cause?: unknown;
  }) {
    super(input.message);
    this.name = "DatabaseQueryError";
    this.code = input.code || null;
    this.sqlState = input.sqlState || null;
    this.query = input.query;
    this.isSchemaMismatch = input.isSchemaMismatch;
    this.cause = input.cause;
  }
}

export function createDatabasePool(databaseUrl: string): Pool {
  const connectionUrl = new URL(databaseUrl);

  return createMysqlPool({
    host: connectionUrl.hostname,
    port: Number(connectionUrl.port || "3306"),
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: decodeURIComponent(connectionUrl.pathname.replace(/^\//, "")),
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
    charset: "utf8mb4"
  });
}

export async function executeQuery<Row extends object = RowDataPacket>(
  executor: DatabaseExecutor,
  text: string,
  params: readonly unknown[] = []
): Promise<DatabaseQueryResult<Row>> {
  const { sql, values } = compileParameterizedQuery(text, params);

  let result: Row[] | ResultSetHeader;

  try {
    const queryResult = await executor.query(sql, values as unknown[]);
    result = queryResult[0] as Row[] | ResultSetHeader;
  } catch (error) {
    throw toDatabaseQueryError(error, sql);
  }

  if (Array.isArray(result)) {
    return {
      rows: result as Row[],
      insertId: 0,
      affectedRows: 0
    };
  }

  const header = result as ResultSetHeader;

  return {
    rows: [],
    insertId: Number(header.insertId || 0),
    affectedRows: Number(header.affectedRows || 0)
  };
}

function compileParameterizedQuery(
  text: string,
  params: readonly unknown[]
): { sql: string; values: unknown[] } {
  const values: unknown[] = [];
  const sql = text.replace(/\$(\d+)/g, (_match, indexText: string) => {
    const paramIndex = Number(indexText) - 1;

    if (paramIndex < 0 || paramIndex >= params.length) {
      throw new Error(`Missing SQL parameter $${indexText}.`);
    }

    values.push(params[paramIndex]);
    return "?";
  });

  return { sql, values };
}

function toDatabaseQueryError(error: unknown, sql: string): DatabaseQueryError {
  if (error instanceof DatabaseQueryError) {
    return error;
  }

  const mysqlError = asMysqlError(error);
  const message = mysqlError?.sqlMessage || mysqlError?.message || "Unknown database error";

  return new DatabaseQueryError({
    message,
    code: mysqlError?.code || null,
    sqlState: mysqlError?.sqlState || null,
    query: normalizeSqlForLogs(sql),
    isSchemaMismatch: isSchemaMismatchError(mysqlError),
    cause: error
  });
}

function asMysqlError(error: unknown): MysqlErrorLike | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  return error as MysqlErrorLike;
}

function isSchemaMismatchError(error: MysqlErrorLike | null): boolean {
  const code = String(error?.code || "");
  const message = String(error?.sqlMessage || error?.message || "").toLowerCase();

  if (
    [
      "ER_BAD_FIELD_ERROR",
      "ER_NO_SUCH_TABLE",
      "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD",
      "WARN_DATA_TRUNCATED"
    ].includes(code)
  ) {
    return true;
  }

  return [
    "unknown column",
    "unknown table",
    "doesn't exist",
    "data truncated for column",
    "incorrect value"
  ].some((fragment) => message.includes(fragment));
}

function normalizeSqlForLogs(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}
