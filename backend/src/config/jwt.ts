export default {
    secret: process.env.JWT_SECRET || 'fallbackSecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}