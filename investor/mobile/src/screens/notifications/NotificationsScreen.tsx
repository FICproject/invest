import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../theme/spacing';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import notificationService from '../../services/notificationService';
import { AppNotification } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifs();
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-left" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <Loader message="Loading notifications..." />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleMarkRead(item._id)}
                style={[
                  styles.notifItem,
                  !item.isRead && styles.notifItemUnread,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        item.type === 'investment'
                          ? COLORS.primarySubtle
                          : item.type === 'kyc'
                          ? COLORS.goldSubtle
                          : COLORS.successBg,
                    },
                  ]}
                >
                  <Icon
                    name={
                      item.type === 'investment'
                        ? 'briefcase'
                        : item.type === 'kyc'
                        ? 'shield'
                        : 'dollar-sign'
                    }
                    size={18}
                    color={
                      item.type === 'investment'
                        ? COLORS.primary
                        : item.type === 'kyc'
                        ? COLORS.goldDark
                        : COLORS.success
                    }
                  />
                </View>

                <View style={styles.details}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, !item.isRead && styles.titleBold]}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState
                icon="bell"
                title="All Caught Up"
                description="You have no notifications at this time."
              />
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary, COLORS.gold]}
              />
            }
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  notifItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifItemUnread: {
    backgroundColor: '#FFFCF7',
    borderColor: COLORS.gold,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  titleBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

export default NotificationsScreen;
