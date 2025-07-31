'use client';

import { useState } from 'react';
import axios from 'axios';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import Button from '../../ui/button/Button';

type ButtonVariant = 'primary' | 'outline' | 'secondary';

interface RoomOption {
  value: string;
  label: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
  price: number;
}

interface MonthData {
  ranges: DateRange[];
  basePrice: number;
}

interface PriceData {
  jan?: MonthData;
  feb?: MonthData;
  mar?: MonthData;
  apr?: MonthData;
  may?: MonthData;
  jun?: MonthData;
  jul?: MonthData;
  aug?: MonthData;
  sep?: MonthData;
  oct?: MonthData;
  nov?: MonthData;
  dec?: MonthData;
  [key: string]: MonthData | undefined;
}

interface ApiResponse {
  prices?: PriceData;
  message?: string;
}
const apiBase = import.meta.env.VITE_API_URL;
const options: RoomOption[] = [
  // { value: '687dd634fcd5e0829434c9a0', label: 'Chic-1' },
  // { value: '687dd643fcd5e0829434c9a2', label: 'Dubail-mall' },
  // { value: '687dd653fcd5e0829434c9a4', label: 'Chic-studio' },
  { value: '688aeab7ed82dbd5f4ec09e8', label: 'Merano-1710' },
  { value: '688a06b056c748a9ea56a65a', label: 'Majestine-618' },
  { value: '688a068256c748a9ea56a60c', label: 'Reva-1811' },
  { value: '688a057256c748a9ea56a4f8', label: 'Merano-2906' },
];

const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
type MonthKey = typeof monthNames[number];

const monthLabels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarDatePicker = ({ 
  month, 
  year, 
  selectedRanges, 
  onRangeSelect, 
  onClose 
}: {
  month: number;
  year: number;
  selectedRanges: DateRange[];
  onRangeSelect: (startDate: string, endDate: string) => void;
  onClose: () => void;
}) => {
  const [selectionPhase, setSelectionPhase] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateString = (day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const isDateInRange = (day: number) => {
    const dateStr = formatDateString(day);
    return selectedRanges.some(range => {
      return dateStr >= range.startDate && dateStr <= range.endDate;
    });
  };

  const isDateInSelection = (day: number) => {
    const dateStr = formatDateString(day);
    
    if (!startDate) return false;
    if (!endDate && !hoverDate) return dateStr === startDate;
    
    const effectiveEndDate = endDate || hoverDate;
    if (!effectiveEndDate) return false;
    
    const start = startDate <= effectiveEndDate ? startDate : effectiveEndDate;
    const end = startDate <= effectiveEndDate ? effectiveEndDate : startDate;
    
    return dateStr >= start && dateStr <= end;
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDateString(day);
    
    if (selectionPhase === 'start') {
      setStartDate(dateStr);
      setEndDate(null);
      setSelectionPhase('end');
    } else {
      setEndDate(dateStr);
      setSelectionPhase('start');
    }
  };

  const handleMouseEnter = (day: number) => {
    if (selectionPhase === 'end') {
      const dateStr = formatDateString(day);
      setHoverDate(dateStr);
    }
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const confirmSelection = () => {
    if (startDate && endDate) {
      onRangeSelect(startDate, endDate);
    } else if (startDate && hoverDate) {
      onRangeSelect(startDate, hoverDate);
    }
    onClose();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = isDateInRange(day);
    const isInSelection = isDateInSelection(day);
    
    days.push(
      <div
        key={day}
        className={`calendar-day ${isSelected ? 'selected' : ''} ${isInSelection ? 'selection' : ''}`}
        onClick={() => handleDateClick(day)}
        onMouseEnter={() => handleMouseEnter(day)}
      >
        {day}
      </div>
    );
  }

  return (
    <div 
      className="calendar-popup fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-1 mt-20"
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {monthLabels[month]} {year}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="calendar-grid grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-header text-center text-sm font-medium p-2 text-gray-300">
              {day}
            </div>
          ))}
          {days}
        </div>

        <div className="flex flex-col items-center">
          <div className="text-sm text-gray-400 mb-4">
            <p>Click to select start date, then click end date</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={confirmSelection}
            disabled={!startDate || (!endDate && !hoverDate)}
            className="w-full max-w-xs"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

const PriceRangeManager = ({ 
  ranges, 
  basePrice, 
  onRangesChange, 
  onBasePriceChange,
  roomName,
  month
}: {
  ranges: DateRange[];
  basePrice: number;
  onRangesChange: (ranges: DateRange[]) => void;
  onBasePriceChange: (price: number) => void;
  roomName: string;
  month: MonthKey;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handlePriceChange = (index: number, price: number) => {
    const newRanges = [...ranges];
    newRanges[index].price = price;
    onRangesChange(newRanges);
  };

  const handleRemoveRange = async (index: number) => {
    const rangeToDelete = ranges[index];
    if (!roomName || !rangeToDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await axios.delete(`${apiBase}/api/priceDelete`, {
        data: {
          roomName,
          month,
          startDate: rangeToDelete.startDate,
          endDate: rangeToDelete.endDate
        }
      });

      if (response.data.message === 'Range deleted successfully') {
        const newRanges = ranges.filter((_, i) => i !== index);
        onRangesChange(newRanges);
      } else {
        setError('Failed to delete range on server');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete range. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}
      
      <div>
        <Label>Base Price (AED)</Label>
        <Input
          type="number"
          value={basePrice || ''}
          onChange={(e) => onBasePriceChange(Number(e.target.value) || 0)}
          placeholder="Enter base price"
          className='dark:text-white dark:border-white'
        />
      </div>
      
      {ranges.length > 0 && (
        <div className='dark:text-white '>
          <Label>Date Range Pricing</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {ranges.map((range, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm flex-1">
                  {range.startDate} to {range.endDate}
                </span>
                <Input
                  type="number"
                  value={range.price || ''}
                  onChange={(e) => handlePriceChange(index, Number(e.target.value) || 0)}
                  placeholder="Price"
                  className="w-20"
                />
                <button
                  onClick={() => handleRemoveRange(index)}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-700 font-bold disabled:opacity-50"
                >
                  {isDeleting ? '...' : '×'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Price() {
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [prices, setPrices] = useState<Record<MonthKey, MonthData>>({
    jan: { ranges: [], basePrice: 0 },
    feb: { ranges: [], basePrice: 0 },
    mar: { ranges: [], basePrice: 0 },
    apr: { ranges: [], basePrice: 0 },
    may: { ranges: [], basePrice: 0 },
    jun: { ranges: [], basePrice: 0 },
    jul: { ranges: [], basePrice: 0 },
    aug: { ranges: [], basePrice: 0 },
    sep: { ranges: [], basePrice: 0 },
    oct: { ranges: [], basePrice: 0 },
    nov: { ranges: [], basePrice: 0 },
    dec: { ranges: [], basePrice: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCalendar, setActiveCalendar] = useState<MonthKey | null>(null);
  const currentYear = new Date().getFullYear();

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    if (!id) return;

    setRoomId(id);
    setError('');
    setIsLoading(true);

    const selected = options.find((o) => o.value === id);
    setRoomName(selected ? selected.label : '');

    try {
      const res = await axios.get<ApiResponse>(`${apiBase}/api/priceView/${id}`);
      const fetched = res.data;

      if (fetched?.prices) {
        const newPrices = { ...prices };
        
        monthNames.forEach(month => {
          const monthData = fetched.prices?.[month];
          if (monthData) {
            newPrices[month] = {
              ranges: monthData.ranges || [],
              basePrice: monthData.basePrice || 0
            };
          }
        });

        setPrices(newPrices);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to load prices.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCalendar = (month: MonthKey) => {
    setActiveCalendar(month);
  };

  const handleCloseCalendar = () => {
    setActiveCalendar(null);
  };

  const handleRangeSelect = (month: MonthKey, startDate: string, endDate: string) => {
    setPrices(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        ranges: [...prev[month].ranges, { startDate, endDate, price: prev[month].basePrice }]
      }
    }));
  };

  const handleRangesChange = (month: MonthKey, ranges: DateRange[]) => {
    setPrices(prev => ({
      ...prev,
      [month]: { ...prev[month], ranges }
    }));
  };

  const handleBasePriceChange = (month: MonthKey, price: number) => {
    setPrices(prev => ({
      ...prev,
      [month]: { ...prev[month], basePrice: price }
    }));
  };

  const handleSubmit = async () => {
    if (!roomId) {
      setError('Please select a room before updating prices.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.put(`${apiBase}/api/priceUpadte`, {
        roomName,
        prices,
      });

      alert('Prices updated successfully!');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to update prices.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };
const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
  outline: "border border-gray-400 text-black hover:bg-gray-100",
  secondary: "bg-gray-600 text-white hover:bg-gray-700",
};

  return (
    <>
      <ComponentCard title="Monthly Room Pricing with Date Ranges">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="room-select">Select Room</Label>
            <select
              id="room-select"
              value={roomId}
              onChange={handleSelectChange}
              disabled={isLoading}
              className="w-full p-2 rounded border bg-white text-black focus:text-black dark:bg-gray-800 dark:text-white dark:focus:text-white"
            >
              <option value="">-- Select a room --</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {error}
              </div>
            )}

            {isLoading && <div className="text-blue-500">Loading prices...</div>}

            <div className="grid grid-cols-1 gap-4 mt-4 max-h-96 overflow-y-auto">
              {monthNames.map((month, index) => (
                <div key={month} className="border border-gray-200 rounded-lg p-4 dark:text-white dark:border-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">{monthLabels[index]}</h4>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenCalendar(month)}
                      disabled={!roomId || isLoading}
                      className='dark:text-white '
                    >
                      📅 Select Dates
                    </Button>
                  </div>
                  
                  <PriceRangeManager
                    ranges={prices[month].ranges}
                    basePrice={prices[month].basePrice}
                    onRangesChange={(ranges) => handleRangesChange(month, ranges)}
                    onBasePriceChange={(price) => handleBasePriceChange(month, price)}
                    roomName={roomName}
                    month={month}
                  />
                </div>
              ))}
            </div>

            <Button
              size="md"
              variant="primary"
              onClick={handleSubmit}
              disabled={!roomId || isLoading}
              className="w-full"
            >
              {isLoading ? 'Updating…' : 'Update All Prices'}
            </Button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 dark:text-white ">Live Preview</h3>
            <p className="mb-4 dark:text-white ">
              <strong className='dark:text-white '>Room Name:</strong> {roomName || 'Not selected'}
            </p>

            {roomId && (
              <div className="space-y-3 max-h-120 overflow-y-auto">
                {monthNames.map((month, index) => {
                  const monthData = prices[month];
                  const hasData = monthData.basePrice > 0 || monthData.ranges.length > 0;
                  
                  if (!hasData) return null;

                  return (
                    <div key={month} className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {monthLabels[index]}
                      </h4>
                      
                      {monthData.basePrice > 0 && (
                        <p className="text-sm dark:text-white ">
                          <strong>Base Price:</strong> {monthData.basePrice} AED
                        </p>
                      )}
                      
                      {monthData.ranges.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Special Pricing:
                          </p>
                          {monthData.ranges.map((range, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-700 p-1 rounded mb-1 dark:text-white ">
                              {range.startDate} to {range.endDate}: <strong>{range.price} AED</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      {activeCalendar && (
        <CalendarDatePicker
          month={monthNames.indexOf(activeCalendar)}
          year={currentYear}
          selectedRanges={prices[activeCalendar].ranges}
          onRangeSelect={(start, end) => handleRangeSelect(activeCalendar, start, end)}
          onClose={handleCloseCalendar}
        />
      )}

      <style jsx global>{`
        .calendar-popup {
          background-color: rgba(0, 0, 0, 0.8) !important;
        }
        
        .calendar-day {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          user-select: none;
          color: white;
          transition: all 0.2s ease;
          
        }
        
        .calendar-day:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .calendar-day.empty {
          border-color: transparent;
          cursor: default;
          background-color: transparent !important;
        }
        
        .calendar-day.selected {
          background-color: #3b82f6 !important;
          color: white;
          border-color: #3b82f6 !important;
        }
        
        .calendar-day.selection {
          background-color: rgba(59, 130, 246, 0.5) !important;
          border-color: rgba(59, 130, 246, 0.7) !important;
        }
        
        .calendar-header {
          text-align: center;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </>
  );
}