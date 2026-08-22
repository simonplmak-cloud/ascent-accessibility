import type { LocaleOverlay } from "./curriculum";

// Locale overlays for the training curriculum. Structure (ids, SCs, answer keys,
// references, durations, activity lists) stays English in `curriculum.ts`; only
// user-facing text is translated here.

export const LOCALE_OVERLAYS: Record<string, LocaleOverlay> = {
  "zh-Hant": {
    pathTitle: "Ascent 網頁無障礙計劃",
    modules: {
      advocacy: {
        title: "倡導",
        description: "提出論據 — 誰需要無障礙、他們面對的障礙，以及這對你的組織為何重要。",
      },
      everyday: {
        title: "日常無障礙",
        description: "修復常見障礙 — 結構、替代文字、對比、鍵盤、連結、表單、媒體及重排。",
      },
      standards: {
        title: "標準",
        description: "精通標準 — 讀懂任何 WCAG 2.2 準則，並深入探討造成大多數真實失敗的準則。",
      },
      audit: {
        title: "稽核",
        description: "證明合規 — 自動化、手動及螢幕閱讀器測試，最終完成專題稽核。",
      },
    },
    lessons: {
      "what-is-accessibility": {
        title: "什麼是網頁無障礙",
        body: "網頁無障礙意味著身心障礙人士可以感知、理解、瀏覽、互動並貢獻於網頁。它是易用性的一個子集，與包容性設計不同：無障礙旨在消除障礙，而包容性設計則從一開始就力求不排除任何人。",
      },
      "how-people-use-the-web": {
        title: "人們如何使用網頁",
        body: "人們使用輔助科技與適應性策略：螢幕閱讀器、放大、純鍵盤瀏覽、語音控制及開關裝置。每一種都揭示不同的障礙 — 同一個頁面對某個人可能無法使用，對另一個人卻沒有問題。",
      },
      "disability-barriers": {
        title: "障礙類型與阻礙",
        body: "身心障礙是人與環境之間的不匹配，而非個人的缺陷。障礙分為視覺、聽覺、動作及認知類別 — 且可能是永久、暫時或情境性的。為某一類人設計往往能惠及許多人。",
      },
      "business-legal-case": {
        title: "商業與法律論據",
        body: "無障礙能拓展市場觸及、促進創新與品牌信任 — 並降低法律風險。法律因司法管轄區而異：ADA 與 Section 508（美國）、EN 301 549（歐盟）及其他地區的對應法規。法律合規並不等同於技術合規。",
      },
      "inclusive-design-etiquette": {
        title: "包容性設計與用語禮儀",
        body: "包容性設計遵循「辨識排除、從多樣性學習、為一人解決並擴及眾人」。使用個人與社群用於自身的術語 — 以人為先或以身份為先皆是情境偏好，而非規則。",
      },
      "history-standards": {
        title: "WCAG 與標準的歷史",
        body: "WCAG 1.0（1999）使用 14 條檢查點；WCAG 2.0（2008）重組為 POUR 四原則，並搭配可測試的成功準則及 A/AA/AAA 等級（後成為 ISO/IEC 40500）。WCAG 2.1（2018）新增行動裝置、低視力及認知準則；2.2（2023）新增焦點外觀、目標尺寸、拖曳及無障礙驗證。WCAG 3.0 正在開發中。相關標準：Section 508、EN 301 549、ATAG（編寫工具）、UAAG（使用者代理）、WAI-ARIA。",
      },
      "everyday-structure": {
        title: "語意與結構",
        body: "螢幕閱讀器使用者透過標題、地標與清單來瀏覽 — 而不是用看的。使用真實的標題階層（一個 h1、有序的層級）、地標（header/nav/main/footer）及語意清單。一個看起來有結構、實際上卻是滿滿 div 的頁面，對螢幕閱讀器而言就是一堵牆。",
      },
      "everyday-alt-text": {
        title: "文字替代",
        body: "每張圖片都需要一個決定：資訊性（描述內容）、裝飾性（alt=\"\"）、功能性（描述動作）或複雜（長描述）。替代文字會取代某人無法看見的圖片 — 就像你口頭描述那張圖片一樣地撰寫。",
      },
      "everyday-contrast": {
        title: "色彩與對比",
        body: "低視力影響的人遠多於全盲。內文需要至少 4.5:1（大字文字 3:1），且色彩絕不能是唯一的訊號 — 紅色要搭配圖示或文字。檢查實際渲染的色彩，而不只是樣式表裡的值。",
      },
      "everyday-keyboard": {
        title: "鍵盤與焦點",
        body: "滑鼠能做的一切都必須能只靠鍵盤完成 — 而且你必須能看到自己所在的位置。切勿移除焦點外框；使用原生互動元素，鍵盤與焦點就能「直接運作」。測試方式：拔掉滑鼠。",
      },
      "everyday-links": {
        title: "連結與導覽",
        body: "螢幕閱讀器使用者會逐個連結切換，在沒有上下文的狀況下聽取文字。「點此」與「閱讀更多」毫無意義 — 連結文字本身必須說明它通往何處。提供跳過連結以略過重複的導覽。",
      },
      "everyday-forms": {
        title: "表單與錯誤",
        body: "每個輸入都需要可見且程式化的標籤；錯誤必須以文字識別、描述並連結到該欄位。使用 <label>、群組用 <fieldset>/<legend>，以及提示與錯誤訊息用 aria-describedby — 切勿以佔位文字作為標籤。",
      },
      "everyday-media": {
        title: "媒體（字幕與音訊）",
        body: "影片需要字幕給聽不見的人，並以音訊描述或逐字稿給看不見的人。音訊需要逐字稿。自動播放的音訊必須可控制。字幕是媒體最高影響力的修復。",
      },
      "everyday-reflow": {
        title: "縮放、重排與目標尺寸",
        body: "內容必須在 320 px 及 400% 縮放下重排，不出現水平捲動，且文字縮放時不得破版。互動目標至少需要 24×24 px（WCAG 2.2）— 過小的連結是動作無障礙的障礙。",
      },
      "how-to-read-any-sc": {
        title: "如何讀懂任何成功準則",
        body: "你不需要背誦 87 條準則 — 你需要的是方法。對任何 SC：先讀規範文字，再讀其 Understanding 文件（意圖、好處、範例），接著讀 Techniques（充分、建議及已記錄的失敗），最後決定如何測試。編號的第一位數字代表原則，第二位代表指引。",
      },
      "sc-1.1.1": {
        title: "1.1.1 非文字內容",
        body: "替代文字決策樹：資訊性 → 描述；裝飾性 → 空白 alt；功能性 → 描述動作；複雜 → 長描述。失敗：圖片被宣告為「無」或「檔名」。測試：用螢幕閱讀器逐項切換，詢問每張圖片傳達了什麼。",
      },
      "sc-1.3.1": {
        title: "1.3.1 資訊和關係",
        body: "程式化結構必須與視覺結構一致。標題、地標、清單、表格及 <label> 關聯將關係暴露給輔助科技。失敗：「標題只是粗體文字」；「表單欄位沒有標籤」。",
      },
      "sc-1.4.3": {
        title: "1.4.3 對比度（最小）",
        body: "一般文字 4.5:1，大字文字與 UI 元件 3:1。判斷方式：計算渲染前後景的對比度。失敗：灰底白字、文字壓在雜亂圖片上。用對比檢查器測試，不要用目測。",
      },
      "sc-1.4.10": {
        title: "1.4.10 反覆捲動",
        body: "在 320 px（或 1280 px 視埠的 400% 縮放）下，內容必須重排為單欄，不出現水平捲動且功能不喪失。失敗：強制二維捲動的表格或固定寬度版面。測試：實際縮放到 400%。",
      },
      "sc-2.1.1": {
        title: "2.1.1 鍵盤",
        body: "所有功能都必須能透過鍵盤介面操作 — 不只是「可到達」，而是可使用，並具備可見焦點與邏輯順序。失敗：只有點擊處理器、沒有鍵盤對應的控制項。測試：拔掉滑鼠。",
      },
      "sc-2.4.4": {
        title: "2.4.4 連結目的（在上下文裡）",
        body: "每個連結的目的必須能從連結文字本身、或連結文字加上其程式化脈絡中判定。失敗：多個指向不同目標的「閱讀更多」連結。測試：列出所有連結，逐個脫離脈絡讀取。",
      },
      "sc-2.4.7": {
        title: "2.4.7 焦點可見",
        body: "任何可透過鍵盤操作的元素都必須有可見的焦點指示。失敗：以 :focus { outline: none } 移除外框且沒有替代。測試：逐項 Tab 切換，確認你始終能看到自己所在的位置。",
      },
      "sc-2.5.8": {
        title: "2.5.8 目標尺寸（最小）",
        body: "目標至少需 24×24 CSS 像素（有間距例外）— 這是 WCAG 2.2 針對動作與觸控存取的準則。失敗：沒有內距的微小文字連結。測試：量測命中區域，而非字形。",
      },
      "sc-3.3.1": {
        title: "3.3.1 錯誤識別",
        body: "當輸入無效時，必須以文字向使用者識別並描述錯誤，並指出有問題的欄位。失敗：表單變紅卻沒有任何訊息。測試：提交無效表單，確認螢幕閱讀器宣告哪裡出錯。",
      },
      "sc-4.1.2": {
        title: "4.1.2 名稱，角色，值",
        body: "每個 UI 元件都必須向輔助科技暴露其名稱、角色與值。原生元素免費提供；自訂控制項需要無障礙名稱與正確的角色。失敗：一個行為像按鈕的 div，卻被宣告為「泛用」。",
      },
      "aria-restrained": {
        title: "ARIA，節制使用",
        body: "ARIA 傳達語意；它不提供鍵盤行為。先使用原生 HTML；只有在 HTML 無法表達時才動用 ARIA（對話框、即時區域、自訂元件）— 而且當你加上 role 時，你就要負責鍵盤互動。",
      },
      "audit-overview": {
        title: "評估概觀",
        body: "自動化工具能協助，但沒有任何工具能單獨判定合規 — 需要人工判斷。稽核結合自動化掃描、手動檢查與輔助科技測試，並以可重現的證據記錄。",
      },
      "audit-easy-checks": {
        title: "簡易檢查（首次檢視）",
        body: "快速的第一輪：頁面標題、標題、對比、替代文字、鍵盤存取、縮放及表單。簡易檢查能快速找出明顯問題，但並非合規評估。",
      },
      "audit-automated": {
        title: "自動化工具",
        body: "axe、WAVE 與 Lighthouse 約能捕捉 30–50% 的問題 — 且會產生誤報。將每項發現視為需手動驗證的線索，而非定論。",
      },
      "audit-manual": {
        title: "手動測試",
        body: "自動化無法判斷的部分：純鍵盤操作、焦點順序、渲染像素的對比、標題階層及錯誤處理。這是任何可信稽核的核心。",
      },
      "audit-screen-reader": {
        title: "螢幕閱讀器測試",
        body: "使用真實的螢幕閱讀器測試（NVDA + Chrome、VoiceOver + Safari）：閱讀順序、標題、地標、連結、表單及動態更新。這能捕捉程式碼檢查無法發現的問題。",
      },
      "audit-wcag-em": {
        title: "WCAG-EM 與 VPAT/ACR",
        body: "WCAG-EM 是評估方法論：定義範圍 → 探索產品 → 選取代表性樣本 → 評估樣本 → 報告。VPAT 是空白範本；為特定產品填寫完成的 VPAT 即為無障礙合規報告（ACR）。",
      },
      "capstone-audit": {
        title: "專題：稽核一個網站",
        body: "整合所學：執行一次真實稽核。挑選一個小網站，遵循 WCAG-EM 五步驟（定義範圍、探索、選取代表性樣本、依 WCAG 2.2 AA 評估、報告），並記錄你的證據。使用「執行掃描」工具取得自動化基準，再以鍵盤與螢幕閱讀器驗證。",
      },
    },
    quizzes: {
      "advocacy-quiz": {
        title: "倡導測驗",
        questions: {
          a1: {
            prompt: "一位設計師說：「盲人使用者是我們唯一的無障礙受眾，所以只要頁面在螢幕閱讀器下正常運作，我們就完成了。」這有什麼問題？",
            options: [
              "沒問題 — 螢幕閱讀器支援涵蓋所有身心障礙",
              "它忽略了低視力、動作、聽覺與認知障礙，而這些更為普遍",
              "螢幕閱讀器已不再廣泛使用",
            ],
            explanation: "盲人使用者只是身心障礙人口中的少數；低視力、動作、聽覺與認知障礙各自需要對應的修復。",
          },
          a2: {
            prompt: "相較於 WCAG 1.0，WCAG 2.0 引入了哪項改變？",
            options: [
              "POUR 四原則與可測試的成功準則",
              "首項字幕要求",
              "禁止 JavaScript",
            ],
            explanation: "WCAG 2.0 將 14 條檢查點重組為 POUR 四原則，並搭配可測試的成功準則與 A/AA/AAA 等級。",
          },
          a3: {
            prompt: "一位主管詢問公司為何應投資無障礙。哪個論點最弱？",
            options: [
              "它能降低法律風險",
              "它能拓展市場觸及並改善 SEO",
              "WCAG 標準要求全球所有私人企業遵循",
            ],
            explanation: "WCAG 是技術標準，不是全球性的法律強制 — 法律因司法管轄區而異。",
          },
        },
      },
      "everyday-quiz": {
        title: "日常測驗",
        questions: {
          e1: {
            prompt: "一張裝飾性的水平分隔線圖片被設為 alt=\"divider line\"。應改為什麼？",
            options: ["alt=\"\"", "alt=\"decorative image\"", "改用 <hr> 元素"],
            explanation: "裝飾性分隔線最好以語意的 <hr> 表達；若必須用圖片，則使用空白 alt 讓它被忽略。",
          },
          e2: {
            prompt: "一個表單輸入使用 placeholder=\"Email address\" 且沒有 <label>。為什麼這是問題？",
            options: [
              "所有螢幕閱讀器都會把佔位文字宣告為標籤",
              "佔位文字在聚焦時消失，且輔助科技常會略過它",
              "這不是問題",
            ],
            explanation: "佔位文字在使用者輸入時會消失，且暴露方式不一致 — 需要真正的 <label>。",
          },
          e3: {
            prompt: "你發現白底上的內文是 #888888。這最直接違反哪條 SC，需要什麼比例？",
            options: ["1.4.1 — 3:1", "1.4.3 — 4.5:1", "1.4.11 — UI 元件 3:1"],
            explanation: "白底上的 #888 約為 3.5:1，低於 1.4.3 對一般文字要求的 4.5:1。",
          },
        },
      },
      "perceivable-quiz": {
        title: "可感知測驗",
        questions: {
          pr1: {
            prompt: "一張複雜的資料圖表是 <img>。針對 1.1.1 的正確做法為何？",
            options: [
              "alt=\"chart\"",
              "簡短 alt 加上附近的長描述或資料表格",
              "移除圖片",
            ],
            explanation: "複雜圖片需要簡短 alt 加上長描述（或對等的資料表格）。",
          },
          pr2: {
            prompt: "頁面在 1280 px 正常，但在 320 px 強制水平捲動。違反哪條 SC？",
            options: ["1.4.3", "1.4.10", "2.4.7"],
            explanation: "1.4.10 重排要求內容在 320 px 下重排，不出現二維捲動。",
          },
        },
      },
      "operable-quiz": {
        title: "可操作測驗",
        questions: {
          op1: {
            prompt: "一個下拉選單只在滑鼠懸停時開啟，鍵盤聚焦時不開啟，且無法用 Escape 關閉。違反哪條 SC？",
            options: ["僅 1.4.13", "2.1.1（鍵盤）與 1.4.13", "沒有 SC 違反 — 懸停就夠了"],
            explanation: "鍵盤可操作性（2.1.1）與可關閉/可懸停內容（1.4.13）皆適用。",
          },
          op2: {
            prompt: "一個按鈕以 :focus { outline: none } 移除了焦點外框。違反什麼，為什麼重要？",
            options: [
              "2.4.7 — 鍵盤使用者無法得知焦點位置",
              "1.4.3 — 外框對比不足",
              "沒有問題 — 外框可有可無",
            ],
            explanation: "移除可見焦點指示違反 2.4.7 焦點可見。",
          },
        },
      },
      "understandable-quiz": {
        title: "可理解測驗",
        questions: {
          u1: {
            prompt: "登入表單以欄位旁的紅色邊框拒絕了錯誤密碼。違反什麼？",
            options: [
              "僅 1.4.3",
              "3.3.1 — 錯誤未以文字識別或描述",
              "沒有問題 — 紅色邊框就足夠了",
            ],
            explanation: "3.3.1 要求以文字識別並描述錯誤；僅靠色彩是不夠的。",
          },
          u2: {
            prompt: "一個頁面混用英文與中文句子，卻未標記語言變化。你應檢查哪條 SC？",
            options: ["2.4.4", "3.1.2", "1.4.5"],
            explanation: "3.1.2 語言部分要求在頁面內標記語言變化。",
          },
        },
      },
      "robust-quiz": {
        title: "穩健測驗",
        questions: {
          r1: {
            prompt: "一個自訂開關是 <div role=\"switch\" aria-checked=\"true\">，但沒有鍵盤處理。有什麼問題？",
            options: [
              "沒有問題 — ARIA 使它無障礙",
              "ARIA 提供角色但不提供鍵盤行為；仍需要焦點與 Space/Enter 處理",
              "只有 <button> 可以是開關",
            ],
            explanation: "ARIA 傳達語意但不提供互動 — 必須實作鍵盤操作（2.1.1）。",
          },
        },
      },
      "audit-quiz": {
        title: "稽核測驗",
        questions: {
          au1: {
            prompt: "自動化掃描回報 0 個違規。正確的結論為何？",
            options: [
              "網站是合規的",
              "網站僅通過了自動化檢查 — 仍需要手動與輔助科技測試",
              "網站不需要進一步處理",
            ],
            explanation: "自動化工具只能捕捉一部分問題；合規需要人工評估。",
          },
          au2: {
            prompt: "在 WCAG-EM 中，為什麼要「選取代表性樣本」而非測試每個頁面？",
            options: [
              "這樣比較快",
              "為了評估一個可管理、可辯護的頁面、範本與狀態子集",
              "WCAG 不要求測試",
            ],
            explanation: "WCAG-EM 第 3 步選取常見頁面、範本、狀態與完整流程，使範圍具可辯護性。",
          },
        },
      },
    },
    meta: {
      "what-is-accessibility": {
        outcome: "區分無障礙、易用性與包容性設計。",
        check: {
          prompt: "一個頁面沒有 WCAG 違規，但對每個人都難以使用。哪項正確？",
          options: ["它自動就易用", "無障礙與易用性重疊但並不相同", "WCAG 是唯一的品質衡量"],
          explanation: "頁面可以合規卻仍是糟糕的體驗 — 無障礙消除障礙，而易用性更廣。",
        },
      },
      "how-people-use-the-web": {
        outcome: "說出人們瀏覽網頁所使用的輔助科技。",
        check: {
          prompt: "哪種輔助科技最能幫助低視力者閱讀文字？",
          options: ["螢幕閱讀器", "螢幕放大鏡", "語音控制"],
          explanation: "放大鏡為低視力使用者放大內容；螢幕閱讀器則為盲人使用者宣告內容。",
        },
      },
      "disability-barriers": {
        outcome: "認知到身心障礙是人與環境的不匹配。",
        check: {
          prompt: "下列何者是暫時性身心障礙的最佳範例？",
          options: ["失明", "限制滑鼠使用的骨折手臂", "閱讀障礙"],
          explanation: "骨折的手臂是暫時且情境性的 — 為此設計能惠及所有人。",
        },
      },
      "business-legal-case": {
        outcome: "說明無障礙的商業與法律驅動力。",
        check: {
          prompt: "哪項標準規範歐盟公共部門的數位無障礙？",
          options: ["ADA", "Section 508", "EN 301 549"],
          explanation: "EN 301 549 是歐盟標準；Section 508 是美國的，ADA 是美國法律。",
        },
      },
      "inclusive-design-etiquette": {
        outcome: "使用尊重、以人為本的語言談論身心障礙。",
        check: {
          prompt: "以人為先與以身份為先的語言最適合描述為：",
          options: ["一條嚴格規則", "情境偏好 — 使用當事人自己的用語", "只有以身份為先才正確"],
          explanation: "社群與個人各不相同；遵循人們用於自身的術語。",
        },
      },
      "history-standards": {
        outcome: "追溯 WCAG 1.0→2.2 並說出相關標準。",
        check: {
          prompt: "哪個 WCAG 版本引入了 POUR 四原則？",
          options: ["1.0", "2.0", "2.2"],
          explanation: "WCAG 2.0（2008）將 14 條檢查點重組為 POUR，並搭配可測試的成功準則。",
        },
      },
      "everyday-structure": {
        outcome: "以語意標題與地標結構建立頁面。",
        check: {
          prompt: "一個頁面滿是 <div> 且沒有地標。最佳修復？",
          options: ["加更多 <div>", "使用 header/nav/main/footer 與真實標題", "把 div 樣式化得像章節"],
          explanation: "地標與真實標題階層將結構暴露給輔助科技。",
        },
      },
      "everyday-alt-text": {
        outcome: "為任何圖片撰寫適當的替代文字。",
        check: {
          prompt: "純裝飾性的圖片應有：",
          options: ["alt=\"decorative\"", "alt=\"\"", "長描述"],
          explanation: "空白 alt 會將圖片隱藏於螢幕閱讀器 — 這是裝飾的正確處理方式。",
        },
      },
      "everyday-contrast": {
        outcome: "依 WCAG 最低標準檢查文字對比。",
        check: {
          prompt: "WCAG AA 下一般內文需要什麼對比度？",
          options: ["3:1", "4.5:1", "7:1"],
          explanation: "4.5:1 是一般文字的 AA 最低標準；7:1 是 AAA 目標。",
        },
      },
      "everyday-keyboard": {
        outcome: "讓每個控制項都能以鍵盤操作並具可見焦點。",
        check: {
          prompt: "一個選單在懸停時開啟，但鍵盤聚焦時不開啟。修復方式是：",
          options: ["忽略 — 懸停就夠了", "加入鍵盤與焦點處理", "停用選單"],
          explanation: "滑鼠可操作的任何東西都必須能由鍵盤操作，並具可見焦點。",
        },
      },
      "everyday-links": {
        outcome: "撰寫能描述其目的地的連結文字。",
        check: {
          prompt: "五個「閱讀更多」連結指向不同頁面。最佳修復？",
          options: ["讓每個連結文字描述其目標", "加上 title 屬性", "維持原狀"],
          explanation: "連結文字必須說明去向；「閱讀更多」脫離脈絡毫無意義。",
        },
      },
      "everyday-forms": {
        outcome: "為每個表單欄位加上標籤，並以文字描述錯誤。",
        check: {
          prompt: "一個文字輸入只有佔位文字、沒有 <label>。最佳修復？",
          options: ["加上真正的 <label>", "加深佔位文字顏色", "這樣沒問題"],
          explanation: "佔位文字會消失且暴露不一致 — 需要真正的 <label>。",
        },
      },
      "everyday-media": {
        outcome: "為媒體提供字幕與逐字稿。",
        check: {
          prompt: "含語音的預錄影片在 AA 最低要求下需要：",
          options: ["字幕", "手語", "無需額外內容"],
          explanation: "1.2.2 要求同步媒體中的預錄音訊須有字幕。",
        },
      },
      "everyday-reflow": {
        outcome: "驗證內容在 400% 縮放下重排且不出現水平捲動。",
        check: {
          prompt: "400% 縮放時頁面強制水平捲動。違反哪條 SC？",
          options: ["1.4.3", "1.4.10", "2.4.7"],
          explanation: "1.4.10 重排要求內容在 320px / 400% 下重排，不出現二維捲動。",
        },
      },
      "how-to-read-any-sc": {
        outcome: "閱讀並解讀任何 WCAG 成功準則。",
        check: {
          prompt: "要解讀一條不熟悉的 SC，首先閱讀：",
          options: ["僅 Techniques", "其 Understanding 文件", "任意部落格"],
          explanation: "Understanding 文件解釋意圖、好處與範例 — 是規範文字之後的起點。",
        },
      },
      "sc-1.1.1": {
        outcome: "將替代文字決策樹套用到任何圖片。",
        check: {
          prompt: "複雜的資料圖表需要：",
          options: ["僅 alt=\"chart\"", "簡短 alt 加上長描述或資料表格", "無 alt"],
          explanation: "複雜圖片需要簡短 alt 加上長描述（或對等的資料表格）。",
        },
      },
      "sc-1.3.1": {
        outcome: "以程式化方式暴露結構與關聯。",
        check: {
          prompt: "欄位標籤只有視覺呈現（未關聯）。違反哪條 SC？",
          options: ["1.3.1", "1.4.3", "2.5.8"],
          explanation: "1.3.1 要求資訊與關聯可程式化判定 — 需要真正的 <label>。",
        },
      },
      "sc-1.4.3": {
        outcome: "依 4.5:1 / 3:1 判斷文字對比。",
        check: {
          prompt: "白底上 #888 的內文（約 3.5:1）違反：",
          options: ["1.4.3", "2.4.4", "1.1.1"],
          explanation: "3.5:1 低於一般文字的 4.5:1 最低標準 — 這是 1.4.3 的失敗。",
        },
      },
      "sc-1.4.10": {
        outcome: "在 320px 與 400% 縮放下測試重排。",
        check: {
          prompt: "固定寬度版面在 320px 強制水平捲動。這違反：",
          options: ["1.4.10", "2.4.4", "3.3.1"],
          explanation: "重排（1.4.10）要求單欄重排，不出現二維捲動。",
        },
      },
      "sc-2.1.1": {
        outcome: "驗證每個控制項都可透過鍵盤操作。",
        check: {
          prompt: "一個控制項有 onclick 但沒有鍵盤處理。這違反：",
          options: ["2.1.1", "1.4.3", "4.1.2"],
          explanation: "2.1.1 要求所有功能都能透過鍵盤操作。",
        },
      },
      "sc-2.4.4": {
        outcome: "撰寫在脈絡中清楚的連結文字。",
        check: {
          prompt: "標示為「點此」的連結指向政策頁面。這違反：",
          options: ["2.4.4", "1.4.3", "2.5.8"],
          explanation: "2.4.4 要求連結目的能從連結文字（加上脈絡）清楚判定。",
        },
      },
      "sc-2.4.7": {
        outcome: "在每個控制項上保留可見焦點指示。",
        check: {
          prompt: "CSS 移除焦點外框且沒有替代。這違反：",
          options: ["2.4.7", "1.1.1", "3.3.1"],
          explanation: "2.4.7 要求任何可鍵盤操作的 UI 具有可見焦點指示。",
        },
      },
      "sc-2.5.8": {
        outcome: "驗證互動目標符合 24×24px 最低標準。",
        check: {
          prompt: "沒有內距的微小文字連結低於 24×24px。這違反：",
          options: ["2.5.8", "1.4.3", "3.3.1"],
          explanation: "2.5.8（WCAG 2.2）要求目標至少 24×24 CSS 像素。",
        },
      },
      "sc-3.3.1": {
        outcome: "以文字識別並描述輸入錯誤。",
        check: {
          prompt: "表單在無效欄位上只顯示紅色邊框。這違反：",
          options: ["3.3.1", "2.4.4", "1.4.10"],
          explanation: "3.3.1 要求以文字識別並描述錯誤 — 僅靠色彩是不夠的。",
        },
      },
      "sc-4.1.2": {
        outcome: "確保每個控制項暴露名稱、角色與值。",
        check: {
          prompt: "一個 <div> 行為像按鈕但沒有角色或名稱。這違反：",
          options: ["4.1.2", "1.4.3", "2.4.7"],
          explanation: "4.1.2 要求 UI 元件暴露其名稱、角色與值。",
        },
      },
      "aria-restrained": {
        outcome: "僅在原生 HTML 無法表達語意時使用 ARIA。",
        check: {
          prompt: "何時應動用 ARIA？",
          options: ["永遠，為了穩健", "僅在原生 HTML 無法表達時", "絕不"],
          explanation: "原生 HTML 優先；ARIA 傳達語意但不提供鍵盤行為。",
        },
      },
      "audit-overview": {
        outcome: "說明為何合規需要人工判斷。",
        check: {
          prompt: "自動化工具能否單獨判定合規？",
          options: ["能，只要它回報零錯誤", "不能 — 需要人工評估", "能，針對 AA"],
          explanation: "工具能協助但會漏掉約 50% 的問題；合規需要人工判斷。",
        },
      },
      "audit-easy-checks": {
        outcome: "對頁面執行快速的初步檢視。",
        check: {
          prompt: "簡易檢查最適合描述為：",
          options: ["完整的合規評估", "快速的初步檢視", "自動化掃描"],
          explanation: "簡易檢查是快速的初步檢視，並非合規評估。",
        },
      },
      "audit-automated": {
        outcome: "批判性地使用自動化工具，並手動驗證發現。",
        check: {
          prompt: "自動化掃描回報零錯誤。最佳回應？",
          options: ["宣告網站合規", "手動驗證 — 工具會漏掉許多問題", "直接上線"],
          explanation: "自動化工具只捕捉一部分問題，且會產生誤報與遺漏。",
        },
      },
      "audit-manual": {
        outcome: "手動執行鍵盤、焦點與對比測試。",
        check: {
          prompt: "下列何者是手動測試（非自動化）？",
          options: ["執行 axe", "純鍵盤導覽", "Lighthouse 分數"],
          explanation: "純鍵盤操作是自動化無法判斷的手動測試。",
        },
      },
      "audit-screen-reader": {
        outcome: "以真實螢幕閱讀器測試頁面。",
        check: {
          prompt: "常見的螢幕閱讀器測試組合是：",
          options: ["NVDA + Chrome（Windows）", "axe + Lighthouse", "VoiceOver + axe"],
          explanation: "Windows 的 NVDA + Chrome（及 macOS 的 VoiceOver + Safari）是標準組合。",
        },
      },
      "audit-wcag-em": {
        outcome: "使用 WCAG-EM 五步驟組織稽核。",
        check: {
          prompt: "正確的 WCAG-EM 順序是：",
          options: ["探索 → 範圍 → 評估 → 報告", "範圍 → 探索 → 樣本 → 評估 → 報告", "報告 → 評估 → 樣本"],
          explanation: "WCAG-EM：定義範圍、探索、選取樣本、評估、報告。",
        },
      },
      "capstone-audit": {
        outcome: "完成 WCAG-EM 稽核並產出合規報告。",
        check: {
          prompt: "專題的交付成果是：",
          options: ["通過的測驗分數", "基於證據的合規報告", "程式碼範例"],
          explanation: "專題是一份基於證據的 WCAG-EM 報告 — 真實的評量。",
        },
      },
    },
  },
  "zh-Hans": {
    pathTitle: "Ascent 网页无障碍计划",
    modules: {
      advocacy: {
        title: "倡导",
        description: "提出论据 — 谁需要无障碍、他们面对的障碍，以及这对你的组织为何重要。",
      },
      everyday: {
        title: "日常无障碍",
        description: "修复常见障碍 — 结构、替代文本、对比、键盘、链接、表单、媒体及重排。",
      },
      standards: {
        title: "标准",
        description: "精通标准 — 读懂任何 WCAG 2.2 准则，并深入探讨造成大多数真实失败的准则。",
      },
      audit: {
        title: "审计",
        description: "证明合规 — 自动化、手动及屏幕阅读器测试，最终完成专题审计。",
      },
    },
    lessons: {
      "what-is-accessibility": {
        title: "什么是网页无障碍",
        body: "网页无障碍意味着身心障碍人士可以感知、理解、浏览、互动并贡献于网页。它是易用性的一个子集，与包容性设计不同：无障碍旨在消除障碍，而包容性设计则从一开始就力求不排除任何人。",
      },
      "how-people-use-the-web": {
        title: "人们如何使用网页",
        body: "人们使用辅助科技与适应性策略：屏幕阅读器、放大、纯键盘浏览、语音控制及开关设备。每一种都揭示不同的障碍 — 同一个页面对某个人可能无法使用，对另一个人却没有问题。",
      },
      "disability-barriers": {
        title: "障碍类型与阻碍",
        body: "身心障碍是人与环境之间的不匹配，而非个人的缺陷。障碍分为视觉、听觉、动作及认知类别 — 且可能是永久、暂时或情境性的。为某一类人设计往往能惠及许多人。",
      },
      "business-legal-case": {
        title: "商业与法律论据",
        body: "无障碍能拓展市场触达、促进创新与品牌信任 — 并降低法律风险。法律因司法管辖区而异：ADA 与 Section 508（美国）、EN 301 549（欧盟）及其他地区的对应法规。法律合规并不等同于技术合规。",
      },
      "inclusive-design-etiquette": {
        title: "包容性设计与用语礼仪",
        body: "包容性设计遵循「识别排除、从多样性学习、为一人解决并扩及众人」。使用个人与社群用于自身的术语 — 以人为先或以身份为先皆是情境偏好，而非规则。",
      },
      "history-standards": {
        title: "WCAG 与标准的历史",
        body: "WCAG 1.0（1999）使用 14 条检查点；WCAG 2.0（2008）重组为 POUR 四原则，并搭配可测试的成功准则及 A/AA/AAA 等级（后成为 ISO/IEC 40500）。WCAG 2.1（2018）新增移动设备、低视力及认知准则；2.2（2023）新增焦点外观、目标尺寸、拖拽及无障碍验证。WCAG 3.0 正在开发中。相关标准：Section 508、EN 301 549、ATAG（编写工具）、UAAG（用户代理）、WAI-ARIA。",
      },
      "everyday-structure": {
        title: "语义与结构",
        body: "屏幕阅读器用户通过标题、地标与列表来浏览 — 而不是用看的。使用真实的标题层级（一个 h1、有序的层级）、地标（header/nav/main/footer）及语义列表。一个看起来有结构、实际上却是满满 div 的页面，对屏幕阅读器而言就是一堵墙。",
      },
      "everyday-alt-text": {
        title: "文字替代",
        body: "每张图片都需要一个决定：信息性（描述内容）、装饰性（alt=\"\"）、功能性（描述动作）或复杂（长描述）。替代文本会取代某人无法看见的图片 — 就像你口头描述那张图片一样地编写。",
      },
      "everyday-contrast": {
        title: "色彩与对比",
        body: "低视力影响的人远多于全盲。正文需要至少 4.5:1（大号文字 3:1），且色彩绝不能是唯一的信号 — 红色要搭配图标或文字。检查实际渲染的色彩，而不只是样式表里的值。",
      },
      "everyday-keyboard": {
        title: "键盘与焦点",
        body: "鼠标能做的一切都必须能只靠键盘完成 — 而且你必须能看到自己所在的位置。切勿移除焦点外框；使用原生交互元素，键盘与焦点就能「直接运作」。测试方式：拔掉鼠标。",
      },
      "everyday-links": {
        title: "链接与导航",
        body: "屏幕阅读器用户会逐个链接切换，在没有上下文的状况下听取文字。「点击此处」与「阅读更多」毫无意义 — 链接文字本身必须说明它通往何处。提供跳过链接以略过重复的导航。",
      },
      "everyday-forms": {
        title: "表单与错误",
        body: "每个输入都需要可见且程序化的标签；错误必须以文字识别、描述并链接到该字段。使用 <label>、分组用 <fieldset>/<legend>，以及提示与错误信息用 aria-describedby — 切勿以占位文字作为标签。",
      },
      "everyday-media": {
        title: "媒体（字幕与音频）",
        body: "视频需要字幕给听不见的人，并以音频描述或文字稿给看不见的人。音频需要文字稿。自动播放的音频必须可控制。字幕是媒体最高影响力的修复。",
      },
      "everyday-reflow": {
        title: "缩放、重排与目标尺寸",
        body: "内容必须在 320 px 及 400% 缩放下重排，不出现水平滚动，且文字缩放时不得破版。交互目标至少需要 24×24 px（WCAG 2.2）— 过小的链接是动作无障碍的障碍。",
      },
      "how-to-read-any-sc": {
        title: "如何读懂任何成功准则",
        body: "你不需要背诵 87 条准则 — 你需要的是方法。对任何 SC：先读规范文字，再读其 Understanding 文件（意图、好处、示例），接着读 Techniques（充分、建议及已记录的失败），最后决定如何测试。编号的第一位数字代表原则，第二位代表指引。",
      },
      "sc-1.1.1": {
        title: "1.1.1 非文本内容",
        body: "替代文本决策树：信息性 → 描述；装饰性 → 空白 alt；功能性 → 描述动作；复杂 → 长描述。失败：图片被宣告为「无」或「文件名」。测试：用屏幕阅读器逐项切换，询问每张图片传达了什么。",
      },
      "sc-1.3.1": {
        title: "1.3.1 信息和关系",
        body: "程序化结构必须与视觉结构一致。标题、地标、列表、表格及 <label> 关联将关系暴露给辅助科技。失败：「标题只是粗体文字」；「表单字段没有标签」。",
      },
      "sc-1.4.3": {
        title: "1.4.3 对比度（最小）",
        body: "一般文字 4.5:1，大号文字与 UI 组件 3:1。判断方式：计算渲染前后景的对比度。失败：灰底白字、文字压在杂乱图片上。用对比检查器测试，不要用目测。",
      },
      "sc-1.4.10": {
        title: "1.4.10 反复滚动",
        body: "在 320 px（或 1280 px 视口的 400% 缩放）下，内容必须重排为单栏，不出现水平滚动且功能不丧失。失败：强制二维滚动的表格或固定宽度布局。测试：实际缩放到 400%。",
      },
      "sc-2.1.1": {
        title: "2.1.1 键盘",
        body: "所有功能都必须能通过键盘接口操作 — 不只是「可到达」，而是可使用，并具备可见焦点与逻辑顺序。失败：只有点击处理器、没有键盘对应的控件。测试：拔掉鼠标。",
      },
      "sc-2.4.4": {
        title: "2.4.4 链接目的（在上下文里）",
        body: "每个链接的目的必须能从链接文字本身、或链接文字加上其程序化上下文中判定。失败：多个指向不同目标的「阅读更多」链接。测试：列出所有链接，逐个脱离上下文读取。",
      },
      "sc-2.4.7": {
        title: "2.4.7 焦点可见",
        body: "任何可通过键盘操作的元素都必须有可见的焦点指示。失败：以 :focus { outline: none } 移除外框且没有替代。测试：逐项 Tab 切换，确认你始终能看到自己所在的位置。",
      },
      "sc-2.5.8": {
        title: "2.5.8 目标尺寸（最小）",
        body: "目标至少需 24×24 CSS 像素（有间距例外）— 这是 WCAG 2.2 针对动作与触控访问的准则。失败：没有内距的微小文字链接。测试：量测命中区域，而非字形。",
      },
      "sc-3.3.1": {
        title: "3.3.1 错误标识",
        body: "当输入无效时，必须以文字向用户识别并描述错误，并指出有问题的字段。失败：表单变红却没有任何信息。测试：提交无效表单，确认屏幕阅读器宣告哪里出错。",
      },
      "sc-4.1.2": {
        title: "4.1.2 名称，角色，值",
        body: "每个 UI 组件都必须向辅助科技暴露其名称、角色与值。原生元素免费提供；自定义控件需要无障碍名称与正确的角色。失败：一个行为像按钮的 div，却被宣告为「泛用」。",
      },
      "aria-restrained": {
        title: "ARIA，节制使用",
        body: "ARIA 传达语义；它不提供键盘行为。先使用原生 HTML；只有在 HTML 无法表达时才动用 ARIA（对话框、实时区域、自定义组件）— 而且当你加上 role 时，你就要负责键盘交互。",
      },
      "audit-overview": {
        title: "评估概观",
        body: "自动化工具能协助，但没有任何工具能单独判定合规 — 需要人工判断。审计结合自动化扫描、手动检查与辅助科技测试，并以可重现的证据记录。",
      },
      "audit-easy-checks": {
        title: "简易检查（首次检视）",
        body: "快速的第一轮：页面标题、标题、对比、替代文本、键盘访问、缩放及表单。简易检查能快速找出明显问题，但并非合规评估。",
      },
      "audit-automated": {
        title: "自动化工具",
        body: "axe、WAVE 与 Lighthouse 约能捕捉 30–50% 的问题 — 且会产生误报。将每项发现视为需手动验证的线索，而非定论。",
      },
      "audit-manual": {
        title: "手动测试",
        body: "自动化无法判断的部分：纯键盘操作、焦点顺序、渲染像素的对比、标题层级及错误处理。这是任何可信审计的核心。",
      },
      "audit-screen-reader": {
        title: "屏幕阅读器测试",
        body: "使用真实的屏幕阅读器测试（NVDA + Chrome、VoiceOver + Safari）：阅读顺序、标题、地标、链接、表单及动态更新。这能捕捉代码检查无法发现的问题。",
      },
      "audit-wcag-em": {
        title: "WCAG-EM 与 VPAT/ACR",
        body: "WCAG-EM 是评估方法论：定义范围 → 探索产品 → 选取代表性样本 → 评估样本 → 报告。VPAT 是空白模板；为特定产品填写完成的 VPAT 即为无障碍合规报告（ACR）。",
      },
      "capstone-audit": {
        title: "专题：审计一个网站",
        body: "整合所学：执行一次真实审计。挑选一个小网站，遵循 WCAG-EM 五步骤（定义范围、探索、选取代表性样本、依 WCAG 2.2 AA 评估、报告），并记录你的证据。使用「执行扫描」工具取得自动化基准，再以键盘与屏幕阅读器验证。",
      },
    },
    quizzes: {
      "advocacy-quiz": {
        title: "倡导测验",
        questions: {
          a1: {
            prompt: "一位设计师说：「盲人用户是我们唯一的无障碍受众，所以只要页面在屏幕阅读器下正常运作，我们就完成了。」这有什么问题？",
            options: [
              "没问题 — 屏幕阅读器支持涵盖所有身心障碍",
              "它忽略了低视力、动作、听觉与认知障碍，而这些更为普遍",
              "屏幕阅读器已不再广泛使用",
            ],
            explanation: "盲人用户只是身心障碍人口中的少数；低视力、动作、听觉与认知障碍各自需要对应的修复。",
          },
          a2: {
            prompt: "相较于 WCAG 1.0，WCAG 2.0 引入了哪项改变？",
            options: ["POUR 四原则与可测试的成功准则", "首项字幕要求", "禁止 JavaScript"],
            explanation: "WCAG 2.0 将 14 条检查点重组为 POUR 四原则，并搭配可测试的成功准则与 A/AA/AAA 等级。",
          },
          a3: {
            prompt: "一位主管询问公司为何应投资无障碍。哪个论点最弱？",
            options: [
              "它能降低法律风险",
              "它能拓展市场触达并改善 SEO",
              "WCAG 标准要求全球所有私人企业遵循",
            ],
            explanation: "WCAG 是技术标准，不是全球性的法律强制 — 法律因司法管辖区而异。",
          },
        },
      },
      "everyday-quiz": {
        title: "日常测验",
        questions: {
          e1: {
            prompt: "一张装饰性的水平分隔线图片被设为 alt=\"divider line\"。应改为什么？",
            options: ["alt=\"\"", "alt=\"decorative image\"", "改用 <hr> 元素"],
            explanation: "装饰性分隔线最好以语义的 <hr> 表达；若必须用图片，则使用空白 alt 让它被忽略。",
          },
          e2: {
            prompt: "一个表单输入使用 placeholder=\"Email address\" 且没有 <label>。为什么这是问题？",
            options: [
              "所有屏幕阅读器都会把占位文字宣告为标签",
              "占位文字在聚焦时消失，且辅助科技常会略过它",
              "这不是问题",
            ],
            explanation: "占位文字在用户输入时会消失，且暴露方式不一致 — 需要真正的 <label>。",
          },
          e3: {
            prompt: "你发现白底上的正文是 #888888。这最直接违反哪条 SC，需要什么比例？",
            options: ["1.4.1 — 3:1", "1.4.3 — 4.5:1", "1.4.11 — UI 组件 3:1"],
            explanation: "白底上的 #888 约为 3.5:1，低于 1.4.3 对一般文字要求的 4.5:1。",
          },
        },
      },
      "perceivable-quiz": {
        title: "可感知测验",
        questions: {
          pr1: {
            prompt: "一张复杂的数据图表是 <img>。针对 1.1.1 的正确做法为何？",
            options: ["alt=\"chart\"", "简短 alt 加上附近的长描述或数据表格", "移除图片"],
            explanation: "复杂图片需要简短 alt 加上长描述（或对等的数据表格）。",
          },
          pr2: {
            prompt: "页面在 1280 px 正常，但在 320 px 强制水平滚动。违反哪条 SC？",
            options: ["1.4.3", "1.4.10", "2.4.7"],
            explanation: "1.4.10 重排要求内容在 320 px 下重排，不出现二维滚动。",
          },
        },
      },
      "operable-quiz": {
        title: "可操作测验",
        questions: {
          op1: {
            prompt: "一个下拉菜单只在鼠标悬停时打开，键盘聚焦时不打开，且无法用 Escape 关闭。违反哪条 SC？",
            options: ["仅 1.4.13", "2.1.1（键盘）与 1.4.13", "没有 SC 违反 — 悬停就够了"],
            explanation: "键盘可操作性（2.1.1）与可关闭/可悬停内容（1.4.13）皆适用。",
          },
          op2: {
            prompt: "一个按钮以 :focus { outline: none } 移除了焦点外框。违反什么，为什么重要？",
            options: ["2.4.7 — 键盘用户无法得知焦点位置", "1.4.3 — 外框对比不足", "没有问题 — 外框可有可无"],
            explanation: "移除可见焦点指示违反 2.4.7 焦点可见。",
          },
        },
      },
      "understandable-quiz": {
        title: "可理解测验",
        questions: {
          u1: {
            prompt: "登录表单以字段旁的红色边框拒绝了错误密码。违反什么？",
            options: ["仅 1.4.3", "3.3.1 — 错误未以文字识别或描述", "没有问题 — 红色边框就够了"],
            explanation: "3.3.1 要求以文字识别并描述错误；仅靠色彩是不够的。",
          },
          u2: {
            prompt: "一个页面混用英文与中文句子，却未标记语言变化。你应检查哪条 SC？",
            options: ["2.4.4", "3.1.2", "1.4.5"],
            explanation: "3.1.2 语言部分要求在页面内标记语言变化。",
          },
        },
      },
      "robust-quiz": {
        title: "稳健测验",
        questions: {
          r1: {
            prompt: "一个自定义开关是 <div role=\"switch\" aria-checked=\"true\">，但没有键盘处理。有什么问题？",
            options: [
              "没有问题 — ARIA 使它无障碍",
              "ARIA 提供角色但不提供键盘行为；仍需要焦点与 Space/Enter 处理",
              "只有 <button> 可以是开关",
            ],
            explanation: "ARIA 传达语义但不提供交互 — 必须实现键盘操作（2.1.1）。",
          },
        },
      },
      "audit-quiz": {
        title: "审计测验",
        questions: {
          au1: {
            prompt: "自动化扫描回报 0 个违规。正确的结论为何？",
            options: ["网站是合规的", "网站仅通过了自动化检查 — 仍需要手动与辅助科技测试", "网站不需要进一步处理"],
            explanation: "自动化工具只能捕捉一部分问题；合规需要人工评估。",
          },
          au2: {
            prompt: "在 WCAG-EM 中，为什么要「选取代表性样本」而非测试每个页面？",
            options: ["这样比较快", "为了评估一个可管理、可辩护的页面、模板与状态子集", "WCAG 不要求测试"],
            explanation: "WCAG-EM 第 3 步选取常见页面、模板、状态与完整流程，使范围具可辩护性。",
          },
        },
      },
    },
    meta: {
      "what-is-accessibility": {
        outcome: "区分无障碍、易用性与包容性设计。",
        check: {
          prompt: "一个页面没有 WCAG 违规，但对每个人都难以使用。哪项正确？",
          options: ["它自动就易用", "无障碍与易用性重叠但并不相同", "WCAG 是唯一的品质衡量"],
          explanation: "页面可以合规却仍是糟糕的体验 — 无障碍消除障碍，而易用性更广。",
        },
      },
      "how-people-use-the-web": {
        outcome: "说出人们浏览网页所使用的辅助科技。",
        check: {
          prompt: "哪种辅助科技最能帮助低视力者阅读文字？",
          options: ["屏幕阅读器", "屏幕放大镜", "语音控制"],
          explanation: "放大镜为低视力用户放大内容；屏幕阅读器则为盲人用户宣告内容。",
        },
      },
      "disability-barriers": {
        outcome: "认知到身心障碍是人与环境的不匹配。",
        check: {
          prompt: "下列何者是暂时性身心障碍的最佳示例？",
          options: ["失明", "限制鼠标使用的骨折手臂", "阅读障碍"],
          explanation: "骨折的手臂是暂时且情境性的 — 为此设计能惠及所有人。",
        },
      },
      "business-legal-case": {
        outcome: "说明无障碍的商业与法律驱动力。",
        check: {
          prompt: "哪项标准规范欧盟公共部门的数字无障碍？",
          options: ["ADA", "Section 508", "EN 301 549"],
          explanation: "EN 301 549 是欧盟标准；Section 508 是美国的，ADA 是美国法律。",
        },
      },
      "inclusive-design-etiquette": {
        outcome: "使用尊重、以人为本的语言谈论身心障碍。",
        check: {
          prompt: "以人为先与以身份为先的语言最适合描述为：",
          options: ["一条严格规则", "情境偏好 — 使用当事人自己的用语", "只有以身份为先才正确"],
          explanation: "社群与个人各不相同；遵循人们用于自身的术语。",
        },
      },
      "history-standards": {
        outcome: "追溯 WCAG 1.0→2.2 并说出相关标准。",
        check: {
          prompt: "哪个 WCAG 版本引入了 POUR 四原则？",
          options: ["1.0", "2.0", "2.2"],
          explanation: "WCAG 2.0（2008）将 14 条检查点重组为 POUR，并搭配可测试的成功准则。",
        },
      },
      "everyday-structure": {
        outcome: "以语义标题与地标结构建立页面。",
        check: {
          prompt: "一个页面满是 <div> 且没有地标。最佳修复？",
          options: ["加更多 <div>", "使用 header/nav/main/footer 与真实标题", "把 div 样式化得像章节"],
          explanation: "地标与真实标题层级将结构暴露给辅助科技。",
        },
      },
      "everyday-alt-text": {
        outcome: "为任何图片编写适当的替代文本。",
        check: {
          prompt: "纯装饰性的图片应有：",
          options: ["alt=\"decorative\"", "alt=\"\"", "长描述"],
          explanation: "空白 alt 会将图片隐藏于屏幕阅读器 — 这是装饰的正确处理方式。",
        },
      },
      "everyday-contrast": {
        outcome: "依 WCAG 最低标准检查文字对比。",
        check: {
          prompt: "WCAG AA 下一般正文需要什么对比度？",
          options: ["3:1", "4.5:1", "7:1"],
          explanation: "4.5:1 是一般文字的 AA 最低标准；7:1 是 AAA 目标。",
        },
      },
      "everyday-keyboard": {
        outcome: "让每个控件都能以键盘操作并具可见焦点。",
        check: {
          prompt: "一个菜单在悬停时打开，但键盘聚焦时不打开。修复方式是：",
          options: ["忽略 — 悬停就够了", "加入键盘与焦点处理", "停用菜单"],
          explanation: "鼠标可操作的任何东西都必须能由键盘操作，并具可见焦点。",
        },
      },
      "everyday-links": {
        outcome: "编写能描述其目的地的链接文字。",
        check: {
          prompt: "五个「阅读更多」链接指向不同页面。最佳修复？",
          options: ["让每个链接文字描述其目标", "加上 title 属性", "维持原状"],
          explanation: "链接文字必须说明去向；「阅读更多」脱离上下文毫无意义。",
        },
      },
      "everyday-forms": {
        outcome: "为每个表单字段加上标签，并以文字描述错误。",
        check: {
          prompt: "一个文字输入只有占位文字、没有 <label>。最佳修复？",
          options: ["加上真正的 <label>", "加深占位文字颜色", "这样没问题"],
          explanation: "占位文字会消失且暴露不一致 — 需要真正的 <label>。",
        },
      },
      "everyday-media": {
        outcome: "为媒体提供字幕与文字稿。",
        check: {
          prompt: "含语音的预录视频在 AA 最低要求下需要：",
          options: ["字幕", "手语", "无需额外内容"],
          explanation: "1.2.2 要求同步媒体中的预录音频须有字幕。",
        },
      },
      "everyday-reflow": {
        outcome: "验证内容在 400% 缩放下重排且不出现水平滚动。",
        check: {
          prompt: "400% 缩放时页面强制水平滚动。违反哪条 SC？",
          options: ["1.4.3", "1.4.10", "2.4.7"],
          explanation: "1.4.10 重排要求内容在 320px / 400% 下重排，不出现二维滚动。",
        },
      },
      "how-to-read-any-sc": {
        outcome: "阅读并解读任何 WCAG 成功准则。",
        check: {
          prompt: "要解读一条不熟悉的 SC，首先阅读：",
          options: ["仅 Techniques", "其 Understanding 文件", "任意博客"],
          explanation: "Understanding 文件解释意图、好处与示例 — 是规范文字之后的起点。",
        },
      },
      "sc-1.1.1": {
        outcome: "将替代文本决策树套用到任何图片。",
        check: {
          prompt: "复杂的数据图表需要：",
          options: ["仅 alt=\"chart\"", "简短 alt 加上长描述或数据表格", "无 alt"],
          explanation: "复杂图片需要简短 alt 加上长描述（或对等的数据表格）。",
        },
      },
      "sc-1.3.1": {
        outcome: "以程序化方式暴露结构与关联。",
        check: {
          prompt: "字段标签只有视觉呈现（未关联）。违反哪条 SC？",
          options: ["1.3.1", "1.4.3", "2.5.8"],
          explanation: "1.3.1 要求信息与关联可程序化判定 — 需要真正的 <label>。",
        },
      },
      "sc-1.4.3": {
        outcome: "依 4.5:1 / 3:1 判断文字对比。",
        check: {
          prompt: "白底上 #888 的正文（约 3.5:1）违反：",
          options: ["1.4.3", "2.4.4", "1.1.1"],
          explanation: "3.5:1 低于一般文字的 4.5:1 最低标准 — 这是 1.4.3 的失败。",
        },
      },
      "sc-1.4.10": {
        outcome: "在 320px 与 400% 缩放下测试重排。",
        check: {
          prompt: "固定宽度布局在 320px 强制水平滚动。这违反：",
          options: ["1.4.10", "2.4.4", "3.3.1"],
          explanation: "重排（1.4.10）要求单栏重排，不出现二维滚动。",
        },
      },
      "sc-2.1.1": {
        outcome: "验证每个控件都可通过键盘操作。",
        check: {
          prompt: "一个控件有 onclick 但没有键盘处理。这违反：",
          options: ["2.1.1", "1.4.3", "4.1.2"],
          explanation: "2.1.1 要求所有功能都能通过键盘操作。",
        },
      },
      "sc-2.4.4": {
        outcome: "编写在上下文中清楚的链接文字。",
        check: {
          prompt: "标示为「点击此处」的链接指向政策页面。这违反：",
          options: ["2.4.4", "1.4.3", "2.5.8"],
          explanation: "2.4.4 要求链接目的能从链接文字（加上上下文）清楚判定。",
        },
      },
      "sc-2.4.7": {
        outcome: "在每个控件上保留可见焦点指示。",
        check: {
          prompt: "CSS 移除焦点外框且没有替代。这违反：",
          options: ["2.4.7", "1.1.1", "3.3.1"],
          explanation: "2.4.7 要求任何可键盘操作的 UI 具有可见焦点指示。",
        },
      },
      "sc-2.5.8": {
        outcome: "验证交互目标符合 24×24px 最低标准。",
        check: {
          prompt: "没有内距的微小文字链接低于 24×24px。这违反：",
          options: ["2.5.8", "1.4.3", "3.3.1"],
          explanation: "2.5.8（WCAG 2.2）要求目标至少 24×24 CSS 像素。",
        },
      },
      "sc-3.3.1": {
        outcome: "以文字识别并描述输入错误。",
        check: {
          prompt: "表单在无效字段上只显示红色边框。这违反：",
          options: ["3.3.1", "2.4.4", "1.4.10"],
          explanation: "3.3.1 要求以文字识别并描述错误 — 仅靠色彩是不够的。",
        },
      },
      "sc-4.1.2": {
        outcome: "确保每个控件暴露名称、角色与值。",
        check: {
          prompt: "一个 <div> 行为像按钮但没有角色或名称。这违反：",
          options: ["4.1.2", "1.4.3", "2.4.7"],
          explanation: "4.1.2 要求 UI 组件暴露其名称、角色与值。",
        },
      },
      "aria-restrained": {
        outcome: "仅在原生 HTML 无法表达语义时使用 ARIA。",
        check: {
          prompt: "何时应动用 ARIA？",
          options: ["永远，为了稳健", "仅在原生 HTML 无法表达时", "绝不"],
          explanation: "原生 HTML 优先；ARIA 传达语义但不提供键盘行为。",
        },
      },
      "audit-overview": {
        outcome: "说明为何合规需要人工判断。",
        check: {
          prompt: "自动化工具能否单独判定合规？",
          options: ["能，只要它回报零错误", "不能 — 需要人工评估", "能，针对 AA"],
          explanation: "工具能协助但会漏掉约 50% 的问题；合规需要人工判断。",
        },
      },
      "audit-easy-checks": {
        outcome: "对页面执行快速的初步检视。",
        check: {
          prompt: "简易检查最适合描述为：",
          options: ["完整的合规评估", "快速的初步检视", "自动化扫描"],
          explanation: "简易检查是快速的初步检视，并非合规评估。",
        },
      },
      "audit-automated": {
        outcome: "批判性地使用自动化工具，并手动验证发现。",
        check: {
          prompt: "自动化扫描回报零错误。最佳回应？",
          options: ["宣告网站合规", "手动验证 — 工具会漏掉许多问题", "直接上线"],
          explanation: "自动化工具只捕捉一部分问题，且会产生误报与遗漏。",
        },
      },
      "audit-manual": {
        outcome: "手动执行键盘、焦点与对比测试。",
        check: {
          prompt: "下列何者是手动测试（非自动化）？",
          options: ["执行 axe", "纯键盘导航", "Lighthouse 分数"],
          explanation: "纯键盘操作是自动化无法判断的手动测试。",
        },
      },
      "audit-screen-reader": {
        outcome: "以真实屏幕阅读器测试页面。",
        check: {
          prompt: "常见的屏幕阅读器测试组合是：",
          options: ["NVDA + Chrome（Windows）", "axe + Lighthouse", "VoiceOver + axe"],
          explanation: "Windows 的 NVDA + Chrome（及 macOS 的 VoiceOver + Safari）是标准组合。",
        },
      },
      "audit-wcag-em": {
        outcome: "使用 WCAG-EM 五步骤组织审计。",
        check: {
          prompt: "正确的 WCAG-EM 顺序是：",
          options: ["探索 → 范围 → 评估 → 报告", "范围 → 探索 → 样本 → 评估 → 报告", "报告 → 评估 → 样本"],
          explanation: "WCAG-EM：定义范围、探索、选取样本、评估、报告。",
        },
      },
      "capstone-audit": {
        outcome: "完成 WCAG-EM 审计并产出合规报告。",
        check: {
          prompt: "专题的交付成果是：",
          options: ["通过的测验分数", "基于证据的合规报告", "代码示例"],
          explanation: "专题是一份基于证据的 WCAG-EM 报告 — 真实的评量。",
        },
      },
    },
  },
};
