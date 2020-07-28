import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsSTR =
        (await AsyncStorage.getItem('@GoMarketplace:cart')) || '';
      setProducts(JSON.parse(productsSTR));
    }

    loadProducts();
  }, []);

  const saveData = useCallback(async () => {
    await AsyncStorage.setItem('@GoMarketplace:cart', JSON.stringify(products));
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      setProducts([...products, { ...product, quantity: 1 }]);
      await saveData();
    },
    [products, saveData],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productsWithIncrementQTD = products.map<Product>(product => {
        if (product.id === id) {
          const incremented = { ...product, quantity: product.quantity + 1 };
          return incremented;
        }
        return product;
      });
      setProducts(productsWithIncrementQTD);
      await saveData();
    },
    [products, saveData],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsWithDecrementedQTD = products.map<Product>(product => {
        if (product.id === id) {
          const decremented = { ...product, quantity: product.quantity - 1 };
          return decremented;
        }
        return product;
      });
      setProducts(productsWithDecrementedQTD);
      await saveData();
    },
    [products, saveData],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
