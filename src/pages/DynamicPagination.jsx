import React from "react";
import { Pagination } from "react-bootstrap";

const DynamicPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1); // always show first

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages); // always show last

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination
      className="justify-content-center mt-3"
      style={{
        "--bs-pagination-active-bg": "#212529",
        "--bs-pagination-active-border-color": "#212529",
        "--bs-pagination-color": "#212529",
        "--bs-pagination-hover-color": "#212529",
        "--bs-pagination-focus-color": "#212529",
      }}
    >
      <Pagination.First
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      />
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />

      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
        ) : (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
            style={{
              color: "#212529",
              backgroundColor: page === currentPage ? "#212529" : undefined,
              borderColor: page === currentPage ? "#212529" : undefined,
            }}
          >
            {page}
          </Pagination.Item>
        )
      )}

      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
      <Pagination.Last
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      />
    </Pagination>
  );
};

export default DynamicPagination;
