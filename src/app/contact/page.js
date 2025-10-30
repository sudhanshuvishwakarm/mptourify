import React from 'react'

const page = () => {
    const colors = {
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333'
  };
  return (
    <div style={{ backgroundColor: colors.bgColor , padding: '20px' , height: '100vh' }}>
      contact us page
    </div>
  )
}

export default page
