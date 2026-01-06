import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contract, ApprovalStep } from '../types';

// Reuse Approval Popover Logic (Local to this component for isolation)
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

  // 定義簽核區塊結構
  const sections = [
    {
      title: '[ 借用單位 ]',
      color: 'text-blue-600',
      items: [
        { key: '借用單位經辦', label: '經辦' },
        { key: '借用-Team主管', label: 'Team主管' },
        { key: '借用-部主管', label: '部主管' }
      ]
    },
    {
      title: '[ 合約權責單位 ]',
      color: 'text-purple-600',
      items: [
        { key: '合約權責單位經辦', label: '經辦' },
        { key: '權責-Team主管', label: 'Team主管' },
        { key: '權責-部主管', label: '部主管' }
      ]
    },
    {
      title: '[ 合約保管單位 ]',
      color: 'text-orange-600',
      items: [
        { key: '合約管理者', label: '合約管理者' }
      ]
    },
    {
      title: '[ 超過15日借閱 ]',
      color: 'text-red-600',
      condition: (data: ApprovalStep[] | undefined) => data?.some(a => a.role === '聯柏總經理'),
      items: [
        { key: '聯柏總經理', label: '聯柏總經理' }
      ]
    }
  ];
  
  return (
    <div ref={containerRef} className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-[#007bff] px-4 py-2 border-b border-blue-600 flex justify-between items-center">
        <span className="font-bold text-white text-sm">簽核進度詳情</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">&times;</button>
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {sections.map((section, sIdx) => {
          if (section.condition && !section.condition(approvals)) {
            return null;
          }

          return (
            <div key={sIdx} className="border border-gray-100 rounded-md bg-gray-50/50 overflow-hidden">
               <div className={`bg-gray-100 px-3 py-1.5 text-xs font-bold border-b border-gray-200 ${section.color}`}>
                 {section.title}
               </div>
               <div className="p-2">
                  {section.items.map((item, iIdx) => {
                    const step = approvals?.find(a => a.role === item.key);
                    const isLastInGroup = iIdx === section.items.length - 1;
                    return (
                      <div key={item.key} className={`flex items-start space-x-3 ${!isLastInGroup ? 'border-b border-gray-100 pb-2 mb-2' : ''}`}>
                        <div className="flex-shrink-0 w-28 text-xs font-bold text-gray-600 pt-1 text-right pr-2">
                            {item.label}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-0.5">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MOCK_LENDING_DATA: Contract[] = [
  {
    id: 'l1', no: 'LB20241115001', dept: '採購部', handler: '李大華', vendor: '東方物業管理', content: '大樓機房維護合約',
    appDate: '2024/11/01', endDate: '2024/12/16', startDate: '', finalDate: '', renewal: '', note: '',
    isLendingCompleted: false,
    isManagerConfirmed: false,
    approvals: [
        { role: '借用單位經辦', name: '李大華', status: 'APPROVED', date: '2024/11/01' },
        { role: '借用-Team主管', name: '王組長', status: 'APPROVED', date: '2024/11/01' },
        { role: '借用-部主管', name: '陳經理', status: 'APPROVED', date: '2024/11/02' },
        { role: '合約權責單位經辦', name: '林法務', status: 'APPROVED', date: '2024/11/03' },
        { role: '權責-Team主管', name: '黃法務長', status: 'PENDING' }
    ]
  },
  {
    id: 'l2', no: 'LB20241010002', dept: '資訊處', handler: '張美芳', vendor: '全球通訊軟體', content: '雲端主機租賃服務協議 (超過15日)',
    appDate: '2024/10/10', endDate: '2024/11/24', startDate: '', finalDate: '', renewal: '', note: '',
    isLendingCompleted: false,
    isManagerConfirmed: false,
    approvals: [
        { role: '借用單位經辦', name: '張美芳', status: 'APPROVED', date: '2024/10/10' },
        { role: '借用-Team主管', name: '趙組長', status: 'APPROVED', date: '2024/10/11' },
        { role: '借用-部主管', name: '孫處長', status: 'APPROVED', date: '2024/10/12' },
        { role: '合約權責單位經辦', name: '林法務', status: 'APPROVED', date: '2024/10/13' },
        { role: '權責-Team主管', name: '黃法務長', status: 'APPROVED', date: '2024/10/14' },
        { role: '權責-部主管', name: '吳總監', status: 'APPROVED', date: '2024/10/15' },
        { role: '合約管理者', name: 'Admin', status: 'APPROVED', date: '2024/10/16' },
        { role: '聯柏總經理', name: '李總經理', status: 'PENDING' }
    ]
  },
  {
    id: 'l3', no: 'LB20241201003', dept: '財務部', handler: '王志堅', vendor: '安信會計師事務所', content: '113年度審計服務委任',
    appDate: '2024/11/15', endDate: '2024/12/30', startDate: '', finalDate: '', renewal: '', note: '',
    isLendingCompleted: true,
    isManagerConfirmed: true,
    approvals: [
        { role: '借用單位經辦', name: '王志堅', status: 'APPROVED', date: '2024/11/15' }
    ]
  },
  {
    id: 'l4', no: 'LB20240515001', dept: '業務二部', handler: '李小美', vendor: '2024年度測試廠商', content: '年度推廣合作協議',
    appDate: '2024/06/01', endDate: '2024/07/16', startDate: '', finalDate: '', renewal: '', note: '',
    isLendingCompleted: false,
    isManagerConfirmed: false,
    approvals: [{ role: '借用單位經辦', name: '李小美', status: 'APPROVED', date: '2024/06/01' }]
  }
];

const LendingList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_LENDING_DATA);
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

  const toggleApproval = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveApprovalId(activeApprovalId === id ? null : id);
  };

  const handleToggleLendingCompleted = (id: string) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, isLendingCompleted: !c.isLendingCompleted } : c
    ));
  };

  const handleToggleManagerConfirmed = (id: string) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, isManagerConfirmed: !c.isManagerConfirmed } : c
    ));
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
      alert('請先勾選欲刪除的資料');
      return;
    }
    if (confirm(`確定要刪除這 ${selectedIds.length} 筆資料嗎？`)) {
      setContracts(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setIsDeleteMode(false);
      setSelectedIds([]);
    }
  };

  // 統一勾選框樣式，確保 checked 狀態下可見且可點選
  // 使用 appearance-none 配合 checked:before/after 來確保視覺回饋
  const baseCheckboxStyle = "w-5 h-5 cursor-pointer appearance-none border border-gray-400 rounded bg-white relative flex items-center justify-center transition-all shadow-sm";
  const completedCheckboxClass = `${baseCheckboxStyle} checked:bg-[#28a745] checked:border-[#28a745] after:content-['✓'] after:text-white after:text-xs after:font-bold after:opacity-0 checked:after:opacity-100`;
  const defaultCheckboxClass = `${baseCheckboxStyle} checked:border-[#007bff] after:content-['✓'] after:text-black after:text-xs after:font-bold after:opacity-0 checked:after:opacity-100`;

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl text-center text-black mb-6 font-bold">合約借閱清單</h1>
      
      <div className="mb-8 text-gray-500 text-[13px] bg-gray-50 p-4 border border-gray-200 rounded">
        <span className="font-bold text-gray-600">【註解說明】</span>
        <span>借閱完成請打勾。</span>
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

      <div className="overflow-x-auto bg-white rounded shadow-sm border border-gray-200 pb-48">
        <table className="w-full min-w-[1400px] border-collapse bg-white">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
               {isDeleteMode && (
                <th className="py-4 px-3 text-center w-12 bg-red-50/30">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredContracts.length > 0 && selectedIds.length === filteredContracts.length}
                    className={defaultCheckboxClass}
                  />
                </th>
              )}
              <th className="py-4 px-3 text-left table-header w-16"></th>
              <th className="py-4 px-3 text-left table-header text-[#007bff]">合約編號</th>
              <th className="py-4 px-3 text-left table-header text-[#007bff]">課</th>
              <th className="py-4 px-3 text-left table-header text-[#007bff]">經辦</th>
              <th className="py-4 px-3 text-left table-header text-[#007bff]">廠商</th>
              <th className="py-4 px-3 text-left table-header text-[#007bff] w-1/6">內容</th>
              
              <th className="py-4 px-3 text-center table-header text-[#007bff]">借閱完成</th>
              <th className="py-4 px-3 text-center table-header text-[#007bff]">合約管理者確認</th>
              
              <th className="py-4 px-3 text-left table-header text-[#007bff]">備註</th>
              <th className="py-4 px-3 text-center table-header text-[#17a2b8]">簽核進度</th>
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
                        className={defaultCheckboxClass}
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
                  <td className="py-4 px-3 text-center">
                     {isEditing ? <input name="handler" value={data.handler} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.handler}
                  </td>
                  <td className="py-4 px-3 font-medium">
                    {isEditing ? <input name="vendor" value={data.vendor} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.vendor}
                  </td>
                  <td className="py-4 px-3">
                    {isEditing ? <input name="content" value={data.content} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.content}
                  </td>
                  
                  {/* 借閱完成 (Checkbox) */}
                  <td className="py-4 px-3 text-center">
                     <div className="flex justify-center">
                       <input 
                          type="checkbox" 
                          className={completedCheckboxClass} 
                          checked={!!contract.isLendingCompleted}
                          onChange={() => handleToggleLendingCompleted(contract.id)}
                        />
                     </div>
                  </td>

                  {/* 合約管理者確認 (Checkbox) */}
                  <td className="py-4 px-3 text-center">
                     <div className="flex justify-center">
                       <input 
                          type="checkbox" 
                          className={completedCheckboxClass} 
                          checked={!!contract.isManagerConfirmed}
                          onChange={() => handleToggleManagerConfirmed(contract.id)}
                        />
                     </div>
                  </td>
                  
                  <td className="py-4 px-3">
                    {isEditing ? <input name="note" value={data.note} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs" /> : data.note}
                  </td>

                  <td className="py-4 px-3 text-center relative min-w-[110px]">
                    <button 
                      onClick={(e) => toggleApproval(contract.id, e)}
                      disabled={isDeleteMode}
                      className={`text-[#17a2b8] font-bold hover:text-[#138496] flex items-center justify-center w-full group py-1 border border-[#17a2b8] rounded-md bg-white hover:bg-[#17a2b8]/10 transition-colors ${isDeleteMode ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                <td colSpan={isDeleteMode ? 11 : 10} className="py-10 text-center text-gray-400 italic">無相關資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LendingList;