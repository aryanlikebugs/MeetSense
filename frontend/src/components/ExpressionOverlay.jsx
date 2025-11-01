import { motion, AnimatePresence } from 'framer-motion';
import { EXPRESSIONS } from '../utils/constants';

const ExpressionOverlay = ({ expression }) => {
  const expressionData = EXPRESSIONS.find(
    (e) => e.label.toLowerCase() === expression.type.toLowerCase()
  );

  if (!expressionData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="absolute top-2 right-2 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2"
        style={{ backgroundColor: `${expressionData.color}20` }}
      >
        <span className="text-xl">{expressionData.emoji}</span>
        <span
          className="text-sm font-medium"
          style={{ color: expressionData.color }}
        >
          {expressionData.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpressionOverlay;
