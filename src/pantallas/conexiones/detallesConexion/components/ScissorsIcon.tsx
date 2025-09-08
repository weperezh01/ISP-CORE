import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface ScissorsIconProps {
    size?: number;
    color?: string;
}

const ScissorsIcon: React.FC<ScissorsIconProps> = ({ 
    size = 24, 
    color = '#EF4444' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Hoja superior de tijera industrial */}
            <Path 
                d="M12 12L6 4h12l-6 8z" 
                fill={color}
                stroke={color}
                strokeWidth="1"
                strokeLinejoin="round"
            />
            
            {/* Hoja inferior de tijera industrial */}
            <Path 
                d="M12 12L6 20h12l-6-8z" 
                fill={color}
                stroke={color}
                strokeWidth="1"
                strokeLinejoin="round"
            />
            
            {/* Mango superior grueso */}
            <Rect 
                x="3" 
                y="2" 
                width="4" 
                height="4" 
                rx="1"
                fill={color}
            />
            
            {/* Mango inferior grueso */}
            <Rect 
                x="3" 
                y="18" 
                width="4" 
                height="4" 
                rx="1"
                fill={color}
            />
            
            {/* Pivote central reforzado */}
            <Circle 
                cx="12" 
                cy="12" 
                r="2" 
                fill="white"
                stroke={color}
                strokeWidth="2"
            />
            
            {/* Tornillo del pivote */}
            <Circle 
                cx="12" 
                cy="12" 
                r="0.8" 
                fill={color}
            />
            
            {/* Cable/línea siendo cortada */}
            <Path 
                d="M18 11h4M18 13h4" 
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
            />
            
            {/* Marcas de corte */}
            <Path 
                d="M19 10l1-1M19 14l1 1" 
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
            />
        </Svg>
    );
};

export default ScissorsIcon;