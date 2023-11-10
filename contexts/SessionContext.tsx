import React, { ReactNode, createContext, useContext, useState } from 'react'

import Vault from '../models/Vault'
import VaultManager from '../managers/VaultManager'

type SessionContextType = {
    vault: Vault | null
    setVault: (vault: Vault) => void
    manager: VaultManager | null
    setManager: (manager: VaultManager) => void
}


const SessionContext = createContext<SessionContextType|undefined>(undefined)

export const useSessionContext = (): SessionContextType => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useSessionContext must be used within a SessionContextProvider')
    }
    return context
}

type SessionContextProviderProps = {
    children: ReactNode
}
export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
    const [vault, setVault] = useState<Vault | null>(null)
    const [manager, setManager] = useState<VaultManager | null>(null)

    const value = {
        vault,
        setVault,
        manager,
        setManager,
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
  }