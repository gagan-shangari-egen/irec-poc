import React from "react";
import _ from "lodash";
import PropType from "prop-types";

const Pagination = ({ count, pageSize, onPageChange, currentPage }) => {
  const pagesCount = Math.ceil(count / pageSize);
  if (pagesCount === 1) return null;
  const pages = _.range(1, pagesCount + 1);
  return (
    <div>
      <ul className="pagination">
        {pages.map((page) => (
          <li
            key={page}
            className={page === currentPage ? "page-item active" : "page-item"}
          >
            <a className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

Pagination.propType = {
  count: PropType.number.isRequired,
  pageSize: PropType.number.isRequired,
  onPageChange: PropType.number.isRequired,
  currentPage: PropType.func.isRequired,
};

export default Pagination;
