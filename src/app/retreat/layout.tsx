import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function RetreatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #site-chrome-top, #site-chrome-bottom { display: none !important; }
          `,
        }}
      />
      <div className="retreat-page">{children}</div>
    </>
  );
}
