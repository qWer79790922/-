import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contract, ApprovalStep } from '../types';
import { MOCK_CONTRACTS } from '../constants';
import DatePicker from './DatePicker';

const ApprovalPopover: React.FC<{ approvals?: ApprovalStep[]; onClose: () => void }> = ({ approvals, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200 font-bold';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200 font-bold';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return '核准';
      case 'REJECTED': return '駁回';
      default: return '待簽核';
    }
  };

  const roles = ['經辦人', 'Team Leader', '部主管'];
  
  return (
    <div ref={containerRef} className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-[#007bff] px-4 py-2 border-b border-blue-600 flex justify-between items-center">
        <span className="font-bold text-white text-sm">簽核進度詳情</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">&times;</button>
      </div>
      <div className="p-4 space-y-4">
        {roles.map((role, idx) => {
          const step = approvals?.find(a => a.role === role);
          return (
            <div key={idx} className="flex items-start space-x-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-20 text-xs font-bold text-gray-500 pt-1">{role}</div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-black">{step?.name || '--'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusStyle(step?.status || 'PENDING')}`}>
                    {getStatusLabel(step?.status || 'PENDING')}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  {step?.date ? `簽核日期：${step.date}` : '尚未簽核'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!approvals && (
        <div className="p-4 text-center text-gray-400 text-xs bg-gray-50">
          此合約目前無電子簽核紀錄
        </div>
      )}
    </div>
  );
};

const OverdueList: React.FC = () => {
  const addDaysAndFormat = (dateStr: string, days: number) => {
    if (!dateStr) return '';
    const result = new Date(dateStr);
    result.setDate(result.getDate() + days);
    return `${result.getFullYear()}/${(result.getMonth() + 1).toString().padStart(2, '0')}/${result.getDate().toString().padStart(2, '0')}`;
  };

  const addDays = (dateStr: string, days: number) => {
    if (!dateStr) return new Date();
    const result = new Date(dateStr);
    result.setDate(result.getDate() + days);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialOverdueContracts = useMemo(() => {
    return MOCK_CONTRACTS
      .filter(c => {
        if (c.isDisabled) return false;
        if (c.file) return false;
        const overdueThreshold = addDays(c.startDate, 45);
        return today >= overdueThreshold;
      })
      .map(c => ({
        ...c,
        endDate: addDaysAndFormat(c.startDate, 45),
        appDate: '',
        finalDate: ''
      }));
  }, []);

  const [contracts, setContracts] = useState<Contract[]>(initialOverdueContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Contract | null>(null);
  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null);
  
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    const term = searchQuery.toLowerCase().trim();
    return contracts.filter(c => 
      c.no.toLowerCase().includes(term) ||
      c.dept.toLowerCase().includes(term) ||
      c.vendor.toLowerCase().includes(term) ||
      c.content.toLowerCase().includes(term) ||
      c.handler.toLowerCase().includes(term) ||
      c.note.toLowerCase().includes(term)
    );
  }, [contracts, searchQuery]);

  const handleEditClick = (contract: Contract) => {
    setEditingId(contract.id);
    setEditFormData({ ...contract });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleUpdateClick = () => {
    if (editFormData) {
      setContracts(prev => prev.map(c => c.id === editFormData.id ? editFormData : c));
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleDateChange = (name: keyof Contract, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const toggleApproval = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveApprovalId(activeApprovalId === id ? null : id);
  };

  const handleToggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
    setEditingId(null);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredContracts.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) {
      alert('請先勾選欲刪除的合約');
      return;
    }
    if (confirm(`確定要刪除這 ${selectedIds.length} 筆合約資料嗎？`)) {
      // 實際刪除狀態中的合約
      const newContracts = contracts.filter(c => !selectedIds.includes(c.id));
      setContracts(newContracts);
      setIsDeleteMode(false);
      setSelectedIds([]);
    }
  };

  // 勾選框共同樣式：底色白、選中後邊框藍、勾勾黑
  const checkboxClass = "w-5 h-5 cursor-pointer appearance-none bg-white border border-gray-400 rounded checked:bg-white checked:border-[#007bff] relative flex items-center justify-center after:content-['✓'] after:hidden after:checked:block after:text-black after:text-xs after:font-bold shadow-sm";

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl text-center text-black mb-6 font-bold">逾期合約清單</h1>
      
      <div className="mb-8 text-gray-500 text-[11px] leading-relaxed max-w-5xl bg-gray-50 p-4 border border-gray-200 rounded">
        <p className="font-bold mb-1 text-gray-600">【註解說明】</p>
        <p>(1) 法務簽核日：公文簽核系統簽核完成時間。</p>
        <p>(2) 應繳回日：法務簽核日+45天</p>
        <p>(3) 預計繳回日1：該合約的合約逾期歸檔通知書之預計繳回日期。</p>
        <p>(4) 預計繳回日2：同份合約預計繳回日1已有日期，但合約截止至預計繳回日1之日期仍未繳回，則需再請經辦再次填寫合約逾期歸檔通知書，並以新的逾期歸檔通知書之預計繳回日期為主。</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 flex-grow max-w-xl">
          <label className="text-black font-bold whitespace-nowrap">查詢欄</label>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="請輸入關鍵字" 
            className="w-full border border-gray-300 rounded p-2 text-black bg-white focus:outline-none focus:border-blue-400 placeholder-gray-400 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-3">
          {!isDeleteMode ? (
            <button 
              onClick={handleToggleDeleteMode}
              className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-colors shadow-sm font-bold flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              刪除
            </button>
          ) : (
            <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
              <button 
                onClick={handleConfirmDelete}
                className="bg-[#d9534f] text-white px-4 py-2 rounded hover:bg-[#c9302c] transition-colors shadow-sm font-bold"
              >
                確認刪除 ({selectedIds.length})
              </button>
              <button 
                onClick={handleToggleDeleteMode}
                className="bg-[#e9ecef] text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors shadow-sm font-bold"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-sm border border-gray-200 pb-64">
        <table className="w-full min-w-[1400px] border-collapse bg-white">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              {isDeleteMode && (
                <th className="py-4 px-3 text-center w-12 bg-red-50/30">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredContracts.length > 0 && selectedIds.length === filteredContracts.length}
                    className={checkboxClass}
                  />
                </th>
              )}
              <th className="py-4 px-3 text-left table-header w-16"></th>
              <th className="py-4 px-3 text-left table-header">合約編號</th>
              <th className="py-4 px-3 text-left table-header">課</th>
              <th className="py-4 px-3 text-left table-header text-center">經辦</th>
              <th className="py-4 px-3 text-left table-header">廠商</th>
              <th className="py-4 px-3 text-left table-header w-1/6">內容</th>
              <th className="py-4 px-3 text-center table-header text-[#007bff]">法務簽核日</th>
              <th className="py-4 px-3 text-center table-header text-[#007bff]">應繳回日</th>
              <th className="py-4 px-3 text-center table-header text-[#007bff]">預計繳回日1</th>
              <th className="py-4 px-3 text-center table-header text-[#007bff]">預計繳回日2</th>
              <th className="py-4 px-3 text-left table-header">備註</th>
              <th className="py-4 px-3 text-center table-header text-[#17a2b8] font-bold">簽核進度</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((contract) => {
              const isEditing = editingId === contract.id;
              const data = isEditing && editFormData ? editFormData : contract;
              const isSelected = selectedIds.includes(contract.id);

              return (
                <tr key={contract.id} className={`border-b border-gray-200 hover:bg-blue-50/20 text-sm text-black transition-colors ${isEditing ? 'bg-blue-50/50 relative z-50' : isSelected ? 'bg-red-50/40' : 'bg-white'}`}>
                  {isDeleteMode && (
                    <td className="py-4 px-3 text-center bg-red-50/10">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOne(contract.id)}
                        className={checkboxClass}
                      />
                    </td>
                  )}
                  <td className="py-4 px-3">
                    {isEditing ? (
                      <div className="flex flex-col space-y-1">
                        <button onClick={handleUpdateClick} className="text-blue-600 font-bold hover:underline text-xs">更新</button>
                        <button onClick={handleCancelClick} className="text-gray-500 hover:underline text-xs">取消</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(contract)}
                        disabled={isDeleteMode}
                        className={`text-blue-500 font-bold hover:underline ${isDeleteMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        編輯
                      </button>
                    )}
                  </td>
                  
                  <td className="py-4 px-3 font-mono">{contract.no}</td>
                  
                  <td className="py-4 px-3">
                    {isEditing ? <input name="dept" value={data.dept} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.dept}
                  </td>
                  <td className="py-4 px-3 text-center">{contract.handler}</td>
                  <td className="py-4 px-3 font-medium">
                    {isEditing ? <input name="vendor" value={data.vendor} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.vendor}
                  </td>
                  <td className="py-4 px-3">
                    {isEditing ? <input name="content" value={data.content} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.content}
                  </td>
                  
                  <td className="py-4 px-3 text-center min-w-[120px] font-medium text-gray-600">
                    {contract.startDate}
                  </td>

                  <td className="py-4 px-3 text-center min-w-[140px] text-[#d9534f] font-bold">
                    {contract.endDate || '-'}
                  </td>

                  <td className="py-4 px-3 text-center min-w-[140px] relative">
                    {isEditing ? (
                      <DatePicker value={data.appDate} onChange={(val) => handleDateChange('appDate', val)} />
                    ) : (
                      contract.appDate || '-'
                    )}
                  </td>

                  <td className="py-4 px-3 text-center min-w-[140px] relative">
                    {isEditing ? (
                      <DatePicker value={data.finalDate} onChange={(val) => handleDateChange('finalDate', val)} />
                    ) : (
                      contract.finalDate || '-'
                    )}
                  </td>
                  
                  <td className="py-4 px-3">
                    {isEditing ? <input name="note" value={data.note} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.note}
                  </td>

                  <td className="py-4 px-3 text-center relative min-w-[110px]">
                    <button 
                      onClick={(e) => toggleApproval(contract.id, e)}
                      disabled={isDeleteMode}
                      className={`text-[#17a2b8] font-bold hover:text-[#138496] flex items-center justify-center w-full group py-1 border border-[#17a2b8] rounded-md hover:bg-[#17a2b8]/10 transition-colors ${isDeleteMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-xs">查看進度</span>
                      <svg className={`w-3 h-3 ml-1 transition-transform ${activeApprovalId === contract.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeApprovalId === contract.id && (
                      <ApprovalPopover 
                        approvals={contract.approvals} 
                        onClose={() => setActiveApprovalId(null)} 
                      />
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredContracts.length === 0 && (
              <tr>
                <td colSpan={isDeleteMode ? 13 : 12} className="py-10 text-center text-gray-400 italic">目前無逾期合約資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverdueList;