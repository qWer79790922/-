import React, { useState } from 'react';
import DatePicker from './DatePicker';

const OverdueForm: React.FC = () => {
    const [notifDate, setNotifDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white my-8 shadow-md">
            <h2 className="text-2xl font-bold mb-8 text-center text-black">合約逾期歸檔通知書</h2>
            
            <div className="mb-3 font-bold text-black">一、聯柏合約管理者填寫欄</div>
            <div className="border-2 border-black mb-8 bg-white">
                <div className="flex border-b-2 border-black">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">合約編號</div>
                    <div className="w-3/4 p-3 bg-white">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="LB2025........"
                        />
                    </div>
                </div>
                <div className="flex border-b-2 border-black">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">合約名稱</div>
                    <div className="w-3/4 p-3 bg-white">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="115年南聯法律事務服務合約"
                        />
                    </div>
                </div>
                <div className="flex">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">通知日</div>
                    <div className="w-1/4 p-3 border-r-2 border-black bg-white">
                        <DatePicker value={notifDate} onChange={setNotifDate} isTeal={true} />
                    </div>
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">備註</div>
                    <div className="w-1/4 p-3 bg-white">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="若有，請填寫"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-3 font-bold text-black">二、承辦單位填寫欄</div>
            <div className="border-2 border-black bg-white">
                <div className="flex border-b-2 border-black">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">所屬部門/Team</div>
                    <div className="w-1/4 p-3 border-r-2 border-black bg-white">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="聯柏-總經理室"
                        />
                    </div>
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black">承辦人</div>
                    <div className="w-1/4 p-3 bg-white">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="請填寫"
                        />
                    </div>
                </div>
                <div className="flex border-b-2 border-black min-h-[80px]">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black text-center">簽約對象(1)</div>
                    <div className="w-1/4 p-3 border-r-2 border-black bg-white flex items-center">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="請填寫"
                        />
                    </div>
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black text-center">其他簽約對象<br/>(若無則免填)</div>
                    <div className="w-1/4 p-3 bg-white flex items-center">
                        <input 
                            type="text" 
                            className="w-full p-2 outline-none text-black placeholder-gray-400" 
                            placeholder="若有，請填寫"
                        />
                    </div>
                </div>
                <div className="flex border-b-2 border-black min-h-[120px]">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black text-center">未如期繳回<br/>事由</div>
                    <div className="w-3/4 p-3 bg-white">
                        <textarea 
                            className="w-full h-full p-2 outline-none text-black resize-none placeholder-gray-400 font-medium" 
                            placeholder="請填寫原因"
                        ></textarea>
                    </div>
                </div>
                <div className="flex min-h-[80px]">
                    <div className="w-1/4 p-4 border-r-2 border-black bg-gray-50 flex items-center justify-center font-bold text-black text-center">預計繳回日期</div>
                    <div className="w-3/4 p-4 flex items-center bg-white relative">
                        <div className="w-48 mr-4">
                            <DatePicker value={returnDate} onChange={setReturnDate} isTeal={false} />
                        </div>
                        <span className="text-sm text-red-500 font-medium">(備註：如未於期限內繳回，將連續寄發本通知書，直至繳回為止。)</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-yellow-50 p-6 rounded border border-yellow-200">
                <div className="font-bold mb-3 text-yellow-800 tracking-wider">[ 相關事項說明 ]</div>
                <ol className="list-decimal list-inside text-sm text-gray-700 leading-8 space-y-1">
                    <li>本通知書寄發標準：南聯法務課發還用印合約後之翌日起算 45 日(含國際合約)，若未於 45 日(含國際合約)內繳回符合公司歸檔標準(含：大小章、騎縫章、修正章等)之合約，將寄發本通知書。</li>
                    <li>通知書回覆期限：請於 <span className="text-red-600 font-bold">3 個工作天</span>內繳回聯柏合約管理者。</li>
                </ol>
            </div>

            <div className="mt-10 text-center flex justify-center space-x-8">
                <button className="bg-gray-400 text-white px-12 py-3 rounded shadow-md hover:bg-gray-500 transition-colors font-bold">存檔</button>
                <button className="bg-[#007bff] text-white px-12 py-3 rounded shadow-md hover:bg-[#0069d9] transition-colors font-bold">提交送出</button>
            </div>
        </div>
    );
};

export default OverdueForm;