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
  const [result] = await executor.query(sql, values as unknown[]);

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
