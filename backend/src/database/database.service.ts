import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { getRequiredDatabaseUrl } from "../config/env";
import {
  createDatabasePool,
  type DatabaseClient,
  type DatabaseQueryResult,
  executeQuery
} from "./mysql";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

export type TransactionClient = DatabaseClient;

@Injectable()
export class DatabaseService implements DatabaseClient, OnModuleDestroy {
  private readonly pool = createDatabasePool(getRequiredDatabaseUrl());

  async query<Row extends object = RowDataPacket>(
    text: string,
    params: readonly unknown[] = []
  ): Promise<DatabaseQueryResult<Row>> {
    return executeQuery<Row>(this.pool, text, params);
  }

  async transaction<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    const client = new MysqlTransactionClient(connection);

    try {
      await connection.beginTransaction();
      const result = await callback(client);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

class MysqlTransactionClient implements TransactionClient {
  constructor(private readonly connection: PoolConnection) {}

  async query<Row extends object = RowDataPacket>(
    text: string,
    params: readonly unknown[] = []
  ): Promise<DatabaseQueryResult<Row>> {
    return executeQuery<Row>(this.connection, text, params);
  }
}
