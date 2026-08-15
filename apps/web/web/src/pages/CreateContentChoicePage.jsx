import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import { Upload, Radio, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateContentChoicePage = () => {
  return (
    <>
      <Helmet>
        <title>Create Content - Eduvirse</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Header />
        
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 text-slate-900 dark:text-white">What would you like to create?</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Choose the type of content you want to share with your students.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Link to="/upload" className="group">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border-2 border-slate-100 dark:border-slate-800 hover:border-[#6366f1] dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Upload Pre-recorded Video</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Upload high-quality video lectures, add resources, and create a structured curriculum for your students to learn at their own pace.</p>
                <div className="mt-auto">
                  <span className="text-[#6366f1] dark:text-indigo-400 font-semibold group-hover:underline text-lg">Select Option &rarr;</span>
                </div>
              </div>
            </Link>

            <Link to="/go-live" className="group">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border-2 border-slate-100 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Go Live</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Host real-time interactive classes, engage with your students via live chat, and conduct Q&A sessions dynamically.</p>
                <div className="mt-auto">
                  <span className="text-red-600 dark:text-red-500 font-semibold group-hover:underline text-lg">Select Option &rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default CreateContentChoicePage;
