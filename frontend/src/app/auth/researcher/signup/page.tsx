"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/authContext";
import { useRouter } from "next/navigation";
import { researcherSchema } from "@/schemas/researcherSchema";
import { motion, AnimatePresence } from "framer-motion";
import { TailSpin } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResearcherSignup() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const router = useRouter();
  const [nameError, setNameError] = useState<boolean | string>("");
  const [nameErr, setNameErr] = useState<string>("");
  const [emailError, setEmailError] = useState<string | boolean>("");
  const [emailErr, setEmailErr] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | boolean>("");
  const [passwordErr, setPasswordErr] = useState<string>("");
  const [institutionError, setInstitutionError] = useState<string | boolean>("");
  const [institutionErr, setInstitutionErr] = useState<string>("");
  const [specializationErr, setSpecializationErr] = useState<string>("");
  const [specializationError, setSpecializationError] = useState<
    string | boolean
  >("");
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const role = "researcher";

  function nameValidation() {
    const res = researcherSchema.shape.name.safeParse(name);
    if (!res.success) {
      setNameError(true);
      setNameErr(res.error.issues[0].message);
    } else {
      setNameError(false);
    }
  }

  function emailValidation() {
    const res = researcherSchema.shape.email.safeParse(email);
    if (!res.success) {
      setEmailError(true);
      setEmailErr(res.error.issues[0].message);
    } else {
      setEmailError(false);
    }
  }

  function passwordValidation() {
    const res = researcherSchema.shape.password.safeParse(password);
    if (!res.success) {
      setPasswordError(true);
      setPasswordErr(res.error.issues[0].message);
    } else {
      setPasswordError(false);
    }
  }

  function instituteValidation() {
    const res = researcherSchema.shape.institution.safeParse(institution);
    if (!res.success) {
      setInstitutionError(true);
      setInstitutionErr(res.error.issues[0].message);
    } else {
      setInstitutionError(false);
    }
  }

  function specializationValidation() {
    const res = researcherSchema.shape.specialization.safeParse(specialization);
    if (!res.success) {
      setSpecializationError(true);
      setSpecializationErr(res.error.issues[0].message);
    } else {
      setSpecializationError(false);
    }
  }

  async function signUpHandler() {
    const res = researcherSchema.safeParse({
      name,
      email,
      password,
      institution,
      specialization,
    });
    if (!res.success) {
      const nameInvalid = res.error.issues.find(
        (issue) => issue.path[0] == "name",
      );
      const emailInvalid = res.error.issues.find(
        (issue) => issue.path[0] == "email",
      );
      const passwordInvalid = res.error.issues.find(
        (issue) => issue.path[0] == "password",
      );
      const institutionInvalid = res.error.issues.find(
        (issue) => issue.path[0] == "institution",
      );
      const specializationInvalid = res.error.issues.find(
        (issue) => issue.path[0] == "specialization",
      );
      if (nameInvalid) {
        setNameError(true);
        setNameErr(nameInvalid.message);
      }
      if (emailInvalid) {
        setEmailError(true);
        setEmailErr(emailInvalid.message);
      }
      if (passwordInvalid) {
        setPasswordError(true);
        setPasswordErr(passwordInvalid.message);
      }
      if (institutionInvalid) {
        setInstitutionError(true);
        setInstitutionErr(institutionInvalid.message);
      }
      if (specializationInvalid) {
        setSpecializationError(true);
        setSpecializationErr(specializationInvalid.message);
      }
      return;
    } else {
      setNameError(false);
      setEmailError(false);
      setPasswordError(false);
      setInstitutionError(false);
      setSpecializationError(false);
    }
    setLoading(true);
    try {
      const response = await register({
        name,
        email,
        password,
        role,
        institution,
        specialization,
      });
      setLoading(false);
      if (response?.success) {
        toast.success(response.success, {
          autoClose: 1600,
          onClose: () => router.push("/profile"),
        });
        return;
      }
      if (response?.message) {
        toast.error(response.message);
        return;
      }
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      toast.error("Server side error occurred.");
    } catch (err: any) {
      setLoading(false);
      toast.error("Server side error occurred.");
    }
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="min-h-screen min-w-screen flex justify-center items-center">
        <fieldset className="relative md:p-[60px] max-md:p-[20px] md:pb-12 max-md:pb-10 md:pt-[1px] max-md:pt-[5px] md:mt-3 border-2 border-gray-500 rounded-xl flex flex-col">
          <legend className="text-center">
            <div className="w-fit h-fit bg-clip-text bg-linear-to-br from-blue-200 via-blue-400 to-blue-300">
              <p className="text-[60px] max-md:text-[40px] font-bold text-transparent cursor-default">
                SIGNUP
              </p>
            </div>
          </legend>
          <p className="text-center text-[35px] max-md:text-[26px] font-extrabold cursor-default text-black">
            CREATE ACCOUNT
          </p>
          <p className="mt-[2px] text-center text-[18px] max-md:text-[12px] max-md:font-semibold text-black font-medium cursor-default">
            Register and experience best features
          </p>
          <div className="mt-2 max-md:mt-3">
            <label
              htmlFor="name"
              className="text-md text-white font-medium max-md:text-sm max-md:font-medium"
            >
              Name:
            </label>
            <br />
            <input
              id="name"
              className={`mt-2 px-5 py-[10px] max-md:py-[8px] max-md:px-3 w-[500px] max-md:w-[295px] border rounded-lg bg-black placeholder:font-serif font-serif ${nameError === true ? "border-red-600" : nameError === false ? "border-green-500" : "border-gray-400"}`}
              placeholder="Name*"
              onBlur={nameValidation}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AnimatePresence>
              {nameError && nameErr && (
                <motion.p
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-red-700 font-serif mt-2"
                >
                  {nameErr}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 max-md:mt-2.5">
            <label
              htmlFor="email"
              className="text-md font-medium max-md:text-sm max-md:font-medium"
            >
              Email:
            </label>
            <br />
            <input
              id="email"
              type="email"
              className={`mt-2 px-5 py-[10px] max-md:py-[8px] max-md:px-3 w-[500px] max-md:w-[295px] border ${
                emailError === true
                  ? "border-red-600"
                  : emailError === false
                    ? "border-green-500"
                    : "border-gray-400"
              } focus:border-white rounded-lg bg-black placeholder:font-serif font-serif`}
              placeholder="Email*"
              onBlur={emailValidation}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AnimatePresence>
              {emailError && emailErr && (
                <motion.p
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-red-700 font-serif mt-2"
                >
                  {emailErr}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 max-md:mt-2.5">
            <label
              htmlFor="password"
              className="text-md font-medium max-md:text-sm max-md:font-medium"
            >
              Password:
            </label>
            <br />
            <div className="relative w-fit h-fit">
              <input
                id="password"
                type="password"
                className={`mt-2 px-5 py-[10px] max-md:py-[8px] max-md:px-3 w-[500px] max-md:w-[295px] border ${
                  passwordError === true
                    ? "border-red-600"
                    : passwordError === false
                      ? "border-green-500"
                      : "border-gray-400"
                } rounded-lg bg-black placeholder:font-serif font-serif`}
                placeholder="Password*"
                onBlur={passwordValidation}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AnimatePresence>
                {passwordError && passwordErr && (
                  <motion.p
                    initial={{ y: -15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    className="text-red-700 font-serif mt-2"
                  >
                    {passwordErr}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-3 max-md:mt-2.5">
            <label
              htmlFor="email"
              className="text-md font-medium max-md:text-sm max-md:font-medium"
            >
              Institution:
            </label>
            <br />
            <input
              id="institution"
              type="text"
              className={`mt-2 px-5 py-[10px] max-md:py-[8px] max-md:px-3 w-[500px] max-md:w-[295px] border ${
                institutionError === true
                  ? "border-red-600"
                  : institutionError === false
                    ? "border-green-500"
                    : "border-gray-400"
              } focus:border-white rounded-lg bg-black placeholder:font-serif font-serif`}
              placeholder="Institution*"
              onBlur={instituteValidation}
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
            <AnimatePresence>
              {institutionError && institutionErr && (
                <motion.p
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-red-700 font-serif mt-2"
                >
                  {institutionErr}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 max-md:mt-2.5">
            <label
              htmlFor="email"
              className="text-md font-medium max-md:text-sm max-md:font-medium"
            >
              Specialization :
            </label>
            <br />
            <input
              id="specialization"
              type="text"
              className={`mt-2 px-5 py-[10px] max-md:py-[8px] max-md:px-3 w-[500px] max-md:w-[295px] border ${
                specializationError === true
                  ? "border-red-600"
                  : specializationError === false
                    ? "border-green-500"
                    : "border-gray-400"
              } focus:border-white rounded-lg bg-black placeholder:font-serif font-serif`}
              placeholder="Specialization*"
              onBlur={specializationValidation}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
            <AnimatePresence>
              {specializationError && specializationErr && (
                <motion.p
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-red-700 font-serif mt-2"
                >
                  {specializationErr}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="w-full h-fit flex justify-center md:mt-6 max-md:mt-8">
            <button
              disabled={loading}
              className="cursor-pointer relative w-[100%] max-md:w-[100%] py-[14px] px-25 max-md:px-14 max-md:py-[9px] font-bold max-md:font-semibold text-lg rounded-xl bg-blue-600 focus:bg-blue-500 hover:bg-blue-500 outline-offset-2 outline-1 max-md:outline-2 outline-gray-100 text-black disabled:cursor-not-allowed disabled:opacity-70"
              onMouseDown={signUpHandler}
            >
              {loading ? (
                <div className="absolute inset-0 bg-transparent flex justify-center items-center">
                  <TailSpin height={25} width={25} strokeWidth={6} color="#ffffff" />
                </div>
              ) : (
                "Signup"
              )}
            </button>
          </div>
        </fieldset>
      </div>
    </>
  );
}
