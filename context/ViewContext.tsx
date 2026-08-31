'use client';

import React, { createContext, useContext, useState } from 'react';

type ActiveView = 'portal' | 'dashboard';

interface ViewContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  toggleView: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveView>('portal');
  const toggleView = () => setActiveView((prev) => (prev === 'portal' ? 'dashboard' : 'portal'));

  return (
    <ViewContext.Provider value={{ activeView, setActiveView, toggleView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}
