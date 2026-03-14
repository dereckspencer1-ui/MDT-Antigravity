import React from "react"
import { motion } from "framer-motion"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function BurnGauge({ size = "small", detail, detailLabel, label, value }) {
  const isLarge = size === "large"
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden ${
        isLarge ? "h-64" : "h-40"
      }`}
    >
      {/* Neon glow effect */}
      <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full ${isLarge ? 'w-40 h-20' : 'w-20 h-10'} bg-primary blur-3xl opacity-20`} />

      <div className={`relative ${isLarge ? 'w-32 h-32' : 'w-20 h-20'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 100 }]}
              cx="50%" cy="50%"
              innerRadius={isLarge ? "75%" : "70%"}
              outerRadius={isLarge ? "90%" : "85%"}
              stroke="none"
              fill="rgba(0, 255, 136, 0.1)"
            />
            <Pie
              data={[{ value: 30 }, { value: 70 }]}
              cx="50%" cy="50%"
              innerRadius={isLarge ? "75%" : "70%"}
              outerRadius={isLarge ? "95%" : "90%"}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              cornerRadius={40}
            >
              <Cell fill="var(--primary)" />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-white text-glow font-mono leading-none`}>
            {detail}
          </span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{detailLabel}</span>
        </div>
      </div>

      <div className="text-center mt-3 z-10 w-full px-2">
        <h3 className={`font-semibold text-white ${isLarge ? 'text-sm' : 'text-xs truncate'}`}>
          {label}
        </h3>
        {value !== undefined && (
          <p className="text-primary font-mono text-xs mt-1 font-bold">{value.toLocaleString()}</p>
        )}
      </div>
    </motion.div>
  )
}
