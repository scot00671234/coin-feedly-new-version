import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Legal Disclaimer | Coin Feedly',
  description: 'Legal disclaimer and terms of use for Coin Feedly. Important information about financial responsibility and data accuracy.',
  robots: 'index, follow'
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Legal Disclaimer
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Important information about your use of Coin Feedly
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              {/* Warning Notice */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                      Important Legal Notice
                    </h2>
                    <p className="text-red-800 dark:text-red-200">
                      Please read this disclaimer carefully before using Coin Feedly. By using our service, you acknowledge that you have read, understood, and agree to be bound by these terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Responsibility */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Financial Responsibility & Disclaimer
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                      No Financial Advice
                    </h3>
                    <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                      <strong>Coin Feedly does not provide financial advice.</strong> All information, data, analysis, and content provided on our platform is for informational and educational purposes only. Nothing on our website should be construed as financial, investment, trading, or any other form of advice.
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      You are solely responsible for your financial decisions and any consequences that may result from them.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      User Responsibility
                    </h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>You are responsible for conducting your own research and due diligence before making any financial decisions</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>You must verify all information independently and not rely solely on data provided by Coin Feedly</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>You acknowledge that all trading, investment, and financial activities carry inherent risks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>You understand that past performance does not guarantee future results</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Accuracy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Data Accuracy & Information
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      No Warranty on Accuracy
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 mb-4">
                      <strong>Coin Feedly takes no responsibility for the accuracy, completeness, or timeliness of any information provided on our platform.</strong> While we strive to provide accurate and up-to-date information, we make no warranties or representations regarding the accuracy of any data, news, analysis, or other content.
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      We continuously work to improve our data quality and accuracy, but we cannot guarantee that all information is error-free or current.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Third-Party Content
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Our platform aggregates content from various sources including news websites, APIs, and other third-party providers. We do not control or verify the accuracy of this third-party content and disclaim any responsibility for its accuracy or reliability.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Users should independently verify any information before making decisions based on it.
                    </p>
                  </div>
                </div>
              </section>

              {/* Broker & Platform Links */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  External Links & Brokers
                </h2>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                    No Endorsement of Brokers or Platforms
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 mb-4">
                    <strong>Coin Feedly does not endorse, recommend, or take responsibility for any brokers, exchanges, trading platforms, or financial services providers that may be linked to or mentioned on our platform.</strong>
                  </p>
                  <ul className="space-y-2 text-orange-800 dark:text-orange-200">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>You are solely responsible for researching and evaluating any brokers or platforms before using their services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>We are not liable for any losses, damages, or issues arising from your use of external platforms or services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>You should verify the legitimacy, security, and regulatory compliance of any platform before depositing funds or trading</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Limitation of Liability
                </h2>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
                    No Liability for Financial Losses
                  </h3>
                  <p className="text-red-800 dark:text-red-200 mb-4">
                    <strong>Coin Feedly shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from:</strong>
                  </p>
                  <ul className="space-y-2 text-red-800 dark:text-red-200">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Your use of or reliance on any information provided on our platform</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Any financial decisions you make based on our content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Inaccuracies, errors, or omissions in our data or content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Your use of any external platforms or services linked from our site</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Any interruption or cessation of our services</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* General Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  General Terms
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Service Availability
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Coin Feedly reserves the right to modify, suspend, or discontinue any part of our service at any time without notice. We do not guarantee uninterrupted access to our platform.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Changes to Terms
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      We may update this legal disclaimer at any time. Continued use of our service after changes constitutes acceptance of the new terms.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      If you have any questions about this legal disclaimer, please contact us through our website or support channels.
                    </p>
                  </div>
                </div>
              </section>

              {/* Final Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Final Notice
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>By using Coin Feedly, you acknowledge that you have read, understood, and agree to be bound by this legal disclaimer.</strong> If you do not agree with any part of these terms, please do not use our service.
                </p>
                <p className="text-blue-800 dark:text-blue-200 mt-3">
                  Remember: Always do your own research and consult with qualified financial professionals before making any investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


