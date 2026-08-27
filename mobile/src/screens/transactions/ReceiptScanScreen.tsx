import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { colors, radius, spacing, typography } from "../../theme/theme";
import { scanReceipt } from "../../api/receipts";
import { getErrorMessage } from "../../api/client";
import { TransactionsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<TransactionsStackParamList, "ReceiptScan">;

type PickedImage = { uri: string; base64: string; mimeType: "image/jpeg" | "image/png" | "image/webp" };

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toAllowedMimeType(mimeType?: string | null): "image/jpeg" | "image/png" | "image/webp" {
  if (mimeType && ALLOWED_MIME_TYPES.includes(mimeType)) {
    return mimeType as "image/jpeg" | "image/png" | "image/webp";
  }
  return "image/jpeg";
}

export function ReceiptScanScreen({ navigation }: Props) {
  const [image, setImage] = useState<PickedImage | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Fiş fotoğrafı çekmek için kamera izni vermeniz gerekiyor");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
    });
    handlePicked(result);
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Galeriden fotoğraf seçmek için izin vermeniz gerekiyor");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
    });
    handlePicked(result);
  }

  function handlePicked(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets?.[0]?.base64) return;
    const asset = result.assets[0];
    setError(null);
    setImage({ uri: asset.uri, base64: asset.base64!, mimeType: toAllowedMimeType(asset.mimeType) });
  }

  async function handleScan() {
    if (!image) return;
    setScanning(true);
    setError(null);
    try {
      const result = await scanReceipt({ base64: image.base64, mimeType: image.mimeType });
      navigation.replace("TransactionForm", {
        prefill: {
          type: result.type,
          amount: result.amount,
          date: result.date ?? undefined,
          description: result.description,
          categoryId: result.categoryId ?? undefined,
        },
      });
    } catch (e) {
      setError(getErrorMessage(e, "Fiş taranamadı, tekrar deneyin"));
    } finally {
      setScanning(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.hint}>
        Fişin veya faturanın net bir fotoğrafını çekin ya da galeriden seçin. Tutar, tarih ve kategori otomatik
        olarak doldurulacak.
      </Text>

      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Henüz fotoğraf seçilmedi</Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.row}>
        <Button label="Kamera" variant="secondary" onPress={pickFromCamera} style={{ flex: 1 }} />
        <Button label="Galeri" variant="secondary" onPress={pickFromLibrary} style={{ flex: 1, marginLeft: spacing.sm }} />
      </View>

      <Button
        label="Fişi Tara ve Devam Et"
        onPress={handleScan}
        loading={scanning}
        disabled={!image}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.body, color: colors.textMuted, marginBottom: spacing.md },
  preview: {
    width: "100%",
    height: 280,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  placeholder: {
    width: "100%",
    height: 280,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  placeholderText: { color: colors.textLight },
  row: { flexDirection: "row" },
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: "center" },
});
