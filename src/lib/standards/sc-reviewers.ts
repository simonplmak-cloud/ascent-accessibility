// Who reviews what — maps each success criterion that requires human judgement to
// the certified reviewer profile (lived experience matching the barrier) and why.
// Reviewers are lived-experience experts certified through the Ascent Web
// Accessibility Program. Content-in-code + locale overlays.

export type ReviewerProfile =
  | "blindness"
  | "lowVision"
  | "motor"
  | "cognitive"
  | "hearing"
  | "photosensitivity"
  | "speech";

export interface ScReviewer {
  profile: ReviewerProfile;
  why: string;
}

// The SCs that require human review (manual-only), each mapped to the reviewer
// whose lived experience matches the barrier + why only a person can judge it.
const REVIEWERS_EN: Record<string, ScReviewer> = {
  "1.2.8": { profile: "hearing", why: "Only a person can confirm a video's full text alternative conveys the same information." },
  "1.4.8": { profile: "lowVision", why: "Whether custom presentation settings truly help needs a low-vision user's judgement." },
  "2.1.3": { profile: "motor", why: "Only a keyboard-only user can confirm every function is genuinely operable." },
  "2.1.4": { profile: "speech", why: "Only a voice-input user can tell whether character-key shortcuts interfere." },
  "2.2.4": { profile: "cognitive", why: "Whether an interruption is tolerable needs a person's judgement." },
  "2.2.5": { profile: "cognitive", why: "Whether re-authentication preserves data needs a person to verify the flow." },
  "2.2.6": { profile: "cognitive", why: "Whether a timeout warning is adequate needs a person to test it in context." },
  "2.3.1": { profile: "photosensitivity", why: "Whether flashing content is safe requires a person to review it." },
  "2.3.2": { profile: "photosensitivity", why: "Whether content ever flashes above the threshold requires a person to review it." },
  "2.5.6": { profile: "motor", why: "Whether concurrent input mechanisms work needs a person to test them." },
  "3.1.6": { profile: "cognitive", why: "Whether pronunciation guidance is adequate needs a reader's judgement." },
  "3.2.5": { profile: "cognitive", why: "Whether context changes are user-initiated needs a person to test the flow." },
  "3.3.4": { profile: "cognitive", why: "Whether error prevention for legal/financial submissions works needs a person to test it." },
  "3.3.6": { profile: "cognitive", why: "Whether error prevention for all submissions works needs a person to test it." },
  "3.3.8": { profile: "cognitive", why: "Whether authentication avoids cognitive tests needs a person to attempt the flow." },
  "3.3.9": { profile: "cognitive", why: "Whether authentication avoids cognitive tests entirely needs a person to attempt the flow." },
  "1.2.4": { profile: "hearing", why: "Live captions must be reviewed by a person who relies on them." },
  "1.2.9": { profile: "hearing", why: "A live audio alternative must be reviewed by a person who relies on it." },
};

const PROFILES_EN: Record<ReviewerProfile, string> = {
  blindness: "a certified reviewer with lived experience of blindness (screen reader)",
  lowVision: "a certified reviewer with lived experience of low vision",
  motor: "a certified reviewer with lived experience of limited movement (keyboard-only)",
  cognitive: "a certified reviewer with lived experience of cognitive or learning disability",
  hearing: "a certified reviewer with lived experience of deafness (captions/media)",
  photosensitivity: "a certified reviewer with lived experience of photosensitive epilepsy",
  speech: "a certified reviewer with lived experience of speech/voice control",
};

const PROFILES_ZH_HANT: Record<ReviewerProfile, string> = {
  blindness: "具失明親身經歷（屏幕閱讀器）的認證審核員",
  lowVision: "具低視力親身經歷的認證審核員",
  motor: "具行動受限（純鍵盤）親身經歷的認證審核員",
  cognitive: "具認知或學習障礙親身經歷的認證審核員",
  hearing: "具失聰親身經歷（字幕/媒體）的認證審核員",
  photosensitivity: "具光敏性癲癇親身經歷的認證審核員",
  speech: "具語音控制親身經歷的認證審核員",
};

const PROFILES_ZH_HANS: Record<ReviewerProfile, string> = {
  blindness: "具失明亲身经历（屏幕阅读器）的认证审核员",
  lowVision: "具低视力亲身经历的认证审核员",
  motor: "具行动受限（纯键盘）亲身经历的认证审核员",
  cognitive: "具认知或学习障碍亲身经历的认证审核员",
  hearing: "具失聪亲身经历（字幕/媒体）的认证审核员",
  photosensitivity: "具光敏性癫痫亲身经历的认证审核员",
  speech: "具语音控制亲身经历的认证审核员",
};

const REVIEWERS_ZH_HANT: Record<string, ScReviewer> = {
  "1.2.8": { profile: "hearing", why: "只有人能確認影片的完整文字替代是否傳達了相同資訊。" },
  "1.4.8": { profile: "lowVision", why: "自訂呈現設定是否真正有幫助，需要低視力使用者的判斷。" },
  "2.1.3": { profile: "motor", why: "只有純鍵盤使用者能確認每個功能是否真正可操作。" },
  "2.1.4": { profile: "speech", why: "只有語音輸入使用者能判斷單字元快速鍵是否會干擾。" },
  "2.2.4": { profile: "cognitive", why: "中斷是否可容忍，需要人的判斷。" },
  "2.2.5": { profile: "cognitive", why: "重新認證是否保留資料，需要人驗證流程。" },
  "2.2.6": { profile: "cognitive", why: "逾時警告是否足夠，需要人在情境中測試。" },
  "2.3.1": { profile: "photosensitivity", why: "閃光內容是否安全，需要人審查。" },
  "2.3.2": { profile: "photosensitivity", why: "內容是否閃光超過閾值，需要人審查。" },
  "2.5.6": { profile: "motor", why: "並行輸入機制是否有效，需要人測試。" },
  "3.1.6": { profile: "cognitive", why: "發音指引是否足夠，需要讀者的判斷。" },
  "3.2.5": { profile: "cognitive", why: "上下文變化是否由使用者發起，需要人測試流程。" },
  "3.3.4": { profile: "cognitive", why: "法律/金融提交的錯誤預防是否有效，需要人測試。" },
  "3.3.6": { profile: "cognitive", why: "所有提交的錯誤預防是否有效，需要人測試。" },
  "3.3.8": { profile: "cognitive", why: "認證是否避免認知測試，需要人嘗試流程。" },
  "3.3.9": { profile: "cognitive", why: "認證是否完全避免認知測試，需要人嘗試流程。" },
  "1.2.4": { profile: "hearing", why: "即時字幕必須由依賴它們的人審查。" },
  "1.2.9": { profile: "hearing", why: "即時音訊替代必須由依賴它們的人審查。" },
};

const REVIEWERS_ZH_HANS: Record<string, ScReviewer> = {
  "1.2.8": { profile: "hearing", why: "只有人能确认视频的完整文字替代是否传达了相同信息。" },
  "1.4.8": { profile: "lowVision", why: "自定义呈现设置是否真正有帮助，需要低视力用户的判断。" },
  "2.1.3": { profile: "motor", why: "只有纯键盘用户能确认每个功能是否真正可操作。" },
  "2.1.4": { profile: "speech", why: "只有语音输入用户能判断单字符快捷键是否会干扰。" },
  "2.2.4": { profile: "cognitive", why: "中断是否可容忍，需要人的判断。" },
  "2.2.5": { profile: "cognitive", why: "重新认证是否保留数据，需要人验证流程。" },
  "2.2.6": { profile: "cognitive", why: "超时警告是否足够，需要人在情境中测试。" },
  "2.3.1": { profile: "photosensitivity", why: "闪光内容是否安全，需要人审查。" },
  "2.3.2": { profile: "photosensitivity", why: "内容是否闪光超过阈值，需要人审查。" },
  "2.5.6": { profile: "motor", why: "并行输入机制是否有效，需要人测试。" },
  "3.1.6": { profile: "cognitive", why: "发音指引是否足够，需要读者的判断。" },
  "3.2.5": { profile: "cognitive", why: "上下文变化是否由用户发起，需要人测试流程。" },
  "3.3.4": { profile: "cognitive", why: "法律/金融提交的错误预防是否有效，需要人测试。" },
  "3.3.6": { profile: "cognitive", why: "所有提交的错误预防是否有效，需要人测试。" },
  "3.3.8": { profile: "cognitive", why: "认证是否避免认知测试，需要人尝试流程。" },
  "3.3.9": { profile: "cognitive", why: "认证是否完全避免认知测试，需要人尝试流程。" },
  "1.2.4": { profile: "hearing", why: "即时字幕必须由依赖它们的人审查。" },
  "1.2.9": { profile: "hearing", why: "即时音频替代必须由依赖它们的人审查。" },
};

export function scReviewer(sc: string, locale?: string): { profile: string; why: string } | undefined {
  const reviewers =
    locale === "zh-Hant" ? REVIEWERS_ZH_HANT : locale === "zh-Hans" ? REVIEWERS_ZH_HANS : REVIEWERS_EN;
  const profiles =
    locale === "zh-Hant" ? PROFILES_ZH_HANT : locale === "zh-Hans" ? PROFILES_ZH_HANS : PROFILES_EN;
  const entry = reviewers[sc];
  if (!entry) return undefined;
  return { profile: profiles[entry.profile], why: entry.why };
}

/** All SCs that require human review (the manual-only set). */
export function reviewableScs(locale?: string): Array<{ sc: string; profile: string; why: string }> {
  const reviewers =
    locale === "zh-Hant" ? REVIEWERS_ZH_HANT : locale === "zh-Hans" ? REVIEWERS_ZH_HANS : REVIEWERS_EN;
  const profiles =
    locale === "zh-Hant" ? PROFILES_ZH_HANT : locale === "zh-Hans" ? PROFILES_ZH_HANS : PROFILES_EN;
  return Object.entries(reviewers).map(([sc, r]) => ({
    sc,
    profile: profiles[r.profile],
    why: r.why,
  }));
}
