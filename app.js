const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getAccessTokenFromRefreshToken } = require("./refreshToken");

const app = express();

// ✅ CORS 設定：Zendesk iframe からのアクセスを許可
app.use(
  cors({
    origin: "*", // 開発中は全許可、本番はドメインを絞る
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
