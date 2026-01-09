import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import notesStore from '../store/notesStore';
import { takePhoto, pickImageFromGallery, getCurrentLocation, triggerHaptic } from '../utils/nativeFeatures';

const AddEditNoteScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params || {};
  const isEditing = !!noteId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const note = notesStore.getNote(noteId);
      if (note) {
        setTitle(note.title || '');
        setDescription(note.description || '');
        setPhoto(note.photo || null);
        setLocation(note.location || null);
      }
      navigation.setOptions({ title: 'Edit Note' });
    }
  }, [noteId, isEditing, navigation]);

  const handleTakePhoto = async () => {
    try {
      triggerHaptic('light');
      const uri = await takePhoto();
      if (uri) {
        setPhoto(uri);
        triggerHaptic('success');
      }
    } catch (error) {
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to take photo. Please check camera permissions.');
    }
  };

  const handlePickImage = async () => {
    try {
      triggerHaptic('light');
      const uri = await pickImageFromGallery();
      if (uri) {
        setPhoto(uri);
        triggerHaptic('success');
      }
    } catch (error) {
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to pick image. Please check gallery permissions.');
    }
  };

  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);
      triggerHaptic('light');
      const loc = await getCurrentLocation();
      setLocation(loc);
      triggerHaptic('success');
      Alert.alert('Success', 'Location saved successfully!');
    } catch (error) {
      triggerHaptic('error');
      Alert.alert('Error', error.message || 'Failed to get location. Please check location permissions.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRemovePhoto = () => {
    triggerHaptic('light');
    setPhoto(null);
  };

  const handleRemoveLocation = () => {
    triggerHaptic('light');
    setLocation(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for your note.');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        description: description.trim(),
        photo,
        location,
      };

      if (isEditing) {
        await notesStore.updateNote(noteId, noteData);
      } else {
        await notesStore.addNote(noteData);
      }

      triggerHaptic('success');
      navigation.goBack();
    } catch (error) {
      triggerHaptic('error');
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label} accessibilityLabel="Note title">
            Title *
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter note title"
            placeholderTextColor="#999"
            accessibilityLabel="Note title input"
            accessibilityHint="Enter the title for your field note"
          />

          <Text style={styles.label} accessibilityLabel="Note description">
            Description
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter note description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            accessibilityLabel="Note description input"
            accessibilityHint="Enter the description for your field note"
          />

          <Text style={styles.label}>Photo</Text>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemovePhoto}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <Text style={styles.removeButtonText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
                accessibilityRole="button"
                accessibilityLabel="Take photo with camera"
                accessibilityHint="Opens camera to take a photo for this note"
              >
                <Text style={styles.photoButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePickImage}
                accessibilityRole="button"
                accessibilityLabel="Pick image from gallery"
                accessibilityHint="Opens gallery to select an image for this note"
              >
                <Text style={styles.photoButtonText}>🖼️ Pick from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Location</Text>
          {location ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveLocation}
                accessibilityRole="button"
                accessibilityLabel="Remove location"
              >
                <Text style={styles.removeButtonText}>Remove Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]}
              onPress={handleGetLocation}
              disabled={loadingLocation}
              accessibilityRole="button"
              accessibilityLabel="Get current location"
              accessibilityHint="Gets your current GPS location to tag this note"
            >
              {loadingLocation ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.locationButtonText}>📍 Get Current Location</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? "Save changes" : "Save new note"}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Save Note'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 48, // Accessibility: minimum touch target
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  photoContainer: {
    marginTop: 8,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minHeight: 48, // Accessibility: minimum touch target
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#E8F4F8',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  locationButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48, // Accessibility: minimum touch target
    justifyContent: 'center',
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 44, // Accessibility: minimum touch target
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minHeight: 48, // Accessibility: minimum touch target
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddEditNoteScreen;

