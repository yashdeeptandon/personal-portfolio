"use client";
import { useEffect } from "react";

export default function TestCookies() {
  useEffect(() => {
    const oneYear = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
    const opts = `; path=/; SameSite=Lax; Expires=${oneYear}`;
    document.cookie = `_ga=TEST.GA.COOKIE${opts}`;
    document.cookie = `_ga_ABC123=TEST.GA4.COOKIE${opts}`;
    document.cookie = `_gid=TEST.GID${opts}`;
    document.cookie = `_gat=1${opts}`;
    document.cookie = `__utmz=TEST.UTM${opts}`;
    document.cookie = `_gcl_au=TEST.GCL${opts}`;
    document.cookie = `_fbp=FB.TEST${opts}`;
    document.cookie = `_hjSessionUser_12345=HJ.TEST${opts}`;
    document.cookie = `ajs_anonymous_id=SEGMENT.TEST${opts}`;
    document.cookie = `device_info=SHOULD_BE_BLOCKED${opts}`;
  }, []);
  return null;
}
