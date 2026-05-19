import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Auth() {
  const signIn = useForm({ email: "", password: "" });

  return (
    <>
      <Head title="Sign in" />
      <div className="min-h-screen grid lg:grid-cols-2 bg-background">
        <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url(/images/skf.png)" }}></div>

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md panel p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to continue, or create a new account.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn.post("/auth/login");
              }}
              className="space-y-3 mt-4"
            >
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  required
                  value={signIn.data.email}
                  onChange={(e) => signIn.setData("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="si-pwd">Password</Label>
                <Input
                  id="si-pwd"
                  type="password"
                  required
                  value={signIn.data.password}
                  onChange={(e) => signIn.setData("password", e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={signIn.processing}
                className="w-full"
              >
                {signIn.processing ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
