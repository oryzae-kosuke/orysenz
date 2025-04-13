const API_BASE = "https://orysenz.onrender.com"; // Render 上のミドルウェアURL
let currentOppId = null;

// 商談を取得して表示
async function fetchOpportunity() {
  try {
    const client = ZAFClient.init();
    client.invoke("resize", { width: "100%", height: "80vh" });

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

  const input = document.getElementById("opp-name-input");
  const newName = input.value;

  try {
    const res = await fetch(`${API_BASE}/opportunity/${currentOppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: newName }),
    });

    if (!res.ok) throw new Error("Salesforce更新に失敗しました");

    // ✅ 成功したら編集モードを解除
    document.getElementById("opp-name-text").textContent = newName;
    document.getElementById("opp-name-text").style.display = "inline";
    document.getElementById("opp-name-input").style.display = "none";

    alert("保存しました！");
  } catch (err) {
    console.error("❌ 保存エラー:", err);
    alert("保存エラー：" + err.message);
  }
}

document.getElementById("edit-btn").addEventListener("click", () => {
  const span = document.getElementById("opp-name-text");
  const input = document.getElementById("opp-name-input");

  span.style.display = "none";
  input.style.display = "inline-block";
  input.focus();
});

function renderOpportunity(opp) {
  const name = opp.Name || "名称不明";
  document.getElementById("opp-name-text").textContent = name;
  document.getElementById("opp-name-input").value = name;

  const total = Number(opp.amountfee_c__c);
  document.getElementById("opp-amount").textContent = !isNaN(total)
    ? `¥${total.toLocaleString("ja-JP")}`
    : "未設定";
  document.getElementById("opp-stage").textContent = opp.StageName || "未設定";
}

// 編集モードに入ったら表示
document.getElementById("edit-btn").addEventListener("click", () => {
  document.getElementById("opp-name-text").style.display = "none";
  document.getElementById("opp-name-input").style.display = "inline-block";

  document.getElementById("edit-btn").style.display = "none";
  document.getElementById("edit-actions").style.display = "flex";
});
document.getElementById("save-btn").addEventListener("click", async () => {
  const newName = document.getElementById("opp-name-input").value;

  try {
    const res = await fetch(`${API_BASE}/opportunity/${currentOppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: newName }),
    });

    if (!res.ok) throw new Error("Salesforce更新に失敗しました");

    document.getElementById("opp-name-text").textContent = newName;
    exitEditMode(); // ✅ 保存後に通常モードに戻す

    alert("保存しました！");
  } catch (err) {
    alert("保存エラー：" + err.message);
  }
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  // 入力欄の中身を元のテキストに戻す
  const currentText = document.getElementById("opp-name-text").textContent;
  document.getElementById("opp-name-input").value = currentText;

  exitEditMode(); // 元の状態に戻す
});
// 保存 or キャンセル後は非表示
function exitEditMode() {
  document.getElementById("opp-name-input").style.display = "none";
  document.getElementById("opp-name-text").style.display = "inline";
  document.getElementById("edit-btn").style.display = "inline-block";
  document.getElementById("edit-actions").style.display = "none";
}
// DOMロード後の初期化処理
document.addEventListener("DOMContentLoaded", () => {
  fetchOpportunity();
  document.getElementById("save-btn").addEventListener("click", handleSave);
});
