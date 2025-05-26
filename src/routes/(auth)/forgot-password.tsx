import { useTranslation } from "@/lib/intl/react";
import { Link } from "@tanstack/react-router";
import ForgotPasswordForm from "./-components/forgot-password";

export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <div className="p-2 md:p-6 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <ForgotPasswordForm />

      <div className="mt-4 text-center">
        {t("DONT_HAVE_ACCOUNT")}{" "}
        <Link to="/login" className="underline">
          {t("LOGIN")}
        </Link>
        !
      </div>
    </div>
  );
}
