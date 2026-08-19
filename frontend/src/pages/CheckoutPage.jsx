import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";
import { getPickupAvailability } from "../services/businessHoursService";

function CheckoutPage() {
  const { cartItems, cartSubtotal, clearCart } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    orderType: "pickup",
    pickupDate: "",
    pickupTime: "",
    specialInstructions: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [pickupSlots, setPickupSlots] = useState([]);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [slotMessage, setSlotMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.orderType !== "pickup" || !formData.pickupDate) {
      setPickupSlots([]);
      return;
    }

    async function loadPickupSlots() {
      try {
        setLoadingSlots(true);
        setSlotMessage("");

        const availability = await getPickupAvailability(formData.pickupDate);

        setPickupSlots(availability.slots);

        if (availability.isClosed) {
          setSlotMessage("The restaurant is closed on this day.");
        } else if (availability.slots.length === 0) {
          setSlotMessage("There are no pickup times available for this day.");
        }
      } catch (error) {
        console.error(error);
        setSlotMessage("Pickup times could not be loaded.");
        setPickupSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadPickupSlots();
  }, [formData.orderType, formData.pickupDate]);

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

      let requestedTime = null;

      if (formData.orderType === "pickup") {
        if (!formData.pickupDate || !formData.pickupTime) {
          setError("Please select a pickup date and time.");
          return;
        }

        requestedTime = `${formData.pickupDate}T${formData.pickupTime}:00`;
      }

      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        orderType: formData.orderType,

        pickupDate:
          formData.orderType === "pickup" ? formData.pickupDate : null,

        pickupTime:
          formData.orderType === "pickup" ? formData.pickupTime : null,

        specialInstructions: formData.specialInstructions,

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

  function getTodayDateString() {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return formatter.format(new Date());
  }

  function formatPickupTime(time) {
    const [hourString, minute] = time.split(":");

    const hour = Number(hourString);

    const suffix = hour >= 12 ? "PM" : "AM";

    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
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

                {formData.orderType === "pickup" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="pickupDate">Pickup Date</label>

                      <input
                        id="pickupDate"
                        name="pickupDate"
                        type="date"
                        required
                        min={getTodayDateString()}
                        value={formData.pickupDate}
                        onChange={(event) => {
                          setFormData((current) => ({
                            ...current,
                            pickupDate: event.target.value,
                            pickupTime: "",
                          }));
                        }}
                      />
                    </div>

                    {formData.pickupDate && (
                      <div className="form-group">
                        <label>Pickup Time</label>

                        {loadingSlots && <p>Loading pickup times...</p>}

                        {slotMessage && <p>{slotMessage}</p>}

                        {!loadingSlots && pickupSlots.length > 0 && (
                          <div className="pickup-slots">
                            {pickupSlots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                className={
                                  formData.pickupTime === time
                                    ? "pickup-slot pickup-slot-active"
                                    : "pickup-slot"
                                }
                                onClick={() =>
                                  setFormData((current) => ({
                                    ...current,
                                    pickupTime: time,
                                  }))
                                }
                              >
                                {formatPickupTime(time)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
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
