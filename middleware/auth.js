const jwt = require("jsonwebtoken");
const config = require("config");
// the purpose of this function is to make sure the logged in user
// has a valid token to update data, if not the user will be denied
function auth(req, res, next) {
  // get the value from the header
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Please login to continue");
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (error) {
    // 400 bad req
    // 401 unauthorized
    // 403 forbidden
    // internal server error
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
