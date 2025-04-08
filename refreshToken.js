// refreshToken.js など
const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

async function getAccessTokenFromRefreshToken() {
  const data = qs.stringify({
    grant_type: "refresh_token",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: process.env.REFRESH_TOKEN,
  });

  try {
    const res = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      data,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return res.data.access_token;
  } catch (err) {
    console.error("トークン更新失敗:", err.response?.data || err);
    throw err;
  }
}

module.exports = { getAccessTokenFromRefreshToken };
