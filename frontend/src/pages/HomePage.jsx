import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MenuCard from "../components/MenuCard";

import { getFeaturedItems, getTodaysMenu } from "../services/menuService";

function HomePage() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featuredData, todayData] = await Promise.all([
          getFeaturedItems(),
          getTodaysMenu(),
        ]);

        setFeaturedItems(featuredData);
        setTodaysMenu(todayData);
      } catch (err) {
        console.error(err);
        setError("Some menu information could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <p className="eyebrow">Welcome to Okpara&apos;s</p>

          <h1>Fresh flavors made for every moment.</h1>

          <p className="hero-description">
            Enjoy handcrafted meals, refreshing drinks, and a welcoming
            atmosphere.
          </p>

          <div className="hero-actions">
            <Link to="/menu" className="button button-primary">
              View Our Menu
            </Link>

            <Link to="/contact" className="button button-secondary">
              Visit Us
            </Link>
          </div>
        </div>
      </section>

      {loading && (
        <section className="section">
          <div className="container">
            <p>Loading menu...</p>
          </div>
        </section>
      )}

      {error && (
        <section className="section">
          <div className="container">
            <p>{error}</p>
          </div>
        </section>
      )}

      {!loading && todaysMenu.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Fresh today</p>

              <h2>Today&apos;s Specials</h2>

              <p>A rotating selection of items available today.</p>
            </div>

            <div className="menu-grid">
              {todaysMenu.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!loading && featuredItems.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Customer favorites</p>

              <h2>Featured Items</h2>
            </div>

            <div className="menu-grid">
              {featuredItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            <div className="section-actions">
              <Link to="/menu" className="button button-primary">
                Explore Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Our approach</p>

            <h2>A welcoming neighborhood dining experience</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Fresh Ingredients</h3>
              <p>
                Carefully selected ingredients prepared fresh for every order.
              </p>
            </article>

            <article className="feature-card">
              <h3>Made With Care</h3>
              <p>
                Every meal is prepared with attention to flavor and quality.
              </p>
            </article>

            <article className="feature-card">
              <h3>Friendly Atmosphere</h3>
              <p>A comfortable place to relax, eat, and spend time together.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
