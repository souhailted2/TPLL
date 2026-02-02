## Packages
framer-motion | Smooth animations for page transitions and UI elements
recharts | Beautiful charts for the admin dashboard statistics
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely
rtl-css-js | Helper for RTL layouts if needed (though Tailwind handles most via dir="rtl")

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["'Tajawal'", "sans-serif"], // Arabic friendly font
  display: ["'Cairo'", "sans-serif"], // Arabic display font
}
The application requires RTL support. Add `dir="rtl"` to the root html tag in `client/index.html` manually or via a useEffect in App.tsx.
Authentication is handled via Replit Auth (cookie-based).
API endpoints are defined in `@shared/routes`.
