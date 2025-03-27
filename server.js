require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createPost } = require("./gemini");
const app = express();
const PORT = 8080;

const { scrapeLinkedInPosts } = require("./scraper");

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/signin";

app.post("/getLinkedInToken", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }
  console.log("====================================");
  console.log("authorization code", code);
  console.log("====================================");

  try {
    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    // console.log("====================================");
    // console.log("Response from access token endpoint", response.data);
    // console.log("====================================");
    const accessToken = response.data.access_token;
    const idToken = response.data.id_token;
    const decoded_id_token = jwt.decode(idToken);
    const user_sub = decoded_id_token.sub;
    console.log("Sending sub:", user_sub);

    res.json({ accessToken, user_sub });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

app.get("/linkedin/me", async (req, res) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    return res.status(401).json({ error: "Access Token is required" });
  }
  let userInfo = null;
  try {
    userInfo = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // console.log("User info is: ", userInfo.data);

    res.json({ userInfo: userInfo.data });
  } catch (error) {
    console.error(
      "Error fetching LinkedIn profile:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch LinkedIn profile" });
  }
});

app.post("/linkedin/post", async (req, res) => {
  //   const { accessToken, text } = req.body;
  //   console.log("post was called with text:", req.body.text);
  //   console.log("post was called with user id:", req.body.user_id);
  //   console.log("post was called with access token:", req.body.access_token);

  const accessToken = req.body.access_token;
  let text = req.body.text;
  const userId = req.body.user_id;

  if (!accessToken) {
    return res.status(401).json({ error: "Access Token is required" });
  }

  try {
    const postData = {
      author: `urn:li:person:${userId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    // Send the post request to LinkedIn
    const postResponse = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      postData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      message: "Post created successfully!",
      postId: postResponse.data.id,
    });
  } catch (error) {
    console.error(
      "Error posting to LinkedIn:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to post on LinkedIn." });
  }
});

app.get("/linkedin/generate-post", async (req, res) => {
  console.log("generate post was called with context:", req.query.context);

  const char_length = req.query.char_length;
  const context = req.query.context;
  if (context !== null) {
    try {
      // console.log("context is not null");
      const response = await createPost(context, char_length);
      console.log("Response from gemini is: ", response);
      res.json({ response });
    } catch (error) {
      console.error(
        "Error generating post:",
        error.response?.data || error.message
      );
      res.status(500).json({ error: "Failed to generate post." });
    }
  } else {
    res.status(400).json({ error: "Context is required" });
  }
});

// app.get("/linkedin/posts", async (req, res) => {
//   console.log("THis was called");

//   const accessToken = req.headers.authorization;
//   const userId = req.body.user_id;
//   console.log("Access token", accessToken);

//   if (!accessToken) {
//     return res.status(401).json({ error: "Access Token is required" });
//   }

//   try {
//     // Fetch user's posts
//     const postsResponse = await axios.get(
//       //   `https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aperson%3A${userId}&q=author`,
//       `https://api.linkedin.com/v2/ugcPosts?q=author&authors=urn:li:person:${userId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "X-Restli-Protocol-Version": "2.0.0",
//         },
//       }
//     );

//     res.json(postsResponse.data);
//   } catch (error) {
//     console.error(
//       "Error fetching LinkedIn posts:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ error: "Failed to fetch LinkedIn posts." });
//   }
// });

app.get("/linkedin/posts", async (req, res) => {
  console.log("This was called");
  console.log(req.query); // Check if parameters are coming

  const URL = req.query.url; // Use req.query instead of req.body
  const count = req.query.count;

  console.log("URL is:", URL);

  if (!URL) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log("Scraping LinkedIn");

    const posts = await scrapeLinkedInPosts(URL, count);
    console.log("Got posts");

    res.json(posts);
  } catch (error) {
    console.error("Error scraping LinkedIn posts:", error);
    res.status(500).json({ error: "Failed to scrape LinkedIn posts." });
  }
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
