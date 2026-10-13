'use client'
import { createContext, useContext } from 'react'
import type { DataProvider } from './types'
import { mockProvider } from './mock-provider'
import { chainProvider } from './chain-provider'

const source = process.env.NEXT_PUBLIC_DATA_SOURCE === 'chain' ? 'chain' : 'mock'
const DataContext = createContext<DataProvider>(source === 'chain' ? chainProvider : mockProvider)

export function DataProviderRoot({ children }: { children: React.ReactNode }) {
  return <DataContext.Provider value={source === 'chain' ? chainProvider : mockProvider}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
