"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, TrendingUp } from "lucide-react";
import ClientSidebar from "../components/ClientSidebar";

export default function ClientPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/client-portal");
  }, [router]);

  return null;
}
