import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import FeatureShowcase from '../components/FeatureShowcase';

const Home = () => {
  return (
    <div className="w-full">
      <Helmet>
        <title>Crusherbook | The #1 Stone Crusher Plant ERP Solution</title>
        <meta name="description" content="Crusherbook is the ultimate stone crusher plant management software and ERP solution. Automate weighbridge slips and track your ledger seamlessly." />
      </Helmet>
      <Hero />
      <FeatureShowcase />
    </div>
  );
};

export default Home;
