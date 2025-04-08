const API_BASE = "https://orysenz.onrender.com"; // RenderのミドルウェアURL

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
      console.error("❌ 商談取得エラー:", errorText);
      document.getElementById("opp-name").textContent = "取得失敗";
      return;
    }

    const data = await res.json();
    console.log("📦 商談データ:", data);

    renderOpportunity(data, oppId);
  } catch (err) {
    console.error("❗ 予期せぬエラー:", err);
    document.getElementById("opp-name").textContent = "エラー";
  }
}

// 商談情報を表示
function renderOpportunity(opp, oppId) {
  document.getElementById("opp-name").textContent = opp.Name || "名称不明";
  document.getElementById("opp-amount").textContent =
    opp.Amount != null ? `¥${opp.Amount}` : "未設定";
  document.getElementById("opp-stage").textContent = opp.StageName || "―";
  document.getElementById("opp-name-input").value = opp.Name || "";

  setupEditHandlers(oppId);
}

// 編集イベントを設定
function setupEditHandlers(oppId) {
  const editBtn = document.getElementById("edit-opp-name");
  const saveBtn = document.getElementById("save-opp-name");
  const cancelBtn = document.getElementById("cancel-edit");

  const displayName = document.getElementById("opp-name");
  const inputField = document.getElementById("opp-name-input");
  const editField = document.getElementById("opp-name-edit");
  const statusText = document.getElementById("save-status");

  editBtn.addEventListener("click", () => {
    inputField.value = displayName.textContent;
    displayName.style.display = "none";
    editBtn.style.display = "none";
    editField.style.display = "inline";
  });

  cancelBtn.addEventListener("click", () => {
    editField.style.display = "none";
    displayName.style.display = "inline";
    editBtn.style.display = "inline";
    statusText.textContent = "";
  });

  saveBtn.addEventListener("click", async () => {
    const newName = inputField.value.trim();
    if (!newName) {
      statusText.textContent = "商談名を入力してください";
      return;
    }

    const res = await fetch(`${API_BASE}/opportunity/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: newName }),
    });

    if (res.ok) {
      statusText.textContent = "保存しました ✅";
      location.reload();
    } else {
      const error = await res.text();
      statusText.textContent = "保存に失敗しました ❌";
      console.error("PATCHエラー:", error);
    }
  });
}

// 起動時処理
document.addEventListener("DOMContentLoaded", () => {
  fetchOpportunity();
});
