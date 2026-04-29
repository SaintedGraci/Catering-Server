const express = require('express');
const helmet = require('helmet');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.get('/', (req, res) => {
  res.send('Test server with Helmet');
});

app.listen(5001, () => {
  console.log('Test server running on port 5001');
  console.log('Test with: curl -I http://localhost:5001');
});
