import { motion } from 'framer-motion';

export default function TabSwitcher({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1 glass rounded-2xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors duration-300 ${
            activeTab === tab.id ? 'text-black' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 gradient-primary rounded-xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
