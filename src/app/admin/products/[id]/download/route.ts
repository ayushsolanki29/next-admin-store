import { db }  from "@/lib/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const products = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      filePath: true,
      id: true,
      name: true,
    },
  });
  if (!products) {
    return notFound();
  }
  const { size } = await fs.stat(products.filePath);
  const file = await fs.readFile(products.filePath);
  const extension = products.filePath.split(".").pop();
  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename=${products.name}.${extension}`,
      "Content-Length": size.toString(),
      "Content-Type": `application/${extension}`,
      // 1 day
      "Cache-Control": "public, max-age=86400",
      // No cache
      "Surrogate-Control": "no-store",
      "Vary": "Accept-Encoding",
      // Set ETag
      "ETag": `"${products.id}"`,
      // Enable gzip compression
      "Content-Encoding": "gzip",
      // Enable HTTP/2 Push
      "Link": `<${req.nextUrl.pathname}/download>; rel="push"`,
    
    },
  });
}
