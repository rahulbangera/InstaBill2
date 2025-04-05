import { array, object, string } from "zod";

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(32, "Password must be less than 32 characters"),
});

export const shopSchema = object({
  name: string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(32, "Name must be less than 32 characters"),
  itemCodeFormat: string({
    required_error: "Item code format is required",
  }).min(1, "Item code format is required"),
  address: string({ required_error: "Address is required" })
    .min(1, "Address is required")
    .max(32, "Address must be less than 32 characters"),
  phone: string({ required_error: "Phone is required" }).min(
    1,
    "Phone is required",
  ),
  image: string().url().optional(),
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  employees: array(
    object({
      name: string({ required_error: "Name is required" })
        .min(1, "Name is required")
        .max(32, "Name must be less than 32 characters"),
      email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
      phone: string({ required_error: "Phone is required" }).min(
        1,
        "Phone is required",
      ),
    }),
  ),
});
