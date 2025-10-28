import React, { useEffect } from 'react';

interface AdSenseBannerProps {
  adUnitId?: string;
  className?: string;
}

const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  adUnitId = '1234567890', // Use test slot if under review
  className = '',
}) => {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`} style={{ height: '30px' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '30px' }}
        data-ad-client="ca-pub-8617849690810653"
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner;
