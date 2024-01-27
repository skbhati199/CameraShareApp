import { StatusBar } from "expo-status-bar";
import { Button, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { shareAsync } from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState, useEffect } from "react";

export default function App() {
  let cameraRef = useRef();
  const [type, setType] = useState(CameraType.back);
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");

      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return (
      <View>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  } else if (hasCameraPermission === undefined) {
    return (
      <View>
        <Text>Camera permission is undefined</Text>
      </View>
    );
  }

  const takePhoto = async () => {
    let options = {
      quality: 1,
      base64: true,
      fixOrientation: true,
      exif: true,
    };
    if (cameraRef) {
      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
    }
  };

  if (photo) {
    let sharePicture = async () => {
      shareAsync(photo.uri).then(() => setPhoto(undefined));
    };
    let savePhoto = async () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() =>
        setPhoto(undefined)
      );
    };
    return (
      <SafeAreaView>
        <View>
          <Image
            source={{ uri: "data:image/jpg;base64," + photo.base64 }}
            style={styles.preview}
          />
          <Button title="Share" onPress={sharePicture} />
          {hasMediaLibraryPermission && (
            <Button title="Save" onPress={savePhoto} />
          )}
          <Button title="Discard" onPress={() => setPhoto(undefined)} />
        </View>
      </SafeAreaView>
    );
  }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.cameraContainer} ref={cameraRef} type={type} >
        <View style={styles.buttonContainer}>
          <Button title="Take photo" onPress={() => takePhoto()} />
          <Button title="Flip camera" onPress={() => toggleCameraType()} />
        </View>
      </Camera>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    backgroundColor: "blue",
    alignSelf: "flex-end",
    borderRadius: 10,
  },
  preview: {
    width: "100%",
    height: "80%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
