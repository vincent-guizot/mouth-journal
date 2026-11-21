import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react-native';
import { theme } from '../../config/theme';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface FeedbackContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  showAlert: (title: string, message?: string, onOk?: () => void) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

type DialogState =
  | {
      visible: true;
      type: 'alert';
      title: string;
      message?: string;
      buttonText?: string;
      onOk?: () => void;
    }
  | {
      visible: true;
      type: 'confirm';
      title: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
      onConfirm: () => void | Promise<void>;
      onCancel?: () => void;
    }
  | { visible: false };

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

let activeFeedbackHandler: FeedbackContextValue | null = null;

/**
 * Universal feedback singleton. Safe to call anywhere (inside or outside React tree).
 * Renders modal on native and web through FeedbackProvider, with fallback to web alert/confirm
 * if the provider is ever unmounted.
 */
export const feedback: FeedbackContextValue = {
  showToast: (message, type = 'info', durationMs = 3500) => {
    if (activeFeedbackHandler) {
      activeFeedbackHandler.showToast(message, type, durationMs);
    } else {
      console.log(`[Toast:${type}] ${message}`);
    }
  },
  showAlert: (title, message, onOk) => {
    if (activeFeedbackHandler) {
      activeFeedbackHandler.showAlert(title, message, onOk);
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
      onOk?.();
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  },
  showConfirm: (options) => {
    if (activeFeedbackHandler) {
      activeFeedbackHandler.showConfirm(options);
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm(options.message ? `${options.title}\n\n${options.message}` : options.title);
      if (ok) void options.onConfirm();
      else options.onCancel?.();
    } else {
      Alert.alert(options.title, options.message, [
        { text: options.cancelText || 'Batal', style: 'cancel', onPress: options.onCancel },
        {
          text: options.confirmText || 'Konfirmasi',
          style: options.destructive ? 'destructive' : 'default',
          onPress: options.onConfirm,
        },
      ]);
    }
  },
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState>({ visible: false });
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [toastFade] = useState(() => new Animated.Value(0));
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    Animated.timing(toastFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      });
    }, durationMs);
  }, [toastFade]);

  const showAlert = useCallback((title: string, message?: string, onOk?: () => void) => {
    setDialog({ visible: true, type: 'alert', title, message, onOk });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setDialog({ visible: true, type: 'confirm', ...options });
  }, []);

  useEffect(() => {
    activeFeedbackHandler = { showToast, showAlert, showConfirm };
    return () => {
      activeFeedbackHandler = null;
    };
  }, [showToast, showAlert, showConfirm]);

  const handleDismissDialog = () => {
    if (loadingConfirm) return;
    if (dialog.visible && dialog.type === 'confirm' && dialog.onCancel) {
      dialog.onCancel();
    }
    setDialog({ visible: false });
  };

  const handleConfirmPress = async () => {
    if (!dialog.visible || dialog.type !== 'confirm') return;
    try {
      setLoadingConfirm(true);
      await dialog.onConfirm();
    } finally {
      setLoadingConfirm(false);
      setDialog({ visible: false });
    }
  };

  const handleAlertOkPress = () => {
    if (!dialog.visible || dialog.type !== 'alert') return;
    const callback = dialog.onOk;
    setDialog({ visible: false });
    callback?.();
  };

  const renderToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#059669" />;
      case 'warning':
        return <AlertTriangle size={18} color="#D9A571" />;
      case 'error':
        return <AlertCircle size={18} color="#DC2626" />;
      default:
        return <Info size={18} color={theme.colors.terracotta} />;
    }
  };

  return (
    <FeedbackContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* Floating Toast Banner */}
      {toast.visible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastFade }]}>
          <View style={[styles.toastCard, styles[`toastCard_${toast.type}`]]}>
            <View style={styles.toastIconWrapper}>{renderToastIcon(toast.type)}</View>
            <Text style={styles.toastText} numberOfLines={3}>
              {toast.message}
            </Text>
            <TouchableOpacity
              onPress={() => setToast((prev) => ({ ...prev, visible: false }))}
              style={styles.toastCloseBtn}
            >
              <X size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Accessible Cross-Platform Modal Dialog */}
      <Modal
        visible={dialog.visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismissDialog}
      >
        <Pressable style={styles.modalOverlay} onPress={handleDismissDialog}>
          <Pressable style={styles.dialogCard} onPress={(e) => e.stopPropagation()}>
            {dialog.visible && (
              <>
                <Text style={styles.dialogTitle}>{dialog.title}</Text>
                {dialog.message ? <Text style={styles.dialogMessage}>{dialog.message}</Text> : null}

                <View style={styles.dialogActions}>
                  {dialog.type === 'confirm' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnCancel]}
                        onPress={handleDismissDialog}
                        disabled={loadingConfirm}
                      >
                        <Text style={styles.btnCancelText}>{dialog.cancelText || 'Batal'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.btn,
                          dialog.destructive ? styles.btnDestructive : styles.btnPrimary,
                        ]}
                        onPress={handleConfirmPress}
                        disabled={loadingConfirm}
                      >
                        <Text style={styles.btnPrimaryText}>
                          {loadingConfirm ? 'Memproses...' : dialog.confirmText || 'Konfirmasi'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                      onPress={handleAlertOkPress}
                    >
                      <Text style={styles.btnPrimaryText}>{dialog.buttonText || 'Mengerti'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextValue => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) return feedback;
  return ctx;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 54,
    left: 20,
    right: 20,
    zIndex: 99999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    maxWidth: 500,
    width: '100%',
    shadowColor: '#4E2E21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  toastCard_info: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.terracotta,
  },
  toastCard_success: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  toastCard_warning: {
    borderLeftWidth: 4,
    borderLeftColor: '#D9A571',
  },
  toastCard_error: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  toastIconWrapper: {
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: theme.colors.coffeeBrown,
    lineHeight: 20,
  },
  toastCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(78, 46, 33, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dialogTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: theme.colors.coffeeBrown,
    marginBottom: 8,
  },
  dialogMessage: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: theme.colors.espresso,
    lineHeight: 22,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  btnCancel: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D3',
  },
  btnCancelText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: theme.colors.coffeeBrown,
  },
  btnPrimary: {
    backgroundColor: theme.colors.terracotta,
  },
  btnDestructive: {
    backgroundColor: '#DC2626',
  },
  btnPrimaryText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
