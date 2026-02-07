import {z} from "zod";

export const signupSchema = z.object({
    name : z.string().nonempty("Name is required").min(3,{message:"Name must be atleast 3 characters long"}).max(20,{message:"Name must not exceed 20 characters."}),
    email : z.string().nonempty("Email is required").email("Invalid email address"),
    password : z.string().nonempty("Password is required").min(8,{message:"Passwords must contain atleast 8 characters."}).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:"Passwords do not match"})
});

export type signupFormType = z.infer<typeof signupSchema>;