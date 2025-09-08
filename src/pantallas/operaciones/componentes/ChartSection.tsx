// src/componentes/ChartSection.js
import React from 'react';
import { Text, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const ChartSection = ({
  title,
  labels,
  dataValues,
  chartConfig,
  width,
  height,
  isDarkMode,
  legendTitle,
  renderDotContent,
  minDataLength = 2
}) => {
  const dataLength = dataValues.length;

  return (
    <>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>{title}</Text>
      {dataLength >= minDataLength ? (
        <ScrollView horizontal>
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: dataValues,
                }
              ],
              legend: [legendTitle],
            }}
            width={width}
            height={height}
            chartConfig={chartConfig}
            fromZero
            renderDotContent={renderDotContent}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </ScrollView>
      ) : (
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
          No hay suficientes datos para mostrar el gráfico.
        </Text>
      )}
    </>
  );
};

export default ChartSection;
