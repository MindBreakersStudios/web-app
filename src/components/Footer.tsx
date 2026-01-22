import { Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src="https://uploadthingy.s3.us-west-1.amazonaws.com/j4KwKME8Sszn3RKxeLHnDw/Logo-35.png"
              alt="MindBreakers Logo"
              className="h-10 mb-4"
            />
            <p className="text-gray-400 mb-4">
              Premium game server hosting with exceptional performance and
              community focus.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <div className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#servers" className="text-gray-400 hover:text-blue-400 transition">
                  Servers
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-blue-400 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-blue-400 transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Servers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/humanitz" className="text-gray-400 hover:text-blue-400 transition">
                  Humanitz Server
                </a>
              </li>
              <li>
                <a href="/scum" className="text-gray-400 hover:text-blue-400 transition">
                  SCUM Server
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} MindBreakers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};