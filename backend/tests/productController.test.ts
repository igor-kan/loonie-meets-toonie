// backend/tests/productController.test.ts
import request from "supertest";
import express from "express";
import { createProduct } from "../src/controllers/productController";

const app = express();
app.use(express.json());
app.post("/api/products", createProduct);

describe("Product Controller", () => {
  it("should create a new product and compute Canadian score", async () => {
    const productData = {
      asin: "B00TEST123",
      name: "Test Product",
      url: "https://amazon.ca/dp/B00TEST123",
      productDescription: "Test product proudly made in Canada."
    };

    const res = await request(app).post("/api/products").send(productData);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("asin", "B00TEST123");
    expect(typeof res.body.canadianScore).toBe("number");
  });
});
