'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Shield, TrendingUp, Users, ArrowRight } from 'lucide-react'

export default function BrokersPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const brokers = [
    {
      id: 'axiom',
      name: 'Axiom',
      description: 'Professional trading platform offering advanced tools and competitive fees',
      logo: 'A',
      features: [
        'Advanced Trading Tools',
        'Competitive Trading Fees',
        'Professional Support',
        'Secure Platform',
        'Real-time Data',
        'Mobile Trading'
      ],
      referralLink: 'https://axiom.trade/@ekvidity',
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
            Trading Platforms
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Trading
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Platforms</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Explore cryptocurrency trading platforms with various features and services. 
            Each platform offers different tools and fee structures to suit different trading needs.
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
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {broker.description}
                  </p>


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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Security Features</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Trading platforms typically implement various security measures to protect user accounts and funds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Fee Structures</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Different platforms offer various fee structures and pricing models for trading activities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Support Services</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Trading platforms may offer customer support services to assist with platform-related inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">Important Legal Notice</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
              <p>
                <strong>User Responsibility:</strong> It is your sole responsibility to research and evaluate any trading platform 
                before making any financial decisions. Coin Feedly does not provide financial advice, recommendations, or endorsements 
                of any trading platforms or services.
              </p>
              <p>
                <strong>No Liability:</strong> Coin Feedly cannot be held legally responsible for any financial losses, risks, 
                trading decisions, or outcomes resulting from your use of any trading platform. All trading activities carry inherent 
                risks, and you should only trade with funds you can afford to lose.
              </p>
              <p>
                <strong>Independent Research:</strong> Always conduct your own due diligence, read platform terms of service, 
                understand fee structures, and consider your risk tolerance before engaging with any trading platform. 
                Past performance does not guarantee future results.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 pt-2">
                By using this page, you acknowledge and agree to these terms and understand that all trading decisions are your own responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
