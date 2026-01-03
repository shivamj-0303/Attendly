import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ModalHeaderProps {
  onClose: () => void;
  title: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, title }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

interface FullScreenModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  children,
  onClose,
  title,
  visible,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal animationType="slide" transparent={false} visible={visible}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  backButton: {
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  closeIcon: {
    color: theme.colors.textSecondary,
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
