import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Portfolio } from '@/pages/Portfolio';
import { FIIDetail } from '@/pages/FIIDetail';
import { Compare } from '@/pages/Compare';
import { SearchPage } from '@/pages/Search';
import { Favorites } from '@/pages/Favorites';
import { Settings } from '@/pages/Settings';
import { ReportSummary } from '@/pages/ReportSummary';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="carteira" element={<Portfolio />} />
        <Route path="fundos/:ticker" element={<FIIDetail />} />
        <Route path="comparar" element={<Compare />} />
        <Route path="buscar" element={<SearchPage />} />
        <Route path="favoritos" element={<Favorites />} />
        <Route path="relatorio" element={<ReportSummary />} />
        <Route path="configuracoes" element={<Settings />} />
      </Route>
    </Routes>
  );
}
