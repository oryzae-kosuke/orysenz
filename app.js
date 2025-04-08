const express = require("express");
const fetch = require("node-fetch"); // Node.js v18以前なら必要
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const SF_INSTANCE = "https://oryzae4.my.salesforce.com";
const ACCESS_TOKEN = "ここに実際のアクセストークン"; // 今後は環境変数にするのが理想

// 商談情報を取得（IDは動的）
app.get("/opportunity/:id", async (req, res) => {
  const oppId = req.params.id;

  try {
    const sfRes = await fetch(
      `${SF_INSTANCE}/services/data/v57.0/sobjects/Opportunity/${oppId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!sfRes.ok) {
      const error = await sfRes.text();
      return res.status(sfRes.status).send(error);
    }

    const data = await sfRes.json();
    res.json(data);
  } catch (err) {
    console.error("❗ Salesforce fetch error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`🌐 Listening on port ${port}`);
});
