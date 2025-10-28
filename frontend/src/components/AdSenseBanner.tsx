import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  adUnitId?: string;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({ 
  adUnitId = '5261243188',
  className = '' 
}) => {
  useEffect(() => {
    // Force refresh of AdSense script to reflect new layout
    try {
      const ads = (window as any).adsbygoogle || [];
      ads.length = 0; // clear cached ads
      ads.push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [adUnitId]);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl px-1 sm:px-2">
        <ins
          key={adUnitId + Date.now()} // Forces rerender for new settings
          className="adsbygoogle block w-full"
          style={{
            display: 'block',
            width: '100%',
            height: '28px', // 🔹 very slim height
            overflow: 'hidden',
          }}
          data-ad-client="ca-pub-8617849690810653"
          data-ad-slot={adUnitId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSenseBanner;
