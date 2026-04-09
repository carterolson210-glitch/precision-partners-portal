
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_terms TEXT NOT NULL DEFAULT 'net_30',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  stripe_payment_link_id TEXT,
  stripe_payment_link_url TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  notes TEXT,
  user_id UUID NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
