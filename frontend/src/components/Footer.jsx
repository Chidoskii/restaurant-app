function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div>
          <h2>Okpara&apos;s</h2>
          <p>Fresh food, good coffee, and great company.</p>
        </div>

        <div>
          <p>123 Restaurant Street</p>
          <p>California, USA</p>
          <p>(555) 555-5555</p>
        </div>
      </div>

      <p className="copyright">
        © {new Date().getFullYear()} Okpara&apos;s. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
