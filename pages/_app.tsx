import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: { Component: React.ComponentType; pageProps: any }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;