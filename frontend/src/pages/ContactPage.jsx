function ContactPage() {
  return (
    <section className="section page-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Come see us</p>
          <h1>Contact and Location</h1>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <h2>Restaurant Information</h2>
            <p>123 Restaurant Street</p>
            <p>Pomona, California</p>
            <p>(555) 555-5555</p>
            <p>hello@okparas.com</p>
          </div>

          <div className="contact-card">
            <h2>Hours</h2>
            <p>Monday–Thursday: 8:00 AM–8:00 PM</p>
            <p>Friday–Saturday: 8:00 AM–10:00 PM</p>
            <p>Sunday: 9:00 AM–6:00 PM</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
