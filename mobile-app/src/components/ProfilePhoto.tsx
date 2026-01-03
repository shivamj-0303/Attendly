import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

interface ProfilePhotoProps {
  currentPhotoUrl?: string | null;
  onPhotoUpdated?: (photoUrl: string) => void;
  userName?: string;
}

export default function ProfilePhoto({
  currentPhotoUrl,
  onPhotoUpdated,
  userName = 'User',
}: ProfilePhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos!'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      // Upload to backend
      const response = await api.post('/student/upload-profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newPhotoUrl = response.data.photoUrl;
      setPhotoUrl(newPhotoUrl);

      if (onPhotoUpdated) {
        onPhotoUpdated(newPhotoUrl);
      }

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to upload photo. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async () => {
    Alert.alert('Delete Photo', 'Are you sure you want to remove your profile photo?', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          setIsUploading(true);
          try {
            await api.delete('/student/delete-profile-photo');
            setPhotoUrl(null);

            if (onPhotoUpdated) {
              onPhotoUpdated('');
            }

            Alert.alert('Success', 'Profile photo removed successfully!');
          } catch (error: any) {
            console.error('Error deleting photo:', error);
            const errorMessage =
              error.response?.data?.message || 'Failed to delete photo. Please try again.';
            Alert.alert('Delete Failed', errorMessage);
          } finally {
            setIsUploading(false);
          }
        },
        style: 'destructive',
        text: 'Delete',
      },
    ]);
  };

  const renderPhotoContent = () => {
    if (photoUrl) {
      return (
        <Image
          resizeMode="cover"
          source={{ uri: photoUrl }}
          style={styles.profileImage}
        />
      );
    }

    return (
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{userName.charAt(0).toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}
        {renderPhotoContent()}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          disabled={isUploading}
          onPress={pickImage}
          style={[styles.actionButton, styles.uploadButton]}
        >
          <Text style={styles.actionButtonText}>
            {photoUrl ? '📷 Change Photo' : '📷 Upload Photo'}
          </Text>
        </TouchableOpacity>

        {photoUrl && (
          <TouchableOpacity
            disabled={isUploading}
            onPress={deletePhoto}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text style={styles.deleteButtonText}>🗑️ Remove Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.helpText}>
        💡 Tap to upload a profile photo (max 5MB, JPG/PNG)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  initialsContainer: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  initialsText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  photoContainer: {
    borderRadius: 60,
    height: 120,
    overflow: 'hidden',
    width: 120,
  },
  profileImage: {
    height: 120,
    width: 120,
  },
  uploadButton: {
    backgroundColor: '#2563eb',
  },
  uploadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    position: 'absolute',
    width: 120,
    zIndex: 10,
  },
});
