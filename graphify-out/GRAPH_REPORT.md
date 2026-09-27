# Graph Report - .  (2026-08-09)

## Corpus Check
- 122 files · ~483,291 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 494 nodes · 1009 edges · 25 communities (21 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Market Trading Modals
- Market Detail & Resolution
- Account & Navigation Pages
- Auth & Password Flows
- NPM Dependencies
- Dev Tooling Dependencies
- Admin Management Pages
- TypeScript Config
- App Providers & Layout
- Wallet & Leaderboard
- UI Components Config
- Markets Listing Page
- Contact Us Feature
- Share Win Page
- Onboarding Context
- ESLint Config
- Global Types & CSS
- Next.js Config
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `cn()` - 27 edges
2. `useGetUserInfo()` - 23 edges
3. `useGetWalletBalance()` - 17 edges
4. `WalletModal()` - 16 edges
5. `WalletSection()` - 16 edges
6. `compilerOptions` - 16 edges
7. `useAuth()` - 15 edges
8. `useGetLiveRate()` - 15 edges
9. `Navbar()` - 13 edges
10. `isMultiOutcomeMarket()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getMarket()`  [EXTRACTED]
  app/(dashboard)/admin/markets/[id]/page.tsx → hooks/markets/index.ts
- `MarketsPage()` --calls--> `useGetMarkets()`  [EXTRACTED]
  app/(dashboard)/admin/page.tsx → hooks/markets/index.ts
- `LeaderboardPage()` --calls--> `useGetMarkets()`  [EXTRACTED]
  app/(dashboard)/leaderboard/page.tsx → hooks/markets/index.ts
- `generateMetadata()` --calls--> `getMarket()`  [EXTRACTED]
  app/(dashboard)/markets/[id]/page.tsx → hooks/markets/index.ts
- `AdminNavbar()` --calls--> `useAuth()`  [EXTRACTED]
  components/admin/AdminNavbar.tsx → context/auth-provider.tsx

## Import Cycles
- None detected.

## Communities (25 total, 4 thin omitted)

### Community 0 - "Market Trading Modals"
Cohesion: 0.07
Nodes (44): Portfolio(), COLORS, PostMarketModalProps, OUTCOME_COLORS_MOBILE, ConfirmationContent(), SellConfirmation(), useIsMobile(), ShareWinModal() (+36 more)

### Community 1 - "Market Detail & Resolution"
Cohesion: 0.07
Nodes (41): generateMetadata(), MarketDetailPage(), Props, generateMetadata(), MarketDetailPage(), Props, DeleteMarket(), PostMarketModal() (+33 more)

### Community 2 - "Account & Navigation Pages"
Cohesion: 0.13
Nodes (38): metadata, CountdownTimer(), ProfilePage(), AffiliateSettings(), Navbar(), NotificationCard(), calculateDepositBreakdown(), DepositSummaryBox() (+30 more)

### Community 3 - "Auth & Password Flows"
Cohesion: 0.08
Nodes (20): ConfirmResetForm(), Inputs, ForgotPasswordForm(), LoginForm(), SignupForm(), VerifyForm(), Loading(), useAuth() (+12 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.05
Nodes (43): axios, class-variance-authority, clsx, date-fns, lucide-react, next, next-themes, @opennextjs/cloudflare (+35 more)

### Community 5 - "Dev Tooling Dependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, husky, devDependencies, eslint, eslint-config-next, husky, tailwindcss (+30 more)

### Community 6 - "Admin Management Pages"
Cohesion: 0.10
Nodes (27): AuditLogPage(), ReferralsPage(), AdminViewPortfolio(), UsersPage(), AdminNavbar(), CreateMarkets(), useAdminCreateMarkets(), useAdminGetUserPortfolio() (+19 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "App Providers & Layout"
Cohesion: 0.12
Nodes (19): metadata, ReactQueryClientProvider(), Toaster(), AuthContext, AuthProvider(), AuthType, PROTECTED_ROUTES, NotificatiionType (+11 more)

### Community 9 - "Wallet & Leaderboard"
Cohesion: 0.15
Nodes (15): WalletPage(), LeaderboardPage(), PERIOD_TABS, PeriodTab, SortCol, VIEW_TABS, ViewTab, WalletCard() (+7 more)

### Community 10 - "UI Components Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 11 - "Markets Listing Page"
Cohesion: 0.21
Nodes (6): MarketsPage(), metadata, ACCENT_STYLES, MainBanner(), MarketsClient(), useGetMarkets()

### Community 12 - "Contact Us Feature"
Cohesion: 0.40
Nodes (3): contactMethods, ContactUsForm(), SubmitProps

### Community 13 - "Share Win Page"
Cohesion: 0.47
Nodes (5): fetchWinData(), generateMetadata(), Props, ShareWinPage(), WinData

### Community 14 - "Onboarding Context"
Cohesion: 0.33
Nodes (3): OnboardContext, OnboardContextType, OnboardProviderProps

## Knowledge Gaps
- **141 isolated node(s):** `Props`, `contactMethods`, `PERIOD_TABS`, `PeriodTab`, `VIEW_TABS` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `axiosInstance` connect `Wallet & Leaderboard` to `Market Detail & Resolution`, `Account & Navigation Pages`, `Auth & Password Flows`, `Admin Management Pages`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useGetUserInfo()` connect `Account & Navigation Pages` to `Market Detail & Resolution`, `Markets Listing Page`, `Admin Management Pages`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `Props`, `contactMethods`, `PERIOD_TABS` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Market Trading Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.06713286713286713 - nodes in this community are weakly interconnected._
- **Should `Market Detail & Resolution` be split into smaller, more focused modules?**
  _Cohesion score 0.07431693989071038 - nodes in this community are weakly interconnected._
- **Should `Account & Navigation Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.1253246753246753 - nodes in this community are weakly interconnected._
- **Should `Auth & Password Flows` be split into smaller, more focused modules?**
  _Cohesion score 0.08456659619450317 - nodes in this community are weakly interconnected._