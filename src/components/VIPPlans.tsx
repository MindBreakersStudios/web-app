import React from 'react';
import { Crown, Shield, Star, Trophy, CheckCircle, Users, Clock, Gamepad2, Award } from 'lucide-react';

export const VIPPlans = () => {
  const plans = [
    {
      id: 'bronze',
      name: 'VIP BRONZE',
      subtitle: 'Priority Access',
      price: 5,
      icon: <Trophy className="h-12 w-12 text-amber-600" />,
      color: 'amber',
      popular: false,
      features: [
        'Priority Whitelist - Guaranteed server access',
        'VIP Bronze Role in Discord',
        'Priority Support Tickets',
        'Special Events Participation', 
        '2 Simultaneous Pawn Shop Posts',
        'Web Access: Personal Leaderboard'
      ]
    },
    {
      id: 'silver',
      name: 'VIP SILVER',
      subtitle: 'Advanced Survivor',
      price: 15,
      icon: <Crown className="h-12 w-12 text-gray-400" />,
      color: 'gray',
      popular: true,
      features: [
        'All Bronze Benefits +',
        'Clan Name Reservation',
        '4 Simultaneous Pawn Shop Posts',
        'Direct Contact with VIP Staff',
        'Early Drop Notifications (2 min)',
        'Web: Unlocked Achievements + Advanced Stats',
        'Monthly Kit: Basic Materials'
      ]
    },
    {
      id: 'gold',
      name: 'VIP GOLD',
      subtitle: 'Server Elite',
      price: 20,
      icon: <Star className="h-12 w-12 text-yellow-500" />,
      color: 'yellow',
      popular: false,
      features: [
        'All Silver Benefits +',
        'Territory Reservation (designated area)',
        '6 Simultaneous Pawn Shop Posts',
        'Streamer Role Available',
        'Early Drop Notifications (5 min)',
        'Early Access to New Features',
        'Monthly Premium Kit: Advanced Materials',
        'Web: Personal Admin Panel'
      ]
    }
  ];

  const specialPacks = [
    {
      id: 'materials',
      name: 'Materials Pack',
      price: 10,
      icon: <Shield className="h-8 w-8" />,
      color: 'blue',
      description: 'Complete construction kit with premium materials to quickly build your base.',
      items: [
        'Processed Wood x500',
        'Carved Stone x300',
        'Refined Metal x100',
        'Advanced Tools'
      ]
    },
    {
      id: 'food',
      name: 'Top Tier Foods',
      price: 6,
      icon: <Award className="h-8 w-8" />,
      color: 'red',
      description: 'Premium food that provides the best nutritional benefits and temporary buffs.',
      items: [
        'Premium Meats x20',
        'Energy Drinks x10',
        'Supplements x5',
        '3-Day Buffs'
      ]
    },
    {
      id: 'gold',
      name: '10 Gold In-Game',
      price: 3,
      icon: <Gamepad2 className="h-8 w-8" />,
      color: 'yellow',
      description: 'Premium server currency for special purchases at traders and internal market.',
      items: [
        '10 Instant Gold',
        'Valid at all traders',
        'Automatic delivery',
        'Unlimited stacking'
      ]
    }
  ];

  const getColorClasses = (color: string, variant: 'border' | 'bg' | 'text' | 'button') => {
    const colors = {
      amber: {
        border: 'border-amber-500',
        bg: 'bg-amber-500',
        text: 'text-amber-500',
        button: 'bg-amber-600 hover:bg-amber-700'
      },
      gray: {
        border: 'border-gray-400',
        bg: 'bg-gray-400',
        text: 'text-gray-400',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      yellow: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500',
        text: 'text-yellow-500',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-500',
        text: 'text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      red: {
        border: 'border-red-500',
        bg: 'bg-red-500',
        text: 'text-red-500',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colors[color as keyof typeof colors]?.[variant] || '';
  };

  return (
    <section id="vip-plans" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
              🎮 VIP SYSTEM
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Monthly subscriptions and special packs designed to enhance your survival experience
          </p>
        </div>

        {/* VIP Subscription Plans */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-yellow-400">
            💎 Monthly VIP Subscriptions
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 
                  border transition-all duration-300 hover:transform hover:-translate-y-2
                  ${plan.popular ? 'border-yellow-500 scale-105 shadow-lg shadow-yellow-500/20' : `${getColorClasses(plan.color, 'border')}`}
                  hover:shadow-2xl
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <h4 className={`text-2xl font-bold mb-2 ${getColorClasses(plan.color, 'text')}`}>
                    {plan.name}
                  </h4>
                  <p className="text-gray-400 text-lg italic mb-4">"{plan.subtitle}"</p>
                  <div className={`text-4xl font-bold ${getColorClasses(plan.color, 'text')}`}>
                    ${plan.price}<span className="text-lg text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`
                  w-full py-4 px-6 rounded-lg font-bold text-white text-lg
                  transition-all duration-300 transform hover:-translate-y-1
                  ${getColorClasses(plan.color, 'button')}
                `}>
                  Get {plan.name.split(' ')[1]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Special Packs */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-yellow-400">
            🎁 Special Packs (One-time Purchase)
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {specialPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:transform hover:-translate-y-1 hover:border-gray-500"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(pack.color, 'bg')} mr-4`}>
                    {React.cloneElement(pack.icon, { className: 'h-8 w-8 text-white' })}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{pack.name}</h4>
                    <div className={`text-2xl font-bold ${getColorClasses(pack.color, 'text')}`}>
                      ${pack.price}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 text-sm">
                  {pack.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {pack.items.map((item, index) => (
                    <li key={index} className="text-gray-400 text-sm flex items-center">
                      <span className="text-green-400 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className={`
                  w-full py-3 px-4 rounded-lg font-bold text-white
                  transition-all duration-300 transform hover:-translate-y-1
                  ${getColorClasses(pack.color, 'button')}
                `}>
                  Buy Pack
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-center text-yellow-400">
              Feature Comparison
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left p-4 font-semibold text-gray-300">Feature</th>
                  <th className="text-center p-4 font-semibold text-amber-500">Bronze</th>
                  <th className="text-center p-4 font-semibold text-gray-400">Silver</th>
                  <th className="text-center p-4 font-semibold text-yellow-500">Gold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Priority Whitelist', bronze: true, silver: true, gold: true },
                  { name: 'Discord VIP Role', bronze: true, silver: true, gold: true },
                  { name: 'Pawn Shop Posts', bronze: '2', silver: '4', gold: '6' },
                  { name: 'Clan Name Reservation', bronze: false, silver: true, gold: true },
                  { name: 'Territory Reservation', bronze: false, silver: false, gold: true },
                  { name: 'Early Drop Notifications', bronze: false, silver: '2 min', gold: '5 min' },
                  { name: 'Monthly Kit', bronze: false, silver: 'Basic', gold: 'Premium' },
                  { name: 'Staff Contact', bronze: 'Ticket', silver: 'Direct', gold: 'Direct' }
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-4 font-medium text-gray-300">{feature.name}</td>
                    <td className="p-4 text-center">
                      {typeof feature.bronze === 'boolean' ? (
                        feature.bronze ? (
                          <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-300">{feature.bronze}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof feature.silver === 'boolean' ? (
                        feature.silver ? (
                          <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-300">{feature.silver}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof feature.gold === 'boolean' ? (
                        feature.gold ? (
                          <CheckCircle className="h-5 w-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-red-400 text-xl">✗</span>
                        )
                      ) : (
                        <span className="text-gray-300">{feature.gold}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Enhance Your Experience?</h3>
            <p className="text-xl text-gray-200 mb-6">
              Join our VIP community and unlock exclusive benefits, priority access, and premium features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                <Users className="inline-block mr-2 h-5 w-5" />
                Join Discord
              </button>
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
                <Clock className="inline-block mr-2 h-5 w-5" />
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
