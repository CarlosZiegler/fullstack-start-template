import FormFieldInfo from "@/components/form-field-info";
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
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import * as z from "zod";

import { Loader2, X } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

const FormSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(5, "Password must be at least 5 characters"),
    passwordConfirmation: z.string(),
    image: z.instanceof(File).optional(),
  })
  .refine((data: any) => data.password === data.passwordConfirmation, {
    message: "The two passwords do not match.",
    path: ["passwordConfirmation"],
  });

export function SignUpForm() {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      image: undefined as File | undefined,
    },
    validators: {
      onChange: FormSchema,
    },
    onSubmit: async ({ value }: any) => {
      await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: `${value.firstName} ${value.lastName}`,
        image: value.image ? await convertImageToBase64(value.image) : "",
        callbackURL: "/dashboard",
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            navigate({ to: "/dashboard" });
          },
        },
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="z-50 rounded-2xl max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{t("SIGN_UP")}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("SIGN_UP_DESC")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <form.Field
                name="firstName"
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>{t("FIRST_NAME")}</Label>
                    <Input
                      id={field.name}
                      placeholder="Max"
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
            <div className="grid gap-2">
              <form.Field
                name="lastName"
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>{t("LAST_NAME")}</Label>
                    <Input
                      id={field.name}
                      placeholder="Robinson"
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
          <div className="grid gap-2">
            <form.Field
              name="email"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>{t("EMAIL")}</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="m@example.com"
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
          <div className="grid gap-2">
            <form.Field
              name="password"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>{t("PASSWORD")}</Label>
                  <Input
                    id={field.name}
                    type="password"
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
          <div className="grid gap-2">
            <form.Field
              name="passwordConfirmation"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>{t("CONFIRM_PASSWORD")}</Label>
                  <Input
                    id={field.name}
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="new-password"
                    placeholder={t("CONFIRM_PASSWORD")}
                  />
                  <FormFieldInfo field={field} />
                </>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">{t("PROFILE_IMAGE")}</Label>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      form.setFieldValue("image", undefined);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit} className="w-full">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  t("CREATE_ACCOUNT")
                )}
              </Button>
            )}
          />
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            {t("SECURED_BY")}{" "}
            <span className="text-orange-400">better-auth.</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
