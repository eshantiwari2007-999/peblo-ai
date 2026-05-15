"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setApiError(result.message || "Registration failed");
      } else {
        // Redirect to login after successful registration
        router.push("/login?registered=true");
      }
    } catch {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto space-y-8"
    >
      <div className="w-full">
        <div className="text-left mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start organizing your intelligence today
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
                {apiError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
