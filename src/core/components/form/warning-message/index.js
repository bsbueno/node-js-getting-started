import React from 'react'

export const WarningMessage = ({ message }) =>
  message ? (
    <div className="alert alert-outline-warning" role="alert">
      <div className="alert-icon">
        <i className="fas fa-exclamation-triangle" />
      </div>
      <div className="alert-text">{message}</div>
    </div>
  ) : null
