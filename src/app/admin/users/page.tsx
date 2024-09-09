import PageHeader from "@/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import db from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {  MoreVertical } from "lucide-react";


function getUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
  });
}
const Users = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Users</PageHeader>
      </div>
      <UsersTable />
    </>
  );
};

export default Users;

async function UsersTable() {
  const users = await getUsers();
  if (users.length === 0) return <p>No Products Found!!</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Value</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((users) => (
          <TableRow key={users.id}>
            <TableCell>{users.email}</TableCell>
            <TableCell>{formatNumber(users.orders.length)}</TableCell>
            <TableCell>
              {formatCurrency(
                users.orders.reduce(
                  (sum, order) => sum + order.pricePaidInCents,
                  0
                ) / 100
              )}
            </TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a download href={`/admin/products/${users.id}/download`}>
                      Download
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
