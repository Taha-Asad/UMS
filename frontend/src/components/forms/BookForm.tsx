import { useForm } from "react-hook-form";
import { Box, TextField, Grid } from "@mui/material";
import type { Book } from "../../api/library.api";
import { Button } from "../common";

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: Omit<Book, "book_id" | "available_copies">) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const BookForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: BookFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Book, "book_id" | "available_copies">>({
    defaultValues: initialData || {
      total_copies: 1,
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="ISBN" fullWidth {...register("isbn")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Title"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Author"
            fullWidth
            error={!!errors.author}
            helperText={errors.author?.message}
            {...register("author", { required: "Author is required" })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Publisher" fullWidth {...register("publisher")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Category" fullWidth {...register("category")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Total Copies"
            type="number"
            fullWidth
            inputProps={{ min: 1 }}
            error={!!errors.total_copies}
            helperText={errors.total_copies?.message}
            {...register("total_copies", {
              required: "Total copies is required",
              valueAsNumber: true,
              min: { value: 1, message: "Minimum 1 copy" },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField 
            label="Shelf Location" 
            fullWidth 
            {...register("location")}
            helperText="Physical location of the book in the library"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Book" : "Add Book"}
        </Button>
      </Box>
    </Box>
  );
};
