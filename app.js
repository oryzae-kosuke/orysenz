const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getAccessTokenFromRefreshToken } = require("./refreshToken");

const app = express();
app.use(cors());
app.use(express.json()); // JSON対応

// 📦 商談データ取得エンドポイント
app.get("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  console.log("📩 /opportunity にアクセスあり。oppId:", oppId);

  try {
    const accessToken = await getAccessTokenFromRefreshToken();
    console.log("🔑 AccessToken取得成功");

    const instanceUrl = process.env.INSTANCE_URL;
    console.log("🌐 instanceUrl:", instanceUrl);

    const response = await axios.get(
      `${instanceUrl}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Salesforceから商談取得成功");
    res.json(response.data);
  } catch (err) {
    console.error(
      "❌ Salesforce API エラー:",
      err.response?.data || err.message
    );
    res.status(500).send("商談取得失敗");
  }
});

// 🔐 Salesforce認証コールバック
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("コードがありません");

  try {
    const tokenRes = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
        },
      }
    );

    const { access_token, refresh_token, instance_url } = tokenRes.data;
    console.log("✅ Access Token:", access_token);
    console.log("🔁 Refresh Token:", refresh_token);
    console.log("🌐 Instance URL:", instance_url);

    res.send("認証完了しました！アクセストークンを取得しました 🙌");
  } catch (err) {
    console.error("❌ トークン取得エラー:", err.response?.data || err);
    res.status(500).send("トークン取得に失敗しました");
  }
});

// 🚀 サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
