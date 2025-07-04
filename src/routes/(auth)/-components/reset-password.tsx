import FormFieldInfo from "@/components/form-field-info";
import { PasswordInput } from "@/components/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

const FormSchema = z
  .object({
    password: z.string().min(5, "Password must be at least 5 characters"),
    confirmPassword: z.string(),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: FormSchema,
    },
    onSubmit: async ({ value }: any) => {
      setError("");
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setError("Invalid reset token");
        return;
      }
      const res = await authClient.resetPassword({
        newPassword: value.password,
        token,
      });
      if (res.error) {
        toast.error(res.error.message);
      } else {
        router.navigate({ to: "/login" });
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("RESET_PASSWORD")}</CardTitle>
          <CardDescription>{t("RESET_PASSWORD_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid w-full items-center gap-2">
              <div className="flex flex-col space-y-1.5">
                <form.Field
                  name="password"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>{t("NEW_PASSWORD")}</Label>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        placeholder={t("PASSWORD")}
                      />
                      <FormFieldInfo field={field} />
                    </>
                  )}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>
                        {t("CONFIRM_NEW_PASSWORD")}
                      </Label>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="new-password"
                        placeholder={t("PASSWORD")}
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
                  disabled={!canSubmit}
                >
                  {isSubmitting ? t("RESETTING") : t("RESET_PASSWORD_BUTTON")}
                </Button>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
