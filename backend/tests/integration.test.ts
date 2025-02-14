// backend/tests/integration.test.ts
import request from "supertest";
import express from "express";
import productRoutes from "../src/routes/productRoutes";
import voteRoutes from "../src/routes/voteRoutes";
import { errorHandler } from "../src/middleware/errorHandler";

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/votes", voteRoutes);
app.use(errorHandler);

describe("API Integration Tests", () => {
  it("POST /api/products should create a new product", async () => {
    const productData = {
      asin: "B00TEST123",
      name: "Test Product",
      url: "https://amazon.ca/dp/B00TEST123",
      productDescription: "A test product proudly made in Canada."
    };

    const response = await request(app)
      .post("/api/products")
      .send(productData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("asin", "B00TEST123");
    expect(typeof response.body.canadianScore).toBe("number");
  });

  it("GET /api/products/:asin should retrieve the product", async () => {
    const asin = "B00TEST123";
    const response = await request(app).get(`/api/products/${asin}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("asin", asin);
  });

  it("POST /api/votes should record a vote", async () => {
    const voteData = {
      productId: 1,
      userId: "test-user",
      vote: 1,
      review: "Great product!"
    };

    const response = await request(app)
      .post("/api/votes")
      .send(voteData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("userId", "test-user");
  });
});
