import React from "react";

/**
 * Handles row clicks in a data table, preventing navigation if the click originated
 * from an interactive element (like a button, checkbox, link, etc.).
 * 
 * @param e The mouse or keyboard event
 * @param router Next.js App Router instance
 * @param path The path to navigate to
 */
export const handleRowClick = (
  e: React.MouseEvent | React.KeyboardEvent,
  router: any,
  path: string
) => {
  const target = e.target as HTMLElement;

  // Ignore clicks that originate from interactive elements or their children.
  // Includes Base UI data-slot attributes for dropdown menu items rendered in portals.
  if (
    target.closest("button") ||
    target.closest("a") ||
    target.closest("input") ||
    target.closest("label") ||
    target.closest('[role="menuitem"]') ||
    target.closest('[role="checkbox"]') ||
    target.closest('[role="button"]') ||
    target.closest('[role="dialog"]') ||
    target.closest('[data-state="open"]') ||
    target.closest('[data-slot="dropdown-menu-item"]') ||
    target.closest('[data-slot="dropdown-menu-content"]') ||
    target.closest('[data-no-row-click]')
  ) {
    return;
  }

  // Handle both click and Enter key presses
  if (
    e.type === "click" ||
    (e.type === "keydown" && (e as React.KeyboardEvent).key === "Enter")
  ) {
    router.push(path);
  }
};
