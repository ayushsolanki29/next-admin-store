import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { cache } from "@/lib/cache";
import db from "@/lib/db";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const getMostPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    });
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
);
const getNewstProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { created: "desc" },
      take: 6,
    });
  },
  ["/", "getNewstProducts"],
  {
    revalidate: 60 * 60 * 24,
  }
);
const HomePage = () => {
  return (
    <main className="space-y-12">
      <ProductGridSelection
        title="Newest Products"
        productFetcher={getNewstProducts}
      />
      <ProductGridSelection
        title="Most Popular Products"
        productFetcher={getMostPopularProducts}
      />
    </main>
  );
};

export default HomePage;
type ProductGridSelectionProps = {
  productFetcher: () => Promise<Product[]>;
  title: string;
};
async function ProductGridSelection({
  productFetcher,
  title,
}: ProductGridSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between items-center">
        <h2 className="text-2xl text-gray-900 uppercase tracking-widest font-semibold">
          {title}
        </h2>
        <Button size={"sm"} variant={"outline"} asChild>
          <Link className="space-x-2" href={"/products"}>
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productFetcher={productFetcher} />
        </Suspense>
      </div>
    </div>
  );
}
async function ProductSuspense({
  productFetcher,
}: {
  productFetcher: () => Promise<Product[]>;
}) {
  return (await productFetcher()).map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
