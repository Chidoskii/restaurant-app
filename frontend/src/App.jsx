import { useEffect, useState } from "react";
import { getCategories } from "./services/categoryService";
import { getMenu } from "./services/menuService";

function App() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryData, menuData] = await Promise.all([
          getCategories(),
          getMenu(),
        ]);

        setCategories(categoryData);
        setMenuItems(menuData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p>Loading café data...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <main>
      <h1>Okpara's</h1>

      <section>
        <h2>Categories</h2>

        {categories.map((category) => (
          <div key={category.id}>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Menu</h2>

        {menuItems.map((item) => (
          <article key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <strong>${Number(item.price).toFixed(2)}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;