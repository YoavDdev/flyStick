import React from "react";

const page = () => {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  async function retrieveProductPilatis() {
    try {
      const products = await prisma.ProductPilatis.findMany();
      console.log("ProductPilatis:");
      console.log(products);
    } catch (error) {
      console.error("Error retrieving products of Type 1:", error);
    } finally {
      await prisma.$disconnect();
    }
  }

  retrieveProductPilatis();

  return (
    <div>
      <h1>Pilatis</h1>
    </div>
  );
};

export default page;
