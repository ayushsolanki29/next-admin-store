import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import React, { Suspense } from "react";
import db from "@/lib/db";
import { cache } from "@/lib/cache";

const getProducts = cache(
  () => {
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  ["/products", "getProducts"],
  {
    revalidate: 60 * 60 * 24,
  }
);
const Products = () => {
  return (
    <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductSuspense />
      </Suspense>
    </div>
  );
};

export default Products;
async function ProductSuspense() {
  const products = await getProducts();
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
