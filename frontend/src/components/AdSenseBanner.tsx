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
    <div className={`w-full flex justify-center py-2 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '728px',
          height: '90px'
        }}
        data-ad-client="ca-pub-8617849690810653"
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner;

