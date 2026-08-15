import { useCart } from "../context/CartContext";

function MenuCard({ item }) {
  const { addToCart } = useCart();

  const displayedPrice =
    item.specialPrice !== null && item.specialPrice !== undefined
      ? item.specialPrice
      : item.price;

  return (
    <article className="menu-card">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="menu-card-image" />
      ) : (
        <div className="menu-card-image-placeholder">
          <span>{item.name}</span>
        </div>
      )}

      <div className="menu-card-content">
        {item.categoryName && (
          <span className="menu-card-category">{item.categoryName}</span>
        )}

        <div className="menu-card-heading">
          <h3>{item.name}</h3>

          <strong>${Number(displayedPrice).toFixed(2)}</strong>
        </div>

        <p>{item.description}</p>

        {item.specialNote && <p className="special-note">{item.specialNote}</p>}

        <button
          type="button"
          className="button button-primary menu-card-button"
          onClick={() => addToCart(item)}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default MenuCard;
