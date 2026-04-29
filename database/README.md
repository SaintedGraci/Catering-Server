# Database Documentation

This folder contains all database-related documentation and queries for the catering system.

## Files

- **schema.md** - Complete database schema documentation with table structures and relationships
- **queries.sql** - SQL queries for table creation and common operations
- **migrations.log** - History of database changes and migrations (to be updated)

## Quick Reference

### Current Tables
1. **users** - User accounts (admin, customer, staff)

### Setup Instructions

1. Ensure MySQL is running
2. Create database: `catering_db1`
3. Update `.env` file with database credentials
4. Run server to auto-sync tables: `npm start`
5. Create admin account: `npm run create-admin`

### Database Credentials
See `.env` file in root directory for current configuration.

### Backup Recommendations
- Regular backups recommended before major changes
- Use `mysqldump` for full database backups
- Keep migration history updated

## Maintenance

When adding new tables:
1. Create Sequelize model in `src/Models/`
2. Update `src/Models/index.js`
3. Document in `schema.md`
4. Add SQL queries to `queries.sql`
5. Update this README if needed
