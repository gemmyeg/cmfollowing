import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'camera' | 'library';

export type PickedPhoto = {
  /** Full-size local file, e.g. for reading the odometer. */
  uri: string;
  /** Small JPEG data URI to store. */
  dataUri: string;
};

/**
 * Lets the user take or choose a photo and returns it as a small JPEG data URI.
 * Photos are stored in Firestore (not Firebase Storage, which needs a paid plan),
 * so they are shrunk to stay well under Firestore's 1 MB document limit.
 */
export async function pickPhoto(source: PhotoSource, maxWidth = 800): Promise<PickedPhoto | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > maxWidth) context.resize({ width: maxWidth });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
  return saved.base64 ? { uri: asset.uri, dataUri: `data:image/jpeg;base64,${saved.base64}` } : null;
}
