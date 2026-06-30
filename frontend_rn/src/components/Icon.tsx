import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps {
  name: string;
  color?: string;
  size?: number;
}

export default function Icon({ name, color = '#146e4e', size = 20 }: IconProps) {
  const renderPaths = () => {
    switch (name.toLowerCase()) {
      case 'home':
        return (
          <>
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'checklist':
        return (
          <>
            <Path d="M9 11l3 3L22 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'attendance':
      case 'users':
        return (
          <>
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'inventory':
      case 'box':
        return (
          <>
            <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M3.27 6.96L12 12.01l8.73-5.05" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 22.08V12" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'dashboard':
        return (
          <>
            <Path d="M18 20V10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
            <Path d="M12 20V4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
            <Path d="M6 20v-6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'outlet':
        return (
          <>
            <Path d="M2 22h20" stroke={color} strokeWidth="2" />
            <Path d="M3 22V9.5L12 3l9 6.5V22" stroke={color} strokeWidth="2" fill="none" />
            <Rect x="9" y="14" width="6" height="8" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'manager':
        return (
          <>
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'staff':
      case 'card':
        return (
          <>
            <Rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="10" cy="9" r="3" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'supplier':
      case 'truck':
        return (
          <>
            <Rect x="1" y="5" width="15" height="11" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M16 8l4 2v6h-4z" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
            <Circle cx="16.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2" />
          </>
        );
      case 'purchase':
      case 'invoice':
        return (
          <>
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M14 2v6h6" stroke={color} strokeWidth="2" />
            <Path d="M16 13H8" stroke={color} strokeWidth="2" />
            <Path d="M16 17H8" stroke={color} strokeWidth="2" />
            <Path d="M10 9H8" stroke={color} strokeWidth="2" />
          </>
        );
      case 'cash':
      case 'expense':
      case 'dollar':
      case 'rupee':
        return (
          <>
            {/* ₹ Indian Rupee symbol SVG */}
            <Path d="M6 3h12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M6 8h12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 3c0 5 0 9 0 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M6 8c2 0 5 .5 5 4s-3 4-5 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6 21l8-9" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'sales':
      case 'wallet':
        return (
          <>
            <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'reports':
      case 'chart':
        return (
          <>
            <Path d="M3 3v18h18" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'alert':
      case 'warning':
        return (
          <>
            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" />
            <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" />
          </>
        );
      case 'profile':
      case 'user':
        return (
          <>
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'lock':
        return (
          <>
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'unlock':
        return (
          <>
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M7 11V7a5 5 0 0 1 9.9-1" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'clean':
        return (
          <>
            <Path d="M12 22l-6-6v-4h12v4z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 12V2" stroke={color} strokeWidth="2" />
          </>
        );
      case 'kitchen':
      case 'cook':
        return (
          <>
            <Path d="M12 22c5.52 0 10-4.48 10-10H2c0 5.52 4.48 10 10 10z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 2v10" stroke={color} strokeWidth="2" />
          </>
        );
      case 'gas':
        return (
          <>
            <Rect x="5" y="7" width="14" height="14" rx="3" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M9 7V3h6v4" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'power':
      case 'upi':
        return (
          <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={color} strokeWidth="2" fill="none" />
        );
      case 'creditcard':
        return (
          <>
            <Rect x="2" y="5" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2" />
          </>
        );
      case 'delivery':
      case 'moto':
        return (
          <>
            <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
            <Circle cx="18" cy="18" r="3" stroke={color} strokeWidth="2" />
            <Path d="M6 15h12l-3-6H9z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 9V5h3" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'web':
      case 'online':
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M2 12h20" stroke={color} strokeWidth="2" />
            <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'time':
      case 'clock':
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'close':
      case 'x':
        return (
          <>
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'arrow-left':
      case 'back':
        return (
          <>
            <Path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="12 19 5 12 12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'share-2':
      case 'share':
        return (
          <>
            <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="2" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="2" />
          </>
        );
      case 'dollar-sign':
        return (
          <>
            <Path d="M12 1v22" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'trending-up':
        return (
          <>
            <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="17 6 23 6 23 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      case 'trending-down':
        return (
          <>
            <Polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="17 18 23 18 23 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      case 'check-square':
        return (
          <>
            <Path d="M9 11l3 3L22 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'phone':
        return (
          <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="2" fill="none" />
        );
      case 'chat':
      case 'whatsapp':
        return (
          <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth="2" fill="none" />
        );
      case 'menu':
        return (
          <>
            <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </>
        );
      case 'logout':
        return (
          <>
            <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" fill="none" />
            <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" />
          </>
        );
      case 'pin':
      case 'location':
        return (
          <>
            <Path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'food':
      case 'restaurant':
      case 'logo':
        return (
          <>
            <Path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M7 2v20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M21 15V2a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18 22v-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'calendar':
        return (
          <>
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'search':
        return (
          <>
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'plus':
      case 'add':
        return (
          <>
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'edit':
      case 'pencil':
        return (
          <>
            <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'trash':
      case 'delete':
        return (
          <>
            <Polyline points="3 6 5 6 21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="2" />
            <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="2" />
          </>
        );
      case 'bag':
      case 'shopping':
        return (
          <>
            <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" />
            <Path d="M16 10a4 4 0 0 1-8 0" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'clipboard':
        return (
          <>
            <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke={color} strokeWidth="2" fill="none" />
          </>
        );
      case 'download':
        return (
          <>
            <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points="7 10 12 15 17 10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPaths()}
    </Svg>
  );
}
