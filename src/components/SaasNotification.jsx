import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function SaasNotification({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success' } = toast;

  const typeConfig = {
    success: {
      bgColor: 'bg-white/95 dark:bg-emerald-950/95',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-950 dark:text-emerald-100',
      accentBar: 'bg-emerald-500',
      Icon: CheckCircle2,
      label: 'Success'
    },
    error: {
      bgColor: 'bg-white/95 dark:bg-rose-950/95',
      borderColor: 'border-rose-500/30',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-950 dark:text-rose-100',
      accentBar: 'bg-rose-500',
      Icon: AlertCircle,
      label: 'Error'
    },
    warning: {
      bgColor: 'bg-white/95 dark:bg-amber-950/95',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-950 dark:text-amber-100',
      accentBar: 'bg-amber-500',
      Icon: AlertTriangle,
      label: 'Warning'
    },
    info: {
      bgColor: 'bg-white/95 dark:bg-blue-950/95',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-950 dark:text-blue-100',
      accentBar: 'bg-blue-500',
      Icon: Info,
      label: 'Notice'
    }
  };

  const config = typeConfig[type] || typeConfig.success;
  const { Icon } = config;

  return (
    <>
      {/* Backdrop blur overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[9998] bg-black/25 backdrop-blur-sm pointer-events-auto"
      />

      {/* Centered notification dialog modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 380 }}
          className={`pointer-events-auto max-w-sm sm:max-w-md w-full ${config.bgColor} border ${config.borderColor} rounded-2xl shadow-2xl backdrop-blur-xl p-5 relative overflow-hidden flex items-start space-x-3.5`}
        >
          {/* Left vertical accent indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accentBar}`} />

          {/* Animated Icon badge */}
          <div className={`p-2.5 rounded-xl border border-current/10 ${config.iconBg} shrink-0 mt-0.5`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>

          {/* Text Message */}
          <div className="flex-1 min-w-0 pr-6 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-70 mb-0.5">
              {config.label}
            </span>
            <p className={`text-xs font-semibold leading-relaxed ${config.textColor}`}>
              {message}
            </p>
          </div>

          {/* Manual close X button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </>
  );
}
