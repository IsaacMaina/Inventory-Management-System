import { getProducts, getCategoriesWithHierarchy } from '@/actions/categoryActions';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';
import ProductsClient from './ProductsClient';

const ProductsPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Get user context from the session
    const user = await getCurrentUserFromSession();

    const [products, categories] = await Promise.all([
      getProducts(user),
      getCategoriesWithHierarchy(user)
    ]);

    initialData = { products, categories };
  } catch (error) {
    console.error('Error fetching products data:', error);
    error = (error as Error).message;
  }

  // If there was an error and no data, provide empty default data instead of null
  if (!initialData && error) {
    initialData = {
      products: [],
      categories: []
    };
  }

  return <ProductsClient initialData={initialData} />;
};

export default ProductsPage;