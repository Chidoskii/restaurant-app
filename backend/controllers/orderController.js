async function createOrder(_req, res) {
  res.status(501).json({
    message: "Order creation has not been implemented yet",
  });
}

async function getOrderById(_req, res) {
  res.status(501).json({
    message: "Order retrieval has not been implemented yet",
  });
}

module.exports = {
  createOrder,
  getOrderById,
};