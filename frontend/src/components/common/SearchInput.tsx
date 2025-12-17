import { TextField } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import type { TextFieldProps } from "@mui/material";
interface SearchInputProps extends Omit<TextFieldProps, "type"> {
  label?: string;
}

export const SearchInput = ({ label, ...props }: SearchInputProps) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      type="search"
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
      }}
      {...props}
    />
  );
};
