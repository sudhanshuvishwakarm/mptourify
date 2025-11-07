'use client'
import { TextField as MuiTextField, InputAdornment, FormHelperText } from '@mui/material';

export default function TextField({ 
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  startIcon,
  endIcon,
  size = 'medium',
  ...props 
}) {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      error={!!error}
      helperText={error || helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      variant="outlined"
      size={size}
      InputProps={{
        startAdornment: startIcon && (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ),
        endAdornment: endIcon && (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: 'background.paper',
          '& fieldset': {
            borderColor: '#144ae920', // Blue border with 20% opacity
            borderWidth: 1,
          },
          '&:hover fieldset': {
            borderColor: '#144ae9', // Solid blue on hover
            borderWidth: 1,
          },
          '&.Mui-focused fieldset': {
            borderColor: '#144ae9', // Solid blue when focused
            borderWidth: 1,
          },
          '&.Mui-disabled fieldset': {
            borderColor: '#144ae910', // Very light blue for disabled
            backgroundColor: '#144ae905',
          },
          '&.Mui-error fieldset': {
            borderColor: '#d32f2f', // Keep error color red
          },
        },
        '& .MuiOutlinedInput-input': {
          color: 'text.primary',
          '&::placeholder': {
            color: '#6b7280', // Gray placeholder
            opacity: 1,
          },
        },
        '& .MuiInputLabel-root': {
          color: '#6b7280', // Gray label
          '&.Mui-focused': {
            color: '#144ae9', // Blue when focused
          },
          '&.Mui-error': {
            color: '#d32f2f', // Keep error color red
          },
        },
        '& .MuiFormHelperText-root': {
          '&.Mui-error': {
            color: '#d32f2f', // Keep error color red
          },
        },
        ...props.sx
      }}
      {...props}
    />
  );
}
// 'use client'
// import { TextField as MuiTextField, InputAdornment, FormHelperText } from '@mui/material';

// export default function TextField({ 
//   label,
//   value,
//   onChange,
//   type = 'text',
//   placeholder,
//   error,
//   helperText,
//   required = false,
//   disabled = false,
//   fullWidth = true,
//   startIcon,
//   endIcon,
//   size = 'medium',
//   ...props 
// }) {
//   return (
//     <MuiTextField
//       label={label}
//       value={value}
//       onChange={onChange}
//       type={type}
//       placeholder={placeholder}
//       error={!!error}
//       helperText={error || helperText}
//       required={required}
//       disabled={disabled}
//       fullWidth={fullWidth}
//       variant="outlined"
//       size={size}
//       InputProps={{
//         startAdornment: startIcon && (
//           <InputAdornment position="start">{startIcon}</InputAdornment>
//         ),
//         endAdornment: endIcon && (
//           <InputAdornment position="end">{endIcon}</InputAdornment>
//         ),
//       }}
//       sx={{
//         '& .MuiOutlinedInput-root': {
//           borderRadius: 2,
//           '&:hover fieldset': {
//             borderColor: 'primary.main',
//           },
//           '&.Mui-focused fieldset': {
//             borderColor: 'primary.main',
//           },
//         },
//         '& .MuiInputLabel-root.Mui-focused': {
//           color: 'primary.main',
//         },
//         ...props.sx
//       }}
//       {...props}
//     />
//   );
// }