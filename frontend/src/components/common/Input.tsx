import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
interface InputProps extends Omit<TextFieldProps, "error"> {
  error?: string;
}

export const Input = ({ error, helperText, ...props }: InputProps) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      error={!!error}
      helperText={error || helperText}
      {...props}
    />
  );
};
