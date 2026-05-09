# SaaS Dashboard with Stripe Payments

A production-ready SaaS dashboard web app with integrated Stripe payments, built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## Features

- 🔐 Authentication with NextAuth.js
- 💳 Secure Stripe payment processing with embedded forms
- 📊 Modern dashboard with analytics
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 🗄️ PostgreSQL database with Prisma ORM
- 📱 Responsive design
- 🌙 Dark mode support
- 👥 Team management
- 📄 Invoice management
- 🔄 Webhook handling

## Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Backend:** Next.js API routes
- **Database:** PostgreSQL with Prisma
- **Authentication:** NextAuth.js
- **Payments:** Stripe API
- **Styling:** Tailwind CSS, shadcn/ui
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saas-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saas_dashboard"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_BASIC_PRICE_ID="price_basic"
STRIPE_ADVANCED_PRICE_ID="price_advanced"
STRIPE_PREMIUM_PRICE_ID="price_premium"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and prices for your subscription plans
4. Set up webhooks for the following events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`

Webhook URL: `https://yourdomain.com/api/stripe/webhook`

## Database Schema

The application uses the following main models:

- `User` - User accounts
- `Subscription` - User subscriptions
- `PaymentMethod` - Stored payment methods
- `Invoice` - Billing invoices
- `UsageMetrics` - Usage tracking
- `Organization` - Team organizations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Stripe Integration
- `POST /api/stripe/create-customer` - Create Stripe customer
- `POST /api/stripe/create-subscription` - Create subscription
- `POST /api/stripe/webhook` - Webhook handler

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database

For production, use a managed PostgreSQL service like:
- Vercel Postgres
- Supabase
- PlanetScale
- AWS RDS

## Security

- All payment data is handled securely through Stripe
- No sensitive card information is stored in your database
- CSRF protection enabled
- Rate limiting implemented
- Secure HTTP-only cookies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
