import React from 'react'
import { range } from 'core/helpers/functional'
import { Button } from 'core/components/button'
import { classNames } from 'core/helpers/misc'

export function pagesRange(currentPage, total, delta = 2) {
  const middle = Math.min(Math.max(currentPage, delta + 1), total - delta)
  const start = Math.max(middle - delta, 1)
  const end = middle + delta
  return range(start, end)
}

export const Pagination = ({ current, total, changePage }) => {
  const pages = pagesRange(current, total, 3)

  return total < 2 ? null : (
    <ul className="kt-datatable__pager-nav">
      <li>
        <Button
          className={classNames('kt-datatable__pager-link kt-datatable__pager-link--first', {
            'kt-datatable__pager-link--disabled': current === 1,
          })}
          icon="fas fa-angle-double-left"
          onClick={() => changePage(1)}
          disabled={current === 1}
        />
      </li>
      <li>
        <Button
          className={classNames('kt-datatable__pager-link kt-datatable__pager-link--prev', {
            'kt-datatable__pager-link--disabled': current === 1,
          })}
          icon="fas fa-angle-left"
          onClick={() => changePage(current - 1)}
          disabled={current === 1}
        />
      </li>

      {pages.map(num => (
        <li key={num}>
          <button
            type="button"
            className={classNames('kt-datatable__pager-link kt-datatable__pager-link-number', {
              'kt-datatable__pager-link--active': num === current,
            })}
            aria-label={`Página ${num}`}
            aria-current="page"
            onClick={() => changePage(num)}
            disabled={num === current}
          >
            {num}
          </button>
        </li>
      ))}

      <li>
        <Button
          className={classNames('kt-datatable__pager-link kt-datatable__pager-link--next', {
            'kt-datatable__pager-link--disabled': current === total,
          })}
          icon="fas fa-angle-right"
          onClick={() => changePage(current + 1)}
          disabled={current === total}
        />
      </li>
      <li>
        <Button
          className={classNames('kt-datatable__pager-link kt-datatable__pager-link--last', {
            'kt-datatable__pager-link--disabled': current === total,
          })}
          icon="fas fa-angle-double-right"
          onClick={() => changePage(total)}
          disabled={current === total}
        />
      </li>
    </ul>
  )
}
