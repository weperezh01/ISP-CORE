import React from 'react';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions, View } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const BarChartWithLabels = ({ data, width, height, chartConfig, style, formatMoney }) => {
  return (
    <View>
      <BarChart
        data={data}
        width={width}
        height={height}
        chartConfig={chartConfig}
        style={style}
        fromZero={true}
        showValuesOnTopOfBars={false}
      />
      {data.datasets[0].data.map((value, index) => {
        const barWidth = (width - 60) / data.labels.length; // Adjust bar width based on the chart width and number of labels
        const x = index * barWidth + barWidth / 2 + 30; // Calculate x position of the label
        const y = height - value * (height / (chartConfig.fromZero ? data.datasets[0].data.reduce((a, b) => Math.max(a, b), 0) : Math.max(...data.datasets[0].data))); // Calculate y position of the label

        return (
          <Svg
            key={index}
            style={{
              position: 'absolute',
              left: x - barWidth / 2,
              top: y - 20, // Adjust this value to move the label closer to the top of the bar
              width: barWidth,
              height: 40,
            }}
          >
            <SvgText
              x="50%"
              y="20"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {formatMoney(value)}
            </SvgText>
          </Svg>
        );
      })}
    </View>
  );
};

export default BarChartWithLabels;
