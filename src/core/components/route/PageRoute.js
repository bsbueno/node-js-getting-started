/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Route } from 'react-router'

export const PageRoute = ({ component: Component, pageProps, ...rest }) => (
  <Route
    {...rest}
    render={route =>
      Component ? <Component route={route} {...pageProps} /> : <div>undefined component</div>
    }
  />
)
