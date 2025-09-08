import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface ActionsIconProps {
    size?: number;
    color?: string;
}

const ActionsIcon: React.FC<ActionsIconProps> = ({ 
    size = 24, 
    color = '#3B82F6' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            {/* Documento/Lista principal */}
            <Rect 
                x="5" 
                y="4" 
                width="14" 
                height="16" 
                rx="2" 
                stroke={color} 
                strokeWidth="2" 
                fill="none"
            />
            
            {/* Líneas de contenido */}
            <Path 
                d="M8 9h8M8 12h6M8 15h4" 
                stroke={color} 
                strokeWidth="1.5" 
                strokeLinecap="round"
            />
            
            {/* Check mark en la esquina */}
            <Path 
                d="M15 6l2 2 4-4" 
                stroke={color} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default ActionsIcon;