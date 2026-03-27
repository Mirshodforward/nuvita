"use client";

import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const pathname = usePathname();

  // FloatingCart is now completely removed visually as per request, just returning null all the time, 
  // or tracking to completely remove it from the layout.
  // The cart button is moved to the Header.

  return null;
}
