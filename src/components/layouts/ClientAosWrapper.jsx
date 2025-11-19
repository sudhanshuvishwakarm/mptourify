"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ClientAosWrapper({ children }) {
  useEffect(() => {
    AOS.init({
      offset: 130,
      duration: 1000,
    });
  }, []);

  return children;
}
