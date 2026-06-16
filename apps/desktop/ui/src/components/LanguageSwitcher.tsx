import { useState, useEffect } from "react";
import { getLang, setLang, onLangChange } from "@tokenfence/shared/src/i18n";
import type { SupportedLanguage } from "@tokenfence/shared/src/i18n";

export function LanguageSwitcher() {
  const [lang, setLangState] = useState<SupportedLanguage>(getLang());

  useEffect(() => {
    const unsub = onLangChange((l) => setLangState(l));
    return unsub;
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "zh-CN" : "en";
    setLang(next);
  };

  const label = lang === "en" ? "\u4E2D\u6587" : "English"; // always show opposite language

  return (
    <button
      onClick={toggle}
      title={lang === "en" ? "Switch to Chinese" : "Switch to English"}
      style={{
        background: "var(--tf-surface-alt)",
        border: "1px solid var(--tf-border)",
        color: "var(--tf-text-secondary)",
        padding: "4px 10px",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: 500,
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      {label}
    </button>
  );
}