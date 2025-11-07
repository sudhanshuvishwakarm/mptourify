"use client";
import React from "react";

const Loader = () => {
  // 24 Ashoka Chakra spokes (15° apart)
  const spokes = Array.from({ length: 24 });

  return (
    <div className="flex flex-col justify-center items-center h-screen  backdrop-blur-md">
      {/* Chakra */}
      <div className="relative flex items-center justify-center w-28 h-28 animate-[spin_6s_linear_infinite]">
        {/* Outer ring */}
        <div className="absolute w-20 h-20 border-2 border-[#000080] rounded-full"></div>

        {/* 24 Spokes */}
        {spokes.map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-20 bg-[#000080]"
            style={{ transform: `rotate(${i * 15}deg)` }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;

