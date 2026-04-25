'use client';

export function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          maxWidth: '100%',
          padding: '0.6rem 0.8rem',
          border: '2px solid #d0e8e1',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          transition: 'border-color 0.3s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#27ae60'}
        onBlur={(e) => e.target.style.borderColor = '#d0e8e1'}
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
      {!isSmallScreen && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #d0e8e1',
            borderRadius: '4px',
            background: currentPage === 1 ? '#f0f0f0' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.7rem',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          {'<<'}
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.4rem 0.6rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === 1 ? '#f0f0f0' : '#fff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.7rem',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        {'<'}
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '0.4rem 0.6rem',
            border: page === currentPage ? '2px solid #27ae60' : '1px solid #d0e8e1',
            borderRadius: '4px',
            background: page === currentPage ? '#27ae60' : '#fff',
            color: page === currentPage ? '#fff' : '#000',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: page === currentPage ? 'bold' : 'normal'
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.4rem 0.6rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === totalPages ? '#f0f0f0' : '#fff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.7rem',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        {'>'}
      </button>

      {!isSmallScreen && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.4rem 0.6rem',
            border: '1px solid #d0e8e1',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#f0f0f0' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.7rem',
            opacity: currentPage === totalPages ? 0.5 : 1
          }}
        >
          {'>>'}
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#7f8c8d', padding: '0 0.4rem' }}>
        {totalItems > 0 ? (
          <span>
            {isSmallScreen 
              ? `${startItem}-${endItem} of ${totalItems}`
              : `Showing ${startItem} to ${endItem} of ${totalItems}`
            }
          </span>
        ) : (
          <span>
            {isSmallScreen ? `${currentPage}/${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        )}
      </div>
    </div>
  );
}
