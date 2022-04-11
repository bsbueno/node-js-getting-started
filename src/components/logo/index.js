import React from 'react'
import LogoImg from 'assets/img/logo.png'
import LogoImgTransparency from 'assets/img/logoTransparente.png'

export const Logo = ({ transparency }) => (
  <img alt="Clínica Médica" src={transparency ? LogoImgTransparency : LogoImg} />
)
