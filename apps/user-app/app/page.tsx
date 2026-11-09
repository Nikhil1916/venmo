
"use client"
import { Button } from "@repo/ui/button";
import { setBalance, useAppDispatch, useAppSelector } from "@repo/store/useBalance";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state: any) => state.balance.balance);
  console.log(balance);
  useEffect(()=>{
    dispatch(setBalance(100));
  }, [])
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <h1 className="text-3xl font-bold text-red-500">
        Tailwind Working
      </h1>
      <Button className="bg-green-500 text-white" appName="User App">
        Hello
      </Button>
    </div>
  );
}
