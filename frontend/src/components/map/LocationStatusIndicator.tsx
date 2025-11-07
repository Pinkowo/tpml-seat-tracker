/**
 * 定位狀態指示器元件
 *
 * 在地圖右下角顯示「✓ 已定位」提示
 *
 * 設計規範：
 * - 成功狀態：右下角顯示「✓ 已定位」，背景 #76A732 (Green/500)，文字白色
 * - 尺寸：圓角 20px，padding 8px 12px，字體 12px/Semibold
 * - 位置：地圖右下角，距離邊緣 16px
 * - 顯示條件：geolocation.location !== null && geolocation.error === null
 */

import { useEffect, useState } from 'react';

export interface LocationStatusIndicatorProps {
  hasLocation: boolean;
  hasError: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  hasLocation,
  hasError,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 定位成功且無錯誤時顯示
    if (hasLocation && !hasError) {
      setShow(true);

      // 3 秒後自動淡出
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [hasLocation, hasError]);

  if (!show) {
    return null;
  }

  return (
    <div
      className="animate-fade-in fixed bottom-4 right-4 z-10 flex items-center gap-2 rounded-[20px] bg-[#76A732] px-3 py-2 shadow-lg transition-opacity duration-300"
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-xs font-semibold text-white">已定位</span>
    </div>
  );
};

export default LocationStatusIndicator;
