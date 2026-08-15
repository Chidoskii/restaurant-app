import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("okparas-cart");

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Could not load cart:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("okparas-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(item) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(itemId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }

  function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price =
          item.specialPrice !== null && item.specialPrice !== undefined
            ? item.specialPrice
            : item.price;

        return total + Number(price) * item.quantity;
      }, 0),
    [cartItems],
  );

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
