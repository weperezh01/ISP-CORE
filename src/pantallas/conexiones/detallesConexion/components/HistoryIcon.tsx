import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface HistoryIconProps {
    size?: number;
    color?: string;
}

const HistoryIcon: React.FC<HistoryIconProps> = ({ 
    size = 24, 
    color = '#6B7280' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Círculo principal del reloj */}
            <Circle 
                cx="12" 
                cy="12" 
                r="9" 
                stroke={color} 
                strokeWidth="2" 
                fill="none"
            />
            
            {/* Manecilla de horas */}
            <Path 
                d="M12 7v5l3 3" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            
            {/* Flecha circular del historial */}
            <Path 
                d="M1.05 12a11 11 0 0 1 20.23-5.5M23 12a11 11 0 0 1-20.23 5.5" 
                stroke={color} 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                opacity="0.6"
            />
            
            {/* Pequeñas marcas del reloj */}
            <Circle cx="12" cy="4" r="0.5" fill={color} opacity="0.8" />
            <Circle cx="20" cy="12" r="0.5" fill={color} opacity="0.8" />
            <Circle cx="12" cy="20" r="0.5" fill={color} opacity="0.8" />
            <Circle cx="4" cy="12" r="0.5" fill={color} opacity="0.8" />
        </Svg>
    );
};

export default HistoryIcon;