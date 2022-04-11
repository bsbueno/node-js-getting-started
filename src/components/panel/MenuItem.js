import React, { useState, useEffect } from 'react'
import { classNames, firstOrSelf } from 'core/helpers/misc'
import { Link } from 'core/components/route'
import { usePrevious } from 'core/hooks/previous'

export const SingleMenuItem = ({ page, actualPage, basename }) => {
  const href = firstOrSelf(page.href)
  const isExternal = !!href.match('https?://')
  const to = isExternal ? href : basename + href

  return (
    <li
      className={classNames('kt-menu__item', {
        'kt-menu__item--active': !!actualPage && actualPage.href === page.href,
      })}
    >
      <Link className="kt-menu__link" to={to} target={isExternal ? '_blank' : undefined}>
        <i className={classNames(page.icon, 'kt-menu__link-icon')} />
        <span className="kt-menu__link-text">{page.title}</span>
      </Link>
    </li>
  )
}

export const DropdownMenuItem = ({
  page,
  actualPage,
  updateScroll,
  basename,
  operator,
  sidebarRef,
}) => {
  const isActive = page.pages.some(p => !!actualPage && actualPage.href === p.href)
  const wasActive = usePrevious(isActive)
  const [opened, setOpened] = useState(isActive)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (wasActive && !isActive) {
      setOpened(false)
    }
    // eslint-disable-next-line
	}, [isActive])

  useEffect(() => {
    updateScroll()
    // eslint-disable-next-line
	}, [opened])

  useEffect(() => {
    if (sidebarRef)
      sidebarRef.scroll({
        top: scrollTop,
        behavior: 'smooth',
      })
    // eslint-disable-next-line
	}, [opened, scrollTop])

  return (
    <li
      className={classNames('kt-menu__item kt-menu__item--submenu', {
        'kt-menu__item--open': opened,
      })}
    >
      <button
        type="button"
        onClick={ev => {
          ev.preventDefault()
          setOpened(prev => !prev)

          let parent = ev.target.parentNode
          if (!parent.classList.contains('kt-menu__item')) parent = parent.parentNode

          setScrollTop(parent.offsetTop)
        }}
        className="kt-menu__link kt-menu__toggle"
      >
        <i className={classNames(page.icon, 'kt-menu__link-icon')} />
        <span className="kt-menu__link-text">{page.title}</span>
        <i className="kt-menu__ver-arrow fas fa-angle-right" />
      </button>
      <div className="kt-menu__submenu">
        <ul className="kt-menu__subnav">
          {page.pages
            .filter(({ hideWhen = () => false }) => !hideWhen(operator))
            .map(p => (
              <li
                key={firstOrSelf(p.href)}
                className={classNames('kt-menu__item', {
                  'kt-menu__item--active': !!actualPage && actualPage.href === p.href,
                })}
              >
                <Link className="kt-menu__link" to={basename + firstOrSelf(p.href)}>
                  <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                    <span />
                  </i>
                  <span className="kt-menu__link-text">{p.title}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </li>
  )
}
