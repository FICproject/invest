import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FORGE CONNECT</Text>
        </View>
        <Text style={styles.title}>Admin Mobile App</Text>
        <Text style={styles.subtitle}>Connected to Backend on Port 5000</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>● React Native CLI Active</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0047BA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  badge: {
    backgroundColor: '#FAB800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16
  },
  badgeText: {
    color: '#0047BA',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20
  },
  statusBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  statusText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13
  }
});

