const express = require("express");
const router = express.Router();

// Stripe setup with fallback error
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is missing in environment variables.");
  }
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} catch (err) {
  console.error("Stripe initialization error:", err.message);
}

// Product catalog
const PRODUCTS = {
  "lavender-soap": { name: "Lavender Soap", price: 499 },
  "coffee-scrub": { name: "Coffee Scrub Soap", price: 499 },
  "lumber-scrub": { name: "Lumber Scrub Soap", price: 499 }
};

// POST /create-checkout-session
router.post("/", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured correctly." });
  }

  const cart = req.body.cart;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Cart is empty or invalid." });
  }

  try {
    const line_items = cart.map(item => {
      const product = PRODUCTS[item.id];
      if (!product) {
        throw new Error(`Invalid product ID: ${item.id}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://soapbros.store/success.html",
      cancel_url: "https://soapbros.store/checkout.html"
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: "Something went wrong during checkout." });
  }
});

module.exports = router;
