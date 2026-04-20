import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../components/Screen';
import { Theme } from '../constants/Theme';
import { GlassContainer } from '../components/GlassContainer';
import { Utensils, Ticket, Clock, ChevronRight } from 'lucide-react-native';

const OrdersScreen = () => {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Your Orders</Text>

        <Text style={styles.sectionTitle}>Active Vouchers</Text>
        <GlassContainer style={styles.voucherCard}>
          <View style={styles.voucherMain}>
            <View style={styles.iconCircle}>
              <Ticket size={24} color={Theme.colors.secondary} />
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherTitle}>$10 Gift Voucher</Text>
              <Text style={styles.voucherCode}>CODE: SWIFT-FLY-2024</Text>
            </View>
          </View>
          <View style={styles.voucherFooter}>
            <Text style={styles.voucherExpiry}>Expires in 4 hours</Text>
          </View>
        </GlassContainer>

        <Text style={styles.sectionTitle}>Recent Concessions</Text>
        <View style={styles.orderList}>
          {[
            { name: 'Prime Pit BBQ', items: '2x Brisket Sliders', status: 'In Queue', time: '5m wait' },
            { name: 'Stadium Brews', items: '1x Craft IPA', status: 'Ready', time: 'Now' },
          ].map((order, i) => (
            <TouchableOpacity key={i} style={styles.orderItem}>
              <GlassContainer style={styles.orderCard} intensity={50}>
                <View style={styles.orderRow}>
                  <View style={styles.orderMain}>
                    <Text style={styles.orderName}>{order.name}</Text>
                    <Text style={styles.orderItems}>{order.items}</Text>
                  </View>
                  <View style={styles.orderStatusArea}>
                    <Text style={[
                      styles.orderStatus, 
                      { color: order.status === 'Ready' ? Theme.colors.tertiary : Theme.colors.primary }
                    ]}>
                      {order.status}
                    </Text>
                    <View style={styles.orderTime}>
                      <Clock size={12} color={Theme.colors.textVariant} />
                      <Text style={styles.timeText}>{order.time}</Text>
                    </View>
                  </View>
                </View>
              </GlassContainer>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Explore Concessions</Text>
        <GlassContainer style={styles.exploreCard}>
          <Utensils size={20} color={Theme.colors.primary} />
          <Text style={styles.exploreText}>View full concession menu</Text>
          <ChevronRight size={20} color={Theme.colors.textVariant} />
        </GlassContainer>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    ...Theme.typography.display,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.label,
    color: Theme.colors.textVariant,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  voucherCard: {
    padding: 0,
    backgroundColor: 'rgba(255, 181, 159, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 181, 159, 0.2)',
  },
  voucherMain: {
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 181, 159, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    ...Theme.typography.title,
    color: Theme.colors.secondary,
  },
  voucherCode: {
    ...Theme.typography.label,
    fontSize: 10,
    color: Theme.colors.textVariant,
    marginTop: 4,
  },
  voucherFooter: {
    padding: Theme.spacing.sm,
    backgroundColor: 'rgba(255, 181, 159, 0.05)',
    alignItems: 'center',
  },
  voucherExpiry: {
    ...Theme.typography.label,
    fontSize: 9,
    color: Theme.colors.secondary,
  },
  orderList: {
    gap: Theme.spacing.md,
  },
  orderItem: {
    width: '100%',
  },
  orderCard: {
    padding: Theme.spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMain: {
    flex: 1,
  },
  orderName: {
    ...Theme.typography.title,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  orderItems: {
    ...Theme.typography.body,
    fontSize: 14,
    color: Theme.colors.textVariant,
  },
  orderStatusArea: {
    alignItems: 'flex-end',
  },
  orderStatus: {
    ...Theme.typography.label,
    marginBottom: 4,
  },
  orderTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...Theme.typography.label,
    fontSize: 10,
    color: Theme.colors.textVariant,
  },
  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
  },
  exploreText: {
    flex: 1,
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
});

export default OrdersScreen;
