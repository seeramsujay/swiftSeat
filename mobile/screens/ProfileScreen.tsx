import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Screen } from '../components/Screen';
import { Theme } from '../constants/Theme';
import { GlassContainer } from '../components/GlassContainer';
import { QrCode, Settings, Bell, CircleCheck } from 'lucide-react-native';

const ProfileScreen = () => {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Profile</Text>
          <Settings size={24} color={Theme.colors.textVariant} />
        </View>

        <View style={styles.memberCard}>
          <View style={styles.avatarArea}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>M</Text>
             </View>
             <View style={styles.verifiedBadge}>
               <CircleCheck size={16} color={Theme.colors.tertiary} fill={Theme.colors.background} />
             </View>
          </View>
          <Text style={styles.userName}>Marcus Thorne</Text>
          <Text style={styles.userTier}>Platinum Member</Text>
        </View>

        <Text style={styles.sectionTitle}>Digital Ticket</Text>
        <GlassContainer style={styles.ticketCard}>
          <View style={styles.ticketTop}>
            <View>
              <Text style={styles.eventTitle}>Lions vs. Eagles</Text>
              <Text style={styles.eventDate}>Oct 24 • 7:00 PM</Text>
            </View>
            <View style={styles.seatInfo}>
              <Text style={styles.seatLabel}>SECTION</Text>
              <Text style={styles.seatValue}>204</Text>
            </View>
          </View>
          
          <View style={styles.qrArea}>
            <View style={styles.qrSquare}>
              <QrCode size={120} color={Theme.colors.background} />
            </View>
            <Text style={styles.qrInstruction}>Scan at Gate A</Text>
          </View>

          <View style={styles.ticketBottom}>
            <Text style={styles.walletButton}>Add to Google Wallet</Text>
          </View>
        </GlassContainer>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <GlassContainer style={styles.settingsItem}>
          <Bell size={20} color={Theme.colors.primary} />
          <Text style={styles.settingsText}>Smart Alerts</Text>
          <View style={styles.toggleActive} />
        </GlassContainer>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  header: {
    ...Theme.typography.display,
    color: Theme.colors.text,
  },
  memberCard: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  avatarArea: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Theme.typography.display,
    fontSize: 32,
    color: Theme.colors.onPrimary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  userName: {
    ...Theme.typography.headline,
    color: Theme.colors.text,
  },
  userTier: {
    ...Theme.typography.label,
    color: Theme.colors.primary,
    marginTop: 4,
  },
  sectionTitle: {
    ...Theme.typography.label,
    color: Theme.colors.textVariant,
    marginBottom: Theme.spacing.md,
  },
  ticketCard: {
    padding: 0,
    marginBottom: Theme.spacing.xl,
  },
  ticketTop: {
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  eventTitle: {
    ...Theme.typography.title,
    color: Theme.colors.text,
  },
  eventDate: {
    ...Theme.typography.body,
    fontSize: 14,
    color: Theme.colors.textVariant,
    marginTop: 4,
  },
  seatInfo: {
    alignItems: 'flex-end',
  },
  seatLabel: {
    ...Theme.typography.label,
    fontSize: 10,
    color: Theme.colors.textVariant,
  },
  seatValue: {
    ...Theme.typography.headline,
    color: Theme.colors.primary,
  },
  qrArea: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qrSquare: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: Theme.roundness.md,
  },
  qrInstruction: {
    ...Theme.typography.label,
    marginTop: Theme.spacing.md,
    color: Theme.colors.textVariant,
  },
  ticketBottom: {
    padding: Theme.spacing.md,
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceHigh,
  },
  walletButton: {
    ...Theme.typography.title,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  settingsText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  toggleActive: {
    width: 32,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.tertiary,
  },
});

export default ProfileScreen;
