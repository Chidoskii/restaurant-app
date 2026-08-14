import { NavLink } from "react-router-dom";

function Navbar() {
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
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
