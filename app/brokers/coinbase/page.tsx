'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function CoinbasePage() {
  const broker = {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Leading cryptocurrency exchange with institutional-grade security and user-friendly interface',
    logo: 'C',
    features: [
      'Institutional Security',
      'User-Friendly Interface',
      'Wide Asset Selection',
      'Regulatory Compliance',
      'Advanced Trading',
      'Mobile App'
    ],
    referralLink: 'https://coinbase.com',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/brokers" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trading Platforms
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8 shadow-lg">
            Professional Trading Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
            {broker.name}
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {broker.description}
          </p>
        </div>

        {/* Main Card */}
        <div className="relative group transition-all duration-300 hover:scale-[1.02]">
          <div className={`relative overflow-hidden rounded-3xl border-2 ${broker.borderColor} ${broker.bgColor} p-12 shadow-2xl backdrop-blur-sm`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full transform scale-150 -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${broker.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Logo and Name */}
              <div className="flex items-center mb-12">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${broker.color} flex items-center justify-center text-white text-5xl font-black shadow-2xl mr-8 group-hover:scale-110 transition-transform duration-300`}>
                  {broker.logo}
                </div>
                <div>
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">{broker.name}</h2>
                  <div className="w-16 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 mb-12 leading-relaxed text-xl">
                {broker.description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {broker.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-lg text-slate-600 dark:text-slate-400">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href={broker.referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative inline-flex items-center justify-center w-full px-12 py-6 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 text-2xl">Visit Coinbase Platform</span>
                <ArrowRight className="w-6 h-6 ml-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Important Legal Notice</h3>
            <div className="text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">User Responsibility:</strong> It is your sole responsibility to research and evaluate any trading platform 
                before making any financial decisions. Coin Feedly does not provide financial advice, recommendations, or endorsements 
                of any trading platforms or services.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">No Liability:</strong> Coin Feedly cannot be held legally responsible for any financial losses, risks, 
                trading decisions, or outcomes resulting from your use of any trading platform. All trading activities carry inherent 
                risks, and you should only trade with funds you can afford to lose.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Independent Research:</strong> Always conduct your own due diligence, read platform terms of service, 
                understand fee structures, and consider your risk tolerance before engaging with any trading platform. 
                Past performance does not guarantee future results.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-700">
                By using this page, you acknowledge and agree to these terms and understand that all trading decisions are your own responsibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
