const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/detect',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const data = JSON.stringify({
  message: 'CONGRATULATIONS! You\'ve won $5,000 in our lottery. To claim your prize, send $100 processing fee to account 12345.',
});

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsedData, null, 2));
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
