/** Primary top-bar links — keep short. */
export const PRIMARY_NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/creators", label: "Creators" },
  { to: "/players", label: "Players" },
  { to: "/about", label: "About" },
];

/** Secondary links — desktop “More” + mobile menu. */
export const MORE_NAV = [
  { to: "/staff", label: "Staff" },
  { to: "/partners", label: "Partners" },
  { to: "/work-with-us", label: "Work with us" },
];

export const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];
