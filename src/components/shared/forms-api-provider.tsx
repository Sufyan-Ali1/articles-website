"use client";
import { createContext, useContext, type ReactNode } from "react";

const FormsApiContext = createContext("");

// The server supplies only a same-origin form path, never backend credentials.
export function FormsApiProvider({
  apiUrl,
  children,
}: {
  apiUrl: string;
  children: ReactNode;
}) {
  return (
    <FormsApiContext.Provider value={apiUrl}>
      {children}
    </FormsApiContext.Provider>
  );
}
export function useFormsApiUrl() {
  return useContext(FormsApiContext);
}
