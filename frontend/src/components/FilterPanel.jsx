import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

const FilterPanel = ({ filters, onChange, onClear, districts = [], activityTypes = [] }) => {
  const handleSelectChange = (field, val) => {
    onChange({
      ...filters,
      [field]: val
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-gov-blue" />
          <span>Intel Filters</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-gov-blue transition-smooth cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Filter 1: Status */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Report Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:border-gov-blue transition-smooth"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Filter 2: District */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            District
          </label>
          <select
            value={filters.district || ''}
            onChange={(e) => handleSelectChange('district', e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:border-gov-blue transition-smooth"
          >
            <option value="">All Districts</option>
            {districts.map((d, index) => (
              <option key={index} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Activity Type */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Drug Activity Type
          </label>
          <select
            value={filters.activityType || ''}
            onChange={(e) => handleSelectChange('activityType', e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:border-gov-blue transition-smooth"
          >
            <option value="">All Activity Types</option>
            {activityTypes.map((t, index) => (
              <option key={index} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Incident Date */}
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Incident Date
          </label>
          <input
            type="date"
            value={filters.incidentDate || ''}
            onChange={(e) => handleSelectChange('incidentDate', e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:border-gov-blue transition-smooth"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
