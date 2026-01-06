import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    isTeal?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "mm/dd/yyyy", isTeal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 週一開始
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const formatted = `${selected.getFullYear()}/${(selected.getMonth() + 1).toString().padStart(2, '0')}/${selected.getDate().toString().padStart(2, '0')}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        const formatted = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(month, year);
        const startDay = firstDayOfMonth(month, year);
        
        const days = [];
        // 前一個月補位
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }
        
        for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(year, month, d);
            const isToday = new Date().toDateString() === dateObj.toDateString();
            const formatted = `${year}/${(month + 1).toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`;
            const isSelected = value === formatted;
            
            days.push(
                <div 
                    key={d} 
                    onClick={(e) => handleDateSelect(d, e)}
                    className={`p-2 text-center text-sm cursor-pointer rounded-md transition-all flex items-center justify-center h-9 w-9 mx-auto ${
                        isSelected 
                        ? 'bg-[#e0f9f5] text-[#26d2b3] border border-[#26d2b3] font-bold' 
                        : isToday 
                        ? 'text-[#26d2b3] font-bold' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full h-10 px-3 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-gray-400 shadow-sm transition-all"
            >
                <span className={`text-sm ${value ? 'text-black' : 'text-gray-400'}`}>
                    {value || placeholder}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[1000] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-4">
                        <button onClick={handlePrevMonth} className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="text-base font-bold text-gray-700">
                            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                        </div>
                        <button onClick={handleNextMonth} className="p-1 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="px-3 pb-3">
                        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2 border-b border-gray-50 pb-2">
                            {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {renderCalendar()}
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50">
                        <button 
                            onClick={handleClear} 
                            className="text-sm text-[#26d2b3] font-bold hover:underline"
                        >
                            清除
                        </button>
                        <button 
                            onClick={handleToday} 
                            className="text-sm border border-[#26d2b3] text-[#26d2b3] bg-white px-6 py-2 rounded-md hover:bg-[#e0f9f5] transition-colors font-bold"
                        >
                            今天
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;