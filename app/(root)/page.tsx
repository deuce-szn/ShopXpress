
import ProductList from "@/components/ui/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.action";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
   
  return <>
  <ProductList data={latestProducts} title="Latest Arrivals"
  limit={4} />
  </>;
}
 
export default Homepage;