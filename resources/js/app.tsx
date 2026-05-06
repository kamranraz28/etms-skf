import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { toast, Toaster } from "sonner";
import "../css/app.css";

function FlashWatcher({ flash }: { flash: any }) {
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);
  return null;
}

createInertiaApp({
  title: (t) => (t ? `${t} · ETMS` : "ETMS"),
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob("./Pages/**/*.tsx"),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);
    const Wrapped = () => (
      <>
        <App {...props} />
        <Toaster position="top-right" richColors />
        {/* Flash from any inertia visit */}
        <FlashRouterListener />
      </>
    );
    root.render(<Wrapped />);
  },
  progress: { color: "hsl(200 85% 50%)" },
});

function FlashRouterListener() {
  useEffect(() => {
    const off = router.on("success", (event: any) => {
      const flash = event.detail.page?.props?.flash;
      if (flash?.success) toast.success(flash.success);
      if (flash?.error) toast.error(flash.error);
    });
    return () => off();
  }, []);
  return null;
}
