import mysql from 'mysql2/promise';

export const dbRequest = async <T>(query: string, params: any[] = []): Promise<T> => {
    const connection = await mysql.createConnection({
        host: process.env.TIDB_HOST,
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        port: Number(process.env.TIDB_PORT) || 4000,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    try {
        const [rows] = await connection.execute(query, params);
        return rows as T;
    } finally {
        await connection.end();
    }
};
