// app.js
const SF_INSTANCE = "https://oryzae4.my.salesforce.com";
const ACCESS_TOKEN =
  "00D5j00000B8dlW!ARoAQAReX9jqq9MpeFYEw89prgJQs9WsCEgyuUVQ9wXWmkvXyxaZgPozX1uIdlRLRIbQFa82WJPAU0JF1khoB.iBQsw3JFyh";
const OPPORTUNITY_ID = "006J400000JQzdWIAT";

async function fetchOpportunity() {
  try {
    const res = await fetch(
      `${SF_INSTANCE}/services/data/v57.0/sobjects/Opportunity/${OPPORTUNITY_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error fetching opportunity:", res.status, errorText);
      document.getElementById("opp-name").textContent = "取得失敗";
      return;
    }

    const data = await res.json();
    console.log("📦 Opportunity Data:", data);

    // 商談名 表示
    document.getElementById("opp-name").textContent = data.Name || "なし";
    document.getElementById("opp-name-input").value = data.Name || "";

    // 売上（amountfee_c__c）表示のみ
    document.getElementById("opp-amount").textContent =
      data.amountfee_c__c != null ? `¥${data.amountfee_c__c}` : "未設定";

    // ステージ表示
    document.getElementById("opp-stage").textContent =
      data.StageName || "未設定";
  } catch (err) {
    console.error("❗ Unexpected error:", err);
    document.getElementById("opp-name").textContent = "エラー";
  }
}

// DOM読み込み完了後
document.addEventListener("DOMContentLoaded", function () {
  fetchOpportunity();

  // 商談名の編集UI用要素取得
  const editBtn = document.getElementById("edit-opp-name");
  const saveBtn = document.getElementById("save-opp-name");
  const cancelBtn = document.getElementById("cancel-edit");

  const displayName = document.getElementById("opp-name");
  const inputField = document.getElementById("opp-name-input");
  const editField = document.getElementById("opp-name-edit");
  const statusText = document.getElementById("save-status");

  // 編集開始
  editBtn.addEventListener("click", () => {
    inputField.value = displayName.textContent;
    displayName.style.display = "none";
    editBtn.style.display = "none";
    editField.style.display = "inline";
  });

  // 編集キャンセル
  cancelBtn.addEventListener("click", () => {
    editField.style.display = "none";
    displayName.style.display = "inline";
    editBtn.style.display = "inline";
    statusText.textContent = "";
  });

  // 商談名保存（PATCH）
  saveBtn.addEventListener("click", async () => {
    const newName = inputField.value.trim();
    if (!newName) {
      alert("商談名を入力してください");
      return;
    }

    try {
      const res = await fetch(
        `${SF_INSTANCE}/services/data/v57.0/sobjects/Opportunity/${OPPORTUNITY_ID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Name: newName }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ PATCH失敗:", res.status, errorText);
        statusText.textContent = "保存失敗しました";
        return;
      }

      // 成功：表示更新
      displayName.textContent = newName;
      statusText.textContent = "保存成功 🎉";

      // 編集モード解除
      editField.style.display = "none";
      displayName.style.display = "inline";
      editBtn.style.display = "inline";
    } catch (err) {
      console.error("❗ PATCHエラー:", err);
      statusText.textContent = "エラーが発生しました";
    }
  });
});
