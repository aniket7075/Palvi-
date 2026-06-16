import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stateService } from '../services/stateService';
import LayoutWrapper from '../components/LayoutWrapper';
import Icon from '../components/Icon';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const storedEmail = await AsyncStorage.getItem('email');
      if (storedEmail) {
        setEmail(storedEmail);
        const currentUser = stateService.getCurrentUser(storedEmail);
        setUser(currentUser);
        if (currentUser) {
          setMobileNumber(currentUser.mobileNumber || '');
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleUpdateContact = () => {
    setError('');
    setSuccess('');
    try {
      stateService.updateProfileMobile(email, mobileNumber);
      setSuccess('Contact details updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update contact detail.');
    }
  };

  const handleChangePassword = () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      stateService.changePassword(email, oldPassword, newPassword);
      setSuccess('Account password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    }
  };

  if (loading) {
    return (
      <LayoutWrapper title="My Profile">
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#146e4e" />
        </View>
      </LayoutWrapper>
    );
  }

  if (!user) return null;

  return (
    <LayoutWrapper title="My Profile">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Profile Avatar Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileRole}>
            {user.role === 'ADMIN' ? 'Administrator' : 'Outlet Manager'}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successAlert}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        {/* Personal info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.cardDivider} />

          <Text style={styles.formLabel}>Email Address</Text>
          <View style={styles.displayBox}>
            <Text style={styles.displayText}>{user.email}</Text>
          </View>

          <Text style={styles.formLabel}>Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="+91 9999999999"
              placeholderTextColor="#8c6e65"
              keyboardType="phone-pad"
            />
            <TouchableOpacity onPress={handleUpdateContact} style={styles.updateBtn}>
              <Text style={styles.updateBtnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security password change card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security Settings</Text>
          <View style={styles.cardDivider} />

          <Text style={styles.formLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            placeholder="Enter current password"
            placeholderTextColor="#8c6e65"
          />

          <Text style={styles.formLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Min 6 characters"
            placeholderTextColor="#8c6e65"
          />

          <Text style={styles.formLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Repeat new password"
            placeholderTextColor="#8c6e65"
          />

          <TouchableOpacity onPress={handleChangePassword} style={styles.changePasswordBtn}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="lock" color="#ffffff" size={16} />
              <Text style={[styles.changePasswordBtnText, { marginLeft: 8 }]}>Change Account Password</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Social Media Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect & Share</Text>
          <View style={styles.cardDivider} />
          
          <Text style={styles.socialDesc}>
            *आपल्या सेवेत शुद्ध शाकाहारी चवीचा नवा बहर... म्हणजेच हॉटेल पालवी..!! 🌿*
          </Text>
          <Text style={styles.socialAddress}>
            आमचा पत्ता : मुख्य शाखा | मिरज माधवनगर रोड, भारती हॉस्पिटल पाठीमागे, मिरज.
          </Text>

          <View style={styles.socialButtonsRow}>
            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#e1306c' }]}
              onPress={() => Linking.openURL('https://www.instagram.com/hotelpalvi.sangli/')}
            >
              <Text style={styles.socialBtnText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#1877f2' }]}
              onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=100064920224482')}
            >
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialBtn, { backgroundColor: '#ff0000' }]}
              onPress={() => Linking.openURL('https://www.youtube.com/channel/UCFM10ZtibGtegNdrakZ2iKg')}
            >
              <Text style={styles.socialBtnText}>YouTube</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.shareAppBtn}
            onPress={() => Share.share({
              message: `नमस्कार 🙏\n\n*आपल्या सेवेत शुद्ध शाकाहारी चवीचा नवा बहर... म्हणजेच हॉटेल पालवी..!! 🌿*\n\nआमच्या लेटेस्ट डिजिटल मीडियाच्या माध्यमातून अपडेट्स आणि स्पेशल डिशेस पाहण्यासाठी आत्ताच फॉलो करा 👇😍\n\nInstagram:\nhttps://www.instagram.com/hotelpalvi.sangli/\n\nFacebook:\nhttps://www.facebook.com/profile.php?id=100064920224482\n\nYouTube:\nhttps://www.youtube.com/channel/UCFM10ZtibGtegNdrakZ2iKg\n\nआमचा पत्ता : मुख्य शाखा | मिरज माधवनगर रोड, भारती हॉस्पिटल पाठीमागे, मिरज.`
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.shareAppBtnText}>Share Greeting Message</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#146e4e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3d251e',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 13,
    color: '#8c6e65',
    fontWeight: '700',
  },
  errorAlert: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#0d4e37',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  successAlert: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#146e4e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#3d251e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3d251e',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#ebdcd3',
    marginVertical: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d251e',
    marginBottom: 6,
  },
  displayBox: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#fdfbfa',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  displayText: {
    fontSize: 14,
    color: '#8c6e65',
    fontWeight: '700',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ebdcd3',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#3d251e',
    marginBottom: 16,
  },
  updateBtn: {
    width: 80,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  updateBtnText: {
    fontSize: 13,
    color: '#146e4e',
    fontWeight: '800',
  },
  changePasswordBtn: {
    height: 44,
    backgroundColor: '#146e4e',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  changePasswordBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  socialDesc: {
    fontSize: 13,
    color: '#3d251e',
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 18,
  },
  socialAddress: {
    fontSize: 11,
    color: '#8c6e65',
    marginBottom: 16,
    lineHeight: 16,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  socialBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  shareAppBtn: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#146e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareAppBtnText: {
    color: '#146e4e',
    fontWeight: '800',
    fontSize: 13,
  },
});
