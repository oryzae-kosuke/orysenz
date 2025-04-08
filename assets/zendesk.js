const API_BASE = "https://orysenz.onrender.com"; // Render上のミドルウェアURL

async function fetchOpportunity() {
  try {
    const client = ZAFClient.init();
    client.invoke("resize", { width: "100%", height: "200px" });

    const fieldKey = "custom_field_11390318154639";
    const result = await client.get(`ticket.customField:${fieldKey}`);
    const sfUrl = result[`ticket.customField:${fieldKey}`];

    const match = sfUrl.match(/Opportunity\/([a-zA-Z0-9]{15,18})/);
    if (!match) {
      document.getElementById("opp-name").textContent = "ID抽出失敗";
      return;
    }

    const oppId = match[1];
    console.log("🔎 商談ID:", oppId);

    const res = await fetch(`${API_BASE}/opportunity/${oppId}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error fetching opportunity:", res.status, errorText);
      document.getElementById("opp-name").textContent = "取得失敗";
      return;
    }

    const data = await res.json();
    console.log("📦 Opportunity Data:", data);

    // 表示処理
    document.getElementById("opp-name").textContent = data.Name || "なし";
    document.getElementById("opp-name-input").value = data.Name || "";
    document.getElementById("opp-amount").textContent =
      data.amountfee_c__c != null ? `¥${data.amountfee_c__c}` : "未設定";
    document.getElementById("opp-stage").textContent =
      data.StageName || "未設定";
  } catch (err) {
    console.error("❗ Unexpected error:", err);
    document.getElementById("opp-name").textContent = "エラー";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchOpportunity();
});
