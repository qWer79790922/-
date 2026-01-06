import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ContractTable from './components/ContractTable';
import NewContract from './components/NewContract';
import LendingForm from './components/LendingForm';
import OverdueForm from './components/OverdueForm';
import OverdueList from './components/OverdueList';
import LendingList from './components/LendingList';
import { MOCK_CONTRACTS } from './constants';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.ALL);

  // 取得篩選後的資料
  const getFilteredData = () => {
    // 取得今日日期並去除時間部分，用於精準比較
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (currentView) {
      case ViewMode.ALL:
        // 顯示全部合約（包含已停用）
        return MOCK_CONTRACTS;

      case ViewMode.UPCOMING: {
        // 即期合約：到期日 > 今天 且 到期日 <= 今天起算三個月
        const threeMonthsLater = new Date(today);
        threeMonthsLater.setMonth(today.getMonth() + 3);
        
        return MOCK_CONTRACTS.filter(c => {
          const endDate = new Date(c.endDate);
          endDate.setHours(0, 0, 0, 0);
          return endDate > today && endDate <= threeMonthsLater && !c.isDisabled;
        });
      }

      case ViewMode.EXPIRED: {
        // 到期合約：到期日 <= 今天
        return MOCK_CONTRACTS.filter(c => {
          const endDate = new Date(c.endDate);
          endDate.setHours(0, 0, 0, 0);
          return endDate <= today;
        });
      }

      case ViewMode.OVERDUE: {
        // 逾期合約：到期日 <= 今天 且 檔案/備註為空 且 未停用
        return MOCK_CONTRACTS.filter(c => {
          const endDate = new Date(c.endDate);
          endDate.setHours(0, 0, 0, 0);
          const isExpired = endDate <= today;
          const isMissingInfo = (!c.file) && (!c.note || c.note.trim() === '');
          return isExpired && isMissingInfo && !c.isDisabled;
        });
      }

      case ViewMode.INVALID:
        // 無效合約：手動勾選停用的合約
        return MOCK_CONTRACTS.filter(c => c.isDisabled);

      case ViewMode.HOME:
      default:
        // 有效合約：未過期 且 未停用的合約
        return MOCK_CONTRACTS.filter(c => {
          const endDate = new Date(c.endDate);
          endDate.setHours(0, 0, 0, 0);
          return endDate > today && !c.isDisabled;
        });
    }
  };

  const renderContent = () => {
    const data = getFilteredData();
    switch (currentView) {
      case ViewMode.ALL:
        return <ContractTable contracts={data} title="合約清單" />;
      case ViewMode.HOME:
        return <ContractTable contracts={data} title="合約管理-有效合約" />;
      case ViewMode.UPCOMING:
        return <ContractTable contracts={data} title="即期合約 (三個月內到期)" />;
      case ViewMode.EXPIRED:
        return <ContractTable contracts={data} title="到期合約 (已屆期)" />;
      case ViewMode.OVERDUE:
        return <ContractTable contracts={data} title="逾期合約 (未繳回檔案/備註)" />;
      case ViewMode.INVALID:
        return <ContractTable contracts={data} title="無效合約 (已停用)" />;
      case ViewMode.NEW_CONTRACT:
        return <NewContract />;
      case ViewMode.LENDING_FORM:
        return <LendingForm />;
      case ViewMode.OVERDUE_FORM:
        return <OverdueForm />;
      case ViewMode.LENDING_LIST:
        return <LendingList />;
      case ViewMode.OVERDUE_LIST:
        return <OverdueList />;
      default:
        return <ContractTable contracts={MOCK_CONTRACTS} title="合約清單" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentView} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;