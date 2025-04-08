const API_BASE = "https://orysenz.onrender.com"; // Render 上のミドルウェアURL

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
      console.error("❌ 商談取得エラー:", res.status, errorText);
      document.getElementById("opp-name").textContent = "取得失敗";
      return;
    }

    const data = await res.json();
    renderOpportunity(data, oppId);
  } catch (err) {
    console.error("❗ エラー:", err);
    document.getElementById("opp-name").textContent = "エラー";
  }
}

function renderOpportunity(opp, oppId) {
  const displayName = document.getElementById("opp-name");
  const inputField = document.getElementById("opp-name-input");
  const editBtn = document.getElementById("edit-opp-name");
  const editBlock = document.getElementById("opp-name-edit");
  const statusText = document.getElementById("save-status");

  displayName.textContent = opp.Name || "名称不明";
  inputField.value = opp.Name || "";
  document.getElementById("opp-amount").textContent =
    opp.Amount != null ? `¥${opp.Amount}` : "未設定";
  document.getElementById("opp-stage").textContent = opp.StageName || "未設定";

  // 編集ボタン
  editBtn.addEventListener("click", () => {
    displayName.style.display = "none";
    editBtn.style.display = "none";
    editBlock.style.display = "inline";
  });

  // キャンセル
  document.getElementById("cancel-edit").addEventListener("click", () => {
    editBlock.style.display = "none";
    displayName.style.display = "inline";
    editBtn.style.display = "inline";
    statusText.textContent = "";
  });

  // 保存（POSTで送信）
  document
    .getElementById("save-opp-name")
    .addEventListener("click", async () => {
      const newName = inputField.value.trim();
      if (!newName) {
        statusText.textContent = "商談名を入力してください";
        return;
      }

      const res = await fetch(`${API_BASE}/opportunity/${oppId}`, {
        method: "POST", // ← PATCHではなくPOST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: newName }),
      });

      if (res.ok) {
        statusText.textContent = "✅ 保存しました";
        location.reload();
      } else {
        const errText = await res.text();
        console.error("❌ 保存失敗:", errText);
        statusText.textContent = "❌ 保存に失敗しました";
      }
    });
}

document.addEventListener("DOMContentLoaded", fetchOpportunity);
