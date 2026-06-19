import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How is my donation used?',
    answer:
      'Every donation is allocated directly to student support programs. Our finance team tracks every rupee, and monthly transparency reports detail exactly how funds are distributed across meals, educational materials, tuition support, and operational costs.',
  },
  {
    question: 'Can I choose which student to sponsor?',
    answer:
      'Yes. You can select a specific student from our available students list. You will receive regular updates about their progress, achievements, and educational journey. Alternatively, you can make a general donation that supports students with the greatest need.',
  },
  {
    question: 'How do I receive my donation receipt?',
    answer:
      'After your donation is verified, an official receipt is generated automatically. You can download it from your donor dashboard at any time. Receipts include the transaction details, amount, date, and are suitable for tax purposes.',
  },
  {
    question: 'Is my donation tax-deductible?',
    answer:
      'Buddha Academy is a registered nonprofit organization. Donations are eligible for tax benefits as per applicable laws in Nepal and international regulations. Official receipts are provided for every contribution to support your tax filing.',
  },
  {
    question: 'How does the payment verification work?',
    answer:
      'After you complete your payment through Khalti, eSewa, or mobile banking, our finance team manually verifies the transaction. Once confirmed, your donation status is updated, and you receive a confirmation with your receipt.',
  },
  {
    question: 'Can I change or cancel my monthly sponsorship?',
    answer:
      'Yes, you can modify or cancel your recurring sponsorship at any time through your donor dashboard. We aim to make the process as flexible as possible while ensuring consistent support for our students.',
  },
  {
    question: 'How will I stay updated on my impact?',
    answer:
      'Donors receive monthly impact reports, student progress updates, and community news. You can also access your personalized donor dashboard to track your contributions, view certificates, and see the direct impact of your support.',
  },
]

export function DonationFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 sm:py-20 bg-[#fffaf5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-light text-[#0f172a] mb-4">
            Frequently Asked{' '}
            <span className="font-medium text-amber-600">Questions</span>
          </h2>
          <p className="text-gray-600 font-light max-w-xl mx-auto">
            Everything you need to know about donating and sponsoring students at Buddha Academy.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-amber-200 bg-warm-50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-[#0f172a] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
