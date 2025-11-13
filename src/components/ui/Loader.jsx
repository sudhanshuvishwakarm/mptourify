"use client";
import React from "react";
import { Box, Typography } from '@mui/material';

const Loader = ({ message }) => {
  const spokes = Array.from({ length: 24 });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999
      }}
    >
      {/* Chakra */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 112,
          height: 112,
          animation: 'spin 6s linear infinite',
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' }
          }
        }}
      >
        {/* Outer ring */}
        <Box
          sx={{
            position: 'absolute',
            width: 80,
            height: 80,
            border: '2px solid #000080',
            borderRadius: '50%'
          }}
        />

        {/* 24 Spokes */}
        {spokes.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: 80,
              backgroundColor: '#000080',
              transform: `rotate(${i * 15}deg)`
            }}
          />
        ))}
      </Box>

      {/* Message */}
      <Typography
        variant="h6"
        sx={{
          color: '#000080',
          fontWeight: 'bold',
          mt: 2
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;// "use client";
// import React from "react";

// const Loader = ({message}) => {
//   // 24 Ashoka Chakra spokes (15° apart)
//   const spokes = Array.from({ length: 24 });

//   return (
//     <div className="fixed inset-0 flex flex-col justify-center items-center bg-transparent backdrop-blur-md z-50">
//       {/* Chakra */}
//       <div className="relative flex items-center justify-center w-28 h-28 animate-[spin_6s_linear_infinite]">
//         {/* Outer ring */}
//         <div className="absolute w-20 h-20 border-2 border-[#000080] rounded-full"></div>

//         {/* 24 Spokes */}
//         {spokes.map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-[2px] h-20 bg-[#000080]"
//             style={{ transform: `rotate(${i * 15}deg)` }}
//           />
//         ))}
//       </div>
//       <span className="text-[#000080] text-xl font-bold">{message}</span>
//     </div>
//   );
// };

// export default Loader;

// "use client";
// import React from "react";

// const Loader = () => {
//   // 24 Ashoka Chakra spokes (15° apart)
//   const spokes = Array.from({ length: 24 });

//   return (
//     <div className="flex flex-col justify-center items-center h-screen  backdrop-blur-md">
//       {/* Chakra */}
//       <div className="relative flex items-center justify-center w-28 h-28 animate-[spin_6s_linear_infinite]">
//         {/* Outer ring */}
//         <div className="absolute w-20 h-20 border-2 border-[#000080] rounded-full"></div>

//         {/* 24 Spokes */}
//         {spokes.map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-[2px] h-20 bg-[#000080]"
//             style={{ transform: `rotate(${i * 15}deg)` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Loader;

