"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogInIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { signInUser, signUpUser } from "@/lib/local-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AuthMode = "signin" | "signup"

export function AuthPageClient() {
  const router = useRouter()
  const [mode, setMode] = React.useState<AuthMode>("signin")

  function handleEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")

    try {
      if (mode === "signup") {
        signUpUser({
          name: String(formData.get("name") || "").trim(),
          email,
          password,
          phone: String(formData.get("phone") || "").trim(),
          address: String(formData.get("address") || "").trim(),
          city: String(formData.get("city") || "").trim(),
          state: String(formData.get("state") || "").trim(),
          pincode: String(formData.get("pincode") || "").trim(),
        })
        toast.success("Account created")
      } else {
        signInUser(email, password)
        toast.success("Signed in")
      }

      router.push("/account")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in")
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 md:py-24">
      <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <h1 className="font-serif text-3xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your profile details so checkout fills automatically next time.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleEmailAuth}>
          {mode === "signup" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required autoComplete="tel" />
              </div>
            </>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "signup" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="address">Shipping address</Label>
                <Textarea id="address" name="address" required autoComplete="street-address" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required autoComplete="address-level2" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required autoComplete="address-level1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">PIN code</Label>
                  <Input id="pincode" name="pincode" required autoComplete="postal-code" />
                </div>
              </div>
            </>
          ) : null}

          <Button className="w-full" type="submit">
            {mode === "signin" ? <LogInIcon /> : <UserPlusIcon />}
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <Button
          className="mt-4 w-full"
          variant="ghost"
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "New customer? Create an account"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </section>
  )
}
