/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Redirect, Route } from 'react-router'
import { config } from 'config'
import { localStore } from 'core/helpers/store'

export const PrivateRoute = ({
  component: Component,
  render,
  tokenKey = config.TOKEN_KEY,
  ...rest
}) => (
  <Route
    {...rest}
    render={route => {
      if (!localStore.get(tokenKey)) {
        return (
          <Redirect
            to={{
              pathname: `/login`,
              state: { from: route.location },
            }}
          />
        )
      }

      if (Component) return <Component {...route} />
      if (render) return render(route)
      return <div>undefined component</div>
    }}
  />
)
