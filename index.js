const express = require("express");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 8000;
const { MongoClient, ServerApiVersion } = require("mongodb");
// Init Express
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// MongoDB URI For Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@syedsadibd.a5hvdhf.mongodb.net/?retryWrites=true&w=majority&appName=syedsadibd`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// DB Connection
async function run() {
  try {
    // Database and Collections here
    const productCollection = client
      .db("miniEcommerceDB")
      .collection("products");

    // Get ll Products Routes
    app.get("/products", async (req, res) => {
      try {
        const { search, brand, category, minPrice, maxPrice, sortBy } =
          req.query;

        let query = {};

        if (search) {
          query.productName = { $regex: new RegExp(search, "i") };
        }

        // Filter by brand
        if (brand) {
          query.brandName = brand;
        }

        // Filter by category
        if (category) {
          query.category = category;
        }

        // Filter by price range
        if (minPrice && maxPrice) {
          query.price = {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice),
          };
        } else if (minPrice) {
          query.price = { $gte: parseFloat(minPrice) };
        } else if (maxPrice) {
          query.price = { $lte: parseFloat(maxPrice) };
        }

        let sort = {};

        // Sorting
        if (sortBy === "lowToHigh") {
          sort.price = 1;
        } else if (sortBy === "highToLow") {
          sort.price = -1;
        } else if (sortBy === "newestFirst") {
          sort.creationDateTime = -1;
        }

        const products = await productCollection
          .find(query)
          .sort(sort)
          .toArray();
        res.json(products);
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error retrieving products", error: err });
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`Server is Running On Port ${port}`);
});

// Listen Server
app.listen(port, () => {
  console.log(`Server is Running On PORT ${port}`);
});
