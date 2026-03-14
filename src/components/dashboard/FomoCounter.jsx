import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

export default function FomoCounter() {
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60) // 12 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-strong rounded-2xl p-4 flex items-center justify-between border-accent/30"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center glow-green">
          <Zap className="text-accent w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Halving Relativo</h4>
          <p className="text-xs text-muted-foreground">Próximo ajuste de dificultad en la fábrica</p>
        </div>
      </div>
      
      <div className="flex gap-2 text-2xl font-black font-mono text-accent text-glow">
        <AnimatePresence mode="popLayout">
          <motion.div key={hours} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-background/50 px-3 py-1 rounded-lg border border-accent/20">
            {hours.toString().padStart(2, '0')}
          </motion.div>
          <span className="py-1">:</span>
          <motion.div key={minutes} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-background/50 px-3 py-1 rounded-lg border border-accent/20">
            {minutes.toString().padStart(2, '0')}
          </motion.div>
          <span className="py-1">:</span>
          <motion.div key={seconds} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-background/50 px-3 py-1 rounded-lg border border-accent/20 text-white">
            {seconds.toString().padStart(2, '0')}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
