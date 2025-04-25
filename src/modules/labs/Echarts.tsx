
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

const chartData: { title: string; subtitle: string; option: EChartsOption }[] = [
  {
    title: 'Line Chart',
    subtitle: 'Multiple data series',
    option: {
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      yAxis: { type: 'value' },
      series: [
        { name: 'Sales', type: 'line', data: [120, 200, 150, 80, 70] },
        { name: 'Expenses', type: 'line', data: [90, 140, 110, 60, 50] },
      ],
    },
  },
  {
    title: 'Column Chart',
    subtitle: 'Multiple data series',
    option: {
      xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
      yAxis: { type: 'value' },
      series: [
        { name: 'Product A', type: 'bar', data: [400, 500, 600, 700] },
        { name: 'Product B', type: 'bar', data: [300, 400, 500, 600] },
      ],
    },
  },
  {
    title: 'Stacked Column Chart',
    subtitle: 'Stacked by category',
    option: {
      tooltip: { trigger: 'axis' },
      legend: { top: 'top' },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr'] },
      yAxis: { type: 'value' },
      series: [
        { name: 'Online', type: 'bar', stack: 'total', data: [120, 132, 101, 134] },
        { name: 'Retail', type: 'bar', stack: 'total', data: [220, 182, 191, 234] },
      ],
    },
  },
  {
    title: 'Horizontal Bar Chart',
    subtitle: 'Multiple series',
    option: {
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: ['Apples', 'Bananas', 'Cherries'] },
      series: [
        { name: '2023', type: 'bar', data: [120, 200, 150] },
        { name: '2024', type: 'bar', data: [180, 250, 210] },
      ],
    },
  },
  {
    title: 'Combo Chart',
    subtitle: 'Column + Line',
    option: {
      xAxis: [
        { type: 'category', data: ['Category 1', 'Category 2', 'Category 3','Category 4','Category 5'], axisLabel: { color: 'red'} },
      ],
      yAxis: [
        { type: 'value', name: 'Revenue' },
        { type: 'value', name: 'Profit' },
      ],
      series: [
        { name: 'Revenue', type: 'bar', data: [3200, 1600, 800, 400, 200, 100], yAxisIndex: 0 },
        { name: 'Running % of Total', type: 'line', data: [50.9, 25.4+50.9, 12.7+25.4+50.9,6.3+12.7+25.4+50.9,3.2+6.3+12.7+25.4+50.9,1.6+3.2+6.3+12.7+25.4+50.9], yAxisIndex: 1 },
      ],
    },
  },
  {
    title: 'Pie Chart',
    subtitle: 'Share of categories',
    option: {
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: 'Email' },
            { value: 735, name: 'Affiliate' },
            { value: 580, name: 'Video Ads' },
            { value: 484, name: 'Search Engine' },
          ],
        },
      ],
    },
  },
  {
    title: 'Doughnut Chart',
    subtitle: 'Share of categories',
    option: {
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Ads' },
            { value: 135, name: 'Search' },
          ],
        },
      ],
    },
  },
  {
    title: 'Scatter Plot',
    subtitle: 'With best fit line',
    option: {
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 10,
          name: 'Data Points',
          type: 'scatter',
          data: [[10, 8], [20, 15], [30, 20], [40, 28], [50, 35]],
        },
        {
          name: 'Trend Line',
          type: 'line',
          data: [[10, 7], [50, 36]],
          lineStyle: { type: 'dashed' },
        },
      ],
    },
  },
  {
    title: 'Dial Gauge Chart',
    subtitle: 'Real-time KPI',
    option: {
      series: [
        {
          type: 'gauge',
          progress: { show: true },
          detail: { valueAnimation: true, formatter: '{value}%' },
          data: [{ value: 70, name: 'Completion' }],
        },
      ],
    },
  },
  {
    title: 'Heatmap',
    subtitle: 'Matrix values',
    option: {
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      yAxis: { type: 'category', data: ['Morning', 'Afternoon', 'Evening'] },
      visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', left: 'center', bottom: '15%' },
      series: [
        {
          type: 'heatmap',
          data: [
            [0, 0, 5], [0, 1, 1], [0, 2, 0],
            [1, 0, 7], [1, 1, 3], [1, 2, 1],
            [2, 0, 2], [2, 1, 6], [2, 2, 2],
            [3, 0, 4], [3, 1, 7], [3, 2, 3],
            [4, 0, 6], [4, 1, 5], [4, 2, 2],
          ],
        },
      ],
    },
  },
  {
    title: 'Radial Chart',
    subtitle: 'Category performance',
    option: {
      angleAxis: {},
      radiusAxis: {
        type: 'category',
        data: ['Category A', 'Category B', 'Category C'],
      },
      polar: {},
      series: [
        {
          type: 'bar',
          data: [1, 2, 3],
          coordinateSystem: 'polar',
          name: 'Performance',
        },
      ],
      legend: { show: true, data: ['Performance'] },
    },
  },
  {
    title: 'Box Plot',
    subtitle: 'Statistical summary',
    option: {
      dataset: [
        {
          source: [
            ['category', 'min', 'Q1', 'median', 'Q3', 'max'],
            ['A', 100, 200, 300, 400, 500],
            ['B', 150, 250, 350, 450, 550],
          ],
        },
      ],
      xAxis: { type: 'category' },
      yAxis: {},
      series: [
        {
          type: 'boxplot',
          encode: {
            x: 'category',
            y: ['min', 'Q1', 'median', 'Q3', 'max'],
          },
        },
      ],
    },
  },
];

const handleClick = (params: any) => {
  console.log('Data point clicked:', params);
};

const normalizeAxis = (axis: any, axisName: string) => {
  if (!axis) return undefined;
  if (Array.isArray(axis)) {
    return axis.map(a => ({
      ...a,
      axisLabel: { color: '#888' },
      name: a.name || axisName,
    }));
  }
  return {
    ...axis,
    axisLabel: { color: '#888' },
    name: axis.name || axisName,
  };
};

const ChartCard = ({ title, subtitle, option }: { title: string; subtitle: string; option: EChartsOption }) => (
  <div className="chart-card">
    <p className="chart-title">{title}</p>
    <p className="chart-subtitle">{subtitle}</p>
    <ReactECharts
      className="chart-container"
      option={{
        ...option,
        legend: option.legend ?? { top: 'top', left: 'center' },
        tooltip: option.tooltip ?? { trigger: 'item' },
        grid: option.grid ?? { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        label: { show: true },
        xAxis: normalizeAxis(option.xAxis, 'X-Axis'),
        yAxis: normalizeAxis(option.yAxis, 'Y-Axis'),
      }}
      onEvents={{ click: handleClick }}
    />
  </div>
);

export default function Dashboard() {
  return (
    <div className="page w-full h-screen">
        <div className="flex flex-wrap justify-center items-center w-full h-full">
            {chartData.map((chart, idx) => (
                <ChartCard key={`${chart.title}-${idx}`} {...chart} />
            ))}
        </div>
    </div>
  );
}