const jwt = require('jsonwebtoken');

// Function to generate a secure token
exports.generateSecureToken = function(userId) {
    // Ensure you have JWT_SECRET set in your environment variables
    const secret = process.env.JWT_SECRET; 

    // Create a token with the user ID embedded
    const token = jwt.sign({ userId }, secret, { expiresIn: '1h' }); // Token expires in 1 hour

    return token;
}

// Function to verify and decode a secure token
exports.verifyToken = function(token) {
    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        return decoded.userId; // Returns the userId if token is valid
    } catch (error) {
        console.error('Error verifying token:', error);
        return null; // Return null or handle error as needed
    }
}
