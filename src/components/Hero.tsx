import React from 'react';
import { Gamepad2Icon } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://uploadthingy.s3.us-west-1.amazonaws.com/j4KwKME8Sszn3RKxeLHnDw/Logo-35.png"
              alt="MindBreakers Logo"
              className="h-24 md:h-32"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Level Up Your Gaming Experience
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10">
            Premium game server hosting with exceptional performance,
            reliability, and a community-focused experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => {
                const serversSection = document.getElementById('servers');
                if (serversSection) {
                  serversSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium text-lg transition flex items-center justify-center"
            >
              <Gamepad2Icon className="mr-2 h-5 w-5" />
              Explore Servers
            </button>
            <a
              href="https://discord.gg/BV6hQ9AY"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent hover:bg-gray-800 text-blue-400 border border-blue-400 px-8 py-3 rounded-md font-medium text-lg transition inline-block text-center"
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  );
};