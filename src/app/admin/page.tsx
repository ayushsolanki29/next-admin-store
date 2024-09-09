import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/utils";
import React from "react";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  await wait(2000);
  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfsales: data._count,
  };
}
async function getUsersData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);
  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}
async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return {
    activeCount,
    inactiveCount,
  };
}
function wait(durestion: number) {
  return new Promise((resolve) => setTimeout(resolve, durestion));
}
const Dashboard = async () => {
  const [salesData, userData, productsData] = await Promise.all([
    getSalesData(),
    getUsersData(),
    getProductData(),
  ]);

  return (
    <div className="items-center mx-24 max-w-full justify-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <DashboardCard
        title="Customers"
        subtitle={` ${formatCurrency(
          userData.averageValuePerUser
        )} Avarage value`}
        body={`${formatNumber(userData.userCount)}`}
      />
      <DashboardCard
        title="Total Sales"
        subtitle={`Total Orders: ${formatNumber(salesData.numberOfsales)}`}
        body={formatCurrency(salesData.amount)}
      />
      <DashboardCard
        title="Active Products"
        subtitle={`${formatNumber(productsData.inactiveCount)} Inactive`}
        body={formatNumber(productsData.activeCount)}
      />
    </div>
  );
};

export default Dashboard;

interface DashboardCardProps {
  title: string;
  subtitle: string;
  body: string;
}
function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold leading-6 text-gray-900">{body}</p>
      </CardContent>
    </Card>
  );
}
