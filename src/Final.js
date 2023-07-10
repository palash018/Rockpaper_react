import React from 'react'

export default function Final(props) {
  return (
    <div className='neonText'>
      {props.status===false?<p>You lost</p>:<p>You won</p>}
    </div>
  )
}
