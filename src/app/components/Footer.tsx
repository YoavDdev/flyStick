import React from "react";
import NewsletterSignUpForm from "./NewsletterSignUpForm";
import Link from "next/link";

const Footer = () => {
  const navigation = {
    social: [
      {
        name: "Facebook",
        href: "https://www.facebook.com/boazpilates?mibextid=qi2Omg&rdid=ejgWCR8hCZbauwaZ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FQUc7icEH6EzScMN9%2F%3Fmibextid%3Dqi2Omg",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/boaznahaissi?igsh=azQ0MXQxaHgxM2hy",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },

      {
        name: "YouTube",
        href: "https://www.youtube.com/@BoazNahaissi",
        icon: (
          props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
        ) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
  };
  return (
    <footer className="bg-[#F7F3EB]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="border-t border-[#D5C4B7]/30 pt-8 sm:mt-16 lg:mt-20 lg:flex lg:items-center lg:justify-between">
          <div className="text-right">
            <h3 className="text-sm font-semibold leading-6 text-[#2D3142]">
              הירשמו לניוזלטר שלנו
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#3D3D3D]/80">
              עדכון ארועים, חדשות, שיעורים חדשים העולים לאתר ישלחו לתיבת הדואר
              שלכם.
            </p>
          </div>
          <NewsletterSignUpForm />
        </div>

        <div className="mt-8 border-t border-[#D5C4B7]/30 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-4 rtl:space-x-reverse justify-end md:order-2">
            {navigation.social.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="bg-[#E5DFD0]/70 hover:bg-[#D5C4B7]/70 p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-5 w-5 text-[#B56B4A]" aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="mt-8 text-xs leading-5 text-[#3D3D3D]/70 md:order-1 md:mt-0 text-right">
            <p className="mb-2">
              &copy; {new Date().getFullYear()} סטודיו אונליין של בועז נחייסי, בע&quot;מ. כל הזכויות
              שמורות.
            </p>
            <p className="flex flex-wrap gap-2 justify-end">
              <Link className="text-[#B56B4A]/80 hover:text-[#B56B4A] transition-colors duration-300" href="/terms">
                תקנון אתר
              </Link>

              <span className="text-[#8E9A7C]/70">|</span>

              <Link
                className="text-[#B56B4A]/80 hover:text-[#B56B4A] transition-colors duration-300"
                href="/privacyPolicy"
              >
                מדיניות פרטיות
              </Link>
              
              <span className="text-[#8E9A7C]/70">|</span>

              <Link
                className="text-[#B56B4A]/80 hover:text-[#B56B4A] transition-colors duration-300"
                href="/accessibility"
              >
                הצהרת נגישות
              </Link>
              
              <span className="text-[#8E9A7C]/70">|</span>
              
              <Link
                className="text-[#B56B4A]/80 hover:text-[#B56B4A] transition-colors duration-300"
                href="/navigation"
              >
                המדריך לסטודיו
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
