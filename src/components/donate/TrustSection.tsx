import { motion } from 'framer-motion'

const trustItems = [
  {
    title: 'Donation Verification Process',
    description:
      'Every donation undergoes a thorough verification by our finance team. You receive a unique transaction ID and official receipt for your records.',
  },
  {
    title: 'Complete Transparency',
    description:
      'Monthly financial reports detail exactly how every rupee is allocated. We publish impact metrics showing the direct results of your contributions.',
  },
  {
    title: 'Finance Team Review',
    description:
      'Our dedicated finance team manually reviews and reconciles all donations, ensuring accuracy and accountability at every step.',
  },
  {
    title: 'Secure Transaction Handling',
    description:
      'All payment data is encrypted and processed through verified channels. Your financial information is never shared with third parties.',
  },
  {
    title: 'Monthly Accountability Reports',
    description:
      'Subscribe to receive detailed monthly reports showing student progress, fund allocation, and community impact metrics.',
  },
  {
    title: 'Data & Privacy Protection',
    description:
      'Your personal information is protected under strict privacy policies. We never share donor data without explicit consent.',
  },
]

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-light text-[#0f172a] mb-4">
            Transparency You{' '}
            <span className="font-medium text-amber-600">Can Trust</span>
          </h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            We believe complete transparency is the foundation of meaningful giving.
            Here is how we ensure every contribution is handled with integrity.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="rounded-xl border border-amber-200 bg-warm-50 px-6 py-6 hover:border-amber-300 transition-colors"
            >
              <h3 className="text-sm font-medium text-[#0f172a] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 p-6 rounded-xl bg-gray-50 border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#0f172a]">Tax & Financial Compliance</p>
                <p className="text-xs text-gray-600 mt-1">
                  Buddha Academy is a registered nonprofit organization. All donations are eligible for tax benefits
                  under applicable laws. Official receipts are provided for every contribution.
                </p>
              </div>
              <div className="flex-shrink-0 px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-600">
                Registered NGO
              </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
