'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BrokersPage() {

  const brokers = [
    {
      id: 'axiom',
      name: 'Axiom',
      description: 'Professional trading platform for trading meme coins and advanced tools with competitive fees',
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
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-800/20',
      borderColor: 'border-blue-200 dark:border-blue-700'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            Trading Platforms
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Trading
            <span className="text-blue-600 dark:text-blue-400"> Platforms</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Explore cryptocurrency trading platforms with various features and services. 
            Each platform offers different tools and fee structures to suit different trading needs.
          </p>
        </div>

        {/* Brokers Grid */}
        <div className="flex justify-center mb-16">
          <div className="max-w-md w-full">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="relative group transition-all duration-200"
            >
              {/* Card */}
              <div className={`relative overflow-hidden rounded-2xl border ${broker.borderColor} ${broker.bgColor} p-8 h-full shadow-sm hover:shadow-md transition-shadow duration-200`}>

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
                    className="group/btn relative inline-flex items-center justify-center w-full px-6 py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <span className="relative z-10">Visit Platform</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>

              </div>
            </div>
          ))}
          </div>
        </div>


        {/* Legal Disclaimer */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
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
