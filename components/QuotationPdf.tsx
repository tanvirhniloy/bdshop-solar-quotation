'use client';

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

import type {
  Quotation,
  QuotationSettings,
} from '@/types/quotation';

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    position: 'relative',
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#172033',
    paddingTop: '27mm',
    paddingBottom: '49mm',
    paddingHorizontal: '12mm',
  },

  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '210mm',
    height: '297mm',
  },

  title: {
    fontSize: 20,
    color: '#15458f',
    fontFamily: 'Helvetica-Bold',
  },

  sub: {
    fontSize: 7,
    color: '#64748b',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#15458f',
    paddingBottom: 6,
    marginBottom: 9,
  },

  right: {
    textAlign: 'right',
    lineHeight: 1.5,
  },

  sectionTitle: {
    fontSize: 9.5,
    color: '#15458f',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },

  customer: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    padding: 7,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbe3ee',
    paddingVertical: 4,
  },

  th: {
    backgroundColor: '#15458f',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },

  cell: {
    paddingHorizontal: 4,
  },

  table: {
    borderWidth: 0.7,
    borderColor: '#cbd5e1',
  },

  terms: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    padding: 7,
    marginTop: 0,
  },

  summary: {
    borderWidth: 0.7,
    borderColor: '#cbd5e1',
    marginTop: 0,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbe3ee',
  },

  grand: {
    backgroundColor: '#eef4fb',
    color: '#15458f',
    fontFamily: 'Helvetica-Bold',
  },

  words: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    padding: 7,
    marginTop: 6,
  },

  muted: {
    color: '#64748b',
    fontSize: 7.5,
  },
});

const money = (n: number) =>
  `BDT ${new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 2,
  }).format(n)}`;

export default function QuotationPdf({
  quotation,
  settings,
}: {
  quotation: Quotation;
  settings: QuotationSettings;
}) {
  return (
    <Document
      title={quotation.quotation_number}
      author="BDSHOP Limited"
    >
      <Page
        size="A4"
        style={styles.page}
        wrap
      >
        {/* Official BDSHOP Letterhead */}
        <Image
          src="/assets/bdshop-letterhead.png"
          fixed
          style={styles.bg}
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>QUOTATION</Text>

            <Text style={styles.sub}>
              Solar &amp; IPS Division
            </Text>
          </View>

          <View style={styles.right}>
            <Text>
              Quotation No: {quotation.quotation_number}
            </Text>

            <Text>
              Date: {quotation.quotation_date}
            </Text>

            <Text>
              Validity: {quotation.validity_days} days
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customer}>
          <Text style={styles.sectionTitle}>
            Customer Information
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            <Text
              style={{
                width: '50%',
                paddingBottom: 3,
              }}
            >
              Customer: {quotation.customer_name}
            </Text>

            <Text
              style={{
                width: '50%',
                paddingBottom: 3,
              }}
            >
              Company: {quotation.customer_company || '—'}
            </Text>

            <Text
              style={{
                width: '50%',
                paddingBottom: 3,
              }}
            >
              Phone: {quotation.customer_phone || '—'}
            </Text>

            <Text
              style={{
                width: '50%',
                paddingBottom: 3,
              }}
            >
              Email: {quotation.customer_email || '—'}
            </Text>

            <Text
              style={{
                width: '100%',
                paddingBottom: 3,
              }}
            >
              Address: {quotation.customer_address || '—'}
            </Text>

            <Text
              style={{
                width: '100%',
              }}
            >
              Prepared By:{' '}
              {quotation.customer_reference||'—'}
            </Text>
          </View>
        </View>

        {/* Product Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View
            style={[styles.row, styles.th]}
            fixed
          >
            <Text
              style={[
                styles.cell,
                {
                  width: '6%',
                },
              ]}
            >
              SL
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '15%',
                },
              ]}
            >
              Category
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '36%',
                },
              ]}
            >
              Item Description
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '8%',
                  textAlign: 'right',
                },
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '8%',
                },
              ]}
            >
              Unit
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '14%',
                  textAlign: 'right',
                },
              ]}
            >
              Unit Price
            </Text>

            <Text
              style={[
                styles.cell,
                {
                  width: '13%',
                  textAlign: 'right',
                },
              ]}
            >
              Total
            </Text>
          </View>

          {/* Table Rows */}
          {quotation.items.map((item, index) => (
            <View
              key={item.id || index}
              style={styles.row}
              wrap={false}
            >
              <Text
                style={[
                  styles.cell,
                  {
                    width: '6%',
                  },
                ]}
              >
                {index + 1}
              </Text>

              <Text
                style={[
                  styles.cell,
                  {
                    width: '15%',
                  },
                ]}
              >
                {item.category}
              </Text>

              <View
                style={[
                  styles.cell,
                  {
                    width: '36%',
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: 'Helvetica-Bold',
                  }}
                >
                  {item.item_name}
                </Text>

                {item.description && (
                  <Text style={styles.muted}>
                    {item.description}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.cell,
                  {
                    width: '8%',
                    textAlign: 'right',
                  },
                ]}
              >
                {item.quantity}
              </Text>

              <Text
                style={[
                  styles.cell,
                  {
                    width: '8%',
                  },
                ]}
              >
                {item.unit}
              </Text>

              <Text
                style={[
                  styles.cell,
                  {
                    width: '14%',
                    textAlign: 'right',
                  },
                ]}
              >
                {money(item.unit_price)}
              </Text>

              <Text
                style={[
                  styles.cell,
                  {
                    width: '13%',
                    textAlign: 'right',
                  },
                ]}
              >
                {money(item.total_price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary and Terms */}
        <View
          wrap={false}
          style={{
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
            }}
          >
            {/* Terms */}
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.sectionTitle}>
                Terms &amp; Condition / Notes
              </Text>

              <View style={styles.terms}>
                <Text>
                  {quotation.terms_and_conditions}
                </Text>
              </View>
            </View>

            {/* Summary */}
            <View
              style={[
                styles.summary,
                {
                  width: 185,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>

                <Text>
                  {money(quotation.subtotal)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Discount</Text>

                <Text>
                  - {money(quotation.discount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Tax/VAT</Text>

                <Text>
                  {money(quotation.tax)}
                </Text>
              </View>

              <View
                style={[
                  styles.summaryRow,
                  styles.grand,
                ]}
              >
                <Text>Grand Total</Text>

                <Text>
                  {money(quotation.grand_total)}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.words}>
            <Text>
              <Text
                style={{
                  fontFamily: 'Helvetica-Bold',
                }}
              >
                Amount in Words:{' '}
              </Text>

              {quotation.amount_in_words}
            </Text>
          </View>

          {/* Prepared By */}
          <Text
            style={[
              styles.muted,
              {
                textAlign: 'right',
                marginTop: 8,
              },
            ]}
          >
            Prepared By:{' '}
            {quotation.creator?.full_name ||
              'BDSHOP Solar & IPS Division'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}