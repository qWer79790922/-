import React, { useState } from 'react';
import DatePicker from './DatePicker';

const NewContract: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [finalDate, setFinalDate] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans bg-white min-h-screen">
      {/* 標題區塊 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl text-gray-700 tracking-wider mb-4 font-bold">新合約編號</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          合約呈核表若有多份合約，每份合約都需申請一個編號。並將合約掃描後將<br />
          檔名以合約編號命名，上傳至文件區歸檔。
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8 mt-12 bg-white">
        {/* 左側欄：僅保留經辦資訊 */}
        <div className="col-span-12 md:col-span-2">
            <div className="mb-2 text-gray-600 font-bold">經辦：</div>
            <div className="text-blue-600 text-lg font-bold leading-relaxed">
                許亞婷 | 聯柏-企劃<br />Team
            </div>
        </div>

        {/* 右側欄：主要表單欄位 */}
        <div className="col-span-12 md:col-span-10">
            {/* 第一列：公司與名稱 (3欄均分) */}
            <div className="grid grid-cols-12 gap-6 mb-16">
                <div className="col-span-4">
                    <label className="block text-gray-600 mb-2 text-sm font-bold">合約申請公司</label>
                    <select className="w-full border border-gray-300 rounded p-2 text-black bg-white focus:outline-none h-11 shadow-sm">
                        <option>聯柏</option>
                    </select>
                </div>
                <div className="col-span-4">
                    <label className="block text-gray-600 mb-2 text-sm font-bold">簽約公司</label>
                    <input type="text" className="w-full border border-gray-300 rounded p-2 text-black bg-white focus:outline-none h-11 shadow-sm" placeholder="請輸入簽約公司名稱" />
                </div>
                <div className="col-span-4">
                     <label className="block text-gray-600 mb-2 text-sm font-bold">合約名稱</label>
                    <input type="text" className="w-full border border-gray-300 rounded p-2 text-black bg-white focus:outline-none h-11 shadow-sm" placeholder="請輸入合約名稱" />
                </div>
            </div>

            {/* 第二列：合約到期提醒 與 三個日期欄位 同水平並列 (4欄均分) */}
            <div className="grid grid-cols-12 gap-6 mb-28 items-start">
                {/* 合約到期提醒 - 現在位於最左側與日期並列 */}
                <div className="col-span-3">
                    <label className="block text-gray-600 mb-3 text-sm font-bold">合約到期提醒</label>
                    <div className="flex flex-col space-y-4 text-sm text-gray-600 pt-1">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                                <input type="radio" name="reminder" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#d9534f] transition-all cursor-pointer" defaultChecked />
                                <div className="absolute w-2.5 h-2.5 bg-[#d9534f] rounded-full left-[5px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                            <span className="ml-2 text-[#d9534f] font-bold">評估續約，到期前提醒我</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                                <input type="radio" name="reminder" className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-gray-600 transition-all cursor-pointer" />
                                <div className="absolute w-2.5 h-2.5 bg-gray-600 rounded-full left-[5px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                            </div>
                            <span className="ml-2 text-gray-700 font-bold">不續約，不用提醒我</span>
                        </label>
                    </div>
                </div>

                {/* 合約起始日 */}
                <div className="col-span-3">
                    <label className="block text-gray-600 mb-1 text-sm font-bold">合約起始日</label>
                    <div className="text-[#d9534f] text-[11px] mb-2 font-medium">請輸入西元年格式 (例：2022/01/01)</div>
                    <DatePicker value={startDate} onChange={setStartDate} placeholder="年 / 月 / 日" />
                </div>

                {/* 到期日 */}
                <div className="col-span-3">
                    <label className="block text-gray-600 mb-1 text-sm font-bold">到期日</label>
                    <div className="text-[#d9534f] text-[11px] mb-2 font-medium">請輸入西元年格式 (例：2022/01/01)</div>
                    <DatePicker value={endDate} onChange={setEndDate} placeholder="年 / 月 / 日" />
                </div>

                {/* 最終到期日 */}
                <div className="col-span-3">
                    <label className="block text-gray-600 mb-1 text-sm font-bold">*最終到期日(含展延日)</label>
                    <div className="text-[#d9534f] text-[11px] mb-2 font-medium">請輸入西元年格式 (例：2024/01/01)</div>
                    <DatePicker value={finalDate} onChange={setFinalDate} placeholder="年 / 月 / 日" />
                </div>
            </div>

            {/* 確認按鈕：縮小尺寸並保持居中 */}
            <div className="flex justify-center mt-12 pb-16">
                <button className="bg-[#17a2b8] hover:bg-[#138496] text-white px-20 py-3 rounded text-lg font-bold transition-all shadow-md active:transform active:scale-95 min-w-[200px]">
                    確認
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewContract;