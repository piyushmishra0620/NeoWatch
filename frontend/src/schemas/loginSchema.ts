import {z} from "zod";

export const loginSchema = z.object({
    email : z.string().nonempty("Email is required").email("Invalid Email address"),
    password: z.string().nonempty("Password is required").min(8,{message:"Password must be a minimum of 8 characters long"}).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."})
});

export type loginFormType = z.infer<typeof loginSchema>;
