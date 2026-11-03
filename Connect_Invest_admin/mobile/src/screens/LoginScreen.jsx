import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, Server, Check } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getApiHost, setApiHost } from '../services/api';
import { ForgeIndiaLogoCircle, ForgeIndiaLogoEmblem } from '../components/ForgeIndiaLogo';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    getApiHost().then(setServerUrl);
  }, []);

  const handleLogin = async () => {
    const cleanEmail = email ? email.trim() : '';
    if (!cleanEmail || !password) {
      Alert.alert('Required', 'Please enter your administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(cleanEmail, password);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Unable to authenticate with backend server.';
      Alert.alert('Login Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@connectinvest.com');
    setPassword('AdminPassword123!');
  };

  const handleSaveServer = async () => {
    try {
      await setApiHost(serverUrl);
      Alert.alert('Saved', `Backend endpoint set to: ${serverUrl}/api/v1`);
      setShowServerConfig(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update server endpoint');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Card - Replicating Web Login Card */}
        <View style={styles.card}>
          {/* Company Official Logo Emblem */}
          <View style={styles.logoCenterWrapper}>
            <ForgeIndiaLogoCircle size={110} />
          </View>

          {/* Title & Subtitle */}
          <View style={styles.titleSection}>
            <Text style={styles.cardTitle}>Admin Operations Portal</Text>
            <Text style={styles.cardSubtitle}>
              Single-Admin Operations Console • PRD v1.0
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Field with Left Icon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Administrator Email</Text>
              <View style={styles.inputBox}>
                <Mail size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="admin@connectinvest.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field with Left Icon & Eye Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputBox}>
                <Lock size={18} color="#94A3B8" style={styles.inputIconLeft} />
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="AdminPassword123!"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginBtnText}>Sign In to Admin Console</Text>
              )}
            </TouchableOpacity>

            {/* Quick Fill Admin Credentials */}
            <TouchableOpacity
              onPress={handleFillAdmin}
              style={{ alignItems: 'center', marginTop: 10, paddingVertical: 6 }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0047BA' }}>
                Fill Admin Credentials
              </Text>
            </TouchableOpacity>

            {/* Server Config Switcher */}
            <TouchableOpacity
              onPress={() => setShowServerConfig(!showServerConfig)}
              style={styles.serverConfigToggle}
              activeOpacity={0.7}
            >
              <Server size={13} color="#64748B" />
              <Text style={styles.serverConfigToggleText}>
                {showServerConfig ? 'Hide Host Endpoint Settings' : 'Configure Backend Host IP'}
              </Text>
            </TouchableOpacity>

            {/* Expandable Server Config Box */}
            {showServerConfig && (
              <View style={styles.serverBox}>
                <Text style={styles.serverHelp}>
                  • Android Emulator: http://10.0.2.2:5000{'\n'}
                  • USB Cable: http://localhost:5000 (run adb reverse){'\n'}
                  • Wi-Fi Device: http://YOUR_PC_IP:5000
                </Text>
                <TextInput
                  style={styles.serverInput}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="http://10.0.2.2:5000"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={handleSaveServer} style={styles.saveHostBtn} activeOpacity={0.8}>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.saveHostBtnText}>Save Server Host</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.pageFooter}>
          Protected by Single-Admin preparation & approval safeguards
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  logoCenterWrapper: {
    marginBottom: 12
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  wordmarkForge: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0047BA',
    letterSpacing: 0.5
  },
  wordmarkIndia: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FAB800',
    letterSpacing: 0.5
  },
  wordmarkConnect: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0047BA',
    letterSpacing: 3,
    marginTop: 2,
    marginBottom: 16
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 22
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3
  },
  formContainer: {
    width: '100%',
    gap: 16
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  inputIconLeft: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A'
  },
  eyeBtn: {
    padding: 6
  },
  loginBtn: {
    backgroundColor: '#0047BA',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#0047BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  loginBtnDisabled: {
    opacity: 0.7
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  serverConfigToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4
  },
  serverConfigToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  serverBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  serverHelp: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 8
  },
  serverInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 8
  },
  saveHostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 34,
    borderRadius: 8,
    gap: 6
  },
  saveHostBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  pageFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20
  }
});
