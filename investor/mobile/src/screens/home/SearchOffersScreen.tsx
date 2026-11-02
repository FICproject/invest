import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import { ROUTES } from '../../constants/routes';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import OfferCard from '../../components/cards/OfferCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import offerService from '../../services/offerService';
import { useDebounce } from '../../hooks/useDebounce';
import { InvestmentOffer } from '../../types';

export const SearchOffersScreen = ({ navigation }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [offers, setOffers] = useState<InvestmentOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await offerService.getAllOffers({
          search: debouncedSearch.trim() || undefined,
        });
        if (res.success && res.data) {
          setOffers(res.data);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <CustomInput
            placeholder="Search deals, startups, sectors..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon={<Icon name="search" size={18} color={COLORS.gold} />}
            containerStyle={styles.searchContainer}
          />
        </View>
      </View>

      <View style={styles.content}>
        {loading ? (
          <Loader message="Searching opportunities..." />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                onPress={() => navigation.navigate(ROUTES.OFFER_DETAILS, { offerId: item._id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="search"
                title="No Opportunities Found"
                description={`We couldn't find any opportunities matching "${searchTerm}".`}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  inputWrapper: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
});

export default SearchOffersScreen;
