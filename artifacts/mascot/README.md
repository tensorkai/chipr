# Chipr mascot additions

- Business dashboard companion links to invoices when overdue invoices exist, otherwise to reports.
- Sidebar mascot opens the existing AI chat and gives a single greeting motion on hover or keyboard focus.
- Shared empty states use a decorative bird-and-ledger scene while keeping their original actions.
- AI chat has a mascot welcome scene and bird avatars for assistant replies.
- Empty dashboard onboarding introduces the mascot beside existing account actions.
- SVG IDs are unique per mascot instance. New scenes stay still by default and respect reduced motion.

Checks: TypeScript and targeted component lint passed. Browser checks with mocked demo data verified invoice navigation, budget empty state, sidebar chat navigation, prompt selection, unique mascot SVG IDs, and settled mobile layout. No uncaught JavaScript errors were observed.

Credit card artwork and the one-time loading fade were not modified by this change.
