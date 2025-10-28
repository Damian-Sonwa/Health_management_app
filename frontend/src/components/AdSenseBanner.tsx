import React, { useEffect } from "react";

interface AdSenseBannerProps {
  adUnitId?: string;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  adUnitId = "5261243188",
  className = "",
}) => {
  useEffect(() => {
    try {
      // Load AdSense script only once
      if (!document.querySelector("script[src*='adsbygoogle.js']")) {
        const script = document.createElement("script");
        script.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute("data-ad-client", "ca-pub-8617849690810653");
        document.body.appendChild(script);
      }

      // Initialize ads
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense init error:", err);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      <div className="w-full px-2 sm:px-4">
        <ins
          className="adsbygoogle block w-full"
          style={{
            display: "block",
            width: "100%",
            height: "25px", // ✅ reduced height for minimal space
            maxHeight: "25px",
            overflow: "hidden",
          }}
          data-ad-client="ca-pub-8617849690810653"
          data-ad-slot={adUnitId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSenseBanner;
