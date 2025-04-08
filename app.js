const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

<<<<<<< HEAD
const { getAccessTokenFromRefreshToken } = require("./refreshToken");

=======
>>>>>>> revert-to-working
const app = express();
app.use(cors());
app.use(express.json()); // JSONボディを使うために必要

<<<<<<< HEAD
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
=======
// 環境変数
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const INSTANCE_URL = process.env.INSTANCE_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// 🔁 アクセストークンをリフレッシュトークンから取得
async function getAccessTokenFromRefreshToken() {
  const data = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
  });

  const res = await axios.post(
    "https://login.salesforce.com/services/oauth2/token",
    data,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data.access_token;
}

// 📥 商談取得エンドポイント
app.get("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  console.log("📩 /opportunity にアクセスあり。oppId:", oppId);

  try {
    const accessToken = await getAccessTokenFromRefreshToken();
    console.log("🔑 AccessToken取得成功");

    const response = await axios.get(
      `${INSTANCE_URL}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("📥 Salesforceから商談取得成功");
    res.json(response.data);
  } catch (err) {
    console.error("❌ 商談取得失敗:", err.response?.data || err.message);
    res.status(500).send("商談取得に失敗しました");
  }
});

// 📝 商談名更新（POSTで）
app.post("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  const newName = req.body.Name;
  console.log("📝 POSTリクエスト:", oppId, newName);

  try {
    const accessToken = await getAccessTokenFromRefreshToken();

    await axios.patch(
      `${INSTANCE_URL}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      { Name: newName },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send("✅ 商談名を更新しました（POST）");
  } catch (err) {
    console.error("❌ POST失敗:", err.response?.data || err.message);
    res.status(500).send("商談名の更新に失敗しました（POST）");
  }
});

// ✅ POSTルートのデバッグ用
app.post("/debug", (req, res) => {
  console.log("✅ /debug POST 受信");
  res.send("POST /debug は動いています 🚀");
});

// 🔐 Salesforce認証コールバック
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("コードがありません");
>>>>>>> revert-to-working

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

<<<<<<< HEAD
    console.log("✅ Salesforceから商談取得成功");
    res.json(response.data);
  } catch (err) {
    console.error(
      "❌ Salesforce API エラー:",
      err.response?.data || err.message
    );
    res.status(500).send("商談取得失敗");
=======
    const { access_token, refresh_token, instance_url } = tokenRes.data;
    console.log("✅ Access Token:", access_token);
    console.log("🔁 Refresh Token:", refresh_token);
    console.log("🌐 Instance URL:", instance_url);

    res.send("認証完了しました！アクセストークンを取得しました 🙌");
  } catch (err) {
    console.error("❌ トークン取得エラー:", err.response?.data || err.message);
    res.status(500).send("トークン取得に失敗しました");
>>>>>>> revert-to-working
  }
});

// 🚀 起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
