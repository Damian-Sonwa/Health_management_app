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
    const interval = setInterval(() => {
      if (typeof (window as any).adsbygoogle !== 'undefined') {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          clearInterval(interval);
        } catch (err) {
          console.error('AdSense error:', err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl px-1 sm:px-2">
        <ins
          className="adsbygoogle block w-full"
          style={{
            display: 'block',
            width: '100%',
            minHeight: '40px',
            maxHeight: '50px',
            overflow: 'hidden',
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
