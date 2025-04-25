const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  "lavender-soap": { name: "Lavender Soap", price: 499 },
  "coffee-scrub": { name: "Coffee Scrub Soap", price: 499 },
  "lumber-scrub": { name: "Lumber Scrub Soap", price: 499 }
};

router.post("/", async (req, res) => {
  const cart = req.body.cart;

  const line_items = cart.map(item => ({
    price_data: {
      currency: "usd",
      product_data: { name: PRODUCTS[item.id].name },
      unit_amount: PRODUCTS[item.id].price,
    },
    quantity: item.quantity
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://soapbros.store/success.html",
      cancel_url: "https://soapbros.store/checkout.html"
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
