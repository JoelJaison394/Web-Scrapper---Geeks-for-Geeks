const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors());

app.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const url = `https://auth.geeksforgeeks.org/user/${username}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Scrape profile information
    const name = $('.profile_name').text().trim();
    const institution = $('.basic_details_data a').text().trim();
    const longestStrek = $('.streakCnt.tooltipped').text().trim();
    const rank = $('.rankNum').text().trim();
    const coddingScore = $('.score_card_value').text().trim();
    const overallScore = coddingScore.slice(0, 3);
    const solvedProblemsCount = coddingScore.slice(3).replace(/_/g, '');
    const totalSubmissions = $('.heatmap_header .numProblems').text().trim();
    // ... add more data points as needed

    // Scrape solved problems
    const solvedProblems = [];
    $('.problemdiv .row .col.m6.s12')
      .find('.problemLink')
      .each((_, element) => {
        const question = $(element).text().trim();
        const link = $(element).attr('href');
        solvedProblems.push({ question, link });
      });

    // Construct the profile object
    const profile = {
      name,
      username,
      institution,
      rank,
      overallScore,
      solvedProblemsCount,
      longestStrek,
      totalSubmissions,
      solvedProblems,
      // ... add more data points as needed
    };

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});




const ratingSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
});

const Rating = mongoose.model("Rating", ratingSchema);





app.get("/api/ratings", async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ _id: -1 }).limit(5);
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
});

app.post("/api/ratings", async (req, res) => {
  const { rating, username, email } = req.body;

  try {
    const newRating = new Rating({ rating, username, email });
    await newRating.save();
    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
