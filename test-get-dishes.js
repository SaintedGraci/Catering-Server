require('dotenv').config();

console.log('📋 Fetching all dishes from API...\n');

fetch('http://localhost:5000/api/dishes')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Response received:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log(`\n📊 Total dishes: ${data.data.length}`);
      data.data.forEach(dish => {
        console.log(`\n- ${dish.name} (${dish.category})`);
        console.log(`  ID: ${dish.id}`);
        console.log(`  Price: ${dish.price || 'N/A'}`);
        console.log(`  Available: ${dish.isAvailable}`);
      });
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
