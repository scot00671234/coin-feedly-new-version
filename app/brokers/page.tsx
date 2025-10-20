'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Shield, TrendingUp, Users, Star, CheckCircle, ArrowRight } from 'lucide-react'

export default function BrokersPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const brokers = [
    {
      id: 'axiom',
      name: 'Axiom',
      description: 'Professional trading platform with advanced tools and low fees',
      logo: 'A',
      rating: 4.8,
      features: [
        'Advanced Trading Tools',
        'Low Trading Fees',
        'Professional Support',
        'Secure Platform',
        'Real-time Data',
        'Mobile Trading'
      ],
      referralLink: 'https://axiom.trade/@ekvidity',
      isRecommended: true,
      color: 'from-blue-600 to-purple-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Trusted Crypto Brokers
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Broker</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Discover the best cryptocurrency trading platforms with competitive fees, 
            advanced tools, and professional support to enhance your trading experience.
          </p>
        </div>

        {/* Brokers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2`}
              onMouseEnter={() => setHoveredCard(broker.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card */}
              <div className={`relative overflow-hidden rounded-3xl border-2 ${broker.borderColor} ${broker.bgColor} p-8 h-full`}>
                {/* Recommended Badge */}
                {broker.isRecommended && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Recommended
                    </div>
                  </div>
                )}

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full transform scale-150 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Logo and Name */}
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${broker.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg mr-4`}>
                      {broker.logo}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{broker.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(broker.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                          {broker.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {broker.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {broker.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={broker.referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group/btn relative inline-flex items-center justify-center w-full px-6 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${broker.color} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                  >
                    <span className="relative z-10">Start Trading</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    
                    {/* Button Background Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${broker.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secure Trading</h3>
              <p className="text-slate-600 dark:text-slate-400">
                All recommended brokers use industry-standard security measures to protect your funds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Low Fees</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Competitive trading fees and transparent pricing to maximize your trading profits.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expert Support</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Professional customer support available 24/7 to help with your trading needs.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-4xl mx-auto">
            <strong>Disclaimer:</strong> Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. 
            The high degree of leverage can work against you as well as for you. Before deciding to trade cryptocurrencies, 
            you should carefully consider your investment objectives, level of experience, and risk appetite. 
            Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </div>
  )
}
