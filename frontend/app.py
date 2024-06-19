from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import shutil
from vid import create_video_with_audio, concatenate_audios, get_audio_length
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
from moviepy.video.fx.all import fadein, fadeout, resize
from mutagen.mp3 import MP3
import time

app = Flask(__name__)
CORS(app, resources={r"/generateVideo": {"origins": "http://localhost:3000"}})


@app.route('/generateVideo', methods=['GET'])
def generateVideo():
    audio_files = ['./.next/server/output/output-0.mp3',
                   './.next/server/output/output-1.mp3', './.next/server/output/output-2.mp3']

    # time.sleep(10)

    audio_lengths = [get_audio_length(file) for file in audio_files]
    concatenate_audios(audio_files, 'output.mp3')

    # Your audio and image paths
    audio_file_path = 'output.mp3'
    exists = [False] * 5
    dir_path = './.next/server/output/'

    files_in_directory = os.listdir(dir_path)

    jpg_count = sum(1 for file in files_in_directory if file.endswith('.jpg'))
    startTime = int(time.time() * 1000)
    while jpg_count < 5 and int(time.time() * 1000) - startTime < 20000:
        time.sleep(1)
        files_in_directory = os.listdir(dir_path)
        jpg_count = sum(
            1 for file in files_in_directory if file.endswith('.jpg'))

    # Check for each img_i.jpg file
    image_paths = []
    for i in range(5):
        file_name = f'img_{i}.jpg'
        if file_name in files_in_directory:
            exists[i] = True
            image_paths.append(dir_path + file_name)

    durations = []
    if exists[0]:
        durations.append(audio_lengths[0])
    if exists[1] and exists[2]:
        durations.append(audio_lengths[1]/2)
        durations.append(audio_lengths[1]/2)
    elif exists[1]:
        durations.append(audio_lengths[1])
    else:
        durations.append(audio_lengths[1])

    if exists[3] and exists[4]:
        durations.append(audio_lengths[2]/2)
        durations.append('remaining')
    elif exists[3]:
        durations.append('remaining')
    else:
        durations.append('remaining')

    audio_duration = AudioFileClip(audio_file_path).duration

    total_set_duration = sum(
        [duration for duration in durations if isinstance(duration, (int, float))])
    durations = [duration if duration != 'remaining' else audio_duration -
                 total_set_duration for duration in durations]

    # Video options
    video_options = {
        'fps': 15,
        'videoCodec': 'libx264',
    }

    print("======================================================")
    create_video_with_audio(
        image_paths, durations, audio_file_path, 'public/video.mp4', video_options)

    if os.path.exists(dir_path):
        # Iterate over all the items in the directory
        for item in os.listdir(dir_path):
            item_path = os.path.join(dir_path, item)  # Full path to the item

            # Remove the item
            if os.path.isfile(item_path):
                os.remove(item_path)  # Remove the file
            elif os.path.isdir(item_path):
                # Remove the directory and its contents
                shutil.rmtree(item_path)

        print(f"All contents of '{dir_path}' have been deleted.")
    else:
        print(f"Directory '{dir_path}' does not exist.")

    return jsonify({'message': 'Hello, World!'})


if __name__ == '__main__':
    app.run(debug=True)
