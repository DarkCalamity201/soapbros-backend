const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const allowedOrigins = ['https://soapbros.store'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// 👉 This line connects your /create-checkout-session route
const checkoutRoutes = require("./routes/checkout");
app.use("/create-checkout-session", checkoutRoutes);

// ✅ PORT for both local and Render
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
