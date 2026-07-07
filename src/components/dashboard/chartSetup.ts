import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export const CHART_GRID_COLOR = '#232833';
export const CHART_TEXT_COLOR = '#8A93A3';
export const CHART_ACCENT = '#1FD1B8';
