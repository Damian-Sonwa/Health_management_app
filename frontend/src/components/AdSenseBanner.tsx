// src/components/AdSenseBanner.tsx
import React, { useEffect } from "react";

const AdSenseBanner: React.FC = () => {
  useEffect(() => {
    // Load Google AdSense script
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-ad-client", "ca-pub-XXXXXXXXXXXXXXX"); // ✅ replace with your AdSense Publisher ID
    document.body.appendChild(script);

    try {
      // Initialize the ad after script loads
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense load error:", e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center overflow-hidden px-2">
      {/* ✅ Responsive Ad Container */}
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "728px",
          height: "auto",
          minHeight: "60px",
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXX" // ✅ replace this too
        data-ad-slot="XXXXXXXXXX" // ✅ your Ad Unit ID here
        data-ad-format="auto"
        data-full-width-responsive="true"// src/components/AdSenseBanner.tsx
import React, { useEffect } from "react";

interface AdSenseBannerProps {
  adUnitId?: string;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  adUnitId = "5261243188", // ✅ default Ad Unit ID
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
        script.setAttribute("data-ad-client", "ca-pub-8617849690810653"); // ✅ your Publisher ID
        document.body.appendChild(script);
      }

      // Initialize ad after script loads
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense initialization error:", err);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      {/* ✅ Responsive Ad container */}
      <div className="w-full px-2 sm:px-4">
        <ins
          className="adsbygoogle block w-full"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            minHeight: "50px",
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

      />
    </div>
  );
};

export default AdSenseBanner;
