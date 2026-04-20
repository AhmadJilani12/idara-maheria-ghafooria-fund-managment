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
          maxWidth: '300px',
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

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.5rem 0.7rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === 1 ? '#f0f0f0' : '#fff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        {'<<'}
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '0.5rem 0.7rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === 1 ? '#f0f0f0' : '#fff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
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
            padding: '0.5rem 0.7rem',
            border: page === currentPage ? '2px solid #27ae60' : '1px solid #d0e8e1',
            borderRadius: '4px',
            background: page === currentPage ? '#27ae60' : '#fff',
            color: page === currentPage ? '#fff' : '#000',
            cursor: 'pointer',
            fontSize: '0.8rem',
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
          padding: '0.5rem 0.7rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === totalPages ? '#f0f0f0' : '#fff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        {'>'}
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: '0.5rem 0.7rem',
          border: '1px solid #d0e8e1',
          borderRadius: '4px',
          background: currentPage === totalPages ? '#f0f0f0' : '#fff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        {'>>'}
      </button>

      <span style={{ padding: '0.5rem 0.7rem', fontSize: '0.8rem', color: '#7f8c8d' }}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
