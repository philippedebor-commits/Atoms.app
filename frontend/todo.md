# UrbanPermit - Générateur de Dossier Urbanistique Wallonie

## Design Guidelines

### Design References
- **Apple.com**: Clean, premium, whitespace-heavy
- **Tesla.com**: Bold hero sections, minimal navigation
- **Style**: Modern Minimalism + Natural/Organic + Premium

### Color Palette
- Primary: #2D5016 (Forest Green - CTAs, accents)
- Secondary: #4A7C2E (Lighter Green - hover states)
- Background: #FAFAF5 (Warm Off-White)
- Card: #FFFFFF (White cards with subtle shadows)
- Accent Warm: #C4A265 (Gold/Wood tone - highlights)
- Text Primary: #1A1A1A (Near Black)
- Text Secondary: #6B7280 (Gray)
- Border: #E5E2D9 (Warm Gray)

### Typography
- Font: Inter (clean, modern sans-serif)
- H1: font-weight 700, 48px
- H2: font-weight 600, 36px
- H3: font-weight 600, 24px
- Body: font-weight 400, 16px
- Small: font-weight 400, 14px

### Key Component Styles
- Buttons: Green bg (#2D5016), white text, rounded-xl, hover: lighten
- Cards: White bg, rounded-2xl, shadow-sm, border warm gray
- Forms: Rounded-lg inputs, focus ring green
- Progress bar: Green gradient

### Images to Generate
1. **hero-nature-landscape.jpg** - Aerial view of Belgian Wallonia countryside with green rolling hills, forests, and a modern eco-lodge nestled in nature, golden hour lighting (Style: photorealistic, warm tones)
2. **benefit-speed.jpg** - Abstract minimalist illustration of a clock with green leaves, representing speed and nature combined (Style: minimalist, flat design)
3. **benefit-quality.jpg** - Clean architectural blueprint overlaid with natural elements like leaves and wood textures (Style: minimalist, warm)
4. **benefit-simplicity.jpg** - Minimalist illustration of a person using a tablet in a forest clearing, simple and calming (Style: minimalist, soft colors)

---

## Development Tasks

### Backend Files
1. **backend/routers/payments.py** - Stripe payment session + verification
2. **backend/services/prompt_generator.py** - AI prompt generation logic
3. **backend/routers/prompt.py** - Prompt generation + email sending endpoints

### Frontend Files (max 8)
1. **src/pages/Index.tsx** - Landing page (hero, benefits, how-it-works, CTA)
2. **src/pages/Questionnaire.tsx** - Multi-step form (9 steps) with progress bar
3. **src/pages/PaymentSuccess.tsx** - Payment success + prompt display + copy
4. **src/pages/MyDossiers.tsx** - User's dossiers list with regenerate option
5. **src/components/Header.tsx** - Navigation header with auth
6. **src/lib/api.ts** - API client setup (createClient)
7. **src/App.tsx** - Router setup with all routes