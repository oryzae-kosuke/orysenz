// 📁 zendesk.js
const API_BASE = "https://orysenz.onrender.com"; // Render 上のミドルウェアURL

// 商談を取得して表示
async function fetchOpportunity() {
  try {
    const client = ZAFClient.init();
    client.invoke("resize", { width: "100%", height: "200px" });

    const fieldKey = "custom_field_11390318154639";
    const result = await client.get(`ticket.customField:${fieldKey}`);
    const sfUrl = result[`ticket.customField:${fieldKey}`];

    const match = sfUrl.match(/Opportunity\/([a-zA-Z0-9]{15,18})/);
    if (!match) {
      document.getElementById("opp-name").textContent = "商談ID抽出失敗";
      return;
    }

    const oppId = match[1];
    console.log("🔎 商談ID:", oppId);

    const res = await fetch(`${API_BASE}/opportunity/${oppId}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ 商談取得エラー:", res.status, errorText);
      document.getElementById("opp-name").textContent = "取得失敗";
      return;
    }

    const data = await res.json();
    renderOpportunity(data);
  } catch (err) {
    console.error("❗ エラー:", err);
    document.getElementById("opp-name").textContent = "エラー";
  }
}

function renderOpportunity(opp) {
  document.getElementById("opp-name").textContent = opp.Name || "名称不明";
  document.getElementById("opp-amount").textContent =
    opp.Amount != null ? `\u00a5${opp.Amount}` : "未設定";
  document.getElementById("opp-stage").textContent = opp.StageName || "未設定";
}

document.addEventListener("DOMContentLoaded", fetchOpportunity);
