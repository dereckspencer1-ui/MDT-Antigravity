import * as React from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({});

export function Select({ value, onValueChange, children }) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }) {
  const { value, onValueChange } = React.useContext(SelectContext);
  // Just use a native select covering the trigger for simplicity
  return (
    <div className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm", className)}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder = "Seleccionar..." }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>
}

export function SelectContent({ children }) {
  const { value, onValueChange } = React.useContext(SelectContext);
  return (
    <select 
      className="absolute inset-0 opacity-0 cursor-pointer w-full"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  )
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>
}
