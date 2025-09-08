import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface EthernetPortIconProps {
    size?: number;
    color?: string;
}

const EthernetPortIcon: React.FC<EthernetPortIconProps> = ({ 
    size = 20, 
    color = '#6B7280' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Puerto cuadrado para ethernet */}
            <Rect 
                x="4" 
                y="6" 
                width="16" 
                height="12" 
                rx="1.5" 
                stroke={color} 
                strokeWidth="1.5" 
                fill="none"
            />
            
            {/* Conector interior cuadrado */}
            <Rect 
                x="7" 
                y="9" 
                width="10" 
                height="6" 
                rx="0.5" 
                fill={color}
            />
            
            {/* Pestañas laterales */}
            <Rect x="5.5" y="8" width="1.5" height="2" fill={color} />
            <Rect x="17" y="8" width="1.5" height="2" fill={color} />
            
            {/* Líneas de contacto */}
            <Path 
                d="M9 11.5h1M11 11.5h1M13 11.5h1M15 11.5h1" 
                stroke="white" 
                strokeWidth="0.8"
            />
            <Path 
                d="M9 13h1M11 13h1M13 13h1M15 13h1" 
                stroke="white" 
                strokeWidth="0.8"
            />
            
            {/* Indicador de conexión */}
            <Rect x="11" y="4" width="2" height="2" rx="1" fill={color} />
        </Svg>
    );
};

export default EthernetPortIcon;