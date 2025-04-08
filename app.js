const express = require("express");
const axios = require("axios");
const app = express();

const CLIENT_ID =
  "3MVG9pRzvMkjMb6lm9zJuIlsFF2O_L4ZFVI4z1stwfJoOZwTrccwm26viL8RZ0G6nWmuflhh0TbEkFByaIxwi";
const CLIENT_SECRET =
  "C97D024FC027F59C43F29EA31333829E53AAF4D060F7A35BA8BE85C69E00C20D";
const REDIRECT_URI = "https://orysenz.onrender.com/callback";

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

    // 保存して以降のAPIに使う（今回は表示だけ）
    res.send("認証完了しました！アクセストークンを取得しました 🙌");
  } catch (err) {
    console.error("❌ トークン取得エラー:", err.response?.data || err);
    res.status(500).send("トークン取得に失敗しました");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
