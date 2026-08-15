import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartPage() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  if (cartItems.length === 0) {
    return (
      <section className="section page-section">
        <div className="container empty-state">
          <p className="eyebrow">Your order</p>
          <h1>Your cart is empty</h1>

          <p>Browse the menu and add something you'd like to order.</p>

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
          <p className="eyebrow">Your order</p>
          <h1>Shopping Cart</h1>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => {
              const displayedPrice =
                item.specialPrice !== null && item.specialPrice !== undefined
                  ? item.specialPrice
                  : item.price;

              return (
                <article key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h2>{item.name}</h2>

                    <p>${Number(displayedPrice).toFixed(2)} each</p>
                  </div>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong className="cart-item-total">
                    ${(Number(displayedPrice) * item.quantity).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>${cartSubtotal.toFixed(2)}</strong>
            </div>

            <p className="summary-note">
              Tax and final total will be calculated during checkout.
            </p>

            <Link
              to="/checkout"
              className="button button-primary checkout-button"
            >
              Continue to Checkout
            </Link>

            <button
              type="button"
              className="clear-cart-button"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
