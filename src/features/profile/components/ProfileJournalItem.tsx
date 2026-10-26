import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Star, MapPin, ChevronRight } from 'lucide-react-native';
import { DiaryEntry } from '../../../types/diary';
import { theme } from '../../../config/theme';

interface ProfileJournalItemProps {
  journal: DiaryEntry;
  onPress: () => void;
}

export const ProfileJournalItem: React.FC<ProfileJournalItemProps> = ({
  journal,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Photo Row */}
      {journal.photoUrls && journal.photoUrls.length > 0 && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: journal.photoUrls[0] }}
            style={styles.mainPhoto}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Info Block */}
      <View style={styles.infoBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {journal.placeName}
          </Text>
          <View style={styles.ratingBadge}>
            <Star size={11} color="#F39A28" fill="#F39A28" />
            <Text style={styles.ratingText}>{journal.overallRating}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={11} color="#D04A1E" />
          <Text style={styles.addressText} numberOfLines={1}>
            {journal.placeAddress}
          </Text>
        </View>

        <Text style={styles.reviewSnippet} numberOfLines={2}>
          {journal.reviewText}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.dateText}>
            {new Date(journal.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          {journal.totalSpent > 0 && (
            <Text style={styles.spentText}>
              Rp {journal.totalSpent.toLocaleString('id-ID')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECE6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  photoContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#FAF5EE',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  infoBlock: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C1E',
    flex: 1,
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  addressText: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  reviewSnippet: {
    fontSize: 12,
    color: '#6B5749',
    marginTop: 6,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFEB',
  },
  dateText: {
    fontSize: 10,
    color: '#8A7A6D',
  },
  spentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D04A1E',
  },
});
