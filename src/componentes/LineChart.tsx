import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LineChart = ({ data, labels, width = 300, height = 200, isDarkMode }) => {
  const maxY = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (value / maxY) * height;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <View style={[styles.chartContainer, { width, height }]}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((factor) => (
          <View
            key={factor}
            style={[
              styles.gridLine,
              { top: height * factor, borderColor: isDarkMode ? '#555' : '#ccc' },
            ]}
          />
        ))}
        {/* Lines connecting points */}
        <View style={styles.polyline}>
          {data.map((value, index) => {
            if (index === data.length - 1) return null; // Skip last point for line drawing
            
            const x1 = (index / (data.length - 1)) * width;
            const y1 = height - (value / maxY) * height;
            const x2 = ((index + 1) / (data.length - 1)) * width;
            const y2 = height - (data[index + 1] / maxY) * height;
            
            // Calculate line angle and length
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.line,
                  {
                    left: x1,
                    top: y1,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    backgroundColor: isDarkMode ? '#60A5FA' : '#2563EB',
                  },
                ]}
              />
            );
          })}
          
          {/* Points on top of lines */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - (value / maxY) * height;
            return (
              <View
                key={`point-${index}`}
                style={[
                  styles.point,
                  { left: x - 4, top: y - 4, backgroundColor: isDarkMode ? '#60A5FA' : '#2563EB' },
                ]}
              />
            );
          })}
        </View>
      </View>
      {/* Labels */}
      <View style={[styles.labels, { width }]}>
        {labels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.labelText,
              { color: isDarkMode ? '#fff' : '#000', transform: [{ rotate: '-45deg' }] },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    borderBottomWidth: 1,
  },
  polyline: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: '0 50%',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  labelText: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default LineChart;
