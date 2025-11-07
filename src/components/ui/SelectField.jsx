'use client'
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

export default function SelectField({
    name,
    label,
    value,
    onChange,
    options = [],
    error,
    helperText,
    fullWidth = true,
    size = 'medium',
    disabled = false,
    placeholder,
    ...props
}) {
    const displayValue = value === '' || value === undefined || value === null ? '' : value;

    return (
        <FormControl 
            fullWidth={fullWidth} 
            error={!!error} 
            size={size} 
            disabled={disabled}
            variant="outlined"
            sx={{
                minWidth: '120px',
                ...props.sx
            }}
            {...props}
        >
            <InputLabel
                sx={{
                    color: 'rgb(75 85 99)',
                    '&.Mui-focused': {
                        color: 'rgb(59 130 246)',
                    },
                    '&.Mui-error': {
                        color: 'rgb(239 68 68)',
                    },
                    // Tailwind-like classes for positioning
                    position: 'absolute',
                    top: '-8px',
                    left: '14px',
                    backgroundColor: 'white',
                    padding: '0 8px',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                    transform: 'none',
                    '&.MuiInputLabel-shrink': {
                        transform: 'none',
                    }
                }}
            >
                {label}
            </InputLabel>
            <Select
            name={name}
                value={displayValue}
                label={label}
                onChange={onChange}
                displayEmpty
                renderValue={(selected) => {
                    if (selected === '') {
                        return (
                            <span style={{ color: 'rgb(107 114 128)' }}>
                                {placeholder || `Select ${label}`}
                            </span>
                        );
                    }
                    const selectedOption = options.find(option => option.value === selected);
                    return selectedOption?.label || selected;
                }}
                sx={{
                    // Tailwind-like border radius
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    
                    // Border styles
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(209 213 219)',
                        borderWidth: '1px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(59 130 246)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(59 130 246)',
                        borderWidth: '2px',
                    },
                    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(239 68 68)',
                    },
                    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgb(229 231 235)',
                        backgroundColor: 'rgb(249 250 251)',
                    },
                    
                    // Input text styles
                    '& .MuiSelect-select': {
                        color: 'rgb(17 24 39)',
                        display: 'flex',
                        alignItems: 'center',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        paddingLeft: '14px',
                        paddingRight: '14px',
                    },
                    
                    // Remove the notch to prevent overlap
                    '& .MuiOutlinedInput-notchedOutline legend': {
                        display: 'none',
                    }
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            // Tailwind-like shadow
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            borderRadius: '8px',
                            marginTop: '4px',
                            '& .MuiMenuItem-root': {
                                padding: '8px 16px',
                                '&:hover': {
                                    backgroundColor: 'rgb(219 234 254)',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: 'rgb(59 130 246)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgb(37 99 235)',
                                    },
                                },
                            },
                        },
                    },
                }}
            >
                {(placeholder || !options.some(opt => opt.value === '')) && (
                    <MenuItem value="" disabled>
                        <span style={{ color: 'rgb(107 114 128)', fontStyle: 'italic' }}>
                            {placeholder || `Select ${label}`}
                        </span>
                    </MenuItem>
                )}
                
                {options.map((option) => (
                    <MenuItem 
                        key={option.value} 
                        value={option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            
            {(error || helperText) && (
                <FormHelperText
                    sx={{
                        marginLeft: '0',
                        color: error ? 'rgb(239 68 68)' : 'rgb(107 114 128)',
                        fontSize: '0.75rem',
                        lineHeight: '1rem',
                        marginTop: '4px',
                    }}
                >
                    {error || helperText}
                </FormHelperText>
            )}
        </FormControl>
    );
}
