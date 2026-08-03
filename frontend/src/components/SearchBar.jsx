import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search by Complaint ID...' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
        />
        <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
      </div>
    </form>
  );
};

export default SearchBar;
