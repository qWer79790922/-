import React, { useState } from 'react';
import DatePicker from './DatePicker';

const LendingForm: React.FC = () => {
  const [loanDate, setLoanDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [actualReturnDate, setActualReturnDate] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white my-8 shadow-md">
      <h2 className="text-xl font-bold mb-6 text-black border-b pb-2">【附件四】合約借閱申請書</h2>
      
      <div className="border-2 border-black bg-white">
        {/* Row 1 */}
        <div className="flex border-b border-black">
          <div className="w-1/4 p-4 border-r border-black font-bold bg-gray-50 text-black flex items-center">一、合約名稱</div>
          <div className="w-3/4 p-3 bg-white">
            <input 
              type="text" 
              className="w-full p-2 outline-none bg-white text-black placeholder-gray-400" 
              placeholder="115年南聯法律事務服務合約"
            />
          </div>
        </div>
        
        {/* Row 2 */}
        <div className="flex border-b border-black">
          <div className="w-1/4 p-4 border-r border-black font-bold bg-gray-50 text-black flex items-center">二、合約權責部門別</div>
          <div className="w-3/4 p-3 bg-white">
            <input 
              type="text" 
              className="w-full p-2 outline-none bg-white text-black placeholder-gray-400" 
              placeholder="聯柏-總經理室"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex border-b border-black">
          <div className="w-1/4 p-4 border-r border-black font-bold bg-gray-50 text-black flex items-center">三、合約編號</div>
          <div className="w-3/4 p-3 bg-white">
            <input 
              type="text" 
              className="w-full p-2 outline-none bg-white text-black placeholder-gray-400" 
              placeholder="LB2025........"
            />
          </div>
        </div>

        {/* Row 4 */}
        <div className="flex border-b border-black min-h-[100px]">
          <div className="w-1/4 p-4 border-r border-black font-bold flex items-center bg-gray-50 text-black">四、借用原因</div>
          <div className="w-3/4 p-3 bg-white">
            <textarea 
              className="w-full h-full p-2 outline-none bg-white text-black resize-none placeholder-gray-400" 
              placeholder="請輸入原因"
            ></textarea>
          </div>
        </div>

         {/* Row 5 - 改良後的日期選擇區域 */}
        <div className="flex border-b border-black">
          <div className="w-1/4 p-4 border-r border-black font-bold flex items-center justify-start bg-gray-50 text-black">五、借用日期</div>
          <div className="w-3/4 bg-white">
             <div className="flex border-b border-black p-4 items-center">
                 <div className="w-1/3 text-center text-black font-medium">出借日</div>
                 <div className="w-2/3 flex justify-end">
                     <div className="w-52">
                        <DatePicker value={loanDate} onChange={setLoanDate} />
                     </div>
                 </div>
             </div>
             <div className="flex border-b border-black p-4 items-center">
                 <div className="w-1/3 text-center text-black font-medium">預計歸還日</div>
                 <div className="w-2/3 flex justify-end">
                     <div className="w-52">
                        <DatePicker value={expectedReturnDate} onChange={setExpectedReturnDate} />
                     </div>
                 </div>
             </div>
             <div className="flex p-4 items-center">
                 <div className="w-1/3 text-center text-black font-medium">歸還日</div>
                 <div className="w-2/3 flex justify-end">
                     <div className="w-52">
                        <DatePicker value={actualReturnDate} onChange={setActualReturnDate} />
                     </div>
                 </div>
             </div>
          </div>
        </div>

        {/* Row 6 (Item 7) */}
        <div className="flex min-h-[100px]">
          <div className="w-1/4 p-4 border-r border-black font-bold bg-gray-50 text-black flex items-center">七、預計歸還超過規定 15 日者，原因說明</div>
          <div className="w-3/4 p-3 bg-white">
            <textarea 
              className="w-full h-full p-2 outline-none bg-white text-black resize-none placeholder-gray-400" 
              placeholder="請輸入原因"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 leading-7 bg-blue-50 p-5 rounded border border-blue-100">
        <span className="font-bold text-blue-800">註：</span><br/>
        1. 借出時限以 15 日為限，預計歸還超過規定 15 日者，需註明原因並經主管同意。<br/>
        2. 合約資料屬公司機密文件，合約借用單位應善盡借用合約之保密及保管責任。
      </div>

      <div className="mt-10 text-center flex justify-center space-x-8">
         <button className="bg-gray-400 text-white px-10 py-3 rounded shadow hover:bg-gray-500 transition-colors font-bold">存檔</button>
         <button className="bg-blue-600 text-white px-10 py-3 rounded shadow hover:bg-blue-700 transition-colors font-bold">提交申請</button>
      </div>
    </div>
  );
};

export default LendingForm;