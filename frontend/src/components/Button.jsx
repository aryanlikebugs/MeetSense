import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'btn-gradient shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50 disabled:opacity-50',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 disabled:opacity-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
