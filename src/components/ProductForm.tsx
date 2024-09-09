"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { addProduct, updateProduct } from "@/app/admin/_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Product } from "@prisma/client";
import Image from "next/image";

const ProductForm = ({ product }: { product?: Product | null }) => {
  const [error, action] = useFormState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  );
  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name}
        />
        {error?.name && <div className="text-red-500">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          type="text"
          id="price"
          name="priceIncents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        <div className="text-muted-foreground">
          {priceInCents && formatCurrency((priceInCents || 0) / 100)}
        </div>
        {error?.priceIncents && (
          <div className="text-red-500">{error.priceIncents}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          defaultValue={product?.description}
          id="description"
          name="description"
          required
        />
        {error?.description && (
          <div className="text-red-500">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input type="file" id="file" name="file" required={product == null} />
        {error?.file && <div className="text-red-500">{error.file}</div>}
        <br />
        {product != null && (
          <a
            download
            href={product.filePath}
            className="text-white p-2 rounded-md bg-blue-400 mt-6"
          >
            Click to download - {product.filePath}
          </a>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {error?.image && <div className="text-red-500">{error.image}</div>}
        {product != null && (
          <>
            <Image
              src={product.imagePath}
              height={150}
              alt="Product Image"
              width={400}
            />
          </>
        )}
      </div>
      <SubmitButton product={product || null} />
    </form>
  );
};

export default ProductForm;

function SubmitButton({ product }: { product?: any }) {
  const { pending } = useFormStatus();
  if (product == null) {
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add Product"}
      </Button>
    );
  }
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update Product"}
    </Button>
  );
}
