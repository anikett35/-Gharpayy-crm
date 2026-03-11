const jwt = require('jsonwebtoken')

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.agent = payload          // { id, email, role }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
