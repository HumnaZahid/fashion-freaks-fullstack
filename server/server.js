const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// 1. Load Environment Variables
dotenv.config();

const app = express();

// 2. Middlewares
app.use(cors()); // Frontend aur Backend ke darmiyan communication ke liye
app.use(express.json()); // JSON data handle karne ke liye

// 3. MongoDB Connection Logic
const connectDB = async () => {
  try {
    // process.env.MONGO_URI wo link uthayega jo humne .env mein rakhi hai
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Agar connect na ho toh server band kar do
  }
};

// Start Connection
connectDB();

// 4. Routes Integration
// Humein apne banaye hue product routes ko yahan connect karna hai
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Chatbot Secure Route
app.post("/api/chatbot", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are 'Fashion Freaks AI', the official virtual support for the Fashion Freaks online store. You assist clients with finding items, orders, return workflows, sizing metrics cheerfully."
          },
          ...messages
        ]
      })
    });

    const data = await groqResponse.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("Chatbot route error:", error);
    res.status(500).json({ error: "AI server offline" });
  }
});

// 5. Basic Test Route
app.get("/", (req, res) => {
  res.send("Fashion Freaks API is up and running...");
});

// 6. Port Configuration
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
  });
}

module.exports = app;
