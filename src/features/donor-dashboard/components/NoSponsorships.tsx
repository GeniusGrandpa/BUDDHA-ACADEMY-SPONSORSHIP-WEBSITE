import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function NoSponsorships() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="bordered" className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sponsored Children Yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Start sponsoring a child today. Your monthly contribution provides education, meals, and a brighter future.
        </p>
        <Link to="/students">
          <Button size="lg">Browse Students</Button>
        </Link>
      </Card>
    </motion.div>
  )
}
