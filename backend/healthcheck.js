const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

try {
  const req = http.request(options, (res) => {
    try {
      if (res.statusCode === 200) {
        process.exit(0);
      } else {
        console.error(`Health check failed with status code: ${res.statusCode}`);
        process.exit(1);
      }
    } catch (responseError) {
      console.error('Error processing HTTP response:', responseError);
      process.exit(1);
    }
  });

  // Explicitly set timeout on the request object
  req.setTimeout(2000, () => {
    req.destroy();
    process.exit(1);
  });

  req.on('error', (error) => {
    console.error('HTTP request error:', error);
    process.exit(1);
  }); 

  req.on('timeout', () => {
    req.destroy();
    process.exit(1);
  });

  req.end();
} catch (error) {
  console.error('Unexpected error during HTTP request:', error);
  process.exit(1);
}
 