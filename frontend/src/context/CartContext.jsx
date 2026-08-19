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
    const cartId = createCartId(item);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.cartId === cartId,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.cartId === cartId
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
          cartId,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(cartId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartId !== cartId),
    );
  }

  function updateQuantity(cartId, quantity) {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item,
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
      cartItems.reduce(
        (total, item) => total + Number(item.calculatedPrice) * item.quantity,
        0,
      ),
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

function createCartId(item) {
  const optionIds = (item.selectedOptions || [])
    .map((option) => option.optionId)
    .sort((a, b) => a - b)
    .join("-");

  const instructions = item.specialInstructions || "";

  return `${item.id}-${optionIds}-${instructions}`;
}
