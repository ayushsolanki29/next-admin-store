import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Expired = () => {
  return (
    <div className="text-center">
      {/* create download link expired page with tailwind css and cool UI  */}
      <h1
        className="
      text-2xl text-center text-red-500 font-bold py-10 
      leading-tight max-w-md mx-auto

      "
      >
        Your download link has expired.
      </h1>
      <Button asChild size={"lg"}>
        <Link href={"/orders"}>Get New Link</Link>
      </Button>
    </div>
  );
};

export default Expired;
