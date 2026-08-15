import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cartCount } = useCart();

  const getLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="site-header">
      <nav className="navbar container">
        <NavLink to="/" className="brand">
          Okpara&apos;s
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>

          <NavLink to="/menu" className={getLinkClass}>
            Menu
          </NavLink>

          <NavLink to="/about" className={getLinkClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={getLinkClass}>
            Contact
          </NavLink>

          <NavLink to="/cart" className={getLinkClass}>
            Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
