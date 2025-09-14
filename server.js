// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/razorpay", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "payment.html"));
});
// Route to get the key ID for the frontend
app.get("/get-razorpay-key", (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// Route to create an order
app.post("/create-order", async (req, res) => {
  try {
    console.log("Order creation request received:", req.body);
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise for INR)
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      error: "Error creating order",
      details: error.message,
    });
  }
});

// Route to verify payment
app.post("/verify-payment", async (req, res) => {
  try {
    console.log("Payment verification request:", req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment verification parameters",
      });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated signature:", generated_signature);
    console.log("Received signature:", razorpay_signature);

    if (generated_signature === razorpay_signature) {
      console.log("Payment verified successfully");
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.log("Payment verification failed: Signature mismatch");
      res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Error verifying payment",
      details: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Razorpay integration using key: ${process.env.RAZORPAY_KEY_ID}`);
});
