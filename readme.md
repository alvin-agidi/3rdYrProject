# Set-up Guide
1. Clone this repository if you haven't already.
2. Install Expo CLI using `npm install expo-cli --save-dev`.
3. Navigate to the project root folder and install dependencies using `npm install`.
4. Install the Expo mobile application on the phone you wish to use.
5. Start the app by using `npx expo start --tunnel`.
6. Scan the QR code using your phone camera.
7. Wait for Expo app to open and the app to load.
8. Register with your details.

## Recognition Model Set-up for App
1. Open file "3YrProjectDetector.ipynb" in Google Colab.
2. Mount your Google Drive into Colab.
3. Added all 5 detectors to Google Drive.
4. Add Google Drive paths to all detectors to the `DETECTOR_PATHS` list.
5. Run all cells (ctrl+F9).
6. Wait for last cell to show `INFO:werkzeug:Press CTRL+C to quit`
7. Open app using Expo (instructions above) and upload video via camera.

Note without the Recognition Model Set-up the exercise recognition does not work in the app.

Video dataset link: https://www.kaggle.com/datasets/hasyimabdillah/workoutfitness-video

## Recognition Model Set-up for Tests
1. Open file "3YrProjectDetectorTests.ipynb" in Google Colab.
2. Download the video dataset into Google Drive.
3. Mount your Google Drive into Colab.
4. Change `DATASET_PATH` variable to the Google Drive path of your video dataset.
5. Run cells:
   1. Imports
   2. Load video dataset
   3. Create 3D poses (MeTRAbs)
   4. Divide dataset into training and testing data
   5. Visualise poses
   6. Spektral