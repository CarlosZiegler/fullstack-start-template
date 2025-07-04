import FormFieldInfo from "@/components/form-field-info";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import { useAuthHelpers } from "@/hooks/auth-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuthHelpers();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: FormSchema,
    },
    onSubmit: async ({ value }: any) => {
      setError("");
      try {
        await forgotPassword.mutateAsync({ email: value.email });
        setIsSubmitted(true);
      } catch (err) {
        setError("An error occurred. Please try again.");
      }
    },
  });

  if (isSubmitted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>{t("CHECK_EMAIL")}</CardTitle>
            <CardDescription>{t("PASSWORD_RESET_LINK_SENT")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{t("CHECK_SPAM")}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("BACK_TO_RESET")}
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("FORGOT_PASSWORD")}</CardTitle>
          <CardDescription>{t("FORGOT_PASSWORD_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <form.Field
                  name="email"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>{t("EMAIL")}</Label>
                      <Input
                        id={field.name}
                        type="email"
                        placeholder={t("ENTER_EMAIL")}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FormFieldInfo field={field} />
                    </>
                  )}
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full mt-4"
                  type="submit"
                  disabled={!canSubmit || forgotPassword.isPending}
                >
                  {isSubmitting || forgotPassword.isPending
                    ? t("SENDING")
                    : t("SEND_RESET_LINK")}
                </Button>
              )}
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button variant="link" className="px-0">
              {t("BACK_TO_SIGN_IN")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
