import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  adUnitId?: string;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  adUnitId = 'YOUR_AD_SLOT',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if ((window as any).adsbygoogle && adRef.current) {
        (window as any).adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: '20px', maxHeight: '20px' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '20px', maxHeight: '20px' }}
        data-ad-client="ca-pub-8617849690810653"
        data-ad-slot={adUnitId}
        data-ad-format="fluid"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner;
