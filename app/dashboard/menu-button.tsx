"use client";

import { useEffect } from "react";

export function MenuButton({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const placeholder = document.getElementById("menu-button-placeholder");
    if (placeholder) {
      const button = placeholder.querySelector("button");
      if (button) {
        button.removeAttribute("disabled");
        button.onclick = (e) => {
          e.preventDefault();
          onOpen();
        };
      }
    }
  }, [onOpen]);

  return null;
}

