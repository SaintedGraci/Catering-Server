require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate admin token
const token = jwt.sign(
  { id: 1, email: 'admin@example.com', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Generated Admin Token:', token);
console.log('\n📝 Testing Dish Creation API...\n');

// Test data
const dishData = {
  name: 'API Test Lechon',
  description: 'Crispy roasted pork',
  category: 'main_course',
  isAvailable: true,
  servingSize: 'Serves 15-20 people',
  preparationTime: 180
};

console.log('Sending request to: http://localhost:5000/api/dishes');
console.log('With data:', JSON.stringify(dishData, null, 2));
console.log('With Authorization header: Bearer', token.substring(0, 20) + '...');

fetch('http://localhost:5000/api/dishes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(dishData)
})
  .then(response => {
    console.log('\n📡 Response Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Dish created via API');
      console.log('Dish ID:', data.data.id);
      console.log('Dish Name:', data.data.name);
      console.log('Price field:', data.data.price);
    } else {
      console.log('\n❌ FAILED:', data.message);
    }
    process.exit(data.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
