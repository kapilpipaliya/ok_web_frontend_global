'use client'

import { createContext, createSignal, splitProps, useContext } from 'solid-js'

type TabViewContextType = {
    activeTab?: string
    setActiveTab: (tab: string) => void
};

export const TabViewContext = createContext<TabViewContextType | undefined>(undefined)

export const useTabView = () => {
    const context = useContext(TabViewContext)
    if (context === undefined) {
        throw new Error('useTabView must be used within a TabView')
    }
    return context
}

type TabViewProps = {
    activeTab?: string
    children: any
}

const TabView = (props: TabViewProps) => {
    const [local, others] = splitProps(props, ['activeTab', 'children']);
    const [activeTab, setActiveTab] = createSignal<string | undefined>(local.activeTab)
    return (
        <TabViewContext.Provider value={{ activeTab, setActiveTab }}>
            {others.children}
        </TabViewContext.Provider>
    )
}

export default TabView