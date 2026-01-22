import React from 'react';
import { Cpu, Shield, HeartPulse, Zap, BarChart3, Users } from 'lucide-react';
export const Features = () => {
  return <section id="features" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose MindBreakers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We provide more than just game servers. Join a community of gamers
            with custom configurations and exceptional support.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Cpu className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">High Performance</h3>
            <p className="text-gray-400">
              Our servers are powered by top-tier hardware to ensure smooth
              gameplay with minimal lag and downtime.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Anti-Cheat Protection</h3>
            <p className="text-gray-400">
              Advanced anti-cheat systems to keep gameplay fair and enjoyable
              for everyone in the community.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <HeartPulse className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Active Support</h3>
            <p className="text-gray-400">
              Our dedicated team is available to help with any issues and ensure
              your gaming experience is seamless.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Custom Configurations</h3>
            <p className="text-gray-400">
              Enhance your gameplay with our carefully crafted game settings and
              custom features.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Stats Dashboard</h3>
            <p className="text-gray-400">
              Access detailed statistics about your gameplay, server
              performance, and community engagement.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition duration-300">
            <div className="bg-blue-500/20 p-3 rounded-full w-fit mb-4">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Events</h3>
            <p className="text-gray-400">
              Participate in regular community events, competitions, and special
              gameplay scenarios.
            </p>
          </div>
        </div>
      </div>
    </section>;
};