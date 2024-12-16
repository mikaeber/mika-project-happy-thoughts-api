import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const port = process.env.PORT || 9000;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happy-thoughts";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const HappyThought = mongoose.model("HappyThought", {
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

app.get("/happy-thoughts", async (req, res) => {
  const happyThoughts = await HappyThought.find()
    .sort({ createdAt: "desc" })
    .limit(20);
  res.json(happyThoughts);
});

app.post("/happy-thoughts", async (req, res) => {
  const { message } = req.body;
  const happyThought = new HappyThought({ message });

  try {
    const savedThought = await happyThought.save();
    res.status(201).json(savedThought);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Could not save thought", error: err.errors });
  }
});

app.post("/happy-thoughts/:id/like", async (req, res) => {
  const { id } = req.params;
  const happyThought = await HappyThought.findById(id);

  if (!happyThought) {
    return res.status(404).json({ message: "Thought not found" });
  }

  try {
    happyThought.hearts += 1;
    await happyThought.save();
    res.status(200).json(happyThought);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Could not like thought", error: err.errors });
  }
});

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
