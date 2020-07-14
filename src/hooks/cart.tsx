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
      const productsAsync = await AsyncStorage.getItem('@cart:products');
      if (productsAsync) {
        const prod = JSON.parse(productsAsync);
        setProducts(prod);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const productFind = products.filter(prod => prod.id === product.id)[0];

      if (productFind) {
        const productsUpdated = products.map(prod => {
          if (prod.id === product.id) {
            prod.quantity += 1;
          }
          return prod;
        });
        setProducts(productsUpdated);
      } else {
        const newProduct: Product = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        };
        setProducts([...products, newProduct]);
      }
      await AsyncStorage.removeItem('@cart:products');
      await AsyncStorage.setItem('@cart:products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const productsUpdated = products.map(prod => {
        if (prod.id === id) {
          prod.quantity += 1;
        }
        return prod;
      });
      setProducts(productsUpdated);
      await AsyncStorage.removeItem('@cart:products');
      await AsyncStorage.setItem('@cart:products', JSON.stringify(products));
      // products.map((product, index) => {
      //   if (product.id === id) {
      //     products[index].quantity += 1;
      //   }
      //   return product;
      // });
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsUpdated = products.map(prod => {
        if (prod.id === id) {
          if (prod.quantity > 1) {
            prod.quantity -= 1;
          }
        }
        return prod;
      });
      setProducts(productsUpdated);
      await AsyncStorage.removeItem('@cart:products');
      await AsyncStorage.setItem('@cart:products', JSON.stringify(products));
    },
    [products],
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
