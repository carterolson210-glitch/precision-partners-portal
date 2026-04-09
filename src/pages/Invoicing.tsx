import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DollarSign, Plus, Send, Trash2, Loader2, ExternalLink } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  payment_terms: string;
  due_date: string;
  status: string;
  stripe_payment_link_url: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
}

const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const statusColor = (s: string) => {
  switch (s) {
    case "paid": return "default";
    case "sent": return "secondary";
    case "overdue": return "destructive";
    default: return "outline";
  }
};

const Invoicing = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvoices(data as unknown as Invoice[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    updated[index].amount = updated[index].quantity * updated[index].rate;
    setLineItems(updated);
  };

  const addLineItem = () => setLineItems([...lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeLineItem = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const getDueDate = () => {
    const days = paymentTerms === "net_15" ? 15 : paymentTerms === "net_30" ? 30 : paymentTerms === "net_60" ? 60 : paymentTerms === "due_on_receipt" ? 0 : 30;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const handleCreate = async () => {
    if (!user || !clientName || !clientEmail || lineItems.some(li => !li.description || li.rate <= 0)) {
      toast.error("Fill in all required fields with valid amounts");
      return;
    }
    setSaving(true);
    try {
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const subtotalCents = Math.round(subtotal * 100);
      const taxAmountCents = Math.round(taxAmount * 100);
      const totalCents = Math.round(total * 100);

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail,
        line_items: lineItems as any,
        subtotal: subtotalCents,
        tax_rate: taxRate,
        tax_amount: taxAmountCents,
        total: totalCents,
        payment_terms: paymentTerms,
        due_date: getDueDate(),
        status: "draft",
        user_id: user.id,
      });
      if (error) throw error;

      toast.success("Invoice created");
      setCreateOpen(false);
      resetForm();
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setLineItems([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
    setTaxRate(0);
    setPaymentTerms("net_30");
    setNotes("");
  };

  const handleSend = async (invoice: Invoice) => {
    setSending(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-invoice", {
        body: { invoiceId: invoice.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Invoice sent to ${invoice.client_email}`);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invoice");
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("invoices").delete().eq("id", id);
    toast.success("Invoice deleted");
    fetchInvoices();
  };

  // Stats
  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const paidThisMonth = invoices.filter(i => {
    if (i.status !== "paid" || !i.paid_at) return false;
    const d = new Date(i.paid_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  return (
    <DashboardLayout title="Invoicing & Payments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        <DashboardCard title="Outstanding Balance">
          <p className="text-[28px] font-bold text-body-text font-display mt-2">{formatCents(outstanding)}</p>
          <p className="caption-text text-[13px] mt-1">Unpaid invoices total</p>
        </DashboardCard>
        <DashboardCard title="Paid This Month">
          <p className="text-[28px] font-bold text-body-text font-display mt-2">{formatCents(paidThisMonth)}</p>
          <p className="caption-text text-[13px] mt-1">Revenue collected this month</p>
        </DashboardCard>
        <DashboardCard title="Overdue Invoices">
          <p className="text-[28px] font-bold text-body-text font-display mt-2">{overdueCount}</p>
          <p className="caption-text text-[13px] mt-1">Invoices past due date</p>
        </DashboardCard>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy text-primary-foreground hover:bg-navy/90">
              <Plus className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Client Name *</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Acme Corp" /></div>
                <div><Label>Client Email *</Label><Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="billing@acme.com" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Line Items</Label>
                  <Button size="sm" variant="outline" onClick={addLineItem}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
                </div>
                {lineItems.map((li, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-5">
                      {i === 0 && <Label className="text-xs">Description</Label>}
                      <Input value={li.description} onChange={e => updateLineItem(i, "description", e.target.value)} placeholder="Engineering consultation" />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <Label className="text-xs">Qty</Label>}
                      <Input type="number" min={1} value={li.quantity} onChange={e => updateLineItem(i, "quantity", Number(e.target.value))} />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <Label className="text-xs">Rate ($)</Label>}
                      <Input type="number" min={0} step={0.01} value={li.rate} onChange={e => updateLineItem(i, "rate", Number(e.target.value))} />
                    </div>
                    <div className="col-span-2 text-right font-medium text-sm pt-2">${li.amount.toFixed(2)}</div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeLineItem(i)}><Trash2 className="w-3 h-3" /></Button>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><Label>Tax Rate (%)</Label><Input type="number" min={0} max={100} step={0.01} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} /></div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right pt-6">
                  <p className="text-sm text-muted-foreground">Subtotal: ${subtotal.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Tax: ${taxAmount.toFixed(2)}</p>
                  <p className="text-lg font-bold text-body-text">Total: ${total.toFixed(2)}</p>
                </div>
              </div>

              <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes for the client…" /></div>

              <Button onClick={handleCreate} disabled={saving} className="w-full bg-navy text-primary-foreground hover:bg-navy/90">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</> : "Create Invoice"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DashboardCard title="Invoices">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-steel" /></div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="w-8 h-8 text-steel" />}
            title="No invoices created"
            description="Create professional invoices with line items, quantities, rates, tax, and payment terms. Clients pay via Stripe through the invoice link. Automated reminders go out at due date and 7 days overdue."
            actionLabel="Create Invoice"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>
                    <div>{inv.client_name}</div>
                    <div className="text-xs text-muted-foreground">{inv.client_email}</div>
                  </TableCell>
                  <TableCell>{formatCents(inv.total)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={statusColor(inv.status)}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {(inv.status === "draft" || inv.status === "overdue") && (
                      <Button size="sm" variant="outline" onClick={() => handleSend(inv)} disabled={sending === inv.id}>
                        {sending === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 mr-1" /> Send</>}
                      </Button>
                    )}
                    {inv.stripe_payment_link_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(inv.stripe_payment_link_url!, "_blank")}>
                        <ExternalLink className="w-3 h-3 mr-1" /> Pay Link
                      </Button>
                    )}
                    {inv.status === "draft" && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(inv.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Invoicing;
