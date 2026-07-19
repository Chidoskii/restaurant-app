async function login(_req, res) {
  res.status(501).json({
    message: "Authentication has not been implemented yet",
  });
}

module.exports = {
  login,
};