const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></>,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
  moon: <path d="M20.5 14.3A8.6 8.6 0 1 1 9.7 3.5a6.9 6.9 0 0 0 10.8 10.8z" />,
  heart: <path d="M12 20.3s-7.6-4.6-7.6-9.7A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 3c0 5.1-7.6 9.7-7.6 9.7z" />,
  cart: <><path d="M6 6h15l-1.8 8.4H7.6L6 6z" /><path d="M6 6L5.2 3H2.5" /><circle cx="9.2" cy="19.4" r="1.5" /><circle cx="17.6" cy="19.4" r="1.5" /></>,
  login: <><path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" /><path d="M10 12h11M18 9l3 3-3 3" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.3-3.7 4-5.5 7-5.5s5.7 1.8 7 5.5" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  pen: <><path d="M4 20h4L20 8l-4-4L4 16v4z" /><path d="M14.5 5.5l4 4" /></>,
  trash: <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" />,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  check: <path d="M5 13l4.5 4.5L19 8" />,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.6 5.9A9.6 9.6 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3.3 4M6.4 7.9A16.6 16.6 0 0 0 2.5 12S6 18.2 12 18.2c1.3 0 2.5-.3 3.5-.7" /></>,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.8z" fill="none" stroke="currentColor" strokeWidth="1.6" />,
  ig: <><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.3 6.7h.01" /></>,
  fb: <><circle cx="12" cy="12" r="9" /><path d="M15.2 8.4h-1.5a2.1 2.1 0 0 0-2.1 2.1V21" /><path d="M9.9 12.3h4.5" /></>,
  xs: <path d="M4.4 4l15.2 16M19.6 4 4.4 20" />,
  tt: <><path d="M14.2 3.6v9.9a3.4 3.4 0 1 1-2.8-3.35" /><path d="M14.2 3.6c.6 2.6 2.3 4 4.9 4.2" /></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.6 6.6 12 13l8.4-6.4" /></>,
  tel: <path d="M6.6 3.5h2.1l1.5 3.8-1.9 1.4a10.5 10.5 0 0 0 4.9 4.9l1.4-1.9 3.8 1.5v2.1a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />,
  wa: <><path d="M4.2 19.8 5.5 15.6A8 8 0 1 1 8.9 19z" /><path d="M9.2 9.4c.5 2.9 2.5 4.9 5.4 5.4" /></>,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  dir: <path d="M3 11 21 3l-8 18-2-7z" />,
  chevronL: <path d="M15 6l-6 6 6 6" />,
  chevronR: <path d="M9 6l6 6-6 6" />,
  chat: <><path d="M4 5.5h16v11H9.5L5.5 20.5v-4H4z" /><path d="M8 9.5h8M8 12.5h5.5" /></>,
  send: <><path d="M4 12 20.5 4.2 15 20l-3.4-6.2z" /><path d="M11.6 13.8 20.5 4.2" /></>,
  home: <path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H14.5v-6h-5v6H5.5A1.5 1.5 0 0 1 4 19.5z" />,
  board: <><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="2" /><rect x="13" y="13" width="7.5" height="7.5" rx="2" /></>,
  download: <><path d="M12 3.5v10.5M8 10.5l4 4 4-4" /><path d="M4.5 20h15" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10.5 13.5" /><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" /></>,
  share: <><path d="M12 15.5V4M8.5 7.2 12 3.7l3.5 3.5" /><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" /></>
};

export default function Ico({ name, className, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}
