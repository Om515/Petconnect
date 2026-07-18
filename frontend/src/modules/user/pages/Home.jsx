import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Header from '../components/Header'
import FAQs from '../components/FAQs'
import Products from '../components/Products'

const Home = () => {
  return (
    <div>
      <Header/>
      <Products></Products>
      <FAQs></FAQs>
      <Footer/>
    </div>
  )
}

export default Home
