import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contract } from '../types';

interface ContractTableProps {
  contracts: Contract[];
  title: string;
}

// Reusable Dropdown Component for Header Filters
const FilterDropdown: React.FC<{
  options: { label: string; value: string }[];
  currentValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}> = ({ options, currentValue, onSelect, onClose, style }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef} 
      className="absolute top-full left-0 mt-1 min-w-[120px] bg-white border border-gray-200 rounded shadow-xl z-[110] py-1 text-left"
      style={style}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(opt.value);
            onClose();
          }}
          className={`block w-full text-left px-4 py-2 text-xs hover:bg-blue-50 transition-colors ${
            currentValue === opt.value ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const ContractTable: React.FC<ContractTableProps> = ({ contracts: initialContracts, title }) => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'EXPIRED' | 'OVERDUE'>('ALL');
  const [renewalFilter, setRenewalFilter] = useState<'ALL' | 'Y' | 'N'>('ALL');
  
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [dateYearFilter, setDateYearFilter] = useState<string>('ALL');
  const [activeYearCol, setActiveYearCol] = useState<string | null>(null);
  
  // New File Filter State
  const [fileFilter, setFileFilter] = useState<'ALL' | 'HAS_FILE' | 'NO_FILE'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Track which header dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});
  const deptOptions = ['業務一部', '業務二部', '採購部', '資訊處', '財務部', '管理部', '行銷部'];

  // Helper to extract unique years in descending order
  const getUniqueYears = (col: keyof Contract) => {
    const years = contracts
      .map(c => {
        const val = c[col];
        if (typeof val === 'string' && val.includes('/')) {
          return val.split('/')[0];
        }
        return null;
      })
      .filter((y): y is string => y !== null);
    return Array.from(new Set(years)).sort((a: string, b: string) => b.localeCompare(a));
  };

  // Helper to extract unique depts
  const getUniqueDepts = () => {
    const depts = contracts.map(c => c.dept);
    return Array.from(new Set(depts)).sort();
  };

  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // 1. Status Filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (statusFilter === 'UPCOMING') {
      const threeMonthsLater = new Date(today);
      threeMonthsLater.setMonth(today.getMonth() + 3);
      result = result.filter(c => {
        const endDate = new Date(c.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate > today && endDate <= threeMonthsLater;
      });
    } else if (statusFilter === 'EXPIRED') {
      result = result.filter(c => {
        const endDate = new Date(c.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate <= today;
      });
    } else if (statusFilter === 'OVERDUE') {
      result = result.filter(c => {
        const endDate = new Date(c.endDate);
        endDate.setHours(0, 0, 0, 0);
        const isExpired = endDate <= today;
        const isMissingInfo = (!c.file) && (!c.note || c.note.trim() === '');
        return isExpired && isMissingInfo;
      });
    }

    // 2. Header Filters
    if (renewalFilter !== 'ALL') {
      result = result.filter(c => c.renewal === renewalFilter);
    }

    if (deptFilter !== 'ALL') {
      result = result.filter(c => c.dept === deptFilter);
    }

    if (activeYearCol && dateYearFilter !== 'ALL') {
      result = result.filter(c => {
        const val = (c as any)[activeYearCol];
        return typeof val === 'string' && val.startsWith(dateYearFilter);
      });
    }

    if (fileFilter === 'HAS_FILE') {
      result = result.filter(c => !!c.file);
    } else if (fileFilter === 'NO_FILE') {
      result = result.filter(c => !c.file);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.no.toLowerCase().includes(term) ||
        c.dept.toLowerCase().includes(term) ||
        c.vendor.toLowerCase().includes(term) ||
        c.content.toLowerCase().includes(term) ||
        c.handler.toLowerCase().includes(term) ||
        c.note.toLowerCase().includes(term)
      );
    }

    // 4. Sorting: Always sort newest to oldest based on the filtered column or start date
    const sortCol = (activeYearCol as keyof Contract) || 'startDate';
    result.sort((a, b) => {
      const valA = (a as any)[sortCol] || '';
      const valB = (b as any)[sortCol] || '';
      return valB.localeCompare(valA);
    });

    return result;
  }, [contracts, searchQuery, statusFilter, renewalFilter, deptFilter, dateYearFilter, activeYearCol, fileFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, renewalFilter, deptFilter, dateYearFilter, activeYearCol, fileFilter]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    if (filteredContracts.length === 0) {
      alert('無資料可供匯出');
      return;
    }
    const headers = ['合約編號', '課', '廠商', '內容', '起始日', '到期日', '續約', '經辦', '申請日', '最終到期日', '備註'];
    const csvRows = filteredContracts.map(c => [
      c.no,
      c.dept,
      `"${c.vendor.replace(/"/g, '""')}"`,
      `"${c.content.replace(/"/g, '""')}"`,
      c.startDate,
      c.endDate,
      c.renewal,
      c.handler,
      c.appDate,
      c.finalDate,
      `"${(c.note || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = "\ufeff" + headers.join(',') + '\n' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `合約清單_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (editFormData && file) {
      setEditFormData({ ...editFormData, file: file });
    }
  };

  const handleRemoveFile = () => {
     if (editFormData) {
      setEditFormData({ ...editFormData, file: null });
     }
  }

  const handleTriggerFileUpload = (id: string) => {
    if(fileInputRefs.current[id]) {
        fileInputRefs.current[id]?.click();
    }
  }

  const getFileDownloadInfo = (file: File | string | null | undefined) => {
    if (!file) return null;
    if (typeof file === 'string') return { url: file, name: 'contract_file' };
    return { url: URL.createObjectURL(file), name: file.name };
  };

  const toggleDropdown = (col: string) => {
    setOpenDropdown(openDropdown === col ? null : col);
  };

  const clearAllFilters = () => {
    setStatusFilter('ALL');
    setRenewalFilter('ALL');
    setDeptFilter('ALL');
    setDateYearFilter('ALL');
    setActiveYearCol(null);
    setFileFilter('ALL');
  };

  return (
    <div className="p-8 bg-white min-h-screen flex flex-col">
      <h1 className="text-3xl text-center text-black mb-8 font-bold">{title}</h1>
      
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        {/* Search Input */}
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

        {/* Action Buttons Row */}
        <div className="flex items-center space-x-2">
          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-sm font-bold flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            匯出
          </button>
          
          {(statusFilter !== 'ALL' || renewalFilter !== 'ALL' || deptFilter !== 'ALL' || dateYearFilter !== 'ALL' || fileFilter !== 'ALL') && (
            <button 
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 text-sm font-bold underline px-2 ml-2"
            >
              清除所有篩選
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-sm border border-gray-200 flex-grow">
        <table className="w-full min-w-[1200px] border-collapse bg-white">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="py-4 px-3 text-left table-header w-16"></th>
              <th className="py-4 px-3 text-left table-header">合約編號</th>
              
              {/* Dept Filter Dropdown */}
              <th className="py-4 px-3 text-left table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('dept')}>
                <span className="text-[#007bff] hover:underline flex items-center">
                  課 {deptFilter !== 'ALL' ? `(${deptFilter})` : '▼'}
                </span>
                {openDropdown === 'dept' && (
                  <FilterDropdown 
                    currentValue={deptFilter}
                    options={[{ label: '全部', value: 'ALL' }, ...getUniqueDepts().map(d => ({ label: d, value: d }))]}
                    onSelect={setDeptFilter}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </th>

              <th className="py-4 px-3 text-left table-header">廠商</th>
              <th className="py-4 px-3 text-left table-header w-1/5">內容</th>

              {/* Start Date Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('startDate')}>
                <span className="text-[#007bff] hover:underline flex items-center justify-center">
                  起始日 {activeYearCol === 'startDate' && dateYearFilter !== 'ALL' ? `(${dateYearFilter})` : '▼'}
                </span>
                {openDropdown === 'startDate' && (
                  <FilterDropdown 
                    currentValue={activeYearCol === 'startDate' ? dateYearFilter : 'ALL'}
                    options={[{ label: '全部', value: 'ALL' }, ...getUniqueYears('startDate').map(y => ({ label: y, value: y }))]}
                    onSelect={(val) => { setActiveYearCol(val === 'ALL' ? null : 'startDate'); setDateYearFilter(val); }}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </th>

              {/* End Date Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('endDate')}>
                <span className="text-[#007bff] hover:underline flex items-center justify-center">
                  到期日 {activeYearCol === 'endDate' && dateYearFilter !== 'ALL' ? `(${dateYearFilter})` : '▼'}
                </span>
                {openDropdown === 'endDate' && (
                  <FilterDropdown 
                    currentValue={activeYearCol === 'endDate' ? dateYearFilter : 'ALL'}
                    options={[{ label: '全部', value: 'ALL' }, ...getUniqueYears('endDate').map(y => ({ label: y, value: y }))]}
                    onSelect={(val) => { setActiveYearCol(val === 'ALL' ? null : 'endDate'); setDateYearFilter(val); }}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </th>

              {/* Renewal Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('renewal')}>
                <span className="text-[#007bff] hover:underline flex items-center justify-center">
                  續約 {renewalFilter !== 'ALL' ? `(${renewalFilter})` : '▼'}
                </span>
                {openDropdown === 'renewal' && (
                  <FilterDropdown 
                    currentValue={renewalFilter}
                    options={[
                      { label: '全部', value: 'ALL' },
                      { label: 'Y', value: 'Y' },
                      { label: 'N', value: 'N' }
                    ]}
                    onSelect={setRenewalFilter}
                    onClose={() => setOpenDropdown(null)}
                    style={{ left: 'auto', right: 0 }}
                  />
                )}
              </th>

              <th className="py-4 px-3 text-left table-header text-center">經辦</th>

              {/* App Date Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('appDate')}>
                <span className="text-[#007bff] hover:underline flex items-center justify-center">
                  申請日 {activeYearCol === 'appDate' && dateYearFilter !== 'ALL' ? `(${dateYearFilter})` : '▼'}
                </span>
                {openDropdown === 'appDate' && (
                  <FilterDropdown 
                    currentValue={activeYearCol === 'appDate' ? dateYearFilter : 'ALL'}
                    options={[{ label: '全部', value: 'ALL' }, ...getUniqueYears('appDate').map(y => ({ label: y, value: y }))]}
                    onSelect={(val) => { setActiveYearCol(val === 'ALL' ? null : 'appDate'); setDateYearFilter(val); }}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </th>

              {/* Final Date Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('finalDate')}>
                <span className="text-[#007bff] hover:underline text-center block">
                  最終到期日<br/>(含展延日) {activeYearCol === 'finalDate' && dateYearFilter !== 'ALL' ? `(${dateYearFilter})` : '▼'}
                </span>
                {openDropdown === 'finalDate' && (
                  <FilterDropdown 
                    currentValue={activeYearCol === 'finalDate' ? dateYearFilter : 'ALL'}
                    options={[{ label: '全部', value: 'ALL' }, ...getUniqueYears('finalDate').map(y => ({ label: y, value: y }))]}
                    onSelect={(val) => { setActiveYearCol(val === 'ALL' ? null : 'finalDate'); setDateYearFilter(val); }}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </th>

              <th className="py-4 px-3 text-left table-header">備註</th>
              
              {/* File Filter Dropdown */}
              <th className="py-4 px-3 text-center table-header cursor-pointer select-none relative" onClick={() => toggleDropdown('file')}>
                <span className="text-[#007bff] hover:underline flex items-center justify-center">
                  檔案 {fileFilter !== 'ALL' ? (fileFilter === 'HAS_FILE' ? '(有)' : '(無)') : '▼'}
                </span>
                {openDropdown === 'file' && (
                  <FilterDropdown 
                    currentValue={fileFilter}
                    options={[
                      { label: '全部', value: 'ALL' },
                      { label: '有檔案', value: 'HAS_FILE' },
                      { label: '無檔案', value: 'NO_FILE' }
                    ]}
                    onSelect={(val) => setFileFilter(val as any)}
                    onClose={() => setOpenDropdown(null)}
                    style={{ left: 'auto', right: 0 }}
                  />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedContracts.map((contract) => {
              const isEditing = editingId === contract.id;
              const data = isEditing && editFormData ? editFormData : contract;
              const fileInfo = getFileDownloadInfo(contract.file);

              return (
                <tr key={contract.id} className="border-b border-gray-200 hover:bg-blue-50/30 text-sm text-black bg-white transition-colors">
                  <td className="py-4 px-3">
                    {isEditing ? (
                      <div className="flex flex-col space-y-1">
                        <button onClick={handleUpdateClick} className="text-blue-600 font-bold hover:underline">更新</button>
                        <button onClick={handleCancelClick} className="text-gray-500 hover:underline">取消</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(contract)}
                        className="text-blue-500 font-bold hover:underline"
                      >
                        編輯
                      </button>
                    )}
                  </td>
                  
                  <td className="py-4 px-3 font-mono">{contract.no}</td>
                  
                  <td className="py-4 px-3 min-w-[120px]">
                    {isEditing ? (
                      <select name="dept" value={data.dept} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs h-8">
                        {deptOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : data.dept}
                  </td>
                  
                  <td className="py-4 px-3 font-medium">
                    {isEditing ? <input name="vendor" value={data.vendor} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs h-8" /> : data.vendor}
                  </td>
                  
                  <td className="py-4 px-3">
                    {isEditing ? <input name="content" value={data.content} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs h-8" /> : data.content}
                  </td>
                  
                  <td className="py-4 px-3 text-center">
                    {isEditing ? <input name="startDate" value={data.startDate} onChange={handleInputChange} className="border border-gray-300 rounded w-28 p-1 bg-white text-center text-xs h-8" /> : data.startDate}
                  </td>
                  
                  <td className="py-4 px-3 text-center">
                    {isEditing ? <input name="endDate" value={data.endDate} onChange={handleInputChange} className="border border-gray-300 rounded w-28 p-1 bg-white text-center text-xs h-8" /> : data.endDate}
                  </td>
                  
                  <td className="py-4 px-3 text-center min-w-[80px]">
                    {isEditing ? (
                      <select name="renewal" value={data.renewal} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 text-center bg-white text-xs h-8">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    ) : data.renewal}
                  </td>

                  <td className="py-4 px-3 text-center">{contract.handler}</td>

                  <td className="py-4 px-3 text-center">{contract.appDate}</td>
                  
                  <td className="py-4 px-3 text-center">
                    {isEditing ? <input name="finalDate" value={data.finalDate} onChange={handleInputChange} className="border border-gray-300 rounded w-28 p-1 bg-white text-center text-xs h-8" /> : data.finalDate}
                  </td>

                  <td className="py-4 px-3">
                    {isEditing ? <input name="note" value={data.note} onChange={handleInputChange} className="border border-gray-300 rounded w-full p-1 bg-white text-xs h-8" /> : data.note}
                  </td>
                  
                  <td className="py-4 px-3 text-center min-w-[100px]">
                    {isEditing ? (
                        <div className="flex flex-col items-center space-y-2 w-full">
                             <input 
                                type="file" 
                                ref={el => fileInputRefs.current[contract.id] = el}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, contract.id)}
                            />
                            <button 
                                onClick={() => handleTriggerFileUpload(contract.id)}
                                className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded text-xs w-24 font-bold shadow-sm transition-colors"
                            >
                                {data.file ? '更換檔案' : '上傳檔案'}
                            </button>
                            {data.file && (
                                <button 
                                    onClick={handleRemoveFile}
                                    className="bg-[#d9534f] hover:bg-[#c9302c] text-white px-4 py-1.5 rounded text-xs w-24 font-bold shadow-sm transition-colors"
                                >
                                    刪除檔案
                                </button>
                            )}
                        </div>
                    ) : (
                        fileInfo ? (
                          <div className="flex flex-col items-center space-y-2 w-full">
                              <a 
                                href={fileInfo.url} 
                                download={fileInfo.name}
                                className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded text-xs w-24 font-bold shadow-sm transition-colors block text-center no-underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                下載檔案
                              </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )
                    )}
                  </td>
                </tr>
              );
            })}
            {paginatedContracts.length === 0 && (
              <tr>
                <td colSpan={13} className="py-10 text-center text-gray-400 italic">查無相符資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="py-4 flex items-center justify-center space-x-2 bg-white border-t border-gray-200 mt-auto">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border text-sm font-bold ${
                    currentPage === 1 
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                    : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                }`}
            >
                上一頁
            </button>
            
            <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold border ${
                            currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border text-sm font-bold ${
                    currentPage === totalPages 
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                    : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                }`}
            >
                下一頁
            </button>
            <span className="text-sm text-gray-500 ml-4 font-bold">
                第 {currentPage} 頁 / 共 {totalPages} 頁 (總計 {filteredContracts.length} 筆)
            </span>
        </div>
      )}
    </div>
  );
};

export default ContractTable;