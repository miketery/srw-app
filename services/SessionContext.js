import { createContext, useContext, useState } from 'react'


const SessionContext = createContext({
    vault: null,
    setVault: () => {},
    manager: null,
    setManager: () => {},
})



export const useSession = () => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider')
    }
    return context
}

export const SessionProvider = ({ children }) => {
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