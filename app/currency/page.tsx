'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Exchange rates based on 10,000 IDR
const RATES = {
  MYR: 2.44,
  SGD: 0.77,
  AUD: 0.90,
  TWD: 18.84,
};

const CURRENCY_INFO = {
  IDR: { symbol: 'IDR', flag: '🇮🇩', name: 'Indonesian Rupiah' },
  MYR: { symbol: 'MYR', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  SGD: { symbol: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
  AUD: { symbol: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  TWD: { symbol: 'TWD', flag: '🇹🇼', name: 'Taiwan Dollar' },
};

type Currency = 'IDR' | 'MYR' | 'SGD' | 'AUD' | 'TWD';

export default function CurrencyCalculator() {
  const [fromCurrency, setFromCurrency] = useState<Currency>('IDR');
  const [toCurrency, setToCurrency] = useState<Currency>('MYR');
  const [inputValue, setInputValue] = useState<string>('10000');
  const [result, setResult] = useState<number>(0);

  // Load saved currency preference from cookie
  useEffect(() => {
    const savedCurrency = document.cookie
      .split('; ')
      .find(row => row.startsWith('lastCurrency='))
      ?.split('=')[1];
    
    if (savedCurrency && savedCurrency !== 'IDR') {
      setToCurrency(savedCurrency as Currency);
    }
  }, []);

  // Save currency preference to cookie
  useEffect(() => {
    if (fromCurrency === 'IDR') {
      document.cookie = `lastCurrency=${toCurrency}; path=/; max-age=31536000`;
    } else {
      document.cookie = `lastCurrency=${fromCurrency}; path=/; max-age=31536000`;
    }
  }, [fromCurrency, toCurrency]);

  // Calculate conversion
  useEffect(() => {
    const numAmount = parseFloat(inputValue.replace(/,/g, '')) || 0;
    let convertedAmount = 0;

    if (fromCurrency === 'IDR') {
      const rate = RATES[toCurrency as keyof typeof RATES];
      convertedAmount = (numAmount / 10000) * rate;
    } else if (toCurrency === 'IDR') {
      const rate = RATES[fromCurrency as keyof typeof RATES];
      convertedAmount = (numAmount / rate) * 10000;
    } else {
      const fromRate = RATES[fromCurrency as keyof typeof RATES];
      const toRate = RATES[toCurrency as keyof typeof RATES];
      convertedAmount = (numAmount / fromRate) * toRate;
    }

    setResult(convertedAmount);
  }, [inputValue, fromCurrency, toCurrency]);

  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    
    // For display, show up to 2 decimal places, but remove trailing zeros
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    
    return formatted;
  };

  const formatInputDisplay = (value: string): string => {
    if (!value || value === '0') return '0';
    const num = parseFloat(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleNumberPress = (num: string) => {
    if (inputValue === '0') {
      setInputValue(num);
    } else {
      setInputValue(inputValue + num);
    }
  };

  const handleDecimal = () => {
    if (!inputValue.includes('.')) {
      setInputValue(inputValue + '.');
    }
  };

  const handleClear = () => {
    setInputValue('0');
  };

  const handleBackspace = () => {
    if (inputValue.length === 1) {
      setInputValue('0');
    } else {
      setInputValue(inputValue.slice(0, -1));
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyOptions = (exclude: Currency): Currency[] => {
    const all: Currency[] = ['IDR', 'MYR', 'SGD', 'AUD', 'TWD'];
    return all.filter(c => c !== exclude);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#011a42] via-[#0a2d5c] to-[#011a42] pb-20">
      {/* Header */}
      <div className="bg-[#9b59b6] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/" className="text-2xl hover:opacity-80 transition-opacity">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold">💱 Currency Converter</h1>
            <p className="text-sm opacity-90">IDR Quick Reference</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Conversion Display Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-3">
          {/* From Currency */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl">{CURRENCY_INFO[fromCurrency].flag}</span>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as Currency)}
                  className="bg-[#9b59b6]/10 text-[#9b59b6] text-base font-semibold px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9b59b6]/30 cursor-pointer"
                >
                  {getCurrencyOptions(toCurrency).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={formatInputDisplay(inputValue)}
                readOnly
                className="flex-1 min-w-0 text-right text-2xl font-bold text-[#011a42] focus:outline-none"
              />
            </div>
          </div>

          {/* Divider with Swap Button */}
          <div className="relative my-3 border-t border-gray-200">
            <button
              onClick={handleSwap}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#9b59b6] text-white p-1.5 rounded-full hover:bg-[#8e44ad] transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Currency */}
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl">{CURRENCY_INFO[toCurrency].flag}</span>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as Currency)}
                  className="bg-[#00b4fb]/10 text-[#00b4fb] text-base font-semibold px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4fb]/30 cursor-pointer"
                >
                  {getCurrencyOptions(fromCurrency).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-0 text-right text-2xl font-bold text-[#00b4fb]">
                {formatNumber(result)}
              </div>
            </div>
          </div>
        </div>

        {/* Numpad */}
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Numbers 7-9 */}
            {['7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num)}
                className="aspect-square rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-2xl font-semibold text-[#011a42] transition-colors shadow-sm"
              >
                {num}
              </button>
            ))}

            {/* Numbers 4-6 */}
            {['4', '5', '6'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num)}
                className="aspect-square rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-2xl font-semibold text-[#011a42] transition-colors shadow-sm"
              >
                {num}
              </button>
            ))}

            {/* Numbers 1-3 */}
            {['1', '2', '3'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberPress(num)}
                className="aspect-square rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-2xl font-semibold text-[#011a42] transition-colors shadow-sm"
              >
                {num}
              </button>
            ))}

            {/* Bottom row */}
            <button
              onClick={handleDecimal}
              className="aspect-square rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-2xl font-semibold text-[#011a42] transition-colors shadow-sm"
            >
              .
            </button>
            <button
              onClick={() => handleNumberPress('0')}
              className="aspect-square rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-2xl font-semibold text-[#011a42] transition-colors shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="aspect-square rounded-xl bg-gray-200 hover:bg-gray-300 active:bg-gray-400 flex items-center justify-center transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>

            {/* Clear button spans full width */}
            <button
              onClick={handleClear}
              className="col-span-3 rounded-xl bg-[#ff8522] text-white hover:bg-[#ff9544] active:bg-[#e67619] flex items-center justify-center text-lg font-semibold transition-colors shadow-sm py-3"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}