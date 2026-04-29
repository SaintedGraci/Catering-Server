require('dotenv').config();
const { connectDB } = require('../config/database');
const { User } = require('../src/Models');

const createAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@catering.com' } });
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }
    
    // Create admin account
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@catering.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin'
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@catering.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change thex password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
};

createAdmin();
