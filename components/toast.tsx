"use client";
import { createContext, useContext, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
const Ctx = createContext<{ toast: (message:string,type?:Toast["type"])=>void }>({ toast:()=>{} });
export function ToastProvider({children}:{children:React.ReactNode}) {
  const [items,setItems]=useState<Toast[]>([]);
  const toast=(message:string,type:Toast["type"]="info")=>{ const id=Date.now(); setItems(x=>[...x,{id,message,type}]); setTimeout(()=>setItems(x=>x.filter(t=>t.id!==id)),3200); };
  return <Ctx.Provider value={{toast}}>{children}<div className="toast toast-top toast-end z-50">{items.map(t=><div key={t.id} className={`alert ${t.type==='success'?'alert-success':t.type==='error'?'alert-error':'alert-info'}`}>{t.message}</div>)}</div></Ctx.Provider>;
}
export const useToast=()=>useContext(Ctx);
