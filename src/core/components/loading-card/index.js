import React from 'react'

export const LoadingCard = ({ text }) => (
  <div className="loading">
    <div className="blockui-overlay">
      <div className="blockui">
        <span>{text || 'Carregando...'}</span>
        <span>
          <div className="kt-spinner kt-spinner--loader kt-spinner--brand" />
        </span>
      </div>
    </div>
  </div>
)
