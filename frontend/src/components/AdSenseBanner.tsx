import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function AdSenseBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
        height: "28px",  // 👈 strictly limited height
        overflow: "hidden"
      }}
      data-ad-client="ca-pub-8617849690810653"
      data-ad-slot="5261243188"   // replace with your ad unit ID
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
