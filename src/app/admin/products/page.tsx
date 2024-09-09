import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import Link from "next/link";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "../_components/ProductAction";
import { Separator } from "@/components/ui/separator";

const Products = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Products</PageHeader>
        <Button>
          <Link href={"/admin/products/new"}>Add a new product</Link>
        </Button>
      </div>
      <ProductsTable />
    </>
  );
};

export default Products;

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } },
    },
    orderBy: {
      name: "asc",
    },
  });
  if (products.length === 0) return <p>No Products Found!!</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Available For Purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Order</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.isAvailableForPurchase ? (
                <>
                  <CheckCircle2 className="text-green-500" />
                  <span className="sr-only">Available</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" xlinkTitle="Unvailable" />
                  <span className="sr-only">Unvailable</span>
                </>
              )}
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              {product.priceInCents &&
                formatCurrency((product.priceInCents || 0) / 100)}
            </TableCell>
            <TableCell>{formatNumber(product._count.orders)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      Edit
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <a download href={`/admin/products/${product.id}/download`}>
                      Download
                    </a>
                  </DropdownMenuItem>
                  <ActiveToggleDropdownItem
                    id={product.id as string}
                    isAvailableForPurchase={
                      product.isAvailableForPurchase as boolean
                    }
                  />
                  <Separator />
                  <DeleteDropdownItem
                    id={product.id}
                    disabled={product._count.orders > 0}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
