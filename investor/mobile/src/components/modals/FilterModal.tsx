import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../theme/spacing';
import Icon from '../common/Icon';
import CustomButton from '../common/CustomButton';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { category: string; type: string; sort: string }) => void;
  initialFilters: { category: string; type: string; sort: string };
}

const CATEGORIES = [
  'All',
  'Renewable Energy',
  'Real Estate',
  'Technology',
  'Healthcare',
  'Food & Agriculture',
];

const TYPES = ['All', 'Company', 'Project'];

const SORT_OPTIONS = [
  { label: 'Newest Added', value: 'createdAt_desc' },
  { label: 'Highest Return Rate', value: 'returnRate_desc' },
  { label: 'Lowest Minimum Investment', value: 'minInvestment_asc' },
  { label: 'Most Funded Amount', value: 'raised_desc' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [category, setCategory] = useState<string>(initialFilters.category || 'All');
  const [type, setType] = useState<string>(initialFilters.type || 'All');
  const [sort, setSort] = useState<string>(initialFilters.sort || 'createdAt_desc');

  const handleReset = () => {
    setCategory('All');
    setType('All');
    setSort('createdAt_desc');
  };

  const handleApply = () => {
    onApply({ category, type, sort });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Opportunities</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <Text style={styles.sectionTitle}>Asset Category</Text>
            <View style={styles.chipsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type */}
            <Text style={styles.sectionTitle}>Opportunity Type</Text>
            <View style={styles.chipsContainer}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortItem, sort === opt.value && styles.sortItemActive]}
                onPress={() => setSort(opt.value)}
              >
                <View style={styles.radio}>
                  {sort === opt.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.sortText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.buttonRow}>
              <CustomButton
                title="Reset"
                variant="secondary"
                onPress={handleReset}
                style={styles.resetBtn}
              />
              <CustomButton
                title="Apply Filters"
                variant="primary"
                onPress={handleApply}
                style={styles.applyBtn}
              />
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  sortItemActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.surfaceSubtle,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  sortText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});

export default FilterModal;
