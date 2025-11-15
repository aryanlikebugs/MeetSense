const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 ${Icon ? 'pl-12' : ''} border-2 rounded-xl transition-all focus:outline-none ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
              : 'border-white/10 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/30'
          } ${
            disabled
              ? 'bg-slate-800/50 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900/60 text-white placeholder-slate-500'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InputField;
