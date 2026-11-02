import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import Icon from '../common/Icon';
import Badge from '../common/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const isCredit = transaction.type === 'Payout' || transaction.type === 'Refund';
  const isFailed = transaction.status === 'Failed';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.container}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isFailed
              ? COLORS.dangerBg
              : isCredit
              ? COLORS.successBg
              : COLORS.primarySubtle,
          },
        ]}
      >
        <Icon
          name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
          size={18}
          color={isFailed ? COLORS.danger : isCredit ? COLORS.success : COLORS.primary}
        />
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.subtitle}>
          {formatDate(transaction.createdAt)} • Ref: {transaction.referenceId.slice(-8)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            {
              color: isFailed
                ? COLORS.danger
                : isCredit
                ? COLORS.success
                : COLORS.textPrimary,
            },
          ]}
        >
          {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Badge
          label={transaction.status}
          variant={
            transaction.status === 'Confirmed'
              ? 'success'
              : transaction.status === 'Pending'
              ? 'warning'
              : 'danger'
          }
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
});

export default TransactionItem;
