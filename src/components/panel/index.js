import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Route, Switch } from 'react-router'
import ScrollBar from 'react-perfect-scrollbar'
import { Link, PageRoute } from 'core/components/route'
import { classNames, firstOrSelf } from 'core/helpers/misc'
import { useOnClickOutside } from 'core/hooks/clickOutside'
import { config } from 'config'
import { logOut } from 'service'
import { useWindowSize } from 'core/hooks/windowSize'
import { useRefresh } from 'core/hooks/refresh'
import { SingleMenuItem, DropdownMenuItem } from './MenuItem'
import { Logo } from '../logo'

const pathMapper = (item, mapper) => (Array.isArray(item) ? item.map(mapper) : mapper(item))

const Panel = ({
  global,
  pages,
  base,
  home,
  service,
  route,
  routes = [],
  tokenKey,
  userPages = [],
}) => {
  const { operator, unities } = global
  const unityName = route.match.params.unity || ''
  const basename = base.replace(':unity', unityName)

  const windowSize = useWindowSize()
  const userMenuRef = useRef(null)
  const boxRef = useRef(null)
  const sidebarRef = useRef()
  const refresh = useRefresh()
  const [userOpened, setUserOpened] = useState(false)
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const [topbarOpened, setTopbarOpened] = useState(false)

  const unity = useMemo(() => unities.find(c => c.url === unityName), [unities, unityName])
  const panelTitle = unity ? unity.description : 'Super Admin'

  useOnClickOutside(userMenuRef, () => setUserOpened(false))

  const hasBoxRef = !!boxRef.current

  const sidebarHeight = useMemo(() => {
    const box = boxRef.current
    if (hasBoxRef) {
      return windowSize.width > 1000 ? box.offsetHeight - 30 : windowSize.height
    }

    return windowSize.height - 155
    // eslint-disable-next-line
	}, [windowSize, hasBoxRef, refresh.ref])

  useEffect(() => {
    setUserOpened(false)
    setSidebarOpened(false)
    setTopbarOpened(false)
  }, [route.location.pathname])

  if (global.loading) return 'Carregando...'

  const allPages = pages
    .concat(userPages)
    .filter(({ hideWhen = () => false }) => !hideWhen(global.operator))
    .flatMap(i => ('pages' in i ? i.pages : i))
    .filter(p => !firstOrSelf(p.href).match('https?://'))

  const { pathname } = route.location
  const actualPage = allPages.find(a => pathname.startsWith(basename + firstOrSelf(a.href))) || {
    href: pathname,
  }

  const pageProps = { basename, service, global }

  const now = new Date()

  return (
    <>
      <div className="kt-header-mobile kt-header-mobile--fixed">
        <div className="kt-header-mobile__logo">
          <Link to={home.href}>
            <Logo route={route} transparency />
            <span>{panelTitle}</span>
          </Link>
        </div>
        <div className="kt-header-mobile__toolbar">
          <button
            type="button"
            className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left"
            onClick={() => setSidebarOpened(true)}
          >
            <span />
          </button>
          <button
            type="button"
            className="kt-header-mobile__toolbar-topbar-toggler"
            onClick={() => setTopbarOpened(x => !x)}
          >
            <i className="fas fa-ellipsis-h" />
          </button>
        </div>
      </div>

      <div
        className={classNames('kt-grid kt-grid--hor kt-grid--root', {
          'kt-header__topbar--mobile-on': topbarOpened,
          'kt-aside--on': sidebarOpened,
        })}
      >
        <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
          <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper">
            <div className="kt-header kt-grid__item kt-header--fixed">
              <div className="kt-container">
                <div className="kt-header__brand">
                  <div className="kt-header__brand-logo">
                    <Link to={basename}>
                      <Logo route={route} transparency />
                      <span>{panelTitle}</span>
                    </Link>
                  </div>
                </div>
                <div className="kt-header__topbar">
                  <div
                    ref={userMenuRef}
                    className={classNames('kt-header__topbar-item kt-header__topbar-item--user', {
                      show: userOpened,
                    })}
                    onClick={() => setUserOpened(true)}
                  >
                    <div className="kt-header__topbar-wrapper">
                      <span className="kt-header__topbar-welcome kt-visible-desktop">Olá,</span>
                      <span className="kt-header__topbar-username kt-visible-desktop">
                        {operator.name.split(' ')[0]}
                      </span>
                      <span className="kt-header__topbar-icon kt-bg-brand">
                        <b>{operator.name.charAt(0)}</b>
                      </span>
                    </div>
                    <div
                      className={classNames(
                        'dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-xl',
                        {
                          show: userOpened,
                        },
                      )}
                    >
                      <div className="kt-user-card kt-user-card--skin-light kt-notification-item-padding-x">
                        <div className="kt-user-card__avatar">
                          <span className="kt-badge kt-badge--username kt-badge--lg kt-badge--rounded kt-badge--bold">
                            {operator.name.charAt(0)}
                          </span>
                        </div>
                        <div className="kt-user-card__name">{operator.name}</div>
                      </div>
                      <div className="kt-notification">
                        {userPages.map(up => (
                          <Link
                            key={up.title}
                            className="kt-notification__item"
                            to={basename + firstOrSelf(up.href)}
                          >
                            <div className="kt-notification__item-icon">
                              <i className={up.icon} aria-hidden="true" />
                            </div>
                            <div className="kt-notification__item-details">
                              <div className="kt-notification__item-title kt-font-bold">
                                {up.title}
                              </div>
                            </div>
                          </Link>
                        ))}

                        <div
                          style={userPages.length === 0 ? { borderTop: 'none' } : undefined}
                          className="kt-notification__custom justify-content-end"
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-bold btn-light"
                            onClick={() => logOut(tokenKey || config.TOKEN_KEY)}
                          >
                            <i className="fas fa-sign-out-alt" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="kt-container kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
              <button
                type="button"
                className="kt-aside-close"
                onClick={() => setSidebarOpened(false)}
              >
                <i className="fas fa-times" />
              </button>

              <div
                ref={boxRef}
                className={classNames(
                  'kt-aside kt-aside--fixed kt-grid__item kt-grid kt-grid--desktop kt-grid--hor-desktop',
                  {
                    'kt-aside--on': sidebarOpened,
                  },
                )}
              >
                <div className="kt-aside-menu-wrapper kt-grid__item kt-grid__item--fluid">
                  <ScrollBar
                    containerRef={el => {
                      sidebarRef.current = el
                    }}
                    className="kt-aside-menu kt-scroll"
                    style={{
                      height: sidebarHeight,
                    }}
                  >
                    <ul className="kt-menu__nav">
                      <li
                        className={classNames('kt-menu__item', {
                          'kt-menu__item--active': !!actualPage && actualPage.href === basename,
                        })}
                      >
                        <Link className="kt-menu__link" to={basename}>
                          <i className="kt-menu__link-icon fas fa-home" />
                          <span className="kt-menu__link-text">Dashboard</span>
                        </Link>
                      </li>

                      <li className="kt-menu__section">
                        <h4 className="kt-menu__section-text">Menu</h4>
                      </li>

                      {pages
                        .filter(({ hideWhen = () => false }) => !hideWhen(global.operator))
                        .map(p =>
                          'pages' in p ? (
                            <DropdownMenuItem
                              key={p.title}
                              page={p}
                              actualPage={actualPage}
                              basename={basename}
                              updateScroll={() => refresh.force()}
                              operator={global.operator}
                              sidebarRef={sidebarRef.current}
                            />
                          ) : (
                            <SingleMenuItem
                              key={p.title}
                              page={p}
                              actualPage={actualPage}
                              basename={basename}
                            />
                          ),
                        )}
                    </ul>
                  </ScrollBar>
                </div>
              </div>

              {sidebarOpened && (
                <div className="kt-aside-overlay" onClick={() => setSidebarOpened(false)} />
              )}

              <div className="kt-holder kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                <div className="kt-content kt-grid__item kt-grid__item--fluid">
                  <Switch>
                    {routes.map(({ path, component }) => (
                      <PageRoute
                        exact
                        key={path}
                        path={pathMapper(path, p => base + p)}
                        component={component}
                        pageProps={pageProps}
                      />
                    ))}

                    {allPages.map(pg => (
                      <PageRoute
                        exact
                        key={pg.href}
                        path={pathMapper(pg.href, p => base + p)}
                        component={pg.component}
                        pageProps={pageProps}
                      />
                    ))}

                    <PageRoute exact path={basename} component={home} pageProps={pageProps} />

                    <Route
                      render={() => (
                        <>
                          <div className="header">Erro 404 - Não Encontrado.</div>
                          <div className="content-sub-header">
                            A página que você solicitou não pôde ser encontrada, entre em contato
                            com o administrador ou tente novamente.
                          </div>
                        </>
                      )}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            <div className="kt-footer kt-grid__item">
              <div className="kt-container">
                <div className="kt-footer__wrapper">
                  <div className="kt-footer__copyright">
                    Todos os direitos reservados © {now.getFullYear()} - Clinica Médica
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="kt-scrolltop">
        <i className="fa fa-arrow-up" />
      </div>
    </>
  )
}

export default React.memo(Panel)
