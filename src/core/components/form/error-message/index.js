import React from 'react'

export const ErrorMessage = ({ error }) =>
  error ? (
    <div className="alert alert-outline-danger" role="alert">
      <div className="alert-icon">
        <i className="fas fa-exclamation-triangle" />
      </div>
      <div className="alert-text">{error}</div>
    </div>
  ) : null
