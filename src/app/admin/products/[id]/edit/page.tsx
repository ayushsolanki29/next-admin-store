import ProductForm from "@/components/ProductForm";
import PageHeader from "@/components/ui/PageHeader";
import { db }  from "@/lib/db";
import React from "react";

const EditProduct = async ({ params: { id } }: { params: { id: string } }) => {
  const product = await db.product.findUnique({
    where: {
      id,
    },
  });
  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
};

export default EditProduct;
