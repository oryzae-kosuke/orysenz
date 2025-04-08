const API_BASE = "https://orysenz.onrender.com"; // Render上のミドルウェアURL

async function fetchOpportunity() {
  try {
    // カスタムフィールドからSalesforceのURLを取得
    const client = ZAFClient.init();
    const fieldKey = "custom_field_11390318154639"; // ← 実際のフィールドIDに置き換えて！
    const result = await client.get(`ticket.customField:${fieldKey}`);
    const sfUrl = result[`ticket.customField:${fieldKey}`];

    // 商談IDをURL末尾から抽出（例: https://.../006J400000JQzdWIAT）
    const match = sfUrl.match(/([a-zA-Z0-9]{15,18})$/);
    if (!match) {
      console.error("商談IDがURLから取得できませんでした");
      document.getElementById("opp-name").textContent = "ID抽出失敗";
      return;
    }
    const oppId = match[1];

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
