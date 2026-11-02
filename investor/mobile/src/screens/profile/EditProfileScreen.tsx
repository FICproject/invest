import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from '../../components/common/Icon';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import Loader from '../../components/common/Loader';
import transactionService from '../../services/transactionService';
import { useAuthContext } from '../../context/authContext';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthContext();

  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    transactionService
      .getProfile()
      .then((res) => {
        if (res.success && res.data?.profile?.address) {
          const addr = res.data.profile.address;
          setStreet(addr.street || '');
          setCity(addr.city || '');
          setState(addr.state || '');
          setPostalCode(addr.postalCode || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await transactionService.updateProfile({
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
        },
      });
      Alert.alert('Success', 'Profile details updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loader fullScreen message="Loading profile info..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Readonly Identity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity Records (Verified)</Text>
          <CustomInput label="Legal Name" value={user?.name || ''} editable={false} />
          <CustomInput label="Registered Email" value={user?.email || ''} editable={false} />
          <CustomInput label="Mobile Number" value={user?.mobile || ''} editable={false} />
        </View>

        {/* Editable Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Residential Address</Text>
          <CustomInput
            label="Street Address"
            placeholder="Flat / Building / Street"
            value={street}
            onChangeText={setStreet}
          />
          <CustomInput
            label="City"
            placeholder="e.g. Mumbai, Bengaluru"
            value={city}
            onChangeText={setCity}
          />
          <CustomInput
            label="State"
            placeholder="e.g. Maharashtra, Karnataka"
            value={state}
            onChangeText={setState}
          />
          <CustomInput
            label="Postal / PIN Code"
            placeholder="e.g. 400001"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
          />
        </View>

        <CustomButton
          title="Save Profile"
          onPress={handleSave}
          variant="gold"
          size="lg"
          loading={saving}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  submitBtn: {
    marginTop: 4,
    marginBottom: 20,
  },
});

export default EditProfileScreen;
