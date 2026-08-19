import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    orderType: "pickup",
    requestedTime: "",
    specialInstructions: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        ...formData,

        requestedTime: formData.requestedTime || null,

        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,

          optionIds: (item.selectedOptions || []).map(
            (option) => option.optionId,
          ),

          specialInstructions: item.specialInstructions || null,
        })),
      };

      const result = await createOrder(orderPayload);

      clearCart();

      navigate(`/order-confirmation/${result.orderId}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <section className="section page-section">
        <div className="container empty-state">
          <p className="eyebrow">Checkout</p>

          <h1>Your cart is empty</h1>

          <p>Add some menu items before checking out.</p>

          <Link to="/menu" className="button button-primary">
            View Menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Complete your order</p>

          <h1>Checkout</h1>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="customerName">Name *</label>

              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Email</label>

              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone</label>

              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="orderType">Order Type</label>

              <select
                id="orderType"
                name="orderType"
                value={formData.orderType}
                onChange={handleChange}
              >
                <option value="pickup">Pickup</option>

                <option value="dine-in">Dine In</option>
              </select>
            </div>

            {formData.orderType === "pickup" && (
              <div className="form-group">
                <label htmlFor="requestedTime">Requested Pickup Time</label>

                <input
                  id="requestedTime"
                  name="requestedTime"
                  type="datetime-local"
                  value={formData.requestedTime}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="specialInstructions">Order Notes</label>

              <textarea
                id="specialInstructions"
                name="specialInstructions"
                rows="4"
                placeholder="Allergies, pickup notes, etc."
                value={formData.specialInstructions}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="button button-primary checkout-submit"
              disabled={submitting}
            >
              {submitting ? "Submitting Order..." : "Place Order"}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Your Order</h2>

            {cartItems.map((item) => {
              const price =
                item.specialPrice !== null && item.specialPrice !== undefined
                  ? item.specialPrice
                  : item.price;

              return (
                <div key={item.id} className="checkout-summary-item">
                  <div>
                    <strong>
                      {item.quantity} × {item.name}
                    </strong>
                  </div>

                  <span>${(Number(price) * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}

            <div className="summary-row">
              <span>Estimated subtotal</span>

              <strong>${cartSubtotal.toFixed(2)}</strong>
            </div>

            <p className="summary-note">
              Tax and final pricing are calculated by the restaurant server when
              your order is submitted.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;
