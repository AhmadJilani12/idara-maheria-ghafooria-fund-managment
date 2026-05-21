'use client';

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '0.95rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          transition: 'all 0.2s'
        }}
      />
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage = 10, totalItems = 0 }) {
  const pages = [];
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const maxPagesToShow = isSmallScreen ? 3 : 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const btnStyle = {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2.5rem'
  };

  const activeBtnStyle = {
    ...btnStyle,
    background: 'var(--primary)',
    color: 'white',
    borderColor: 'var(--primary)'
  };

  const disabledBtnStyle = {
    ...btnStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
    background: 'var(--bg-main)'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isSmallScreen ? 'column' : 'row',
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: '1rem', 
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid var(--border)'
    }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {totalItems > 0 ? (
          <span>
            Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
          </span>
        ) : (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnStyle}
          title="First Page"
        >
          «
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledBtnStyle : btnStyle}
          title="Previous Page"
        >
          ‹
        </button>

        {!isSmallScreen && startPage > 1 && <span style={{ padding: '0.5rem' }}>...</span>}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={page === currentPage ? activeBtnStyle : btnStyle}
          >
            {page}
          </button>
        ))}

        {!isSmallScreen && endPage < totalPages && <span style={{ padding: '0.5rem' }}>...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnStyle}
          title="Next Page"
        >
          ›
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledBtnStyle : btnStyle}
          title="Last Page"
        >
          »
        </button>
      </div>
    </div>
  );
}

