import styles from './Pagination.module.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <div className={styles.pagination}>
      <button
        className={styles.btn}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ← Prev
      </button>
      <div className={styles.pages}>
        {visiblePages.reduce((acc, p, i) => {
          if (i > 0 && p - visiblePages[i - 1] > 1) {
            acc.push(<span key={`dot-${p}`} className={styles.dots}>…</span>);
          }
          acc.push(
            <button
              key={p}
              className={[styles.page, p === page ? styles.active : ''].join(' ')}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          );
          return acc;
        }, [])}
      </div>
      <button
        className={styles.btn}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
