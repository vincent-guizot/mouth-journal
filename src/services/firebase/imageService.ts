import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../../config/firebase';

export class ImageService {
  /**
   * Helper alias untuk mengambil gambar dari galeri
   */
  static async pickImage(): Promise<string | null> {
    return this.pickImageFromGallery();
  }

  /**
   * Mengambil gambar dari galeri HP
   */
  static async pickImageFromGallery(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin akses galeri diperlukan untuk memilih foto makanan.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('[ImageService] Error picking image from gallery:', error);
      return null;
    }
  }

  /**
   * Mengambil foto langsung menggunakan kamera HP
   */
  static async takePhotoWithCamera(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin kamera diperlukan untuk memotret makanan langsung.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('[ImageService] Error launching camera:', error);
      return null;
    }
  }

  /**
   * Upload gambar ke Firebase Storage (atau mengembalikan URI lokal jika offline/demo)
   * Menyimpan ke path terisolasi: /users/{userId}/photos/{filename}
   */
  static async uploadImage(
    localUri: string,
    userId: string = 'guest',
    folder: string = 'photos'
  ): Promise<string> {
    if (!isFirebaseConfigured || !storage) {
      // Jika Firebase belum dikonfigurasi, gunakan URI lokal langsung (tetap tampil di HP)
      return localUri;
    }

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Validasi ukuran maksimal 10MB sesuai aturan storage.rules
      if (blob.size > 10 * 1024 * 1024) {
        console.warn('[ImageService] Foto melebihi 10MB, menggunakan URI lokal.');
        return localUri;
      }

      const filename = `users/${userId}/${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.warn('[ImageService] Gagal upload ke Firebase Storage, menggunakan URI lokal:', error);
      return localUri;
    }
  }
}
