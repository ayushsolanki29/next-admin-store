import ProductForm from "@/components/ProductForm";
import PageHeader from "@/components/ui/PageHeader";
import React from "react";

const NewProducts = () => {
  return (
    <>
      <PageHeader>Add New Product</PageHeader>
      <ProductForm/>
    </>
  );
};

export default NewProducts;
