import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Plus, Loader2, Calculator, Building, FileText, Wrench,
  Clock, DollarSign, User, MapPin, Phone, Mail, Trash2,
  Edit, Eye, Download, Send, CheckCircle, AlertTriangle
} from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  service_type: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_company: string;
  client_address: string;
  client_email: string;
  client_phone: string;
  project_name: string;
  project_address: string;
  issue_date: string;
  due_date: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
  pe_stamp_required: boolean;
  certification_type: string;
  created_at: string;
  paid_at?: string;
}

interface CompanySettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  license_number: string;
  pe_number: string;
}

const serviceTypes = [
  "Structural Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Plumbing Engineering",
  "Fire Protection Engineering",
  "Geotechnical Engineering",
  "Environmental Engineering",
  "Construction Administration",
  "Peer Review",
  "Expert Witness",
  "Permitting",
  "Code Consulting",
  "Field Inspection",
  "CAD Drafting",
  "Calculations",
  "Report Writing",
  "Meeting Attendance"
];

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Send },
  paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800", icon: AlertTriangle }
};

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const Invoicing = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  // Company settings
  const [companySettings] = useState<CompanySettings>({
    name: "Precision Partners Engineering",
    address: "123 Engineering Way, Suite 100\nAnytown, USA 12345",
    email: "billing@precisionpartners.com",
    phone: "(555) 123-4567",
    license_number: "PE-12345",
    pe_number: "PE-67890"
  });

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{
    id: "1",
    description: "",
    service_type: "",
    quantity: 1,
    unit: "hours",
    rate: 125,
    amount: 125
  }]);
  const [taxRate, setTaxRate] = useState(8.25);
  const [notes, setNotes] = useState("");
  const [peStampRequired, setPeStampRequired] = useState(false);
  const [certificationType, setCertificationType] = useState("");

  useEffect(() => {
    fetchInvoices();
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}-${random}`;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number | boolean) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;

    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }

    setLineItems(updated);
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      service_type: "",
      quantity: 1,
      unit: "hours",
      rate: 125,
      amount: 125
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const resetForm = () => {
    setClientName("");
    setClientCompany("");
    setClientAddress("");
    setClientEmail("");
    setClientPhone("");
    setProjectName("");
    setProjectAddress("");
    setIssueDate(new Date().toISOString().split('T')[0]);
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
    setLineItems([{
      id: "1",
      description: "",
      service_type: "",
      quantity: 1,
      unit: "hours",
      rate: 125,
      amount: 125
    }]);
    setTaxRate(8.25);
    setNotes("");
    setPeStampRequired(false);
    setCertificationType("");
  };

  const handleCreate = async () => {
    if (!user || !clientName || !projectName || lineItems.some(item => !item.description || !item.service_type)) {
      toast.error("Please fill in all required fields and line items");
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      const { subtotal, taxAmount, total } = calculateTotals();

      const invoiceData = {
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_company: clientCompany,
        client_address: clientAddress,
        client_email: clientEmail,
        client_phone: clientPhone,
        project_name: projectName,
        project_address: projectAddress,
        issue_date: issueDate,
        due_date: dueDate,
        line_items: lineItems,
        subtotal: Math.round(subtotal * 100),
        tax_rate: taxRate,
        tax_amount: Math.round(taxAmount * 100),
        total: Math.round(total * 100),
        status: 'draft' as const,
        notes: notes,
        pe_stamp_required: peStampRequired,
        certification_type: certificationType,
        user_id: user.id,
      };

      const { error } = await supabase.from("invoices").insert(invoiceData);

      if (error) throw error;

      toast.success("Engineering invoice created successfully");
      setCreateOpen(false);
      resetForm();
      fetchInvoices();
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  };

  const getOutstandingInvoices = () => {
    return invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  };

  const getTotalOutstanding = () => {
    return getOutstandingInvoices().reduce((sum, inv) => sum + inv.total, 0);
  };

  const getOverdueCount = () => {
    return invoices.filter(inv => inv.status === 'overdue').length;
  };

  return (
    <DashboardLayout title="Engineering Invoicing">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard title="Outstanding Invoices">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold">{formatCurrency(getTotalOutstanding() / 100)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {getOutstandingInvoices().length} unpaid invoices
          </p>
        </DashboardCard>

        <DashboardCard title="Overdue Invoices">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-600">{getOverdueCount()}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Require immediate attention</p>
        </DashboardCard>

        <DashboardCard title="Total Projects">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold">{new Set(invoices.map(inv => inv.project_name)).size}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Active engineering projects</p>
        </DashboardCard>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Invoice List</TabsTrigger>
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <DashboardCard title="Engineering Invoices">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-steel" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No invoices yet</h3>
                    <p className="text-muted-foreground">Create your first engineering invoice to get started.</p>
                  </div>
                  <Button onClick={() => setActiveTab("create")} className="bg-navy text-primary-foreground hover:bg-navy/90">
                    <Plus className="w-4 h-4 mr-2" /> Create Invoice
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.client_name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.client_company}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.project_name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-32">{invoice.project_address}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.total / 100)}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig[invoice.status].color}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <DashboardCard title="Create Engineering Invoice">
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={generateInvoiceNumber()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name *</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="ABC Construction Inc."
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@abcconstruction.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Textarea
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="123 Main St, City, State 12345"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Project Name *</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Downtown Office Building"
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Project Address</Label>
                    <Textarea
                      value={projectAddress}
                      onChange={(e) => setProjectAddress(e.target.value)}
                      placeholder="456 Project Ave, City, State 12345"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Engineering Services */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Engineering Services
                </h3>
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                      <div className="col-span-3">
                        <Label className="text-xs">Service Type</Label>
                        <Select
                          value={item.service_type}
                          onValueChange={(value) => updateLineItem(index, 'service_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Detailed service description"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Unit</Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) => updateLineItem(index, 'unit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="pages">Pages</SelectItem>
                            <SelectItem value="visits">Visits</SelectItem>
                            <SelectItem value="each">Each</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Rate ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          value={formatCurrency(item.amount)}
                          disabled
                          className="bg-gray-50 font-medium"
                        />
                      </div>
                      <div className="col-span-1">
                        {lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLineItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Service Line
                  </Button>
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Invoice Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div className="text-lg font-medium">{formatCurrency(subtotal)}</div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-muted-foreground">Tax ({taxRate}%)</div>
                    <div className="text-lg font-medium">{formatCurrency(taxAmount)}</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-navy">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Engineering Certifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Engineering Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pe-stamp"
                      checked={peStampRequired}
                      onChange={(e) => setPeStampRequired(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="pe-stamp">PE Stamp Required</Label>
                  </div>
                  <div>
                    <Label>Certification Type</Label>
                    <Select
                      value={certificationType}
                      onValueChange={setCertificationType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select certification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sealed">Sealed Documents</SelectItem>
                        <SelectItem value="certified">Certified Calculations</SelectItem>
                        <SelectItem value="stamped">PE Stamped</SelectItem>
                        <SelectItem value="none">No Certification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes, terms, or special instructions..."
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="bg-navy text-primary-foreground hover:bg-navy/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" /> Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg">{companySettings.name}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {companySettings.address}
                  </p>
                  <p className="text-sm text-muted-foreground">{companySettings.email}</p>
                  <p className="text-sm text-muted-foreground">{companySettings.phone}</p>
                  <p className="text-sm text-muted-foreground">PE: {companySettings.pe_number}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-lg font-medium">{selectedInvoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    Issue Date: {new Date(selectedInvoice.issue_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due Date: {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Client & Project Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Bill To:</h4>
                  <p className="font-medium">{selectedInvoice.client_name}</p>
                  {selectedInvoice.client_company && (
                    <p>{selectedInvoice.client_company}</p>
                  )}
                  {selectedInvoice.client_address && (
                    <p className="whitespace-pre-line text-sm">{selectedInvoice.client_address}</p>
                  )}
                  {selectedInvoice.client_email && (
                    <p className="text-sm">{selectedInvoice.client_email}</p>
                  )}
                  {selectedInvoice.client_phone && (
                    <p className="text-sm">{selectedInvoice.client_phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Project:</h4>
                  <p className="font-medium">{selectedInvoice.project_name}</p>
                  {selectedInvoice.project_address && (
                    <p className="whitespace-pre-line text-sm">{selectedInvoice.project_address}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-medium mb-4">Engineering Services</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.line_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.service_type}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({selectedInvoice.tax_rate}%):</span>
                    <span>{formatCurrency(selectedInvoice.tax_amount / 100)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.total / 100)}</span>
                  </div>
                </div>
              </div>

              {/* Certifications & Notes */}
              {(selectedInvoice.pe_stamp_required || selectedInvoice.certification_type || selectedInvoice.notes) && (
                <div className="space-y-4">
                  {selectedInvoice.pe_stamp_required && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">Professional Engineer Stamp Required</p>
                      <p className="text-sm text-blue-700">This document requires PE certification.</p>
                    </div>
                  )}
                  {selectedInvoice.certification_type && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">Certification: {selectedInvoice.certification_type}</p>
                    </div>
                  )}
                  {selectedInvoice.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Invoicing;
