import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface InstallIconProps {
    size?: number;
    color?: string;
}

const InstallIcon: React.FC<InstallIconProps> = ({ 
    size = 24, 
    color = '#3B82F6' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* MARTILLO */}
            {/* Mango del martillo */}
            <Rect 
                x="3" 
                y="12" 
                width="10" 
                height="2.5" 
                rx="1.2"
                fill={color}
            />
            
            {/* Cabeza del martillo */}
            <Rect 
                x="11" 
                y="9" 
                width="5" 
                height="6.5" 
                rx="0.5"
                fill={color}
            />
            
            {/* Garra del martillo */}
            <Path 
                d="M11 11.5c-2 0-3-1-3-2.5s1-2.5 3-2.5" 
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
            
            {/* DESTORNILLADOR */}
            {/* Mango del destornillador */}
            <Rect 
                x="17" 
                y="2" 
                width="2" 
                height="8" 
                rx="1"
                fill={color}
            />
            
            {/* Punta del destornillador */}
            <Rect 
                x="17.5" 
                y="10" 
                width="1" 
                height="4" 
                fill={color}
            />
            
            {/* Cruz de la punta (Phillips) */}
            <Path 
                d="M17.2 11.5h1.6M18 10.7v1.6" 
                stroke="white"
                strokeWidth="0.4"
                strokeLinecap="round"
            />
            
            {/* Empuñadura del destornillador */}
            <Circle 
                cx="18" 
                cy="3" 
                r="1.2" 
                fill="white"
                stroke={color}
                strokeWidth="1"
            />
            
            {/* ELEMENTOS ADICIONALES */}
            {/* Tornillos */}
            <Circle cx="4" cy="18" r="1" fill={color} />
            <Circle cx="7" cy="19" r="0.8" fill={color} />
            <Circle cx="2" cy="20" r="0.6" fill={color} />
            
            {/* Marcas de cruz en tornillos */}
            <Path d="M3.5 18h1M4 17.5v1" stroke="white" strokeWidth="0.3" />
            <Path d="M6.5 19h1M7 18.5v1" stroke="white" strokeWidth="0.3" />
            
            {/* Líneas de trabajo/instalación */}
            <Path 
                d="M20 16l2 2M20 18l2 2" 
                stroke={color}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.5"
            />
        </Svg>
    );
};

export default InstallIcon;