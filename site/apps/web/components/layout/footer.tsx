import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  product: [
    { name: 'NEET', href: '/neet' },
    { name: 'JEE', href: '/jee' },
    { name: 'PYQs', href: '/pyqs' },
    { name: 'Mock Tests', href: '/mock-tests' },
    { name: 'Resources', href: '/resources' },
  ],
  resources: [
    { name: 'NCERT PDFs', href: '/resources/ncert' },
    { name: 'Formula Sheets', href: '/resources/formula-sheets' },
    { name: 'Syllabus', href: '/resources/syllabus' },
    { name: 'Video Lectures', href: '/resources/videos' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="JEENEET Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold">JEENEET</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              India's most structured free NEET/JEE preparation platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NEET/JEE Prep. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for Indian students
          </p>
        </div>
      </div>
    </footer>
  );
}
