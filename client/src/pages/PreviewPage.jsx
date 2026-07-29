import React, { useState, useEffect } from "react";
import GeneratedWebsitePreview from "../components/common/GeneratedWebsitePreview";

export default function PreviewPage() {
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ai_result");
      if (stored) setAiResult(JSON.parse(stored));
    } catch {}
  }, []);

  const handleClose = () => {
    window.location.hash = "#3d-builder";
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <GeneratedWebsitePreview aiResult={aiResult} onClose={handleClose} />
    </div>
  );
}
