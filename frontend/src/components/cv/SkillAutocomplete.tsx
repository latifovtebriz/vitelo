import { useState, useRef, useEffect } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';
import type { SkillCategory } from '../../data/skillsData';

interface SkillAutocompleteProps {
  category: SkillCategory;
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillAutocomplete({
  category,
  selectedSkills,
  onChange,
}: SkillAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter skills based on query
  const filteredSkills = query.trim()
    ? category.all.filter((skill) =>
        skill.toLowerCase().includes(query.toLowerCase().trim())
      )
    : [];

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      onChange([...selectedSkills, trimmed]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        handleAddSkill(filteredSkills[0]);
      } else if (query.trim()) {
        handleAddSkill(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{category.name}</h4>
          <p className="text-xs text-slate-500">{category.description}</p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
          {selectedSkills.length} selected
        </span>
      </div>

      {/* Selected Tags */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transition-all hover:bg-blue-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-blue-500 hover:text-blue-800 focus:outline-none"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Autocomplete Input */}
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder={`Type to search or add ${category.name.toLowerCase()} (e.g. C#, Docker)...`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-24 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => handleAddSkill(query)}
              className="absolute right-2 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && query.trim() && (
          <div className="absolute z-30 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg max-h-56 overflow-y-auto py-1">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isSelected
                        ? 'text-blue-600 font-semibold bg-blue-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2.5 text-xs text-slate-500 flex items-center justify-between">
                <span>
                  No exact match. Press <strong>Add</strong> to add "
                  {query.trim()}"
                </span>
                <button
                  type="button"
                  onClick={() => handleAddSkill(query)}
                  className="px-2 py-0.5 bg-blue-600 text-white rounded font-medium text-[11px]"
                >
                  Add Custom
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular Suggestions Quick-Add Chips */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Popular Suggestions (Click to Add):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {category.popular.map((popSkill) => {
            const isSelected = selectedSkills.includes(popSkill);
            return (
              <button
                key={popSkill}
                type="button"
                onClick={() =>
                  isSelected
                    ? handleRemoveSkill(popSkill)
                    : handleAddSkill(popSkill)
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400" />
                )}
                {popSkill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
