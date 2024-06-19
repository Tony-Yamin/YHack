import ffmpeg
import os
from moviepy.editor import ImageSequenceClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
from moviepy.video.fx.all import fadein, fadeout, resize
from mutagen.mp3 import MP3


def concatenate_audios(audio_files, output_file):
    try:
        (
            ffmpeg
            .input('concat:' + '|'.join(audio_files))
            .output(output_file, codec='copy')
            .run(overwrite_output=True)
        )
    except ffmpeg.Error as e:
        print('Error:', e)


def get_audio_length(file_path):
    audio = MP3(file_path)
    return audio.info.length


def create_video_with_audio(image_paths, durations, audio_file_path, output_file, video_options):
    try:
        # Load the audio file
        audio_clip = AudioFileClip(audio_file_path)

        # Initialize an empty list to hold the clips with transitions and effects
        clips_with_effects = []

        # Duration of the fade effect (in seconds)
        fade_duration = 0.8  # Adjust as needed

        # Settings for zoom effect
        # No zoom at start (you can change this for a different effect)
        zoom_factor_start = 1
        zoom_factor_end = 1.1   # Zoom in by 20% (you can adjust this value)

        for i, (image, duration) in enumerate(zip(image_paths, durations)):
            # Create a clip for each image
            clip = ImageSequenceClip(
                [image], fps=video_options['fps']).set_duration(duration)

            # Apply fade in and fade out
            clip = fadein(clip, fade_duration)
            clip = fadeout(clip, fade_duration)

            # Apply zoom effect
            # clip = clip.fx(resize, newsize=lambda t: (
            # zoom_factor_start + (zoom_factor_end - zoom_factor_start) * t / duration))

            clips_with_effects.append(clip)

        # Concatenate the individual clips with transitions and effects
        final_clip = concatenate_videoclips(
            clips_with_effects, method="compose")

        # Set the audio of the video clip
        final_clip = final_clip.set_audio(audio_clip)

        # Write the video file
        final_clip.write_videofile(
            output_file, codec=video_options['videoCodec'])
        print('Video created in:', output_file)
    except Exception as e:
        print('Error:', e)
