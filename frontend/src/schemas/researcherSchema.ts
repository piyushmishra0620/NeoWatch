import {z} from "zod";

export const researcherSchema = z.object({
    name : z.string().nonempty("Name is required").min(3,{message:"Name must be atleast 3 characters long"}).max(20,{message:"Name must not exceed 20 characters."}),
    email : z.string().nonempty("Email is required").email("Invalid email address"),
    password : z.string().nonempty("Password is required").min(8,{message:"Passwords must contain atleast 8 characters."}).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:"Passwords do not match"}),
    institution: z.string().nonempty("Institution field is required!"),
    specialization:z.string().nonempty("Specialization field is required!")
});

export type signupFormType = z.infer<typeof researcherSchema>;