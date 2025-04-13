const API_BASE = "https://orysenz.onrender.com"; // Render 上のミドルウェアURL
let currentOppId = null;

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
      document.getElementById("opp-name").value = "商談ID抽出失敗";
      return;
    }

    currentOppId = match[1];
    console.log("🔎 商談ID:", currentOppId);

    const res = await fetch(`${API_BASE}/opportunity/${currentOppId}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ 商談取得エラー:", res.status, errorText);
      document.getElementById("opp-name").value = "取得失敗";
      return;
    }

    const data = await res.json();
    renderOpportunity(data);
  } catch (err) {
    console.error("❗ エラー:", err);
    document.getElementById("opp-name").value = "エラー";
  }
}

// 商談内容の表示
function renderOpportunity(opp) {
  // ← input要素には textContent じゃなく value を使う！
  document.getElementById("opp-name").value = opp.Name || "名称不明";

  const total = Number(opp.amountfee_c__c);
  document.getElementById("opp-amount").textContent = !isNaN(total)
    ? `¥${total.toLocaleString("ja-JP")}`
    : "未設定";

  document.getElementById("opp-stage").textContent = opp.StageName || "未設定";
}

// 保存ボタン押下時の処理
async function handleSave() {
  if (!currentOppId) {
    alert("商談IDが見つかりません");
    return;
  }

  const newName = document.getElementById("opp-name").value;

  try {
    const res = await fetch(`${API_BASE}/opportunity/${currentOppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: newName }),
    });

    if (!res.ok) throw new Error("Salesforce更新に失敗しました");

    alert("保存しました！");
    fetchOpportunity(); // 再読み込み
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    alert("保存エラー：" + err.message);
  }
}

// DOMロード後の初期化処理
document.addEventListener("DOMContentLoaded", () => {
  fetchOpportunity();
  document.getElementById("save-btn").addEventListener("click", handleSave);
});
