import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const logoSource = require('../assets/forge-india-logo.jpg');

/**
 * Circular Official Logo Badge Component (for Login & Prominent Branding)
 */
export function ForgeIndiaLogoCircle({ size = 110, style }) {
  return (
    <View
      style={[
        styles.circleShadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2
        },
        style
      ]}
    >
      <Image
        source={logoSource}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2
        }}
        resizeMode="cover"
      />
    </View>
  );
}

/**
 * Square / Rounded Emblem Component
 */
export function ForgeIndiaLogoEmblem({ size = 40, style, rounded = false }) {
  const rad = rounded ? size / 2 : Math.max(6, Math.round(size * 0.2));
  return (
    <View
      style={[
        styles.emblemShadow,
        {
          width: size,
          height: size,
          borderRadius: rad
        },
        style
      ]}
    >
      <Image
        source={logoSource}
        style={{
          width: size,
          height: size,
          borderRadius: rad
        }}
        resizeMode="cover"
      />
    </View>
  );
}

/**
 * Top Navbar & Drawer Brand Header
 * Matches web Admin UI: Official Logo Image + "FORGE INDIA CONNECT" wordmark
 */
export function ForgeIndiaBrandHeader({ size = 36 }) {
  return (
    <View style={styles.brandRow}>
      <View
        style={[
          styles.headerLogoContainer,
          {
            width: size,
            height: size,
            borderRadius: 8
          }
        ]}
      >
        <Image
          source={logoSource}
          style={{
            width: size,
            height: size,
            borderRadius: 8
          }}
          resizeMode="cover"
        />
      </View>

      <View style={styles.brandTextCol}>
        <View style={styles.brandWordRow}>
          <Text style={styles.wordForge}>FORGE </Text>
          <Text style={styles.wordIndia}>INDIA</Text>
        </View>
        <Text style={styles.wordConnect}>CONNECT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circleShadow: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#FAB800'
  },
  emblemShadow: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#FAB800'
  },
  headerLogoContainer: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: '#FAB800',
    flexShrink: 0
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  brandTextCol: {
    justifyContent: 'center'
  },
  brandWordRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  wordForge: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0047BA',
    letterSpacing: 0.5
  },
  wordIndia: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FAB800',
    letterSpacing: 0.5
  },
  wordConnect: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0047BA',
    letterSpacing: 2.2,
    marginTop: 1
  }
});

export default ForgeIndiaBrandHeader;
