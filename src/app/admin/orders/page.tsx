import PageHeader from "@/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db }  from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

function getOrders() {
  return db.order.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      product: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
  });
}
const Orders = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Sales | Orders</PageHeader>
      </div>
      <UsersTable />
    </>
  );
};

export default Orders;

async function UsersTable() {
  const orders = await getOrders();
  if (orders.length === 0) return <p>No Order Found!!</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Price Paid</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.product.name}</TableCell>
            <TableCell>{order.user.email}</TableCell>
            <TableCell>
              {formatCurrency(order.pricePaidInCents / 100)}
            </TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a download href={`/admin/products/${order.id}/download`}>
                      Delete
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
