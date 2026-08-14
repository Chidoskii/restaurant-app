import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="section page-section">
      <div className="container error-page">
        <p className="eyebrow">404 error</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>

        <Link to="/" className="button button-primary">
          Return Home
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
