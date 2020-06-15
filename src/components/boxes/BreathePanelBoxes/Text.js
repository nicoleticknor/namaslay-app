import React from 'react'
import './Text.scss'

export default function Text(props) {

  const { innerText, className } = props

  return (
    <p className={className}>
      {innerText}
    </p>
  )
}
