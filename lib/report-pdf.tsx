import { Document, Page, View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReportData, ReportCustomer } from "./reports";
import { formatDate, STATUS_LABEL, type OrderStatus } from "./utils";

// formatCurrency (used in the web UI) renders the ₹ sign, which isn't in
// the base WinAnsi encoding the built-in PDF fonts (Helvetica) support —
// it silently prints as a mangled glyph rather than throwing. Use a plain
// "Rs." prefix here instead of pulling in and embedding a custom font.
function formatCurrency(value: number | null | undefined): string {
  const n = value ?? 0;
  return `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#13322b" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#5d6f6c", marginBottom: 2 },
  generated: { fontSize: 8, color: "#5d6f6c", marginBottom: 18 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20, gap: 10 },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#d8e8e5",
    borderRadius: 6,
    padding: 8,
    width: "31%",
    marginRight: 6,
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 7.5, color: "#5d6f6c", marginBottom: 3 },
  summaryValue: { fontSize: 13, fontWeight: 700 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#028090",
  },
  empty: { fontSize: 8.5, color: "#5d6f6c", fontStyle: "italic" },
  table: { display: "flex", width: "100%" },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e5e5e5", paddingVertical: 4 },
  th: { fontSize: 7.5, fontWeight: 700, color: "#5d6f6c", textTransform: "uppercase" },
  td: { fontSize: 8.5 },
  link: { fontSize: 8.5, color: "#028090", textDecoration: "underline" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#5d6f6c",
    textAlign: "center",
  },
});

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Customer name, as a Google Maps link when a location has been captured, plain text otherwise. */
function CustomerCell({ customer, width }: { customer: ReportCustomer | null; width: string }) {
  if (!customer) {
    return <Text style={[styles.td, { width, color: "#5d6f6c" }]}>—</Text>;
  }
  if (customer.latitude != null && customer.longitude != null) {
    return (
      <Link src={mapsUrl(customer.latitude, customer.longitude)} style={[styles.link, { width }]}>
        {customer.name}
      </Link>
    );
  }
  return <Text style={[styles.td, { width }]}>{customer.name}</Text>;
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Th({ children, width }: { children: React.ReactNode; width: string }) {
  return <Text style={[styles.th, { width } as Style]}>{children}</Text>;
}
function Td({ children, width, color }: { children: React.ReactNode; width: string; color?: string }) {
  const extra: Style = color ? { width, color } : { width };
  return <Text style={[styles.td, extra]}>{children}</Text>;
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "#8a6100",
  confirmed: "#1c5d8a",
  dispatched: "#5a3d99",
  fulfilled: "#037a4e",
};

export function ReportDocument({ data }: { data: ReportData }) {
  const showRep = data.scopeLabel === "Whole team";
  const custWidth = showRep ? "26%" : "34%";
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document title={`Allvet report ${data.start} to ${data.end}`}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>Allvet Field Ops Report</Text>
        <Text style={styles.subtitle}>
          {formatDate(data.start)} – {formatDate(data.end)} · {data.scopeLabel}
        </Text>
        <Text style={styles.generated}>
          Generated {generatedAt} · figures are pulled directly from the Allvet database for this
          period — no summary text is AI-generated. Customer names link to their captured GPS
          location on Google Maps where available.
        </Text>

        <View style={styles.summaryRow}>
          <SummaryBox label="Fulfilled order value" value={formatCurrency(data.totals.fulfilledValue)} />
          <SummaryBox label="Payments collected" value={formatCurrency(data.totals.collected)} />
          <SummaryBox label="Outstanding" value={formatCurrency(data.totals.outstanding)} />
          <SummaryBox label="Overdue" value={formatCurrency(data.totals.overdue)} />
          <SummaryBox label="Expenses" value={formatCurrency(data.totals.expenses)} />
          <SummaryBox label="Advances outstanding" value={formatCurrency(data.totals.advancesOutstanding)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visits ({data.visits.length})</Text>
          {data.visits.length === 0 ? (
            <Text style={styles.empty}>No visits logged in this period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Th width="11%">Date</Th>
                <Th width={custWidth}>Customer</Th>
                {showRep && <Th width="13%">Rep</Th>}
                <Th width="17%">Purpose</Th>
                <Th width={showRep ? "20%" : "28%"}>Notes</Th>
                <Th width="11%">Follow-up</Th>
              </View>
              {data.visits.map((v) => (
                <View key={v.id} style={styles.tr}>
                  <Td width="11%">{formatDate(v.visitDate)}</Td>
                  <CustomerCell customer={v.customer} width={custWidth} />
                  {showRep && <Td width="13%">{v.repName}</Td>}
                  <Td width="17%">{v.purpose ?? "—"}</Td>
                  <Td width={showRep ? "20%" : "28%"}>{v.discussionSummary ?? "—"}</Td>
                  <Td width="11%">{v.followUpRequired ? "Yes" : "—"}</Td>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders ({data.orders.length})</Text>
          {data.orders.length === 0 ? (
            <Text style={styles.empty}>No orders created in this period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Th width="10%">Date</Th>
                <Th width={custWidth}>Customer</Th>
                {showRep && <Th width="12%">Rep</Th>}
                <Th width="16%">Product</Th>
                <Th width="10%">Status</Th>
                <Th width="12%">Amount</Th>
                <Th width="12%">Due</Th>
              </View>
              {data.orders.map((o) => (
                <View key={o.id} style={styles.tr}>
                  <Td width="10%">{formatDate(o.createdAt)}</Td>
                  <CustomerCell customer={o.customer} width={custWidth} />
                  {showRep && <Td width="12%">{o.repName}</Td>}
                  <Td width="16%">
                    {o.product}
                    {o.quantity ? ` (${o.quantity})` : ""}
                  </Td>
                  <Td width="10%" color={STATUS_COLOR[o.status]}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </Td>
                  <Td width="12%">{formatCurrency(o.amount)}</Td>
                  <Td width="12%" color={o.due > 0 ? "#c0392b" : undefined}>
                    {formatCurrency(o.due)}
                  </Td>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments received ({data.payments.length})</Text>
          {data.payments.length === 0 ? (
            <Text style={styles.empty}>No payments recorded in this period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Th width="14%">Date</Th>
                <Th width={custWidth}>Customer</Th>
                {showRep && <Th width="16%">Rep</Th>}
                <Th width="14%">Amount</Th>
                <Th width={showRep ? "40%" : "56%"}>Notes</Th>
              </View>
              {data.payments.map((p) => (
                <View key={p.id} style={styles.tr}>
                  <Td width="14%">{formatDate(p.createdAt)}</Td>
                  <CustomerCell customer={p.customer} width={custWidth} />
                  {showRep && <Td width="16%">{p.repName}</Td>}
                  <Td width="14%">{formatCurrency(p.amount)}</Td>
                  <Td width={showRep ? "40%" : "56%"}>{p.notes ?? "—"}</Td>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Expenses ({data.expenses.length})</Text>
          {data.expenses.length === 0 ? (
            <Text style={styles.empty}>No expenses logged in this period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Th width="14%">Date</Th>
                {showRep && <Th width="18%">Rep</Th>}
                <Th width="18%">Category</Th>
                <Th width="14%">Amount</Th>
                <Th width={showRep ? "36%" : "54%"}>Note</Th>
              </View>
              {data.expenses.map((e) => (
                <View key={e.id} style={styles.tr}>
                  <Td width="14%">{formatDate(e.expenseDate)}</Td>
                  {showRep && <Td width="18%">{e.repName}</Td>}
                  <Td width="18%">{e.category}</Td>
                  <Td width="14%">{formatCurrency(e.amount)}</Td>
                  <Td width={showRep ? "36%" : "54%"}>{e.note ?? "—"}</Td>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Advances ({data.advances.length})</Text>
          {data.advances.length === 0 ? (
            <Text style={styles.empty}>No advances logged in this period.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Th width="14%">Date</Th>
                <Th width={custWidth}>Customer</Th>
                {showRep && <Th width="16%">Rep</Th>}
                <Th width="14%">Amount</Th>
                <Th width="14%">Status</Th>
              </View>
              {data.advances.map((a) => (
                <View key={a.id} style={styles.tr}>
                  <Td width="14%">{formatDate(a.createdAt)}</Td>
                  <CustomerCell customer={a.customer} width={custWidth} />
                  {showRep && <Td width="16%">{a.repName}</Td>}
                  <Td width="14%">{formatCurrency(a.amount)}</Td>
                  <Td width="14%" color={a.status === "settled" ? "#037a4e" : "#8a6100"}>
                    {a.status === "settled" ? `Settled${a.settledAt ? " " + formatDate(a.settledAt) : ""}` : "Pending"}
                  </Td>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Allvet · page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
