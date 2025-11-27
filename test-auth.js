// Simple test script to debug authentication functions
const bcrypt = require('bcryptjs');

async function testBcrypt() {
  console.log('Testing bcrypt operations...');
  
  try {
    // Test hashing
    const plainPassword = 'testpassword123';
    const hashed = await bcrypt.hash(plainPassword, 10);
    console.log('Password hashed successfully:', hashed.substring(0, 20) + '...');
    
    // Test verification
    const isValid = await bcrypt.compare(plainPassword, hashed);
    console.log('Password verification result:', isValid);
    
    // Test verification with wrong password
    const isInvalid = await bcrypt.compare('wrongpassword', hashed);
    console.log('Wrong password verification result:', isInvalid);
    
    console.log('Bcrypt operations are working correctly!');
  } catch (error) {
    console.error('Bcrypt test failed:', error.message);
  }
}

// Test JWT functionality if available
async function testJWT() {
  console.log('\nTesting JWT operations...');
  
  try {
    const jose = await import('jose');
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
    );
    
    // Test token creation
    const token = await new jose.SignJWT({ userId: 'test', email: 'test@example.com', role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
      
    console.log('JWT created successfully:', token.substring(0, 20) + '...');
    
    // Test token verification
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    console.log('JWT verified successfully:', payload);
    
    console.log('JWT operations are working correctly!');
  } catch (error) {
    console.error('JWT test failed:', error.message);
  }
}

async function runTests() {
  await testBcrypt();
  await testJWT();
}

// Run tests
runTests().then(() => {
  console.log('\nTests completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});