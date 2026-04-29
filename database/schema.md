# Database Schema Documentation

## Database Information
- **Database Name**: catering_db1
- **Dialect**: MySQL
- **Host**: localhost
- **Port**: 3306 (default)

---

## Tables

### 1. Users Table

**Table Name**: `users`

**Description**: Stores user accounts for the catering system including admins, customers, and staff.

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (used for login) |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | ENUM | DEFAULT 'customer' | User role: 'admin', 'customer', or 'staff' |
| createdAt | DATETIME | NOT NULL | Timestamp when record was created |
| updatedAt | DATETIME | NOT NULL | Timestamp when record was last updated |

**Indexes**:
- Primary Key: `id`
- Unique Index: `email`
- Index: `role` (for filtering by role)

**Model Location**: `src/Models/User.js`

**Features**:
- Password hashing using bcrypt (10 salt rounds)
- Email validation
- Password comparison method: `user.comparePassword(password)`
- Automatic timestamp management

**Default Admin Account**:
- Email: `admin@catering.com`
- Password: `admin123` (change after first login)
- Role: `admin`

---

## Relationships

Currently no relationships defined. Future tables may include:
- Orders
- Menu Items
- Categories
- Bookings
- Payments

---

## Scripts

### Create Admin Account
```bash
npm run create-admin
```
Location: `scripts/createAdmin.js`

---

## Migration History

### Initial Setup (Current)
- Created `users` table with basic authentication fields
- Added role-based access control (admin, customer, staff)
- Implemented password hashing with bcrypt
- Created admin account creation script

---

## Future Enhancements

Potential tables to add:
- [ ] Menu Items
- [ ] Categories
- [ ] Orders
- [ ] Order Items
- [ ] Bookings/Reservations
- [ ] Payments
- [ ] Reviews
- [ ] Contact Messages
