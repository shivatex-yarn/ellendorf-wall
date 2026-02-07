"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "../layout/authcontent.jsx";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

export default function Auth() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "", submit: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();
  const { login } = useAuth();

  const quotes = [
    "Transform your space, transform your life.",
    "Style your space, shape your mood.",
    "Every wall tells a story; make yours unforgettable.",
    "Patterns that inspire, designs that captivate.",
    "Elevate your walls, elevate your world.",
    "Where creativity meets craftsmanship.",
    "Unleash the potential of your walls.",
    "From ordinary to extraordinary, one wall at a time.",
    "Your walls, your style, your story.",
    "Design your walls, design your life.",
    "Let your walls reflect your personality.",
    "Crafting spaces that inspire and delight.",
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: "", submit: "" }));
  };

  const validateLogin = () => {
    const errors = {};
    if (!loginData.email) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(loginData.email)) errors.email = "Invalid email format";
    if (!loginData.password) errors.password = "Password is required";
    return errors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLogin();
    if (Object.keys(errors).length > 0) {
      setLoginErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE}/api/users/login`;

      const res = await axios.post(apiUrl, loginData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { user, token } = res.data;

      if (!["user", "admin", "superadmin"].includes(user.role)) {
        toast.error(`Unauthorized role: ${user.role}`, { position: "top-center" });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("branchId", user.branchId);
      sessionStorage.setItem("userRole", user.role);
      sessionStorage.setItem("token", token);

      login({ ...user, token });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Welcome to Ellendorf</span>
          <span className="text-sm opacity-90">Powered by Reimagine Wall </span>
        </div>,
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "linear-gradient(to right, #1e40af, #3b82f6)",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px 24px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            minWidth: "320px",
          },
        }
      );

      // Small delay to show the success message before redirecting
      setTimeout(() => {
        router.push("/wallcoveringcollections");
      }, 1500);

    } catch (error) {
      setIsLoading(false); // Stop loading on error
      const errorMessage = error?.response?.data?.error || "Login failed. Please try again.";
      setLoginErrors((prev) => ({ ...prev, submit: errorMessage }));
      toast.error(errorMessage, { duration: 3000, position: "top-center" });
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex w-1/2 items-center justify-center p-12"
        >
          <div className="text-center max-w-lg">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <Image
                src="/assets/brand.png"
                alt="Brand Logo"
                width={320}
                height={100}
                className="object-contain mx-auto mb-4"
                priority
              />
            </motion.div>
            
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-6">
                Reimagine Textile Wall Coverings
              </h1>
              {/* <p className="text-2xl font-light text-gray-700 mb-8">Textile Wall Coverings</p> */}
            </motion.div>

            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-slate-200"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl text-gray-800 font-medium italic leading-relaxed"
                >
                  {quotes[currentQuoteIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="text-sm text-gray-500 mt-6">
              One step solution for your dream space
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8"
        >
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200">
            <CardHeader className="text-center space-y-2">
              <motion.div initial={{ scale: 0.8, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome to Ellendorf</h2>
              <p className="text-gray-500 text-sm">Sign in to your account</p>
            </CardHeader>

            <CardContent className="p-6">
              <form className="space-y-5" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      disabled={isLoading} // Disable input during loading
                      className={`w-full pl-10 pr-4 py-4 text-lg border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 ${
                        loginErrors.email ? "border-red-500" : "border-gray-200"
                      } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                  </div>
                  {loginErrors.email && <p className="text-red-500 text-sm pl-1">{loginErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      disabled={isLoading} // Disable input during loading
                      className={`w-full pl-10 pr-12 py-4 text-lg border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 ${
                        loginErrors.password ? "border-red-500" : "border-gray-200"
                      } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading} // Disable button during loading
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-red-500 text-sm pl-1">{loginErrors.password}</p>}
                </div>

                {loginErrors.submit && (
                  <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">{loginErrors.submit}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading} // Disable button during loading
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-xl text-lg shadow-md transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing In, Please Wait...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In Securely
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">© 2026 Reimagine Textile Wall Coverings. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}