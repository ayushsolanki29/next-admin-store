"use server";

import db from "@/lib/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, {
  message: "file Required",
});
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceIncents: z.coerce.number().min(1).int(),
  image: fileSchema.refine((file) => file.size > 0, "Required"),
  file: imageSchema.refine((file) => file.size > 0, "Required"),
});
const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});
export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }
  const data = result.data;
  await fs.mkdir("products", { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  await fs.mkdir("public/products", { recursive: true });
  const imgPath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imgPath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  const productSaved = await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceIncents,
      imagePath: imgPath,
      filePath,
    },
  });
  if (productSaved) {
    revalidatePath("/");
    revalidatePath("/products");
    redirect("/admin/products");
  }
}
export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });
  if (product == null) {
    return notFound();
  }

  let filePath = product.filePath;
  if (data.file && data.file.size > 0) {
    await fs.unlink(product.filePath);
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imgPath = product.imagePath;
  if (data.image && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`);
    imgPath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imgPath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  const productSaved = await db.product.update({
    where: { id },
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceIncents,
      imagePath: imgPath,
      filePath,
    },
  });

  if (productSaved) {
    revalidatePath("/");
    revalidatePath("/products");
    redirect("/admin/products");
  }
}
export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  revalidatePath("/");
  revalidatePath("/products");
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });
}
export async function deleteProduct(id: string) {
  const product: any = await db.product.delete({ where: { id } });

  if (product == null) return notFound();

  if (product.filePath && product.imagePath) {
    revalidatePath("/");
    revalidatePath("/products");
    await fs.unlink(product.filePath);
    await fs.unlink(`public${product.imagePath}`);
  } else {
    console.log("No file path or image path found for product");
  }
}
