import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search track ID, section, location...',
  filters = [],
  activeCategory,
  onCategoryChange,
  categoryOptions = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
  totalCount,
  filteredCount,
  onReset
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Top row: search + dropdowns */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="ir-input"
            style={{
              paddingLeft: '34px',
              width: '100%',
              height: '38px',
              fontSize: '0.8125rem'
            }}
          />
        </div>

        {filters.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {f.label && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {f.label}:
              </span>
            )}
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="ir-select"
              style={{ height: '38px', fontSize: '0.8125rem', paddingRight: '28px' }}
            >
              {f.options.map((opt) => {
                const val = typeof opt === 'string' ? opt : opt.value;
                const lbl = typeof opt === 'string' ? opt : opt.label;
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
            </select>
          </div>
        ))}

        {onReset && (
          <button
            onClick={onReset}
            className="btn-ir-secondary"
            style={{
              height: '38px',
              padding: '0 12px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: 'auto'
            }}
            title="Reset Filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Bottom row: category chips + count */}
      {categoryOptions && categoryOptions.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '10px'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>
              Risk Filter:
            </span>
            {categoryOptions.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange && onCategoryChange(cat)}
                  style={{
                    border: '1px solid',
                    borderColor: active ? 'var(--ir-navy-dark)' : 'var(--border-med)',
                    background: active ? 'var(--ir-navy-dark)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: 9999,
                    padding: '3px 10px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {(totalCount !== undefined || filteredCount !== undefined) && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing <strong style={{ color: 'var(--ir-navy-dark)' }}>{filteredCount}</strong> of{' '}
              {totalCount} tracks
            </div>
          )}
        </div>
      )}
    </div>
  );
}
