
import cv2
import os

def extract_frames(video_path, output_folder):
    # Create the output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Open the video file
    cap = cv2.VideoCapture(video_path)

    # Get the frame rate of the video
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Calculate the interval to extract frames at 3 frames per second
    interval = int(fps / 3)

    # Initialize frame counter
    frame_count = 0

    # Loop through the video and extract frames
    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        # Extract frame every interval frames
        if frame_count % interval == 0:
            # Save the frame as an image
            cv2.imwrite(f"{output_folder}/frame_{frame_count}.jpg", frame)

        frame_count += 1

    # Release the video capture object
    cap.release()

if __name__ == "__main__":
    video_path = "cha-cha-slide.mp4"  # Replace with your input video file path
    output_folder = "output_frames"  # Replace with the folder where you want to save the frames
    extract_frames(video_path, output_folder)
