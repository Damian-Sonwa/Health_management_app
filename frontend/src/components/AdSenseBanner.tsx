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
    // Initialize ad after component mounts
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      {/* Responsive container */}
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl px-2 sm:px-4">
        <ins
          className="adsbygoogle block w-full"
          style={{
            display: 'block',
            width: '100%',
            minHeight: '30px'
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

