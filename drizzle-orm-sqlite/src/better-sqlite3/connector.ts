import { Database, RunResult, Statement } from 'better-sqlite3';
import { Logger, MigrationConfig, readMigrationFiles } from 'drizzle-orm';
import { SQLiteSyncDatabase } from '~/db';
import { SQLiteDialect, SQLiteSyncDialect } from '~/dialect';
import { SQLiteDriver } from './driver';
import { BetterSQLiteSession } from './session';

export interface SQLiteConnectorOptions {
	logger?: Logger;
	dialect?: SQLiteDialect;
	driver?: SQLiteDriver;
}

export type SQLiteDatabase = SQLiteSyncDatabase<Statement, RunResult>;

export class SQLiteConnector {
	dialect: SQLiteSyncDialect;
	driver: SQLiteDriver;
	private session: BetterSQLiteSession | undefined;

	constructor(client: Database, options: SQLiteConnectorOptions = {}) {
		this.dialect = new SQLiteSyncDialect();
		this.driver = new SQLiteDriver(client, this.dialect, { logger: options.logger });
	}

	private getSession() {
		return this.session ?? (this.session = this.driver.connect());
	}

	connect(): SQLiteDatabase {
		const session = this.getSession();
		return new SQLiteSyncDatabase(this.dialect, session);
	}

	migrate(config: string | MigrationConfig) {
		const migrations = readMigrationFiles(config);
		const session = this.getSession();
		this.dialect.migrate(migrations, session);
	}
}