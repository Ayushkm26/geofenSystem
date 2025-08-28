import React from "react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-gray-100 dark:bg-gray-800 shadow-lg h-16">
      <div className="w-full mx-auto max-w-screen-xl p-4 flex flex-col md:flex-row items-center justify-between h-full">
        <span className="text-sm text-black dark:text-white text-center md:text-left">
          ©{new Date().getFullYear()}{" "}
          <a
            href="https://github.com/Ayushkm26"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GeoFenceSystems
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-2 md:mt-0 text-sm font-medium text-black dark:text-white gap-4 md:gap-6 justify-center md:justify-end">
          <li>
            <a href="/about" className="hover:underline">
              About
            </a>
          </li>
          <li>
            <a href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/contact-us" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
