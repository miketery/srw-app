import { createContext, useContext, useState } from 'react'


const SessionContext = createContext({
    vault: null,
    setVault: () => {},
    manager: null,
    setManager: () => {},
})

export const useSessionContext = () => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useSessionContext must be used within a SessionContextProvider')
    }
    return context
}

export const SessionContextProvider = ({ children }) => {
    const [vault, setVault] = useState(null)
    const [manager, setManager] = useState(null)

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