import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import { Star, X, Share2, Copy, Check, Sparkles, Utensils, Heart } from 'lucide-react-native';
import { Journal } from '../../../models/journal';

interface ShareStoryCardModalProps {
  visible: boolean;
  journal: Journal;
  onClose: () => void;
}

type AspectRatio = 'story' | 'square';

export const ShareStoryCardModal: React.FC<ShareStoryCardModalProps> = ({
  visible,
  journal,
  onClose,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('story');
  const [copied, setCopied] = useState(false);

  const heroPhoto = journal.photoUrls[0];
  const dateFormatted = new Date(journal.visitedAt || journal.createdAt).toLocaleDateString(
    'id-ID',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const recommendedDishes = journal.menuItems
    .filter((m) => m.isRecommended)
    .map((m) => m.name);

  // Formatted text message for sharing
  const shareMessage = [
    `✨ MouthJournal Review: ${journal.placeName}`,
    journal.placeAddress ? `📍 ${journal.placeAddress}` : '',
    `⭐ Rating Keseluruhan: ${journal.overallRating.toFixed(1)} / 5.0`,
    `• Rasa: ${journal.criteriaRating.taste} ⭐`,
    `• Suasana: ${journal.criteriaRating.ambiance} ⭐`,
    `• Pelayanan: ${journal.criteriaRating.service} ⭐`,
    `• Harga: ${journal.criteriaRating.price} ⭐`,
    recommendedDishes.length > 0 ? `\n🍽️ Menu Rekomendasi: ${recommendedDishes.join(', ')}` : '',
    journal.reviewText ? `\n💬 "${journal.reviewText}"` : '',
    `\n📅 Dikunjungi: ${dateFormatted}`,
    `\nDicatat dengan MouthJournal — Buku Harian Kuliner Pribadi`,
  ]
    .filter(Boolean)
    .join('\n');

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Ulasan Kuliner: ${journal.placeName}`,
        message: shareMessage,
        url: heroPhoto || undefined,
      });
    } catch {
      // User dismissed share dialog
    }
  };

  const handleCopyText = async () => {
    try {
      await Share.share({
        title: `Salin Ulasan`,
        message: shareMessage,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // dismissed
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Kartu Cerita Kuliner</Text>
              <Text style={styles.sheetSubtitle}>Siap dibagikan ke teman atau media sosial</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#4E2E21" />
            </TouchableOpacity>
          </View>

          {/* Aspect Ratio Selector */}
          <View style={styles.ratioSelector}>
            <TouchableOpacity
              style={[styles.ratioChip, aspectRatio === 'story' && styles.ratioChipActive]}
              onPress={() => setAspectRatio('story')}
            >
              <Text
                style={[
                  styles.ratioChipText,
                  aspectRatio === 'story' && styles.ratioChipTextActive,
                ]}
              >
                Story (9:16)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratioChip, aspectRatio === 'square' && styles.ratioChipActive]}
              onPress={() => setAspectRatio('square')}
            >
              <Text
                style={[
                  styles.ratioChipText,
                  aspectRatio === 'square' && styles.ratioChipTextActive,
                ]}
              >
                Square (1:1)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card Preview Container */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.storyCard,
                aspectRatio === 'story' ? styles.cardStory : styles.cardSquare,
              ]}
            >
              {/* Card Header Branding */}
              <View style={styles.cardHeader}>
                <View style={styles.brandBadge}>
                  <Sparkles size={12} color="#D04A1E" />
                  <Text style={styles.brandText}>MOUTHJOURNAL</Text>
                </View>
                <Text style={styles.cardDate}>{dateFormatted}</Text>
              </View>

              {/* Card Photo (if available) */}
              {heroPhoto ? (
                <View style={styles.cardPhotoContainer}>
                  <Image source={{ uri: heroPhoto }} style={styles.cardPhoto} resizeMode="cover" />
                  <View style={styles.categoryBadgeOverlay}>
                    <Text style={styles.categoryBadgeText}>
                      {journal.subCategoryLabel || journal.subCategory}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Place Name & Rating */}
              <View style={styles.cardBody}>
                <View style={styles.placeHeaderRow}>
                  <View style={styles.placeTitleCol}>
                    <Text style={styles.placeName} numberOfLines={2}>
                      {journal.placeName}
                    </Text>
                    {journal.placeAddress ? (
                      <Text style={styles.placeAddress} numberOfLines={1}>
                        {journal.placeAddress}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.ratingCircle}>
                    <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.ratingCircleScore}>
                      {journal.overallRating.toFixed(1)}
                    </Text>
                  </View>
                </View>

                {/* 4 Criteria Mini Grid */}
                <View style={styles.criteriaGrid}>
                  <View style={styles.criteriaPill}>
                    <Text style={styles.criteriaLabel}>Rasa</Text>
                    <Text style={styles.criteriaValue}>{journal.criteriaRating.taste} ⭐</Text>
                  </View>
                  <View style={styles.criteriaPill}>
                    <Text style={styles.criteriaLabel}>Suasana</Text>
                    <Text style={styles.criteriaValue}>{journal.criteriaRating.ambiance} ⭐</Text>
                  </View>
                  <View style={styles.criteriaPill}>
                    <Text style={styles.criteriaLabel}>Pelayanan</Text>
                    <Text style={styles.criteriaValue}>{journal.criteriaRating.service} ⭐</Text>
                  </View>
                  <View style={styles.criteriaPill}>
                    <Text style={styles.criteriaLabel}>Harga</Text>
                    <Text style={styles.criteriaValue}>{journal.criteriaRating.price} ⭐</Text>
                  </View>
                </View>

                {/* Recommended Menu Item Tag */}
                {recommendedDishes.length > 0 && (
                  <View style={styles.dishesRow}>
                    <Utensils size={13} color="#D04A1E" />
                    <Text style={styles.dishesText} numberOfLines={1}>
                      Favorit: {recommendedDishes.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Review Text Quote */}
                {journal.reviewText ? (
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteText} numberOfLines={aspectRatio === 'story' ? 4 : 2}>
                      &ldquo;{journal.reviewText}&rdquo;
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Card Footer Watermark */}
              <View style={styles.cardFooter}>
                <Heart size={11} color="#8A7A6D" />
                <Text style={styles.footerText}>Buku Harian Kuliner Pribadi</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopyText}
              activeOpacity={0.8}
            >
              {copied ? <Check size={16} color="#4E2E21" /> : <Copy size={16} color="#4E2E21" />}
              <Text style={styles.copyBtnText}>{copied ? 'Tersalin!' : 'Salin Teks'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sharePrimaryBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.sharePrimaryBtnText}>Bagikan Ulasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF5EE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DE',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2321',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFE7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FAF5EE',
  },
  ratioChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  ratioChipActive: {
    backgroundColor: '#D04A1E',
    borderColor: '#D04A1E',
  },
  ratioChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6461',
  },
  ratioChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  storyCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#2B2321',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  cardStory: {
    minHeight: 440,
  },
  cardSquare: {
    minHeight: 340,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBEFEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D04A1E',
    letterSpacing: 0.8,
  },
  cardDate: {
    fontSize: 11,
    color: '#8A7A6D',
  },
  cardPhotoContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#FAF5EE',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(43, 35, 33, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
  },
  placeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  placeTitleCol: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2321',
    lineHeight: 22,
  },
  placeAddress: {
    fontSize: 12,
    color: '#8A7A6D',
    marginTop: 2,
  },
  ratingCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D04A1E',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratingCircleScore: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  criteriaGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  criteriaPill: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  criteriaLabel: {
    fontSize: 10,
    color: '#8A7A6D',
    marginBottom: 2,
  },
  criteriaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3D2C1E',
  },
  dishesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  dishesText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D04A1E',
    flex: 1,
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#D04A1E',
    paddingLeft: 10,
    marginVertical: 4,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#554A43',
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE4',
  },
  footerText: {
    fontSize: 10,
    color: '#8A7A6D',
    fontWeight: '500',
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E2E21',
  },
  sharePrimaryBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#D04A1E',
  },
  sharePrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
