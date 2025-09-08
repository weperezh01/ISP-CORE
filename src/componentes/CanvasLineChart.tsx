import React from 'react';
import { View } from 'react-native';
import Canvas from 'react-native-canvas';

const CanvasLineChart = ({ data, labels, width = 300, height = 200 }) => {
    const drawChart = (canvas) => {
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
    
        const maxY = Math.max(...data);
        const stepX = width / (data.length - 1);
    
        // Draw Grid
        ctx.strokeStyle = isDarkMode ? '#444' : '#DDD';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    
        // Draw Line
        ctx.strokeStyle = isDarkMode ? '#1E90FF' : '#0077cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = stepX * index;
            const y = height - (value / maxY) * height;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    
        // Draw Points
        ctx.fillStyle = isDarkMode ? '#1E90FF' : '#0077cc';
        data.forEach((value, index) => {
            const x = stepX * index;
            const y = height - (value / maxY) * height;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    
        // Draw Labels
        ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
        ctx.font = '10px Arial';
        labels.forEach((label, index) => {
            const x = stepX * index;
            const y = height + 15; // Position below the chart
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 4); // Rotate for better visibility
            ctx.fillText(label, 0, 0);
            ctx.restore();
        });
    };
    

  return (
    <View>
      <Canvas ref={drawChart} />
    </View>
  );
};

export default CanvasLineChart;
 