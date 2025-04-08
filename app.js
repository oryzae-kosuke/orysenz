const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // ← PATCHなどで req.body を使うために必須

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const INSTANCE_URL = process.env.INSTANCE_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// 🔁 リフレッシュトークンからアクセストークン取得
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
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return res.data.access_token;
}

// 📦 商談を取得
app.get("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  console.log("📥 /opportunity アクセス:", oppId);

  try {
    const accessToken = await getAccessTokenFromRefreshToken();
    const response = await axios.get(
      `${INSTANCE_URL}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ 商談取得失敗:", err.response?.data || err.message);
    res.status(500).send("商談取得に失敗しました");
  }
});

// 🛠 商談名の編集（PATCH）
app.patch("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;
  const newName = req.body.Name;

  console.log("🛠 PATCH /opportunity/:id に到達");
  console.log("🔧 oppId:", oppId);
  console.log("✏️ 新しいName:", newName);

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
    console.log("✅ PATCH成功");
    res.send("✅ 商談名を更新しました");
  } catch (err) {
    console.error("❌ PATCH失敗:", err.response?.data || err.message);
    res.status(500).send("商談名の更新に失敗しました");
  }
});

// 🔁 Salesforce OAuth2 認可コードからのコールバック
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("コードがありません");
  }

  try {
    const tokenRes = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
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

// 起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
