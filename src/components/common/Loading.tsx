import { cn } from '@/utils/utils'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  className?: string
  message?: string
  fullScreen?: boolean
}

export function LoadingComponents({
  className,
  message = 'Vui lòng chờ hệ thống phản hồi',
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-10 p-6',
        fullScreen ? 'min-h-screen' : 'min-h-100',
        className,
      )}
    >
      {/* Logo with animation */}
      <div className="relative flex h-25.5 w-24 items-center justify-center">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 0, 360],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.5, 1],
          }}
        >
          <Loader2 className="text-primary h-full w-full" />
        </motion.div>
      </div>

      <p className="text-center text-lg leading-7 font-medium text-gray-900 dark:text-gray-100">
        {message}
      </p>
    </div>
  )
}
