import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, Calendar, PlusCircle, X } from 'lucide-react-native';
import { VisitedPlace } from '../../profile/profileAggregation';
import { theme } from '../../../config/theme';

interface MemoryMapCardProps {
  place: VisitedPlace;
  onClose: () => void;
  onViewJournals: (place: VisitedPlace) => void;
  onAddJournal: (place: VisitedPlace) => void;
}

export const MemoryMapCard: React.FC<MemoryMapCardProps> = ({
  place,
  onClose,
  onViewJournals,
  onAddJournal,
}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color="#8A7A6D" />
      </TouchableOpacity>

      <View style={styles.contentRow}>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <MapPin size={24} color={theme.colors.terracotta} />
          </View>
        )}

        <View style={styles.infoCol}>
          <View style={styles.badgesRow}>
            <View style={styles.ratingBadge}>
              <Star size={11} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.ratingText}>{place.averageRating.toFixed(1)}</Text>
            </View>
            <View style={styles.visitBadge}>
              <Text style={styles.visitText}>{place.visitCount}x dikunjungi</Text>
            </View>
          </View>

          <Text style={styles.placeName} numberOfLines={1}>
            {place.placeName}
          </Text>

          {place.placeAddress ? (
            <Text style={styles.addressText} numberOfLines={1}>
              {place.placeAddress}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Calendar size={12} color="#8A7A6D" />
            <Text style={styles.metaText}>
              Terakhir: {new Date(place.lastVisited).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => onViewJournals(place)}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Lihat Ulasan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onAddJournal(place)}
          activeOpacity={0.8}
        >
          <PlusCircle size={15} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Catat Lagi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#2B2321',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3EDE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FAF5EE',
  },
  placeholderThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FBEFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D04A1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  visitBadge: {
    backgroundColor: '#F3EDE4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visitText: {
    color: '#4E2E21',
    fontSize: 11,
    fontWeight: '600',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2321',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#8A7A6D',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE4',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#D04A1E',
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
