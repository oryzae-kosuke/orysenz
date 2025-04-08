const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getAccessTokenFromRefreshToken } = require("./refreshToken");

const app = express();
app.use(cors());

app.get("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  try {
    const accessToken = await getAccessTokenFromRefreshToken(); // ←これが肝
    const instanceUrl = process.env.INSTANCE_URL;

    const response = await axios.get(
      `${instanceUrl}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "❌ Salesforce API エラー:",
      err.response?.data || err.message
    );
    res.status(500).send("商談取得失敗");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
