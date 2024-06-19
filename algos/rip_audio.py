from moviepy.editor import *

def extract_audio(input_file, output_file):
    video = VideoFileClip(input_file)
    audio = video.audio
    audio.write_audiofile(output_file)

if __name__ == "__main__":
    input_file = "cha-cha-slide.mp4"  # Replace with your input file name
    output_file = "cha-cha-slide-audio.mp3"  # Replace with your output audio file name
    extract_audio(input_file, output_file)
