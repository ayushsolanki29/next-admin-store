import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  name: string;
  priceInCents: number;
  description: string;
  id: string;
  imagePath: string;
};
const ProductCard = ({
  name,
  priceInCents,
  description,
  id,
  imagePath,
}: ProductCardProps) => {
  return (
    <Card className="flex overflow-hidden flex-col w-80">
      <div className="relative w-full h-auto aspect-video">
        <Image fill alt={name} src={imagePath} />
      </div>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{formatCurrency(priceInCents / 100)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild size={"lg"} className="w-full">
          <Link href={`/products/${id}/purchase`}>Purchase Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

export function ProductCardSkeleton() {
  return (
    <Card className="flex overflow-hidden flex-col w-80 animate-pulse">
      <div className="w-full aspect-video bg-gray-300" />
      <CardHeader>
        <CardTitle>
          <div className="w-3/4 h-6 rounded-full bg-gray-300" />
        </CardTitle>
        <CardDescription>
          <div className="w-1/2 h-4 rounded-full bg-gray-300" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-3/4 h-4 rounded-full bg-gray-300" />
      </CardContent>
      <CardFooter>
        <Button asChild size={"lg"} disabled className="w-full"></Button>
      </CardFooter>
    </Card>
  );
}
