"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { redirect, useRouter } from "next/navigation";
import { Router } from "lucide-react";
import { useState } from "react";
import NotificationSnackBar from "@/components/ui/NotificationSnackBar";
import { useDispatch } from "react-redux";
import { responseModal } from "@/lib/redux/slices/snackbarSlice";
import { setSession } from "@/utils/bearerAxios";

const formSchema = z.object({
  // username: z.string().min(6, "Username must be at least 6 characters."),
  // username: z.string().regex(/^[^!@#$%^&*()+\s/]{}+$/, "Username cannot contain spaces or specific symbols like !@#$%^&*()/]{}+\s."),
  username: z
    .string()
    .regex(
      /^[a-z]+$/,
      "Username cannot contain spaces or specific symbols like numbers, spaces or special characters."
    ),
  password: z.string().min(6, "Password must be at least 6 characters."),
  rememberMe: z.boolean().optional(),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const { data } = await response.json();

      setSession(data.Token);
      // setUser(auth);
      if (!response.ok) {
        if (data.Status === "Error") {
          dispatch(
            responseModal({
              message: data.Status,
              variant: "warning",
              display: true,
            })
          );
          return;
        }

        dispatch(
          responseModal({
            message: data.Status || "Incorrect credentials",
            variant: "error",
            display: true,
          })
        );
        return;
      }

      if (data.Status === "Info") {
        dispatch(
          responseModal({
            message: data.Status,
            variant: "info",
            display: true,
          })
        );
      } else {
        dispatch(
          responseModal({
            message: "Login successful!",
            variant: "success",
            display: true,
          })
        );
      }

      setTimeout(() => {
        router.replace("/dashboard");
        dispatch(responseModal({ display: false }));
      }, 3000);
    } catch (error) {
      console.error("Error during login:", error);
      dispatch(
        responseModal({
          message: "An unexpected error occurred.",
          variant: "error",
          display: true,
        })
      );
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <NotificationSnackBar />
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription className="text-xl text-black dark:text-white">
            Enter your Credential VPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div
              className="
       text-center mb-4 rounded-lg border p-3 text-sm shadow-sm
      border-red-500 
      bg-red-100 text-red-700
      dark:bg-red-900/30 dark:text-red-300
    "
            >
              <p className="font-medium">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username </FormLabel>
                        <FormControl>
                          <Input placeholder="admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <a
                            href="#"
                            className="text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center justify-center gap-2 [&_input[type='checkbox']]:hidden">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked === true);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal m-0!">
                            Remember me
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </div>
                {/* <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div> */}
              </div>
            </form>
          </Form>

          {/* <Button onClick={() => logout()} className="w-full">
            Logout
          </Button> */}
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
}
