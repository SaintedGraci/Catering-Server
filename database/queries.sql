-- ============================================
-- CATERING SYSTEM DATABASE QUERIES
-- Database: catering_db1
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================

-- Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'customer', 'staff') DEFAULT 'customer',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Admin User (password is hashed version of 'admin123')
-- Note: Use the createAdmin.js script instead for proper bcrypt hashing
-- INSERT INTO `users` (`name`, `email`, `password`, `role`) 
-- VALUES ('Admin', 'admin@catering.com', '[HASHED_PASSWORD]', 'admin');

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all users
SELECT * FROM users;

-- View only admin users
SELECT * FROM users WHERE role = 'admin';

-- View user by email
SELECT * FROM users WHERE email = 'admin@catering.com';

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Update user role
-- UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Delete user by email
-- DELETE FROM users WHERE email = 'user@example.com';

-- ============================================
-- NOTES
-- ============================================
-- 1. Passwords are hashed using bcrypt (salt rounds: 10)
-- 2. Use scripts/createAdmin.js to create admin accounts
-- 3. Sequelize automatically manages createdAt and updatedAt timestamps
-- 4. Email field has unique constraint
