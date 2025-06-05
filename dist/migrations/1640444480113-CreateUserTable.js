"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1640444480113 = void 0;
class CreateUserTable1640444480113 {
    constructor() {
        this.name = 'CreateUserTable1640444480113';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`User\` (\`id\` varchar(255) NOT NULL, \`name\` varchar(30) NOT NULL, \`email\` varchar(60) NOT NULL, \`password\` varchar(30) NOT NULL, \`signupVerifyToken\` varchar(60) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`User\``);
    }
}
exports.CreateUserTable1640444480113 = CreateUserTable1640444480113;
//# sourceMappingURL=1640444480113-CreateUserTable.js.map