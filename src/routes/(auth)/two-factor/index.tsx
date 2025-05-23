import { useTranslation } from "@/lib/intl/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import TwoFactorForm from "../-components/two-factor";

export const Route = createFileRoute("/(auth)/two-factor/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <div className="p-2 md:p-6 flex flex-col items-center">
      <div className="p-4 md:p-8 w-full max-w-md rounded-lg bg-elevated">
        <TwoFactorForm />

        <div className="mt-4 text-center">
          {t("DONT_HAVE_ACCOUNT")}{" "}
          <Link to="/login" className="underline">
            {t("LOGIN")}
          </Link>
          !
        </div>
      </div>
    </div>
  );
}
