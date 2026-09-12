import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-[#E2E8E5] flex gap-4 overflow-x-auto no-scrollbar ${className}`}>
        {tabs.map((tab) => {
          const tabKey = typeof tab === 'object' ? tab.key || tab.id : tab;
          const tabLabel = typeof tab === 'object' ? tab.label || tab.name : tab;
          const tabCount = typeof tab === 'object' ? tab.count : undefined;
          const Icon = typeof tab === 'object' ? tab.icon : null;
          const isActive = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              onClick={() => onChange(tabKey)}
              className={`pb-3 pt-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#075E54] text-[#075E54]'
                  : 'border-transparent text-[#66736D] hover:text-[#17211D] hover:border-gray-300'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tabLabel}</span>
              {tabCount !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-[#E8F3EF] text-[#075E54]'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 p-1 bg-[#F1F5F2] rounded-2xl overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const tabKey = typeof tab === 'object' ? tab.key || tab.id : tab;
        const tabLabel = typeof tab === 'object' ? tab.label || tab.name : tab;
        const tabCount = typeof tab === 'object' ? tab.count : undefined;
        const Icon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === tabKey;

        return (
          <button
            key={tabKey}
            onClick={() => onChange(tabKey)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white text-[#075E54] shadow-xs'
                : 'text-[#66736D] hover:text-[#17211D] hover:bg-white/50'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tabLabel}</span>
            {tabCount !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#E8F3EF] text-[#075E54]'
                    : 'bg-gray-200/70 text-gray-600'
                }`}
              >
                {tabCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
