import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

interface SfpPortIconProps {
    size?: number;
    color?: string;
}

const SfpPortIcon: React.FC<SfpPortIconProps> = ({ 
    size = 20, 
    color = '#6B7280' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Puerto SFP rectangular alargado */}
            <Rect 
                x="2" 
                y="8" 
                width="20" 
                height="8" 
                rx="2" 
                stroke={color} 
                strokeWidth="1.5" 
                fill="none"
            />
            
            {/* Módulo SFP interior */}
            <Rect 
                x="4" 
                y="10" 
                width="16" 
                height="4" 
                rx="0.5" 
                fill={color}
            />
            
            {/* Pestañas de sujeción */}
            <Rect x="3" y="9" width="1" height="1.5" fill={color} />
            <Rect x="20" y="9" width="1" height="1.5" fill={color} />
            <Rect x="3" y="13.5" width="1" height="1.5" fill={color} />
            <Rect x="20" y="13.5" width="1" height="1.5" fill={color} />
            
            {/* Contactos ópticos */}
            <Circle cx="6" cy="12" r="0.8" fill="white" />
            <Circle cx="18" cy="12" r="0.8" fill="white" />
            
            {/* Líneas de contacto */}
            <Path 
                d="M8 11h1M10 11h1M12 11h1M14 11h1M16 11h1" 
                stroke="white" 
                strokeWidth="0.6"
            />
            <Path 
                d="M8 13h1M10 13h1M12 13h1M14 13h1M16 13h1" 
                stroke="white" 
                strokeWidth="0.6"
            />
            
            {/* Indicador de fibra óptica */}
            <Path 
                d="M12 5V8" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round"
            />
            <Circle cx="12" cy="4" r="1.5" fill="none" stroke={color} strokeWidth="1.5" />
        </Svg>
    );
};

export default SfpPortIcon;