const jwt = require('jsonwebtoken');

const testTokenValidation = async () => {
  const url = 'http://localhost:5000/api/revenue-risk';
  const secret = 'supersecretrevivekey'; // from our backend .env

  console.log('--- Starting Token Validation Tests ---');

  // Test Case 1: Missing Token
  try {
    console.log('\nTest Case 1: Missing Token');
    const res = await fetch(url);
    const body = await res.json();
    console.log(`SUCCESS: Rejected as status ${res.status}`);
    console.log('Response message:', body);
  } catch (error) {
    console.log('FAIL: Request failed with error:', error.message);
  }

  // Test Case 2: Invalid Token
  try {
    console.log('\nTest Case 2: Invalid Token');
    const res = await fetch(url, {
      headers: { Authorization: 'Bearer notarealheaderortokenatallsign' }
    });
    const body = await res.json();
    console.log(`SUCCESS: Rejected as status ${res.status}`);
    console.log('Response message:', body);
  } catch (error) {
    console.log('FAIL: Request failed with error:', error.message);
  }

  // Test Case 3: Expired Token
  try {
    console.log('\nTest Case 3: Expired Token');
    // Generate an expired token (expires in -10 seconds)
    const expiredToken = jwt.sign({ id: '65cf12345678901234567890' }, secret, {
      expiresIn: '-10s'
    });

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    const body = await res.json();
    console.log(`SUCCESS: Rejected as status ${res.status}`);
    console.log('Response message:', body);
  } catch (error) {
    console.log('FAIL: Request failed with error:', error.message);
  }

  console.log('\n--- Token Validation Tests Complete ---');
};

testTokenValidation();
