import React from "react"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: 'Ene', price: 1.00, vol: 0.90, avg: 0.80 },
  { name: 'Feb', price: 1.02, vol: 0.95, avg: 0.95 },
  { name: 'Mar', price: 1.01, vol: 1.10, avg: 1.02 },
  { name: 'Abr', price: 1.05, vol: 0.90, avg: 1.00 },
  { name: 'May', price: 1.08, vol: 1.20, avg: 1.08 },
  { name: 'Jun', price: 1.04, vol: 0.93, avg: 1.06 },
  { name: 'Jul', price: 1.12, vol: 1.30, avg: 1.15 },
  { name: 'Ago', price: 1.08, vol: 1.00, avg: 1.10 },
  { name: 'Sep', price: 1.18, vol: 1.40, avg: 1.25 },
  { name: 'Oct', price: 1.15, vol: 1.10, avg: 1.20 },
  { name: 'Nov', price: 1.22, vol: 1.60, avg: 1.30 },
]

export default function PriceChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Background Hero */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" 
        style={{ backgroundImage: 'url("/src/assets/hero.png")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/60 to-background/40 z-0" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white text-glow">MDT / USDT</h2>
          <div className="flex gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary glow-green" /> Precio
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" /> Volumen
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Promedio
            </div>
          </div>
        </div>

        <div className="h-64 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.05)" vertical={true} />
              <XAxis dataKey="name" stroke="none" fill="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tick={{fill: 'rgba(255,255,255,0.4)'}} dy={10} />
              <YAxis stroke="none" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toFixed(2)}`} tick={{fill: 'rgba(255,255,255,0.4)'}} dx={-10} domain={['dataMin - 0.1', 'dataMax + 0.1']}/>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              
              <Area type="monotone" dataKey="vol" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorVol)" strokeWidth={2} />
              <Area type="monotone" dataKey="avg" stroke="#3b82f6" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
