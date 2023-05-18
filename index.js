const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const url = `https://auth.geeksforgeeks.org/user/${username}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);


    const name = $('.profile_name').text().trim();
    const institution = $('.basic_details_data a').text().trim();
    const longestStrek = $('.streakCnt.tooltipped').text().trim();
    const rank = $('.rankNum').text().trim();
    const coddingScore = $('.score_card_value').text().trim();
    const overallScore = coddingScore.slice(0, 3);
    const solvedProblemsCount = coddingScore.slice(3).replace(/_/g, '');
    const totalSubmissions = $('.heatmap_header .numProblems').text().trim();



    const solvedProblems = [];
    $('.problemdiv .row .col.m6.s12')
      .find('.problemLink')
      .each((_, element) => {
        const question = $(element).text().trim();
        const link = $(element).attr('href');
        solvedProblems.push({ question, link });
      });


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

    };

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
