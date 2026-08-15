import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getOrderById } from "../services/orderService";

function OrderConfirmationPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getOrderById(orderId);

        setOrder(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading order...</p>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Unable to load order</h1>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-section">
      <div className="container narrow-container">
        <p className="eyebrow">Order received</p>

        <h1>Thank you!</h1>

        <p>
          Your order number is <strong>#{order.id}</strong>.
        </p>

        <div className="confirmation-card">
          <div className="summary-row">
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${Number(order.subtotal).toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Tax</span>
            <strong>${Number(order.tax).toFixed(2)}</strong>
          </div>

          <div className="summary-row">
            <span>Total</span>
            <strong>${Number(order.total).toFixed(2)}</strong>
          </div>
        </div>

        <h2>Items</h2>

        <div className="confirmation-items">
          {order.items.map((item) => (
            <div key={item.id} className="checkout-summary-item">
              <span>
                {item.quantity} × {item.itemName}
              </span>

              <strong>
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        <Link to="/menu" className="button button-primary">
          Back to Menu
        </Link>
      </div>
    </section>
  );
}

export default OrderConfirmationPage;
