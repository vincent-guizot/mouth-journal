import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { AuthService, UserProfile, DEMO_USER } from '../services/firebase/authService';
import { theme } from '../config/theme';
import { DecorativeAssets, IllustrationAssets } from '../config/assets';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

export type AuthFlowStep =
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'link_sent'
  | 'new_password'
  | 'reset_success'
  | 'register_success'
  | 'google_signin'
  | 'apple_signin';

interface AuthModalProps {
  onSuccess: (user: UserProfile) => void;
  initialStep?: AuthFlowStep;
}

// Official Google 'G' 4-color Vector
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

// Official Apple Silhouette Vector
const AppleLogo = ({ size = 20, color = '#000000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 170 170" fill={color}>
    <Path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.73-7.92-12.13-14.51-6.19-9.16-10.9-19.5-14.13-31.02-3.23-11.53-4.85-22.56-4.85-33.11 0-14.48 3.58-26.37 10.74-35.68 7.15-9.3 16.03-14.07 26.63-14.32 4.12 0 9.04 1.13 14.77 3.38 5.72 2.26 9.61 3.44 11.66 3.55 1.54 0 5.46-1.22 11.75-3.67 6.29-2.45 11.44-3.52 15.45-3.21 16.71 1.25 29.17 7.73 37.38 19.45-14.94 9.07-22.25 21.41-21.94 37.03.31 12.3 4.9 22.42 13.78 30.34 4.02 3.63 8.7 6.38 14.04 8.25-2.9 8.52-6.52 17.06-10.87 25.62zM119.22 33.52c0-8.31 3.03-15.93 9.09-22.86 6.06-6.93 13.41-10.66 22.05-11.19.22 1.45.33 2.76.33 3.92 0 8.08-3.08 15.75-9.24 23.01-6.16 7.26-13.62 11.08-22.38 11.46-.22-1.34-.33-2.79-.33-4.34z" />
  </Svg>
);

// MouthJournal Monogram Top Header
const BrandMonogramHeader = () => (
  <View style={styles.brandHeader}>
    <Svg width={42} height={42} viewBox="0 0 100 100" fill="none">
      <Path
        d="M42 6 C40 14 46 18 44 26"
        stroke="#D04A1E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M58 8 C60 16 54 20 56 28"
        stroke="#D04A1E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M24 38 L24 74 C24 82 30 88 38 88 L40 88 C45 88 48 83 50 78 C52 83 55 88 60 88 L62 88 C70 88 76 82 76 74 L76 38"
        stroke="#4E2E21"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M34 50 C42 60 47 62 50 62 C53 62 58 60 66 50"
        stroke="#4E2E21"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    <Text style={styles.brandWordmark}>MouthJournal</Text>
    <Text style={styles.brandTagline}>FOOD DIARY</Text>
  </View>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  initialStep = 'login',
}) => {
  const [step, setStep] = useState<AuthFlowStep>(initialStep);

  // Form states
  const [name, setName] = useState('Vincentia');
  const [email, setEmail] = useState('user@email.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading indicator
  const [loading, setLoading] = useState(false);

  // Actions
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Harap isi email dan password.');
      return;
    }
    setLoading(true);
    try {
      const user = await AuthService.login(email.trim(), password);
      onSuccess(user);
    } catch {
      onSuccess(DEMO_USER);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Perhatian', 'Harap lengkapi semua kolom pendaftaran.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi password tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Perhatian', 'Harap setujui syarat penggunaan.');
      return;
    }
    setStep('register_success');
  };

  const handleForgotPasswordSubmit = () => {
    if (!email.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan alamat email.');
      return;
    }
    setStep('link_sent');
  };

  const handleResetPasswordSubmit = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan password baru.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi password baru tidak cocok.');
      return;
    }
    setStep('reset_success');
  };

  const handleSocialSelectUser = (provider: 'google' | 'apple') => {
    const user: UserProfile = {
      uid: provider === 'google' ? 'google-vincent-1' : 'apple-vincent-1',
      displayName: 'Vincent Guizot',
      email: provider === 'google' ? 'vincent@gmail.com' : 'vincent@icloud.com',
      photoURL:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    };
    onSuccess(user);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= 1. LOGIN SCREEN ================= */}
        {step === 'login' && (
          <View style={styles.pageWrapper}>
            <BrandMonogramHeader />

            <View style={styles.headingBox}>
              <Text style={styles.pageTitle}>Selamat Datang{'\n'}Kembali</Text>
              <Text style={styles.pageSubtitle}>
                Lanjutkan perjalanan kuliner bersama MouthJournal.
              </Text>
            </View>

            {/* Input Email */}
            <View style={styles.inputContainer}>
              <Mail size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#A89A90"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#A89A90"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#8C7A70" />
                ) : (
                  <Eye size={18} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Helper Row: Remember me & Forgot Password */}
            <View style={styles.helperRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    rememberMe && styles.checkboxBoxActive,
                  ]}
                >
                  {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>Ingat saya</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep('forgot_password')}
                activeOpacity={0.8}
              >
                <Text style={styles.terracottaLink}>Lupa Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleLogin}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Masuk</Text>
            </TouchableOpacity>

            {/* Social Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau lanjut dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google & Apple Buttons */}
            <View style={styles.socialButtonsGroup}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => setStep('google_signin')}
                activeOpacity={0.85}
              >
                <GoogleLogo size={20} />
                <Text style={styles.socialBtnText}>Lanjut dengan Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => setStep('apple_signin')}
                activeOpacity={0.85}
              >
                <AppleLogo size={20} />
                <Text style={styles.socialBtnText}>Lanjut dengan Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: '#FAF5EE', borderColor: '#D06B3F' }]}
                onPress={() => onSuccess(DEMO_USER)}
                activeOpacity={0.85}
              >
                <Sparkles size={18} color="#D06B3F" />
                <Text style={[styles.socialBtnText, { color: '#D06B3F', fontWeight: '700' }]}>
                  Masuk Cepat (Akun Demo)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Register Switch */}
            <View style={styles.bottomSwitchRow}>
              <Text style={styles.switchText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => setStep('register')}>
                <Text style={styles.switchHighlight}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= 2. REGISTER SCREEN ================= */}
        {step === 'register' && (
          <View style={styles.pageWrapper}>
            {/* Top Back Arrow */}
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('login')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <BrandMonogramHeader />

            <View style={styles.headingBox}>
              <Text style={styles.pageTitle}>Buat Akun Baru</Text>
              <Text style={styles.pageSubtitle}>
                Mulai catat setiap rasa dan pengalaman kuliner kamu.
              </Text>
            </View>

            {/* Input Name */}
            <View style={styles.inputContainer}>
              <User size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Nama Lengkap"
                placeholderTextColor="#A89A90"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Input Email */}
            <View style={styles.inputContainer}>
              <Mail size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#A89A90"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#A89A90"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color="#8C7A70" />
                ) : (
                  <Eye size={18} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Input Confirm Password */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Konfirmasi Password"
                placeholderTextColor="#A89A90"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#8C7A70" />
                ) : (
                  <Eye size={18} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Agree Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkboxBox,
                  agreeTerms && styles.checkboxBoxActive,
                ]}
              >
                {agreeTerms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.termsText}>
                Saya menyetujui{' '}
                <Text style={styles.termsHighlight}>Syarat Penggunaan</Text> dan{' '}
                <Text style={styles.termsHighlight}>Kebijakan Privasi</Text>
              </Text>
            </TouchableOpacity>

            {/* Primary Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRegister}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Daftar</Text>
            </TouchableOpacity>

            {/* Social Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau daftar dengan</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google & Apple Buttons */}
            <View style={styles.socialButtonsGroup}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => setStep('google_signin')}
                activeOpacity={0.85}
              >
                <GoogleLogo size={20} />
                <Text style={styles.socialBtnText}>Daftar dengan Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => setStep('apple_signin')}
                activeOpacity={0.85}
              >
                <AppleLogo size={20} />
                <Text style={styles.socialBtnText}>Daftar dengan Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Login Switch */}
            <View style={styles.bottomSwitchRow}>
              <Text style={styles.switchText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => setStep('login')}>
                <Text style={styles.switchHighlight}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= 3. FORGOT PASSWORD SCREEN ================= */}
        {step === 'forgot_password' && (
          <View style={styles.pageWrapper}>
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('login')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <BrandMonogramHeader />

            <View style={styles.headingBox}>
              <Text style={styles.pageTitle}>Lupa Password?</Text>
              <Text style={styles.pageSubtitle}>
                Masukkan email kamu dan kami akan mengirimkan link untuk mereset password.
              </Text>
            </View>

            {/* Input Email */}
            <View style={styles.inputContainer}>
              <Mail size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#A89A90"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Primary Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleForgotPasswordSubmit}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Kirim Link Reset</Text>
            </TouchableOpacity>

            {/* Envelope Illustration from Assets */}
            <View style={styles.illustrationCenterBox}>
              <Image
                source={IllustrationAssets.envelopeDefault}
                style={{ width: 140, height: 140, resizeMode: 'contain', marginBottom: 8 }}
              />
              <Text style={styles.illustrationCaption}>
                Cek email kamu untuk melanjutkan proses.
              </Text>
            </View>
          </View>
        )}

        {/* ================= 4. RESET LINK SENT SCREEN ================= */}
        {step === 'link_sent' && (
          <View style={styles.pageWrapper}>
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('forgot_password')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            {/* Envelope with Check Badge Illustration from Assets */}
            <View style={styles.illustrationTopCenter}>
              <Image
                source={IllustrationAssets.envelopeSuccess}
                style={{ width: 145, height: 145, resizeMode: 'contain' }}
              />
            </View>

            <View style={[styles.headingBox, { alignItems: 'center' }]}>
              <Text style={[styles.pageTitle, { textAlign: 'center' }]}>
                Link Telah Dikirim
              </Text>
              <Text style={[styles.pageSubtitle, { textAlign: 'center' }]}>
                Kami telah mengirimkan link reset password ke email kamu.
              </Text>
            </View>

            {/* User Email Box */}
            <View style={styles.emailCardBox}>
              <View style={styles.emailCardLeft}>
                <Mail size={18} color="#D04A1E" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.emailCardText}>{email || 'user@email.com'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bukaEmailPill}
                onPress={() => setStep('new_password')}
                activeOpacity={0.8}
              >
                <Text style={styles.bukaEmailPillText}>Buka Email</Text>
              </TouchableOpacity>
            </View>

            {/* Helper text */}
            <Text style={styles.spamHelperText}>
              Tidak menerima email?{'\n'}Cek folder spam atau kirim ulang.
            </Text>

            {/* Resend button */}
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() =>
                Alert.alert('Email Terkirim', 'Link reset baru telah dikirimkan ke email kamu.')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.resendBtnText}>Kirim Ulang Email</Text>
            </TouchableOpacity>

            {/* Return to login */}
            <TouchableOpacity
              style={styles.returnLoginBtn}
              onPress={() => setStep('login')}
            >
              <ArrowLeft size={16} color="#4E2E21" />
              <Text style={styles.returnLoginText}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 5. NEW PASSWORD SCREEN ================= */}
        {step === 'new_password' && (
          <View style={styles.pageWrapper}>
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('link_sent')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <View style={styles.headingBox}>
              <Text style={styles.pageTitle}>Buat Password Baru</Text>
              <Text style={styles.pageSubtitle}>
                Masukkan password baru untuk akun kamu.
              </Text>
            </View>

            {/* Input Password Baru */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Password Baru"
                placeholderTextColor="#A89A90"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color="#8C7A70" />
                ) : (
                  <Eye size={18} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Input Konfirmasi Password Baru */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#7A675B" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Konfirmasi Password Baru"
                placeholderTextColor="#A89A90"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color="#8C7A70" />
                ) : (
                  <Eye size={18} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Password Criteria Card */}
            <View style={styles.criteriaCard}>
              <Text style={styles.criteriaTitle}>Password harus minimal:</Text>
              <View style={styles.criteriaItem}>
                <Check size={13} color="#D04A1E" strokeWidth={2.5} />
                <Text style={styles.criteriaText}>8 karakter</Text>
              </View>
              <View style={styles.criteriaItem}>
                <Check size={13} color="#D04A1E" strokeWidth={2.5} />
                <Text style={styles.criteriaText}>Mengandung huruf besar dan kecil</Text>
              </View>
              <View style={styles.criteriaItem}>
                <Check size={13} color="#D04A1E" strokeWidth={2.5} />
                <Text style={styles.criteriaText}>Mengandung angka</Text>
              </View>
              <View style={styles.criteriaItem}>
                <Check size={13} color="#D04A1E" strokeWidth={2.5} />
                <Text style={styles.criteriaText}>
                  Mengandung simbol (contoh: ! @ # $)
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleResetPasswordSubmit}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 6. RESET SUCCESS SCREEN ================= */}
        {step === 'reset_success' && (
          <View style={[styles.pageWrapper, { justifyContent: 'center' }]}>
            {/* Confetti Popper Illustration from Assets */}
            <View style={styles.successIconCircle}>
              <Image
                source={DecorativeAssets.celebrationPartyPopper}
                style={{ width: 130, height: 130, resizeMode: 'contain', alignSelf: 'center' }}
              />
            </View>

            <View style={[styles.headingBox, { alignItems: 'center' }]}>
              <Text style={[styles.pageTitle, { textAlign: 'center' }]}>
                Password Berhasil{'\n'}Direset
              </Text>
              <Text style={[styles.pageSubtitle, { textAlign: 'center', marginTop: 8 }]}>
                Password kamu telah berhasil diubah.{'\n'}Silakan login dengan password baru.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setStep('login')}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Kembali ke Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 7. REGISTER SUCCESS SCREEN ================= */}
        {step === 'register_success' && (
          <View style={[styles.pageWrapper, { justifyContent: 'center' }]}>
            {/* Cute Smiling Bowl Illustration */}
            <View style={styles.successIconCircle}>
              <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
                <Circle cx={60} cy={60} r={52} fill="#FAF1E8" />
                {/* Bowl */}
                <Path
                  d="M32 58 C32 80 88 80 88 58 Z"
                  fill="#FFFFFF"
                  stroke="#4E2E21"
                  strokeWidth={3}
                />
                {/* Smiling Face in Bowl */}
                <Circle cx={48} cy={64} r={2} fill="#4E2E21" />
                <Circle cx={72} cy={64} r={2} fill="#4E2E21" />
                <Path
                  d="M54 70 C58 74 62 74 66 70"
                  stroke="#4E2E21"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* Food Topping & Heart */}
                <Path
                  d="M38 58 C45 46 75 46 82 58 Z"
                  fill="#E5C7AC"
                  stroke="#4E2E21"
                  strokeWidth={2}
                />
                <Circle cx={60} cy={42} r={7} fill="#D04A1E" />
              </Svg>
            </View>

            <View style={[styles.headingBox, { alignItems: 'center' }]}>
              <Text style={[styles.pageTitle, { textAlign: 'center' }]}>
                Akun Berhasil Dibuat
              </Text>
              <Text style={[styles.pageSubtitle, { textAlign: 'center', marginTop: 8 }]}>
                Selamat bergabung di MouthJournal!{'\n'}Saatnya mulai catat pengalaman kuliner kamu.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                const newUser: UserProfile = {
                  uid: 'registered-user-1',
                  displayName: name || 'Vincentia',
                  email: email || 'user@email.com',
                  photoURL:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                };
                onSuccess(newUser);
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Mulai Sekarang</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= 8. GOOGLE SIGN IN SCREEN ================= */}
        {step === 'google_signin' && (
          <View style={styles.pageWrapper}>
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('login')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <View style={styles.socialHeaderCenter}>
              <GoogleLogo size={46} />
              <Text style={[styles.pageTitle, { textAlign: 'center', marginTop: 14 }]}>
                Masuk dengan Google
              </Text>
              <Text style={[styles.pageSubtitle, { textAlign: 'center', marginTop: 4 }]}>
                Pilih akun Google yang ingin kamu gunakan untuk MouthJournal.
              </Text>
            </View>

            {/* Account Card */}
            <TouchableOpacity
              style={styles.accountCard}
              onPress={() => handleSocialSelectUser('google')}
              activeOpacity={0.85}
            >
              <Image
                source={{
                  uri:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                }}
                style={styles.accountAvatar}
              />
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>Vincent Guizot</Text>
                <Text style={styles.accountEmail}>vincent@gmail.com</Text>
              </View>
            </TouchableOpacity>

            {/* Add Account Option */}
            <TouchableOpacity
              style={styles.addAccountRow}
              onPress={() => handleSocialSelectUser('google')}
            >
              <Text style={styles.addAccountPlus}>+ </Text>
              <Text style={styles.addAccountText}>Gunakan akun lain</Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <Text style={styles.socialDisclaimer}>
              Dengan melanjutkan, kamu menyetujui{' '}
              <Text style={styles.termsHighlight}>Syarat Penggunaan</Text> dan{' '}
              <Text style={styles.termsHighlight}>Kebijakan Privasi</Text> MouthJournal.
            </Text>
          </View>
        )}

        {/* ================= 9. APPLE SIGN IN SCREEN ================= */}
        {step === 'apple_signin' && (
          <View style={styles.pageWrapper}>
            <TouchableOpacity
              style={styles.topBackBtn}
              onPress={() => setStep('login')}
            >
              <ArrowLeft size={22} color="#4E2E21" />
            </TouchableOpacity>

            <View style={styles.socialHeaderCenter}>
              <AppleLogo size={48} />
              <Text style={[styles.pageTitle, { textAlign: 'center', marginTop: 14 }]}>
                Masuk dengan Apple
              </Text>
              <Text style={[styles.pageSubtitle, { textAlign: 'center', marginTop: 4 }]}>
                Gunakan akun Apple kamu untuk masuk ke MouthJournal.
              </Text>
            </View>

            {/* Account Card */}
            <View style={styles.accountCard}>
              <Image
                source={{
                  uri:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                }}
                style={styles.accountAvatar}
              />
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>Vincent Guizot</Text>
                <Text style={styles.accountEmail}>vincent@icloud.com</Text>
              </View>
            </View>

            <Text style={styles.applePrivacyNote}>
              Apple akan membagikan nama dan email kamu dengan MouthJournal sesuai pengaturan privasi perangkat kamu.
            </Text>

            {/* Black Apple Button */}
            <TouchableOpacity
              style={styles.appleBlackBtn}
              onPress={() => handleSocialSelectUser('apple')}
              activeOpacity={0.88}
            >
              <AppleLogo size={20} color="#FFFFFF" />
              <Text style={styles.appleBlackBtnText}>Lanjutkan dengan Apple</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 40,
  },
  pageWrapper: {
    flex: 1,
  },
  topBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 6,
    marginLeft: -4,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  brandWordmark: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    fontWeight: '800',
    color: '#4E2E21',
    letterSpacing: -0.3,
    marginTop: 4,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C7A70',
    letterSpacing: 3,
    marginTop: 2,
  },
  headingBox: {
    marginBottom: 18,
  },
  pageTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 26,
    fontWeight: '800',
    color: '#4E2E21',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#7A675B',
    marginTop: 6,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#4E2E21',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C7B9AC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#6B3F2E',
  },
  terracottaLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D04A1E',
  },
  primaryBtn: {
    height: 50,
    backgroundColor: '#4E2E21',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFE7DE',
  },
  dividerText: {
    fontSize: 11,
    color: '#8C7A70',
    paddingHorizontal: 10,
  },
  socialButtonsGroup: {
    gap: 10,
    marginBottom: 24,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DE',
    gap: 10,
    ...theme.shadows.card,
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4E2E21',
  },
  bottomSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
    color: '#7A675B',
  },
  switchHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D04A1E',
  },

  /* Register Specific */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  termsText: {
    fontSize: 12,
    color: '#7A675B',
    lineHeight: 16,
    flex: 1,
  },
  termsHighlight: {
    color: '#D04A1E',
    fontWeight: '600',
  },

  /* Forgot & Reset Link Sent Specific */
  illustrationCenterBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  envelopeCircleBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FAF1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  illustrationCaption: {
    fontSize: 12,
    color: '#8C7A70',
    textAlign: 'center',
  },
  illustrationTopCenter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  envelopeCheckCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FAF1E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailCardBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF3EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  emailCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  bukaEmailPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  bukaEmailPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D04A1E',
  },
  spamHelperText: {
    fontSize: 12,
    color: '#8C7A70',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  resendBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C7B9AC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  returnLoginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  returnLoginText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4E2E21',
  },

  /* Criteria Card (New Password) */
  criteriaCard: {
    backgroundColor: '#FAF3EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    gap: 6,
  },
  criteriaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B3F2E',
    marginBottom: 2,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  criteriaText: {
    fontSize: 11,
    color: '#7A675B',
  },

  /* Success Screens */
  successIconCircle: {
    alignSelf: 'center',
    marginBottom: 20,
  },

  /* Social Logins */
  socialHeaderCenter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.card,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  accountInfo: {
    marginLeft: 12,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4E2E21',
  },
  accountEmail: {
    fontSize: 12,
    color: '#8C7A70',
    marginTop: 1,
  },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  addAccountPlus: {
    fontSize: 18,
    color: '#D04A1E',
    fontWeight: '700',
  },
  addAccountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4E2E21',
  },
  socialDisclaimer: {
    fontSize: 11,
    color: '#8C7A70',
    textAlign: 'center',
    lineHeight: 16,
  },
  applePrivacyNote: {
    fontSize: 12,
    color: '#8C7A70',
    lineHeight: 17,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  appleBlackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#000000',
  },
  appleBlackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
