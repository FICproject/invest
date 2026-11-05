import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from '../common/Icon';
import { formatCurrency } from '../../utils/formatters';

interface RazorpayMobileModalProps {
  visible: boolean;
  onClose: () => void;
  orderData: {
    amount?: number;
    amountPaise?: number;
    orderId?: string;
    razorpayOrderId?: string;
    offerTitle?: string;
    title?: string;
    companyName?: string;
  } | null;
  onSuccess: (paymentResult: any) => void;
  onFailure?: (error: any) => void;
}

export const RazorpayMobileCheckoutModal: React.FC<RazorpayMobileModalProps> = ({
  visible,
  onClose,
  orderData,
  onSuccess,
  onFailure
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'banking' | 'wallet'>('upi');
  const [upiSubTab, setUpiSubTab] = useState<'vpa' | 'qr'>('vpa');
  const [vpa, setVpa] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('Test Investor');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!visible || !orderData) return null;

  const amount = Number(orderData.amount || (orderData.amountPaise ? orderData.amountPaise / 100 : 0));
  const orderTitle = orderData.offerTitle || orderData.title || 'Investment Asset Allocation';
  const orderId = orderData.orderId || orderData.razorpayOrderId || `order_${Date.now()}`;

  const banks = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'];
  const wallets = ['Paytm Wallet', 'PhonePe', 'Mobikwik', 'Amazon Pay'];

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((r) => setTimeout(r, 1000));

      if (activeTab === 'upi' && vpa.includes('fail')) {
        throw new Error('Transaction was declined by issuing UPI bank (Test Mode Failure)');
      }

      const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const signature = 'simulated_valid_signature';

      let methodDisplay = 'UPI';
      if (activeTab === 'card') methodDisplay = 'Debit/Credit Card';
      if (activeTab === 'banking') methodDisplay = 'Net Banking';

      onSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        orderId,
        paymentId,
        signature,
        paymentMethod: methodDisplay
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed.');
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 1. Header (Dark Navy) */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.headerTitle}>Razorpay Payment</Text>
                  <View style={styles.testBadge}>
                    <Text style={styles.testBadgeText}>TEST MODE</Text>
                  </View>
                </View>
                <Text style={styles.securityText}>Secured by Razorpay 256-Bit SSL</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.amountLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="x" size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Order Summary */}
          <View style={styles.orderSummary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderTitle} numberOfLines={1}>📦 {orderTitle}</Text>
              <Text style={styles.orderSub}>Ref: {orderId.slice(0, 16)}...</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>CONFIRMED ✓</Text>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 3. Method Tabs */}
            <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
            <View style={styles.tabGrid}>
              {[
                { id: 'upi', label: 'UPI / QR', icon: 'smartphone' },
                { id: 'card', label: 'Cards', icon: 'credit-card' },
                { id: 'banking', label: 'Banking', icon: 'home' },
                { id: 'wallet', label: 'Wallet', icon: 'pocket' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                    onPress={() => {
                      setActiveTab(tab.id as any);
                      setErrorMessage('');
                    }}
                  >
                    <Icon name={tab.icon} size={16} color={isActive ? '#2563EB' : '#64748B'} />
                    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Tab Inputs */}
            {activeTab === 'upi' && (
              <View style={styles.tabContent}>
                <View style={styles.subTabRow}>
                  <TouchableOpacity
                    style={[styles.subTabBtn, upiSubTab === 'vpa' && styles.subTabBtnActive]}
                    onPress={() => setUpiSubTab('vpa')}
                  >
                    <Text style={[styles.subTabText, upiSubTab === 'vpa' && styles.subTabTextActive]}>
                      UPI ID / VPA
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.subTabBtn, upiSubTab === 'qr' && styles.subTabBtnActive]}
                    onPress={() => setUpiSubTab('qr')}
                  >
                    <Text style={[styles.subTabText, upiSubTab === 'qr' && styles.subTabTextActive]}>
                      Scan QR Code
                    </Text>
                  </TouchableOpacity>
                </View>

                {upiSubTab === 'vpa' ? (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.inputLabel}>Google Pay / PhonePe / Paytm / BHIM</Text>
                    <TextInput
                      style={styles.input}
                      value={vpa}
                      onChangeText={setVpa}
                      placeholder="Enter UPI ID (e.g. name@oksbi)"
                      autoCapitalize="none"
                    />
                    <View style={styles.quickChips}>
                      <Text style={styles.quickLabel}>Test:</Text>
                      <TouchableOpacity
                        style={styles.chipSuccess}
                        onPress={() => setVpa('success@razorpay')}
                      >
                        <Text style={styles.chipSuccessText}>success@razorpay</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.chipFail}
                        onPress={() => setVpa('fail@upi')}
                      >
                        <Text style={styles.chipFailText}>fail@upi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.qrContainer}>
                    <View style={styles.qrBox}>
                      <Icon name="maximize" size={40} color="#0F172A" />
                      <Text style={styles.qrLabel}>Razorpay Test QR</Text>
                    </View>
                    <Text style={styles.qrNotice}>Scan using any UPI app to authorize {formatCurrency(amount)}</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === 'card' && (
              <View style={styles.tabContent}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  placeholder="4111 1111 1111 1111"
                />
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>VALID THRU</Text>
                    <TextInput
                      style={styles.input}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      placeholder="MM/YY"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="numeric"
                      secureTextEntry
                      placeholder="123"
                    />
                  </View>
                </View>
                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <TextInput
                  style={styles.input}
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="Full name on card"
                />
              </View>
            )}

            {activeTab === 'banking' && (
              <View style={styles.tabContent}>
                <Text style={styles.inputLabel}>POPULAR BANKS</Text>
                {banks.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.bankRow, selectedBank === b && styles.bankRowActive]}
                    onPress={() => setSelectedBank(b)}
                  >
                    <Text style={[styles.bankName, selectedBank === b && styles.bankNameActive]}>
                      {b}
                    </Text>
                    {selectedBank === b && <Icon name="check" size={16} color="#2563EB" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'wallet' && (
              <View style={styles.tabContent}>
                <Text style={styles.inputLabel}>SELECT WALLET</Text>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[styles.bankRow, selectedWallet === w && styles.bankRowActive]}
                    onPress={() => setSelectedWallet(w)}
                  >
                    <Text style={[styles.bankName, selectedWallet === w && styles.bankNameActive]}>
                      {w}
                    </Text>
                    {selectedWallet === w && <Icon name="check" size={16} color="#2563EB" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* 5. Submit Button */}
            <TouchableOpacity
              style={styles.payBtn}
              onPress={handlePay}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.payBtnText}>
                  PAY {formatCurrency(amount)} VIA {activeTab.toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.merchantText}>Merchant: Connect Invest</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelText}>Cancel Payment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    backgroundColor: '#0F1E36',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#0C2340',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3B82F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  testBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  testBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  securityText: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '700',
  },
  amountValue: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    marginTop: 2,
    padding: 2,
  },
  orderSummary: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '800',
  },
  body: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tabGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabButtonActive: {
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  tabButtonText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabButtonTextActive: {
    fontWeight: '800',
    color: '#1D4ED8',
  },
  tabContent: {
    marginTop: 14,
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
  },
  subTabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabTextActive: {
    fontWeight: '800',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  quickChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  quickLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  chipSuccess: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipSuccessText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '700',
  },
  chipFail: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipFailText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qrBox: {
    width: 110,
    height: 110,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 4,
  },
  qrNotice: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  bankRowActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  bankName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  bankNameActive: {
    fontWeight: '800',
    color: '#1E40AF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    flex: 1,
  },
  payBtn: {
    backgroundColor: '#0F1E36',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 4,
  },
  merchantText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 10.5,
    textDecorationLine: 'underline',
  },
});

