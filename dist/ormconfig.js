"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'test',
    database: 'test',
    entities: ['src/**/entity/*.entity.{ts,js}'],
    synchronize: false,
    migrations: ['src/migrations/*.js'],
    migrationsTableName: 'migrations',
});
//# sourceMappingURL=ormconfig.js.map