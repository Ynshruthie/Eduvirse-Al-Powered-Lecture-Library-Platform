import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PlaceholderPage = ({ title }) => {
  return (
    <>
      <Helmet>
        <title>{title} - Eduvirse</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Construction className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              We're currently working hard on this page. Our team is building something amazing for you. Please check back soon!
            </p>
            
            <Link to="/">
              <Button size="lg" className="px-8 h-12 text-base">
                <ArrowLeft className="mr-2 w-5 h-5" /> Back to Home
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PlaceholderPage;
