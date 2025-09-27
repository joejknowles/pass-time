"use client";

import Hotjar from "@hotjar/browser";
import { useEffect } from "react";

const siteId = 5308035;
const hotjarVersion = 6;

export const Tracking = () => {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }
    Hotjar.init(siteId, hotjarVersion);
  }, []);

  return null;
};
