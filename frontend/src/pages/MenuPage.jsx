import { useEffect, useMemo, useState } from "react";

import MenuCard from "../components/MenuCard";

import { getCategories } from "../services/categoryService";
import { getMenu } from "../services/menuService";

function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMenuData() {
      try {
        const [categoryData, menuData] = await Promise.all([
          getCategories(),
          getMenu(),
        ]);

        setCategories(categoryData);
        setMenuItems(menuData);
      } catch (err) {
        console.error(err);
        setError("The menu could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadMenuData();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        item.categoryId === Number(selectedCategory);

      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  return (
    <section className="section page-section">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Explore our food</p>

          <h1>Our Menu</h1>

          <p>Browse our available food and drinks by category.</p>
        </div>

        <div className="menu-controls">
          <div className="category-filters">
            <button
              type="button"
              className={
                selectedCategory === "all"
                  ? "filter-button filter-button-active"
                  : "filter-button"
              }
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={
                  Number(selectedCategory) === category.id
                    ? "filter-button filter-button-active"
                    : "filter-button"
                }
                onClick={() => setSelectedCategory(String(category.id))}
              >
                {category.name}
              </button>
            ))}
          </div>

          <input
            type="search"
            className="menu-search"
            placeholder="Search the menu..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading && <p>Loading menu...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="empty-state">
            <h2>No menu items found</h2>
            <p>Try selecting another category or changing your search.</p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MenuPage;
