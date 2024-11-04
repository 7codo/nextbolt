"use client";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "next-auth/react";

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    setAuthError("");
    try {
      await signIn("mailgun", {
        email: values.email,
      });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted:", values);
      // Handle successful authentication here
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      setAuthError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async () => {
    await signIn("google");
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Login or create an account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleOAuth}
            >
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      defaultChecked
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none ml-px">
                    <FormLabel>
                      I accept the{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        terms and conditions
                      </a>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Sign In with Email
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
