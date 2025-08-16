import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 rounded-lg shadow-sm m-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-black sm:text-center dark:text-white ">
          ©{new Date().getFullYear()}{" "}
          <a
            href="https://github.com/Ayushkm26"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            AyushMishra
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-black dark:text-black sm:mt-0">
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline me-4 md:me-6">
              Privacy Policy
            </a>
          </li>
         
          <li>
            <a href="" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
