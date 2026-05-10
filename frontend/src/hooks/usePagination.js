import { useState } from 'react';

const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  const goToPage = (p) => setPage(p);
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const resetPage = () => setPage(1);
  return { page, goToPage, nextPage, prevPage, resetPage };
};

export default usePagination;
