import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChevronRightIconProps {
    size?: number;
    color?: string;
}

const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ 
    size = 20, 
    color = '#3B82F6' 
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path 
                d="M9 18l6-6-6-6" 
                stroke={color} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default ChevronRightIcon;