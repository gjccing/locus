import type { Value } from "platejs"

/**
 * 中文測試文檔：用於手動驗證 @mention 問答、上下文選擇與大綱結構。
 * 結構刻意加深（多級標題、巢狀列表、跨章節引用）以便測試選詞與選區。
 */
export const contextEditorZhFixture: Value = [
  {
    children: [{ text: "2026 產品路線圖（中文測試文檔）" }],
    type: "h1",
  },
  {
    children: [
      {
        text: "本文件為編輯器內建示範內容，涵蓋多章節、巢狀清單與 @模型 問答場景。各團隊應以第一章的年度主題對齊季度 OKR。",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "一、戰略背景與優先級" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "年度主題：在文檔內寫作、在上下文中問答，避免每次請求都上傳整份文件。",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "公司級優先事項" }],
    type: "h3",
  },
  {
    children: [{ text: "降低 AI 請求的延遲與 token 成本" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "維持協作編輯體驗不被 AI 流程打斷" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "子項：選區與區塊拖曳在串流插入期間仍須可用" }],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [{ text: "子項：Esc 可中止上下文分析或回答串流" }],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [{ text: "提升長文檔中的可發現性（目錄、標題導航）" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "二、AI 助手" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "助手應根據使用者問題回答，而非預設續寫正文。透過 ",
      },
      {
        children: [{ text: "" }],
        type: "mention",
        value: "mention",
      },
      {
        text: " 區塊指定模型，並以智能上下文選擇器裁剪上游內容。",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "2.1 設計原則" }],
    type: "h3",
  },
  {
    children: [{ text: "問題與回答分離：問題寫在含 @模型的段落，Enter 到下一行觸發回答。" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "上下文最小化：僅在問題需要時帶入祖先、同層前序或關鍵字區塊。" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "無關問題（例如講笑話）不應附帶整份文件上下文。" }],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [{ text: "2.2 核心指標（供問答測試引用）" }],
    type: "h3",
  },
  {
    children: [
      {
        text: "分類 + 生成端到端延遲目標：低於 2 秒（P95）。相對於「整份文件前綴」方案，上下文體積至少縮減 50%。",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "指標細項" }],
    type: "h4",
  },
  {
    children: [{ text: "classify 階段：單次結構化輸出，temperature=0" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "generate 階段：串流插入，禁止輸出 Markdown 一級標題除非使用者明確要求" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "高亮：被選中的上下文區塊在回答期間應有視覺標記" }],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [{ text: "2.3 Q1 交付清單" }],
    type: "h3",
  },
  {
    children: [{ text: "智能上下文選擇器（祖先、同層前序、關鍵字、全文上溯）" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "@mention 觸發的問答（非續寫）" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "" },
      {
        children: [{ text: "" }],
        key: "google/gemini-3.1-flash-lite",
        provider: "Gemini",
        type: "mention",
        value: "google/gemini-3.1-flash-lite",
      },
      {
        text: " 上面「核心指標」段落裡提到的延遲與體積目標分別是什麼？請用條列式簡答。",
      },
    ],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [{ text: "分段靈感與區塊級改寫（後續）" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "三、協作與同步" }],
    type: "h2",
  },
  {
    children: [{ text: "3.1 即時編輯" }],
    type: "h3",
  },
  {
    children: [
      {
        text: "即時編輯與評論仍是核心迴圈；AI 功能不得破壞游標同步或區塊選取。",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "3.2 離線與衝突" }],
    type: "h3",
  },
  {
    children: [{ text: "離線模式延後至 v2；v1 衝突解決採最後寫入獲勝。" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "合併策略需與產品、法務共同評估（尤其跨區資料）" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "團隊回饋：希望在長文件中更好發現 " },
      {
        children: [{ text: "" }],
        type: "mention",
        value: "mention",
      },
      { text: " 與 AI 回答入口，而非另開側欄聊天。" },
    ],
    type: "p",
  },
  {
    children: [{ text: "四、附錄" }],
    type: "h2",
  },
  {
    children: [{ text: "4.1 術語對照" }],
    type: "h3",
  },
  {
    children: [{ text: "上下文選擇器：依問題意圖決定 methods[] 的分類器" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "mention 區塊：行內模型選擇 + 使用者問題" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "4.2 建議手動測試步驟" }],
    type: "h3",
  },
  {
    children: [
      {
        text: "在「2.3」含 Gemini 的條目下按 Enter，確認回答引用「2.2」指標且不高亮無關章節。",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "" },
      {
        children: [{ text: "" }],
        type: "mention",
        value: "mention",
      },
      { text: " 講一個與程式無關的笑話" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      {
        text: "在「一、戰略背景」章節下提問：@模型 總結本章三條公司級優先事項（測試 getOlderSiblings / getAncestors）。",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
]
